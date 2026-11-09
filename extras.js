'use strict';
/* Easy pickers, profile photo and nearby place search for Care Companion.
   Loaded before app.js; uses its helpers at call time. */

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const hourLabel = h => new Date(2000, 0, 1, h, 0).toLocaleTimeString([], { hour: 'numeric' });

/* ---------- Date picker: one calm month calendar ---------- */
function dateField(name, value, { optional = false, emptyLabel = 'No date' } = {}) {
  return `<div class="dp" data-dp data-optional="${optional ? 1 : ''}" data-empty="${esc(emptyLabel)}">
    <input type="hidden" name="${name}" value="${esc(value || '')}"><div class="dp-view"></div></div>`;
}
function renderDP(el, dir) {
  const inp = el.querySelector('input');
  const v = inp.value, opt = el.dataset.optional === '1', t = today();
  const on = !opt || !!v || el.dataset.open === '1';
  let html = '';
  if (opt) {
    html += `<div class="toggle-row"><span>${v ? fmtD(v, { weekday: 'long', day: 'numeric', month: 'long' }) : esc(el.dataset.empty)}</span>
      <button type="button" class="switch ${on ? 'on' : ''}" data-dp-switch role="switch" aria-checked="${on}" aria-label="Choose a date"><i></i></button></div>`;
  }
  if (on) {
    const base = el.dataset.month || (v || t).slice(0, 7);
    const [y, m] = base.split('-').map(Number);
    const lead = (new Date(y, m - 1, 1).getDay() + 6) % 7; // weeks start on Monday
    const n = new Date(y, m, 0).getDate();
    let cells = WEEK.map(d => `<span class="cal-wd">${DAYS[d].slice(0, 1)}</span>`).join('') + '<span></span>'.repeat(lead);
    for (let d = 1; d <= n; d++) {
      const s = `${y}-${pad(m)}-${pad(d)}`;
      cells += `<button type="button" class="cal-d ${s === v ? 'on' : ''} ${s === t ? 'today' : ''} ${s < t ? 'past' : ''}" data-pick="${s}" aria-label="${fmtD(s)}" aria-pressed="${s === v}">${d}</button>`;
    }
    const showToday = base !== t.slice(0, 7);
    const long = v ? fmtD(v, { weekday: 'long', day: 'numeric', month: 'long' }) : '';
    const label = v && !opt ? (relDay(v) === fmtD(v) ? long : relDay(v) + ' · ' + long) : '';
    html += `<div class="cal ${opt ? 'inset' : ''}">
      <div class="cal-head">
        <button type="button" class="iconbtn" data-cal-nav="-1" aria-label="Previous month">${icon('chev', 'flip')}</button>
        <b>${MONTHS[m - 1]} <span class="muted">${y}</span></b>
        <button type="button" class="iconbtn" data-cal-nav="1" aria-label="Next month">${icon('chev')}</button>
      </div>
      <div class="cal-grid ${dir ? (dir > 0 ? 'from-r' : 'from-l') : ''}">${cells}</div>
      <div class="cal-foot"><span class="small">${esc(label)}</span>
        ${showToday ? '<button type="button" class="link small" data-cal-today>Back to today</button>' : ''}</div>
    </div>`;
  }
  el.querySelector('.dp-view').innerHTML = html;
}

/* Birthday: three plain dropdowns (a calendar is slow for years long ago). */
function birthField(value) {
  const [y, m, d] = (value || '').split('-').map(Number);
  const yNow = new Date().getFullYear();
  let ys = '<option value="">Year</option>';
  for (let i = yNow; i >= 1900; i--) ys += `<option ${i === y ? 'selected' : ''}>${i}</option>`;
  return `<div class="grid3">
    <select name="bd_d" aria-label="Day"><option value="">Day</option>${Array.from({ length: 31 }, (_, i) => `<option ${i + 1 === d ? 'selected' : ''}>${i + 1}</option>`).join('')}</select>
    <select name="bd_m" aria-label="Month"><option value="">Month</option>${MONTHS.map((n, i) => `<option value="${i + 1}" ${i + 1 === m ? 'selected' : ''}>${n}</option>`).join('')}</select>
    <select name="bd_y" aria-label="Year">${ys}</select></div>`;
}
function readBirth(fd) {
  const d = fd.get('bd_d'), m = fd.get('bd_m'), y = fd.get('bd_y');
  return d && m && y ? `${y}-${pad(m)}-${pad(d)}` : '';
}

/* ---------- Time picker: scroll wheels, like a phone alarm ---------- */
const IS12 = /[ap]\.?\s?m/i.test(new Date(2000, 0, 1, 13).toLocaleTimeString([], { hour: 'numeric' }));
const WHEEL_ROW = 44;
function timeField(name, value, { optional = false, open = false } = {}) {
  return `<div class="tp" data-tp data-optional="${optional ? 1 : ''}" data-open="${open ? 1 : ''}">
    <input type="hidden" name="${name}" value="${esc(value || '')}"><div class="tp-view"></div></div>`;
}
function wheelCols(v) {
  const [h, m] = (v || '09:00').split(':').map(Number);
  const mi = Math.round(m / 5) % 12;
  const cols = [];
  if (IS12) cols.push({ key: 'h', label: 'Hour', items: Array.from({ length: 12 }, (_, i) => String(i + 1)), idx: (h % 12 || 12) - 1 });
  else cols.push({ key: 'h', label: 'Hour', items: Array.from({ length: 24 }, (_, i) => pad(i)), idx: h });
  cols.push({ key: 'm', label: 'Minutes', items: Array.from({ length: 12 }, (_, i) => pad(i * 5)), idx: mi });
  if (IS12) cols.push({ key: 'ap', label: 'AM or PM', items: ['AM', 'PM'], idx: h >= 12 ? 1 : 0 });
  return cols;
}
function renderTP(el) {
  const inp = el.querySelector('input');
  const open = el.dataset.open === '1', opt = el.dataset.optional === '1';
  if (open && !inp.value) inp.value = '09:00';
  const v = inp.value;
  let html = `<button type="button" class="tp-btn ${v ? '' : 'empty'}" data-tp-toggle aria-expanded="${open}">${icon('clock')}<span class="tp-val">${v ? fmtT(v) : opt ? 'No set time' : 'Choose a time'}</span>${icon('down', open ? 'flip' : '')}</button>`;
  if (open) {
    html += `<div class="tp-panel"><div class="wheels"><div class="wheel-band" aria-hidden="true"></div>${wheelCols(v).map(c =>
      `<div class="wheel ${c.key === 'ap' ? 'narrow' : ''}" data-col="${c.key}" tabindex="0" role="listbox" aria-label="${c.label}">
        <div class="wheel-pad"></div>${c.items.map((x, i) => `<div class="wheel-item" data-i="${i}" role="option">${x}</div>`).join('')}<div class="wheel-pad"></div></div>`).join('')}</div>
      <div class="actions tp-actions">${opt ? '<button type="button" class="btn sm" data-tp-clear>No set time</button>' : ''}<button type="button" class="btn sm primary" data-tp-toggle>Done</button></div></div>`;
  }
  el.querySelector('.tp-view').innerHTML = html;
  if (open) setupWheels(el, v);
}
function setupWheels(el, v) {
  const inp = el.querySelector('input');
  const cols = wheelCols(v);
  const read = () => {
    const idx = $$('.wheel', el).map(w => Math.round(w.scrollTop / WHEEL_ROW));
    let h = idx[0];
    const m = (idx[1] || 0) * 5;
    if (IS12) h = (idx[0] + 1) % 12 + (idx[2] === 1 ? 12 : 0);
    inp.value = pad(h) + ':' + pad(m);
    el.querySelector('.tp-val').textContent = fmtT(inp.value);
    el.querySelector('.tp-btn').classList.remove('empty');
    inp.dispatchEvent(new Event('change', { bubbles: true }));
  };
  $$('.wheel', el).forEach((w, ci) => {
    const items = $$('.wheel-item', w);
    const mark = i => items.forEach((it, k) => { it.classList.toggle('sel', k === i); it.setAttribute('aria-selected', String(k === i)); });
    w.scrollTop = cols[ci].idx * WHEEL_ROW;
    mark(cols[ci].idx);
    let t;
    w.addEventListener('scroll', () => {
      mark(Math.max(0, Math.min(items.length - 1, Math.round(w.scrollTop / WHEEL_ROW))));
      clearTimeout(t);
      t = setTimeout(read, 90);
    }, { passive: true });
    w.addEventListener('click', ev => {
      const it = ev.target.closest('.wheel-item');
      if (it) w.scrollTo({ top: +it.dataset.i * WHEEL_ROW, behavior: 'smooth' });
    });
    w.addEventListener('keydown', ev => {
      if (ev.key !== 'ArrowDown' && ev.key !== 'ArrowUp') return;
      ev.preventDefault();
      w.scrollBy({ top: ev.key === 'ArrowDown' ? WHEEL_ROW : -WHEEL_ROW, behavior: 'smooth' });
    });
  });
}

/* Wire all pickers inside a container (event delegation, so rows added later work too). */
function initPickers(root) {
  $$('[data-dp]', root).forEach(el => renderDP(el));
  $$('[data-tp]', root).forEach(renderTP);
  if (root.dataset.pickers) return;
  root.dataset.pickers = '1';
  root.addEventListener('click', ev => {
    const dp = ev.target.closest('[data-dp]');
    if (dp) {
      const inp = dp.querySelector('input');
      const pick = ev.target.closest('[data-pick]');
      if (pick) {
        inp.value = pick.dataset.pick;
        renderDP(dp); inp.dispatchEvent(new Event('change', { bubbles: true }));
      } else if (ev.target.closest('[data-dp-switch]')) {
        const isOn = !!inp.value || dp.dataset.open === '1';
        dp.dataset.open = isOn ? '' : '1';
        if (isOn) inp.value = '';
        renderDP(dp);
      } else if (ev.target.closest('[data-cal-today]')) {
        dp.dataset.month = today().slice(0, 7); renderDP(dp);
      } else if (ev.target.closest('[data-cal-nav]')) {
        const step = +ev.target.closest('[data-cal-nav]').dataset.calNav;
        const base = dp.dataset.month || (inp.value || today()).slice(0, 7);
        const [y, m] = base.split('-').map(Number);
        const d = new Date(y, m - 1 + step, 1);
        dp.dataset.month = `${d.getFullYear()}-${pad(d.getMonth() + 1)}`; renderDP(dp, step);
      }
      return;
    }
    const tp = ev.target.closest('[data-tp]');
    if (!tp) return;
    if (ev.target.closest('[data-tp-clear]')) { tp.querySelector('input').value = ''; tp.dataset.open = ''; }
    else if (ev.target.closest('[data-tp-toggle]')) {
      const opening = tp.dataset.open !== '1';
      if (opening) $$('[data-tp][data-open="1"]', root).forEach(o => { if (o !== tp) { o.dataset.open = ''; renderTP(o); } });
      tp.dataset.open = opening ? '1' : '';
    } else return;
    renderTP(tp);
  });
}

/* ---------- Profile photo ---------- */
async function resizePhoto(file) {
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    await new Promise((res, rej) => { img.onload = res; img.onerror = rej; img.src = url; });
    const s = Math.min(img.naturalWidth, img.naturalHeight), size = 320;
    const c = document.createElement('canvas'); c.width = c.height = size;
    c.getContext('2d').drawImage(img, (img.naturalWidth - s) / 2, (img.naturalHeight - s) / 2, s, s, 0, 0, size, size);
    return c.toDataURL('image/jpeg', 0.82);
  } finally { URL.revokeObjectURL(url); }
}

/* ---------- Opening hours in OpenStreetMap format → one text per weekday ---------- */
function osmHours(oh) {
  const out = {};
  if (!oh || typeof oh !== 'string') return out;
  if (/24\s*\/\s*7/.test(oh)) { WEEK.forEach(d => { out[d] = '00:00-24:00'; }); return out; }
  const map = { Mo: 1, Tu: 2, We: 3, Th: 4, Fr: 5, Sa: 6, Su: 0 }, order = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
  const rules = [];
  oh.split(';').forEach(r => r.split(/(?<=\d)\s*,\s*(?=(?:Mo|Tu|We|Th|Fr|Sa|Su)\b)/).forEach((x, i) => rules.push([x, i > 0])));
  rules.forEach(([rule, additive]) => {
    rule = rule.trim();
    if (!rule) return;
    const m = rule.match(/^((?:(?:Mo|Tu|We|Th|Fr|Sa|Su)(?:\s*-\s*(?:Mo|Tu|We|Th|Fr|Sa|Su))?\s*,?\s*)+)(.*)$/);
    let daysPart, timePart;
    if (m) { daysPart = m[1]; timePart = m[2]; } else if (/^\d/.test(rule)) { daysPart = 'Mo-Su'; timePart = rule; } else return;
    const days = [];
    daysPart.split(',').forEach(seg => {
      const [a, b] = seg.split('-').map(x => x.trim());
      if (!a || map[a] == null) return;
      if (b && map[b] != null) { let i = order.indexOf(a); const j = order.indexOf(b); for (let k = 0; k < 7; k++) { days.push(map[order[i]]); if (i === j) break; i = (i + 1) % 7; } }
      else days.push(map[a]);
    });
    const tp = timePart.trim().replace(/"[^"]*"/g, '').trim();
    const val = !tp || /^(off|closed)/i.test(tp) ? 'closed' : tp.replace(/\s+/g, '').replace(/,/g, ', ');
    days.forEach(d => { out[d] = additive && out[d] && out[d] !== 'closed' && val !== 'closed' ? out[d] + ', ' + val : val; });
  });
  if (Object.keys(out).length) WEEK.forEach(d => { if (!(d in out)) out[d] = 'closed'; });
  return out;
}

/* ---------- Nearby place search ---------- */
let searchMode = null; // 'osm' (live map data) | 'claude' (asked Claude) | 'none'
const geoCache = {};
async function withTimeout(promise, ms) {
  let t; const timer = new Promise((_, rej) => { t = setTimeout(() => rej(new Error('timeout')), ms); });
  try { return await Promise.race([promise, timer]); } finally { clearTimeout(t); }
}
async function geocode(label) {
  if (geoCache[label]) return geoCache[label];
  const r = await withTimeout(fetch('https://nominatim.openstreetmap.org/search?format=json&limit=1&q=' + encodeURIComponent(label)), 12000);
  const j = await r.json();
  if (!j[0]) throw Object.assign(new Error('Address not found'), { notFound: true });
  return (geoCache[label] = { lat: +j[0].lat, lon: +j[0].lon });
}
function distKm(a, b) {
  const R = 6371, dLat = (b.lat - a.lat) * Math.PI / 180, dLon = (b.lon - a.lon) * Math.PI / 180;
  const x = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * Math.PI / 180) * Math.cos(b.lat * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(x));
}
function osmRole(t) {
  if (t.amenity === 'pharmacy' || t.healthcare === 'pharmacy') return 'Pharmacy';
  if (t.amenity === 'dentist' || t.healthcare === 'dentist') return 'Dentist';
  if (t.amenity === 'hospital' || t.healthcare === 'hospital') return 'Hospital';
  if (/physiotherap|psychotherap|occupational|speech/.test(t.healthcare || '')) return 'Therapist';
  const sp = t['healthcare:speciality'] || '';
  if (!sp || /general|family|allgemein/.test(sp)) return 'Family doctor';
  return 'Specialist';
}
async function osmSearch(q, loc) {
  const c = loc.lat != null ? loc : await geocode(loc.label);
  const words = q.replace(/^(dr\.?|doctor|doktor|praxis)\s+/i, '').trim() || q;
  const rx = words.replace(/[.*+?^${}()|[\]\\"]/g, '\\$&');
  const query = `[out:json][timeout:20];(
    nwr(around:20000,${c.lat},${c.lon})["amenity"~"^(doctors|clinic|dentist|hospital|pharmacy)$"]["name"~"${rx}",i];
    nwr(around:20000,${c.lat},${c.lon})["healthcare"]["name"~"${rx}",i];
    nwr(around:20000,${c.lat},${c.lon})["healthcare:speciality"~"${rx}",i];
  );out center tags 30;`;
  const r = await withTimeout(fetch('https://overpass-api.de/api/interpreter', { method: 'POST', body: 'data=' + encodeURIComponent(query), headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }), 25000);
  if (!r.ok) throw new Error('search failed');
  const j = await r.json();
  const seen = new Set();
  return (j.elements || []).map(e => {
    const t = e.tags || {}, pos = e.center || { lat: e.lat, lon: e.lon };
    const street = [t['addr:street'], t['addr:housenumber']].filter(Boolean).join(' ');
    const town = [t['addr:postcode'], t['addr:city']].filter(Boolean).join(' ');
    return {
      name: t.name, role: osmRole(t), speciality: (t['healthcare:speciality'] || '').replace(/_/g, ' ').replace(/;/g, ', ').replace(/^./, ch => ch.toUpperCase()),
      address: [street, town].filter(Boolean).join(', '), phone: t.phone || t['contact:phone'] || '',
      hours: osmHours(t.opening_hours), website: t.website || t['contact:website'] || '',
      km: pos && pos.lat ? distKm(c, pos) : null, source: 'osm',
    };
  }).filter(x => x.name && !seen.has(x.name + x.address) && seen.add(x.name + x.address))
    .sort((a, b) => (a.km ?? 99) - (b.km ?? 99)).slice(0, 8);
}
async function claudeSearch(q, loc) {
  const sample = window.claude && window.claude.use ? await window.claude.use('sample') : null;
  if (!sample) throw new Error('unavailable');
  const prompt = `You help a family caregiver find a doctor's practice, clinic or pharmacy.
Search text typed by the caregiver: "${q}"
Location to search near: ${loc.label}${loc.lat != null ? ` (latitude ${loc.lat.toFixed(4)}, longitude ${loc.lon.toFixed(4)})` : ''}
List up to 5 real places that match the search text near that location (within about 20 km), best match first.
Only include places you are confident really exist. If you are not sure about a phone number, address or opening hours, use an empty string for that field. Never guess or invent details.
Reply with ONLY a JSON array and no other text, in this shape:
[{"name":"","type":"Family doctor|Specialist|Dentist|Pharmacy|Hospital|Therapist|Other","speciality":"","address":"street and number, postcode town","phone":"","hours":"OpenStreetMap opening_hours format, e.g. Mo-Fr 08:00-12:00; Mo,Tu,Th 14:00-18:00"}]
If you do not know any matching place, reply [].`;
  const res = await sample(prompt, { modelTier: 'default' });
  const txt = (res && res.text) || '';
  const a = txt.indexOf('['), b = txt.lastIndexOf(']');
  if (a < 0 || b < a) return [];
  const arr = JSON.parse(txt.slice(a, b + 1));
  return (Array.isArray(arr) ? arr : []).filter(x => x && x.name).slice(0, 5).map(x => ({
    name: String(x.name), role: ROLES.includes(x.type) ? x.type : 'Other', speciality: String(x.speciality || ''),
    address: String(x.address || ''), phone: String(x.phone || ''), hours: osmHours(String(x.hours || '')), km: null, source: 'claude',
  }));
}
const mapsSearchHref = (q, label) => 'https://www.google.com/maps/search/' + encodeURIComponent(q + (label ? ' near ' + label : ''));

/* The search box. opts.local: also suggest saved contacts. onPick(result | contact, isSaved). */
function placeSearchHTML(value, placeholder) {
  return `<div class="ps"><input name="who" class="ps-in" autocomplete="off" value="${esc(value || '')}" placeholder="${esc(placeholder || 'Start typing, e.g. Dr. Schmidt')}" role="combobox" aria-expanded="false" aria-autocomplete="list"><div class="ps-list" hidden></div></div>`;
}
function initPlaceSearch(root, { local = true, onPick }) {
  const box = $('.ps', root), inp = $('.ps-in', root), list = $('.ps-list', root);
  let timer, seq = 0, results = [], statusHtml = '';
  const p = P();
  const show = open => { list.hidden = !open; inp.setAttribute('aria-expanded', String(open)); };

  function draw() {
    const q = inp.value.trim();
    if (!q) { show(false); return; }
    const saved = local ? S.contacts.filter(c => c.name.toLowerCase().includes(q.toLowerCase())).slice(0, 4) : [];
    let h = saved.map(c => `<button type="button" class="ps-item" data-cid="${c.id}"><b>${esc(c.name)}</b><small>${icon('check')} Saved contact${c.role ? ' · ' + esc(c.role) : ''}${c.address ? ' · ' + esc(c.address) : ''}</small></button>`).join('');
    if (q.length >= 3) {
      if (!p.loc && !S.settings.noLoc) h += consentHTML(p);
      else if (p.loc) h += `<div class="ps-sec"><p class="ps-where">${icon('nav')} Near ${esc(p.loc.label)} · <button type="button" class="link small" data-loc-change>change</button></p>${statusHtml}${results.map((r, i) => resultHTML(r, i)).join('')}</div>`;
      h += `<a class="ps-foot" href="${mapsSearchHref(q, p.loc?.label || p.address)}" target="_blank" rel="noopener">${icon('search')} Search “${esc(q)}” on Google Maps</a>`;
    }
    list.innerHTML = h;
    show(!!h);
  }
  function resultHTML(r, i) {
    const bits = [r.speciality || r.role, r.km != null ? (r.km < 1 ? `${Math.round(r.km * 1000)} m` : `${r.km.toFixed(1)} km`) + ' away' : ''].filter(Boolean).join(' · ');
    return `<button type="button" class="ps-item" data-ri="${i}"><b>${esc(r.name)}</b><small>${esc(bits)}</small>
      ${r.address ? `<small>${esc(r.address)}</small>` : ''}
      <span class="ps-tags">${r.phone ? `<span class="pill">${icon('phone')} Phone</span>` : ''}${hasHours(r) ? `<span class="pill">${icon('clock')} Hours</span>` : ''}${r.source === 'claude' ? '<span class="pill warm">Please check</span>' : ''}</span></button>`;
  }
  async function online(byClick) {
    const q = inp.value.trim();
    if (q.length < 3 || !p.loc) return;
    const my = ++seq;
    if (searchMode === 'claude' && !byClick) {
      results = []; statusHtml = `<button type="button" class="btn sm primary ps-ask" data-ask>${icon('search')} Ask Claude to find “${esc(q)}” nearby</button>`; draw(); return;
    }
    if (searchMode === 'none') { results = []; statusHtml = '<p class="ps-msg">Searching nearby isn’t available here. Use the Google Maps link below, then type the details in.</p>'; draw(); return; }
    statusHtml = `<p class="ps-msg"><span class="spin"></span> Searching…</p>`; results = []; draw();
    try {
      let r;
      if (searchMode === 'claude') r = await claudeSearch(q, p.loc);
      else {
        try { r = await osmSearch(q, p.loc); searchMode = 'osm'; }
        catch (e) {
          if (e.notFound) throw e;
          if (searchMode === 'osm') throw e; // live search worked before: a temporary problem
          const sample = window.claude && window.claude.use ? await withTimeout(window.claude.use('sample'), 11000).catch(() => null) : null;
          searchMode = sample ? 'claude' : 'none';
          if (my === seq) online(false);
          return;
        }
      }
      if (my !== seq) return;
      results = r;
      statusHtml = r.length ? (searchMode === 'claude' ? '<p class="ps-msg warm">Suggested by Claude from what it knows — please double-check phone numbers and hours before relying on them.</p>' : '')
        : '<p class="ps-msg">Nothing found nearby with that name. Try fewer words, or the Google Maps link below.</p>';
    } catch (e) {
      if (my !== seq) return;
      results = [];
      statusHtml = e.notFound ? `<p class="ps-msg">Couldn’t find “${esc(p.loc.label)}” on the map. <button type="button" class="link small" data-loc-change>Change location</button></p>`
        : e.code === 'not_granted' ? '<p class="ps-msg">Claude wasn’t allowed to help here. You can use the Google Maps link below.</p>'
          : '<p class="ps-msg">The search didn’t work just now. Please try again in a moment.</p>';
    }
    draw();
  }
  function consentHTML(p) {
    return `<div class="ps-consent"><p><b>Find doctors and places near ${esc(p.name)}?</b></p>
      <p class="small muted">To suggest places nearby, the app needs a location. It’s only used for searching.</p>
      <div class="stack" style="margin-top:10px">
        ${p.address ? `<button type="button" class="btn sm primary" data-loc="home">${icon('home')} Near ${esc(p.name)}’s home</button>` : ''}
        <button type="button" class="btn sm" data-loc="here">${icon('nav')} Use my current location</button>
        <div class="timerow"><input class="ps-town" placeholder="Or type a town or address" aria-label="Town or address"><button type="button" class="btn sm" data-loc="manual">Use</button></div>
        <button type="button" class="link small" data-loc="no">No thanks</button></div></div>`;
  }
  function setLoc(loc) { clearTimeout(timer); p.loc = loc; S.settings.noLoc = false; save(); results = []; statusHtml = ''; draw(); online(false); }

  inp.addEventListener('input', () => {
    results = []; statusHtml = '';
    draw();
    clearTimeout(timer);
    timer = setTimeout(() => online(false), 700);
  });
  inp.addEventListener('focus', () => { if (inp.value.trim()) draw(); });
  inp.addEventListener('keydown', ev => { if (ev.key === 'Escape' && !list.hidden) { ev.stopPropagation(); show(false); } });
  list.addEventListener('click', ev => {
    const t = ev.target;
    const c = t.closest('[data-cid]'), r = t.closest('[data-ri]'), l = t.closest('[data-loc]');
    if (c) { const ct = contactById(c.dataset.cid); inp.value = ct.name; show(false); onPick(ct, true); }
    else if (r) { const res = results[+r.dataset.ri]; inp.value = res.name; show(false); onPick(res, false); }
    else if (t.closest('[data-ask]')) online(true);
    else if (t.closest('[data-loc-change]')) { delete p.loc; save(); draw(); }
    else if (l) {
      const how = l.dataset.loc;
      if (how === 'home') setLoc({ label: p.address });
      else if (how === 'manual') { const v = $('.ps-town', list).value.trim(); if (v) setLoc({ label: v }); else $('.ps-town', list).focus(); }
      else if (how === 'no') { S.settings.noLoc = true; save(); draw(); }
      else if (how === 'here') {
        const fail = () => { toast('Your location isn’t available here — please type a town instead'); const i = $('.ps-town', list); if (i) i.focus(); };
        try {
          if (!navigator.geolocation) return fail();
          l.disabled = true; l.lastChild.textContent = ' Finding you…';
          navigator.geolocation.getCurrentPosition(
            pos => setLoc({ label: 'your current location', lat: pos.coords.latitude, lon: pos.coords.longitude }),
            () => { l.disabled = false; l.lastChild.textContent = ' Use my current location'; fail(); }, { timeout: 15000, maximumAge: 600000 });
        } catch (e) { fail(); }
      }
    }
  });
  list.addEventListener('keydown', ev => { if (ev.key === 'Enter' && ev.target.classList.contains('ps-town')) { ev.preventDefault(); $('[data-loc="manual"]', list).click(); } });
  root.addEventListener('click', ev => { if (!box.contains(ev.target)) show(false); });
}

/* Turn a search result into a saved contact (re-using one with the same name and address). */
function contactFromResult(r) {
  const same = S.contacts.find(c => c.name.toLowerCase() === r.name.toLowerCase() && (!r.address || !c.address || c.address === r.address));
  if (same) {
    if (!same.phone && r.phone) same.phone = r.phone;
    if (!same.address && r.address) same.address = r.address;
    if (!hasHours(same) && hasHours(r)) same.hours = r.hours;
    return same;
  }
  const c = { id: uid(), name: r.name, role: r.role, phone: r.phone, address: r.address, hours: r.hours || {},
    notes: [r.speciality, r.website, r.source === 'claude' ? 'Details suggested by Claude — please check them.' : 'Details from OpenStreetMap.'].filter(Boolean).join('\n'), source: r.source };
  S.contacts.push(c);
  return c;
}
function pickedCard(c) {
  if (!c) return '';
  const st = statusPill(c);
  return `<div class="card picked">${icon('check', 'kind')}<div style="flex:1;min-width:0">
    <p class="t">${esc(c.name)}</p>
    <p class="s">${[c.role, c.address, c.phone].filter(Boolean).map(esc).join(' · ') || 'No details yet'}</p>
    ${st ? `<p style="margin-top:6px">${st}</p>` : ''}
    ${c.source === 'claude' ? '<p style="margin-top:6px"><span class="pill warm">Suggested by Claude — please check</span></p>' : ''}
    <p class="small muted" style="margin-top:4px">Saved in Contacts.</p></div>
    <button type="button" class="iconbtn" data-unpick aria-label="Remove">${icon('x')}</button></div>`;
}
