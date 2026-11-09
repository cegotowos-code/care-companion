'use strict';
/* Care Companion — all data is stored locally on this device (localStorage). */

const KEY = 'care-companion-v1';
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DAYS_LONG = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const WEEK = [1, 2, 3, 4, 5, 6, 0];
const COLORS = ['#a08f7d', '#8f9aa6', '#b59a8a', '#9aa58f', '#a99bb0', '#b3a27f'];
const ROLES = ['Family doctor', 'Specialist', 'Dentist', 'Pharmacy', 'Hospital', 'Therapist', 'Care service', 'Family', 'Neighbour', 'Other'];

/* ---------- Icons ---------- */
const ICONS = {
  home: '<path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="2.5"/><path d="M3 10h18M8 3v4M16 3v4"/>',
  pill: '<path d="M10.5 3.5a5 5 0 0 1 7.07 7.07l-7 7a5 5 0 0 1-7.07-7.07z"/><path d="M7 7l7 7"/>',
  phone: '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/>',
  nav: '<path d="M3 11l18-8-8 18-2-8z"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  book: '<rect x="4" y="3" width="16" height="18" rx="2.5"/><circle cx="12" cy="10" r="3"/><path d="M8 17a4 4 0 0 1 8 0"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  bag: '<path d="M5 8h14l-1 12H6z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/>',
  alert: '<path d="M12 3.5l9 16H3z"/><path d="M12 10v4M12 17v.01"/>',
  chev: '<path d="M9 6l6 6-6 6"/>',
  down: '<path d="M6 9l6 6 6-6"/>',
  x: '<path d="M6 6l12 12M18 6L6 18"/>',
  trash: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
  car: '<path d="M4 17v-5l2-5h12l2 5v5z"/><path d="M4 12h16"/><circle cx="7.5" cy="17" r="1.6"/><circle cx="16.5" cy="17" r="1.6"/>',
  stetho: '<path d="M6 3v6a5 5 0 0 0 10 0V3"/><path d="M11 14v2a4 4 0 0 0 8 0v-2"/><circle cx="19" cy="12" r="2"/>',
  leaf: '<path d="M5 19c0-9 6-14 15-14 0 9-5 15-14 15"/><path d="M5 19l8-8"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>',
  heart: '<path d="M12 20s-7-4.2-7-9.3C5 8.3 6.8 6.5 9 6.5c1.4 0 2.4.7 3 1.8.6-1.1 1.6-1.8 3-1.8 2.2 0 4 1.8 4 4.2C19 15.8 12 20 12 20z"/>',
  bell: '<path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15z"/><path d="M10 20a2 2 0 0 0 4 0"/>',
  print: '<path d="M7 9V3h10v6"/><rect x="3" y="9" width="18" height="8" rx="2"/><path d="M7 14h10v7H7z"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
};
const icon = (n, cls = '') => `<svg class="ic ${cls}" viewBox="0 0 24 24" aria-hidden="true">${ICONS[n] || ''}</svg>`;

/* ---------- Helpers ---------- */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const uid = () => Math.random().toString(36).slice(2, 10);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const pad = n => String(n).padStart(2, '0');
const ds = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const parseDs = s => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
const addDays = (s, n) => { const d = parseDs(s); d.setDate(d.getDate() + n); return ds(d); };
const today = () => ds(new Date());
const nowMin = () => { const d = new Date(); return d.getHours() * 60 + d.getMinutes(); };
const toMin = hm => { const [h, m] = hm.split(':').map(Number); return h * 60 + m; };
const minHM = m => pad(Math.floor(((m % 1440) + 1440) % 1440 / 60)) + ':' + pad(((m % 60) + 60) % 60);
const fmtT = hm => { if (!hm) return ''; const [h, m] = hm.split(':').map(Number); return new Date(2000, 0, 1, h, m).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }); };
const fmtD = (s, o) => parseDs(s).toLocaleDateString([], o || { weekday: 'long', day: 'numeric', month: 'long' });
const relDay = s => {
  const t = today();
  if (s === t) return 'Today';
  if (s === addDays(t, 1)) return 'Tomorrow';
  if (s === addDays(t, -1)) return 'Yesterday';
  return fmtD(s);
};
const telHref = p => 'tel:' + String(p).replace(/[^\d+]/g, '');
const mapHref = a => 'https://www.google.com/maps/dir/?api=1&destination=' + encodeURIComponent(a);
const searchHref = q => 'https://www.google.com/search?q=' + encodeURIComponent(q);
const initials = n => (n || '?').trim().split(/\s+/).map(w => w[0]).slice(0, 2).join('').toUpperCase();
const lines = s => String(s || '').split('\n').map(x => x.trim()).filter(Boolean);
const plural = (n, w) => `${n} ${w}${n === 1 ? '' : 's'}`;
const avatar = (p, cls = '') => p.photo ? `<img class="avatar ${cls}" src="${esc(p.photo)}" alt="">` : `<span class="avatar ${cls}" style="--c:${esc(p.color)}">${esc(initials(p.name))}</span>`;

/* ---------- State ---------- */
const blank = () => ({ people: [], contacts: [], meds: [], events: [], medLog: {}, prnLog: [], skipLog: {}, me: {}, activeId: null, settings: { notify: false } });
function load() {
  try {
    const d = JSON.parse(localStorage.getItem(KEY));
    if (d && Array.isArray(d.people)) return Object.assign(blank(), d);
  } catch (e) { /* ignore */ }
  return blank();
}
let S = load();
let view = 'today';
/* When running inside Claude, data is also kept in the viewer's private storage there. */
let cloud = null, cloudBusy = false, cloudDirty = false;
function save() {
  try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* storage may be unavailable */ }
  if (cloud) { cloudDirty = true; pushCloud(); }
}
async function pushCloud() {
  if (cloudBusy || !cloudDirty) return;
  cloudBusy = true; cloudDirty = false;
  try { await cloud.set({ json: JSON.stringify(S), updated: Date.now() }); } catch (e) { cloudDirty = true; }
  cloudBusy = false;
  if (cloudDirty) setTimeout(pushCloud, 800);
}
async function connectCloud() {
  try {
    if (!window.claude || !window.claude.use) return;
    const [db, user] = await Promise.all([window.claude.use('db'), window.claude.use('user')]);
    if (!db || !user) return;
    const id = await user.id();
    if (!id) return;
    const ref = db.collection('data/users/' + id).doc('state');
    const timer = new Promise(r => setTimeout(() => r('timeout'), 10000));
    const snap = await Promise.race([ref.get(), timer]);
    if (snap === 'timeout') return;
    cloud = ref;
    const d = snap && (typeof snap.data === 'function' ? snap.data() : snap);
    if (d && d.json) {
      const parsed = JSON.parse(d.json);
      if (parsed && Array.isArray(parsed.people)) { S = Object.assign(blank(), parsed); try { localStorage.setItem(KEY, d.json); } catch (e) {} if (!$('.overlay')) render(); }
    } else if (S.people.length) { save(); }
  } catch (e) { /* keep working locally */ }
}

const P = () => S.people.find(p => p.id === S.activeId) || S.people[0];
const medsOf = pid => S.meds.filter(m => m.personId === pid);
const eventsOf = pid => S.events.filter(e => e.personId === pid);
const contactById = id => S.contacts.find(c => c.id === id);
const medById = id => S.meds.find(m => m.id === id);
const evById = id => S.events.find(e => e.id === id);

/* ---------- Scheduling ---------- */
function medOn(m, date) {
  if (m.asNeeded) return false;
  if (m.start && date < m.start) return false;
  if (m.end && date > m.end) return false;
  if (m.days && m.days.length && !m.days.includes(parseDs(date).getDay())) return false;
  return true;
}
const logKey = (date, mid, t) => `${date}|${mid}|${t}`;

function evOn(e, date) {
  if (date < e.date) return false;
  if ((e.skipDates || []).includes(date)) return false;
  if (date === e.date) return true;
  if (e.until && date > e.until) return false;
  if (e.repeat === 'daily') return true;
  if (e.repeat === 'weekly') return parseDs(date).getDay() === parseDs(e.date).getDay();
  if (e.repeat === 'monthly') return parseDs(date).getDate() === parseDs(e.date).getDate();
  return false;
}
const evDone = (e, date) => (e.doneDates || []).includes(date);

function agenda(pid, date) {
  const items = [];
  medsOf(pid).filter(m => medOn(m, date)).forEach(m =>
    (m.times || []).filter(t => !(S.skipLog || {})[logKey(date, m.id, t)]).forEach(t => items.push({ kind: 'med', time: t, m, date, key: logKey(date, m.id, t), done: !!S.medLog[logKey(date, m.id, t)] })));
  eventsOf(pid).filter(e => evOn(e, date)).forEach(e => items.push({ kind: 'event', time: e.time || '', e, date, done: evDone(e, date) }));
  return items.sort((a, b) => (a.time || '99').localeCompare(b.time || '99'));
}

/* Medicines due at the same time are grouped into one "round". */
function grouped(items) {
  const out = [], rounds = {};
  items.forEach(i => {
    if (i.kind === 'med') {
      if (!rounds[i.time]) { rounds[i.time] = { kind: 'round', time: i.time, date: i.date, meds: [] }; out.push(rounds[i.time]); }
      rounds[i.time].meds.push(i);
    } else out.push(i);
  });
  out.forEach(o => { if (o.kind === 'round') o.done = o.meds.every(x => x.done); });
  return out;
}

function hasStock(m) { return m.stock !== '' && m.stock != null && !isNaN(+m.stock); }
function daysLeft(m) {
  if (!hasStock(m) || m.asNeeded) return null;
  const perWeekDays = (m.days && m.days.length) ? m.days.length / 7 : 1;
  const perDay = (m.times || []).length * (+m.perDose || 1) * perWeekDays;
  if (!perDay) return null;
  return Math.floor(+m.stock / perDay);
}

/* ---------- Opening hours ---------- */
function parseHours(str) {
  if (str == null) return null;
  const s = String(str).trim().toLowerCase();
  if (!s) return null;
  const r = [];
  s.split(/[,;&]|\band\b/).forEach(part => {
    const m = part.match(/(\d{1,2})(?:[:.](\d{2}))?\s*(?:-|–|—|to|bis)\s*(\d{1,2})(?:[:.](\d{2}))?/);
    if (m) r.push([+m[1] * 60 + (+m[2] || 0), +m[3] * 60 + (+m[4] || 0)]);
  });
  return r; // [] = closed
}
const hasHours = c => c && c.hours && Object.values(c.hours).some(v => v && String(v).trim());
function openAt(c, date, hm) {
  if (!hasHours(c)) return null;
  const r = parseHours(c.hours[parseDs(date).getDay()]);
  if (r === null) return null;
  const x = toMin(hm);
  return r.some(([a, b]) => x >= a && x < b);
}
const fmtM = m => fmtT(minHM(m));
function hoursText(c, day) {
  const r = parseHours(c.hours?.[day]);
  if (r === null) return '—';
  if (!r.length) return 'Closed';
  return r.map(([a, b]) => `${fmtM(a)} – ${fmtM(b)}`).join(', ');
}
function openStatus(c) {
  if (!hasHours(c)) return { state: 'unknown', text: '' };
  const d = new Date(), day = d.getDay(), x = nowMin();
  const cur = (parseHours(c.hours[day]) || []).find(([a, b]) => x >= a && x < b);
  if (cur) {
    const left = cur[1] - x;
    return left <= 30 ? { state: 'soon', text: `Closes soon · ${fmtM(cur[1])}` } : { state: 'open', text: `Open until ${fmtM(cur[1])}` };
  }
  for (let k = 0; k < 8; k++) {
    const dd = (day + k) % 7;
    const nxt = (parseHours(c.hours[dd]) || []).filter(([a]) => k > 0 || a > x).sort((p, q) => p[0] - q[0])[0];
    if (nxt) return { state: 'closed', text: `Closed · opens ${k === 0 ? '' : k === 1 ? 'tomorrow ' : DAYS_LONG[dd] + ' '}${fmtM(nxt[0])}` };
  }
  return { state: 'closed', text: 'Closed' };
}
const statusPill = c => { const s = openStatus(c); return s.state === 'unknown' ? '' : `<span class="pill ${s.state}">${esc(s.text)}</span>`; };

/* ---------- Toast ---------- */
let toastTimer, toastGone;
function toast(msg, undo) {
  const t = $('#toast');
  clearTimeout(toastTimer); clearTimeout(toastGone);
  t.innerHTML = `<span>${esc(msg)}</span>${undo ? '<button type="button">Undo</button>' : ''}`;
  t.style.transition = ''; t.style.transform = ''; t.style.opacity = '';
  t.classList.remove('hide');
  void t.offsetWidth;
  t.classList.add('show');
  if (undo) t.querySelector('button').onclick = () => { undo(); hideToast(); };
  toastTimer = setTimeout(() => hideToast(), undo ? 5000 : 2200);
}
function hideToast(dx = 0, dy = 0) {
  const t = $('#toast');
  if (!t.classList.contains('show')) return;
  clearTimeout(toastTimer);
  t.style.transition = '';
  if (dx || dy) {
    t.style.transform = dy ? 'translate(-50%, 90px)' : `translate(calc(-50% + ${dx < 0 ? -420 : 420}px), 0)`;
    t.style.opacity = '0';
  } else t.classList.add('hide');
  toastGone = setTimeout(() => { t.classList.remove('show', 'hide'); t.style.transform = ''; t.style.opacity = ''; }, 380);
}
(function toastSwipe() {
  let st = null;
  document.addEventListener('pointerdown', ev => {
    const t = ev.target.closest('#toast');
    if (!t || ev.target.closest('button') || !t.classList.contains('show')) return;
    st = { x: ev.clientX, y: ev.clientY, dx: 0, dy: 0 };
    clearTimeout(toastTimer);
    t.style.transition = 'none';
  });
  document.addEventListener('pointermove', ev => {
    if (!st) return;
    st.dx = ev.clientX - st.x; st.dy = Math.max(0, ev.clientY - st.y);
    const t = $('#toast');
    t.style.transform = `translate(calc(-50% + ${st.dx}px), ${st.dy}px)`;
    t.style.opacity = String(Math.max(0.2, 1 - Math.max(Math.abs(st.dx), st.dy * 2) / 260));
  });
  const end = () => {
    if (!st) return;
    const { dx, dy } = st; st = null;
    const t = $('#toast');
    if (Math.abs(dx) > 70) hideToast(dx, 0);
    else if (dy > 40) hideToast(0, dy);
    else { t.style.transition = ''; t.style.transform = ''; t.style.opacity = ''; toastTimer = setTimeout(() => hideToast(), 1800); }
  };
  document.addEventListener('pointerup', end);
  document.addEventListener('pointercancel', end);
})();

/* ---------- Rendering ---------- */
const NAV = [['today', 'home', 'Today'], ['plan', 'calendar', 'Plan'], ['meds', 'pill', 'Medicines'], ['contacts', 'book', 'Contacts'], ['about', 'user', 'About']];
let shownView = null;
function render() {
  const app = $('#app');
  if (!S.people.length) { app.innerHTML = vWelcome(); shownView = null; return; }
  const p = P();
  if (S.activeId !== p.id) { S.activeId = p.id; save(); }
  const views = { today: vToday, plan: vPlan, meds: vMeds, contacts: vContacts, about: vAbout };
  if (!$('#shell')) {
    app.innerHTML = `<div id="shell">
      <header class="top" id="top"></header>
      <main id="main"></main>
      <button class="fab" data-act="add" aria-label="Add something">${icon('plus')}</button>
      <nav class="nav" aria-label="Main"><ul><li class="nav-ind" aria-hidden="true"></li>${NAV.map(([v, i, l]) =>
        `<li><button data-act="nav" data-v="${v}">${icon(i)}<span>${l}</span></button></li>`).join('')}</ul></nav></div>`;
  }
  $('#top').innerHTML = `<button class="who" data-act="switch-person" aria-label="Caring for ${esc(p.name)}. Switch person">
      ${avatar(p)}<span><small>Caring for</small><b>${esc(p.name)}</b></span>${icon('down')}</button>`;
  const main = $('#main');
  main.innerHTML = views[view](p);
  if (shownView !== view) {
    main.classList.remove('enter'); void main.offsetWidth; main.classList.add('enter');
    shownView = view;
  }
  const idx = NAV.findIndex(n => n[0] === view);
  $('.nav ul').style.setProperty('--i', idx);
  $$('.nav [data-act=nav]').forEach(b => { if (b.dataset.v === view) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current'); });
}

function vWelcome() {
  return `<div class="welcome">
    <svg class="logo" viewBox="0 0 512 512" aria-hidden="true"><rect width="512" height="512" rx="112" fill="#8a7a6a"/><path d="M256 384s-118-70-118-156c0-40 30-68 66-68 24 0 42 12 52 30 10-18 28-30 52-30 36 0 66 28 66 68 0 86-118 156-118 156z" fill="#fffdf9"/></svg>
    <h1>Care Companion</h1>
    <p class="lead">A calm place for everything you need to remember while caring for someone.</p>
    <ul>
      <li>Medicines — what, how much and when</li>
      <li>Appointments, errands, things to bring</li>
      <li>Doctors with phone numbers, directions and opening hours</li>
    </ul>
    <form id="welcome-form">
      <label class="field"><span>Your first name</span>
        <input name="me" placeholder="So the app can greet you" autocomplete="given-name"></label>
      <label class="field"><span>Who are you caring for?</span>
        <input name="name" required placeholder="e.g. Mum, Dad, Grandpa Joe" autocomplete="off"></label>
      <div style="margin-top:16px"><button class="btn primary big">Get started</button></div>
    </form>
    <p style="margin-top:18px;text-align:center"><button class="link" data-act="demo">Or look around with an example first</button></p>
    <p class="muted small" style="margin-top:20px;text-align:center">Everything stays private on this device. No account needed.</p>
  </div>`;
}

/* ---- Today ---- */
function vToday(p) {
  const t = today(), x = nowMin();
  const items = grouped(agenda(p.id, t));
  const h = new Date().getHours();
  const greet = h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
  const myName = (S.me && S.me.name) ? ', ' + esc(S.me.name.split(' ')[0]) : '';
  let html = `<div class="hello"><p class="muted">${fmtD(t)}</p><h1>${greet}${myName}</h1></div>`;
  if (p.allergies) html += `<div class="keyinfo">${icon('alert')}<span><b>Allergies:</b> ${esc(p.allergies)}</span></div>`;
  html += nextUp(p, items, x);
  html += `<h2 class="sec">Today’s plan <span class="small">${items.filter(i => i.done).length} of ${items.length} done</span></h2>`;
  if (items.length && !S.settings.swipeTipDone) html += `<p class="swipe-tip">${icon('chev', 'flip')} Tip: swipe an item to the left to remove it <button class="link small" data-act="swipe-tip">Got it</button></p>`;
  html += items.length ? items.map(i => swipeWrap(i, rowHtml(i, x))).join('') :
    `<div class="card empty">${icon('leaf')}<p>Nothing planned for today.</p><button class="btn" data-act="add">Add something</button></div>`;
  const hu = headsUp(p);
  if (hu.length) html += `<h2 class="sec">Thinking ahead</h2><div class="stack">${hu.join('')}</div>`;
  return html;
}

function isLate(i, x) { return i.time && !i.done && toMin(i.time) < x - 15; }

function nextUp(p, items, x) {
  const n = items.find(i => !i.done && (!i.time || toMin(i.time) >= x - 180)) || items.find(i => !i.done);
  if (!items.length) return '';
  if (!n) return `<div class="card next calm"><p class="label">All done</p><h2>Everything for today is taken care of.</h2><p class="when">Well done. Take a moment for yourself, too.</p></div>`;
  const late = isLate(n, x) ? `<span class="overdue">Was due at ${fmtT(n.time)}</span>` : '';
  if (n.kind === 'round') {
    const open = n.meds.filter(m => !m.done);
    return `<section class="card next" aria-label="Next up">
      <p class="label">Next up</p>
      <h2>Medicines at ${fmtT(n.time)}</h2>${late}
      <ul class="lines">${open.map(i => `<li><b>${esc(i.m.name)}</b> ${esc(i.m.dose || '')}${i.m.instructions ? ` · ${esc(i.m.instructions)}` : ''}</li>`).join('')}</ul>
      <div class="actions"><button class="btn solid" data-act="round-all" data-date="${n.date}" data-time="${n.time}">${icon('check')} Mark ${open.length > 1 ? 'all ' : ''}as given</button></div>
    </section>`;
  }
  const e = n.e, c = contactById(e.contactId);
  const addr = e.address || c?.address;
  const phone = c?.phone;
  return `<section class="card next" aria-label="Next up">
    <p class="label">Next up</p>
    <h2>${esc(e.title)}</h2>
    <p class="when">${n.time ? fmtT(n.time) : 'Any time today'}${e.place ? ` · ${esc(e.place)}` : ''}</p>${late}
    ${(e.bring || []).length ? `<ul class="lines"><li>${icon('bag')} Bring: ${esc(e.bring.join(', '))}</li></ul>` : ''}
    <div class="actions">
      ${addr ? `<a class="btn" href="${mapHref(addr)}" target="_blank" rel="noopener">${icon('nav')} Directions</a>` : ''}
      ${phone ? `<a class="btn" href="${telHref(phone)}">${icon('phone')} ${esc(phone)}</a>` : ''}
      <button class="btn" data-act="open-ev" data-id="${e.id}" data-date="${n.date}">Details</button>
      <button class="btn solid" data-act="toggle-ev" data-id="${e.id}" data-date="${n.date}">${icon('check')} Done</button>
    </div>
  </section>`;
}

function rowHtml(i, x) {
  const late = x != null && isLate(i, x);
  if (i.kind === 'round') {
    return `<div class="row ${i.done ? 'done' : ''}">
      <div class="time">${fmtT(i.time)}</div>
      <div class="body">
        <p class="title">${icon('pill', 'kind')}<span>Medicines</span>${late ? '<span class="overdue">Due</span>' : ''}</p>
        ${i.meds.map(m => `<button class="medline ${m.done ? 'on' : ''}" data-act="toggle-med" data-k="${m.key}" data-m="${m.m.id}" aria-pressed="${m.done}">
          <span class="box">${icon('check')}</span>
          <span><span class="nm">${esc(m.m.name)}</span> ${esc(m.m.dose || '')}<small>${esc(m.m.instructions || '')}${m.done ? ` · given ${new Date(S.medLog[m.key]).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}` : ''}</small></span>
        </button>`).join('')}
      </div>
    </div>`;
  }
  const e = i.e, c = contactById(e.contactId);
  const sub = [e.place || c?.name, (e.bring || []).length ? 'Bring: ' + e.bring.join(', ') : ''].filter(Boolean).join(' · ');
  return `<div class="row ${i.done ? 'done' : ''}">
    <div class="time">${i.time ? fmtT(i.time) : 'Any time'}</div>
    <div class="body"><button class="open" data-act="open-ev" data-id="${e.id}" data-date="${i.date}">
      <p class="title">${icon(e.type === 'errand' ? 'car' : 'stetho', 'kind')}<span>${esc(e.title)}</span>${late ? '<span class="overdue">Due</span>' : ''}</p>
      ${sub ? `<p class="sub">${esc(sub)}</p>` : ''}</button></div>
    <button class="check ${i.done ? 'on' : ''}" data-act="toggle-ev" data-id="${e.id}" data-date="${i.date}" aria-pressed="${i.done}" aria-label="Mark ${esc(e.title)} as done">${icon('check')}</button>
  </div>`;
}

function swipeWrap(i, inner) {
  const data = i.kind === 'round' ? `data-swipe="round" data-date="${i.date}" data-time="${i.time}"` : `data-swipe="event" data-id="${i.e.id}" data-date="${i.date}"`;
  return `<div class="swipe" ${data}><div class="swipe-bg" aria-hidden="true"><span>Remove</span>${icon('trash')}</div>${inner}</div>`;
}

/* "Thinking ahead": tomorrow's prep, refills, opening-hour clashes. */
function headsUp(p) {
  const out = [], t = today(), tm = addDays(t, 1);
  agenda(p.id, tm).filter(i => i.kind === 'event').forEach(i => {
    const e = i.e;
    const bring = e.bring || [];
    out.push(`<div class="card tip">${icon('calendar')}<div><p class="t">Tomorrow${i.time ? ' at ' + fmtT(i.time) : ''}: ${esc(e.title)}</p>
      <p class="muted">${bring.length ? 'Get ready tonight: ' + esc(bring.join(', ')) : esc(e.place || 'Nothing to prepare.')}</p>
      <div class="actions"><button class="btn sm" data-act="open-ev" data-id="${e.id}" data-date="${tm}">See details</button></div></div></div>`);
  });
  const pharmacy = S.contacts.find(c => /pharm|apothek/i.test(c.role || ''));
  medsOf(p.id).forEach(m => {
    const d = daysLeft(m);
    if (d !== null && d <= 7) {
      const ph = contactById(m.pharmacyId) || pharmacy;
      out.push(`<div class="card tip warm">${icon('pill')}<div><p class="t">${esc(m.name)}: ${d <= 0 ? 'running out now' : `about ${plural(d, 'day')} left`}</p>
        <p class="muted">${+m.stock} left. Time to arrange a refill or new prescription.</p>
        <div class="actions">${ph?.phone ? `<a class="btn sm" href="${telHref(ph.phone)}">${icon('phone')} ${esc(ph.name)} · ${esc(ph.phone)}</a>` : ''}
        <button class="btn sm" data-act="open-med" data-id="${m.id}">Update stock</button></div></div></div>`);
    }
  });
  for (let k = 0; k <= 14; k++) {
    const d = addDays(t, k);
    eventsOf(p.id).filter(e => e.contactId && e.time && evOn(e, d) && !evDone(e, d)).forEach(e => {
      const c = contactById(e.contactId);
      if (openAt(c, d, e.time) === false) {
        out.push(`<div class="card tip warm">${icon('clock')}<div><p class="t">Please double-check: ${esc(e.title)}</p>
          <p class="muted">${esc(c.name)} is usually closed ${relDay(d).toLowerCase() === 'today' || relDay(d) === 'Tomorrow' ? relDay(d).toLowerCase() : 'on ' + relDay(d)} at ${fmtT(e.time)}. Worth a quick call to confirm.</p>
          ${c.phone ? `<div class="actions"><a class="btn sm" href="${telHref(c.phone)}">${icon('phone')} ${esc(c.phone)}</a></div>` : ''}</div></div>`);
      }
    });
  }
  return out;
}

/* ---- Plan ---- */
function vPlan(p) {
  const t = today();
  let html = `<div class="hello"><h1>Plan</h1><p class="muted">Appointments and errands for the next 8 weeks.</p></div>`;
  let any = false;
  for (let k = 0; k < 56; k++) {
    const d = addDays(t, k);
    const items = agenda(p.id, d).filter(i => i.kind === 'event');
    if (!items.length) continue;
    any = true;
    const label = relDay(d);
    html += `<h3 class="day-h">${esc(label)}${label === 'Today' || label === 'Tomorrow' ? `<small>${fmtD(d, { weekday: 'long', day: 'numeric', month: 'long' })}</small>` : ''}</h3>`;
    html += items.map(i => rowHtml(i, k === 0 ? nowMin() : null)).join('');
  }
  if (!any) html += `<div class="card empty">${icon('calendar')}<p>No appointments or errands yet.</p><button class="btn primary" data-act="add-ev">Add an appointment</button></div>`;
  html += `<p class="muted small" style="margin-top:18px">Daily medicines are on the Medicines tab so this stays uncluttered.</p>`;
  return html;
}

/* ---- Medicines ---- */
function vMeds(p) {
  const t = today();
  const meds = medsOf(p.id);
  const doses = agenda(p.id, t).filter(i => i.kind === 'med');
  const given = doses.filter(d => d.done).length;
  let html = `<div class="hello"><h1>Medicines</h1></div>`;
  if (!meds.length) return html + `<div class="card empty">${icon('pill')}<p>No medicines added yet.</p><p class="small">Add each medicine once with its times. It will show up on Today automatically.</p><button class="btn primary" data-act="add-med">Add a medicine</button></div>`;
  if (doses.length) html += `<div class="card"><p><b>${given} of ${doses.length}</b> doses given today</p><div class="progress"><span style="width:${Math.round(given / doses.length * 100)}%"></span></div></div>`;
  const reg = meds.filter(m => !m.asNeeded), prn = meds.filter(m => m.asNeeded);
  if (reg.length) html += `<h2 class="sec">Regular</h2><div class="stack">${reg.map(medCard).join('')}</div>`;
  if (prn.length) html += `<h2 class="sec">Only when needed</h2><div class="stack">${prn.map(m => {
    const last = S.prnLog.filter(l => l.mid === m.id).sort((a, b) => b.ts - a.ts)[0];
    return `<div class="card"><button class="item" data-act="open-med" data-id="${m.id}"><span class="ibadge">${icon('pill')}</span><span class="body"><p class="t">${esc(m.name)} ${esc(m.dose || '')}</p>
      <p class="s">${last ? 'Last given ' + relDay(ds(new Date(last.ts))).toLowerCase() + ' at ' + new Date(last.ts).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) : 'Not given yet'}${m.instructions ? ' · ' + esc(m.instructions) : ''}</p></span>${icon('chev')}</button>
      <div class="actions" style="margin-top:12px"><button class="btn sm" data-act="prn" data-id="${m.id}">${icon('check')} Given now</button></div></div>`;
  }).join('')}</div>`;
  html += `<p style="margin-top:16px"><button class="btn big" data-act="add-med">${icon('plus')} Add a medicine</button></p>`;
  return html;
}
function medCard(m) {
  const d = daysLeft(m);
  const days = m.days && m.days.length && m.days.length < 7 ? m.days.slice().sort((a, b) => WEEK.indexOf(a) - WEEK.indexOf(b)).map(x => DAYS[x]).join(', ') : 'Every day';
  return `<div class="card"><button class="item" data-act="open-med" data-id="${m.id}">
    <span class="ibadge">${icon('pill')}</span>
    <span class="body"><p class="t">${esc(m.name)} <span class="muted" style="font-weight:500">${esc(m.dose || '')}</span></p>
      <p class="s">${days}${m.instructions ? ' · ' + esc(m.instructions) : ''}</p>
      <div class="chips" style="margin-top:8px">${(m.times || []).map(t => `<span class="tchip">${fmtT(t)}</span>`).join('')}
      ${d !== null ? `<span class="pill ${d <= 7 ? 'warm' : ''}">${d <= 7 ? 'Refill soon · ' : ''}${plural(d, 'day')} left</span>` : ''}</div>
    </span>${icon('chev')}</button></div>`;
}

/* ---- Contacts ---- */
function vContacts() {
  let html = `<div class="hello"><h1>Contacts &amp; places</h1><p class="muted">Doctors, pharmacy, family — one tap to call or get directions.</p></div>`;
  if (!S.contacts.length) return html + `<div class="card empty">${icon('book')}<p>No contacts yet.</p><p class="small">Add the family doctor and pharmacy first — they are needed most often.</p><button class="btn primary" data-act="add-contact">Add a contact</button></div>`;
  const sorted = S.contacts.slice().sort((a, b) => ROLES.indexOf(a.role) - ROLES.indexOf(b.role) || a.name.localeCompare(b.name));
  html += `<div class="stack">${sorted.map(c => `<div class="card">
    <button class="item" data-act="open-contact" data-id="${c.id}"><span class="ibadge">${icon(/pharm/i.test(c.role) ? 'pill' : /doctor|special|dent|hosp|thera/i.test(c.role) ? 'stetho' : 'user')}</span>
      <span class="body"><p class="t">${esc(c.name)}</p><p class="s">${esc(c.role || '')}</p>${statusPill(c) ? `<div style="margin-top:6px">${statusPill(c)}</div>` : ''}</span>${icon('chev')}</button>
    ${c.phone || c.address ? `<div class="actions" style="margin-top:12px">
      ${c.phone ? `<a class="btn sm" href="${telHref(c.phone)}">${icon('phone')} ${esc(c.phone)}</a>` : ''}
      ${c.address ? `<a class="btn sm" href="${mapHref(c.address)}" target="_blank" rel="noopener">${icon('nav')} Directions</a>` : ''}</div>` : ''}
  </div>`).join('')}</div>`;
  html += `<p style="margin-top:16px"><button class="btn big" data-act="add-contact">${icon('plus')} Add a contact</button></p>`;
  return html;
}

/* ---- About the person ---- */
function age(b) { if (!b) return ''; const d = parseDs(b), n = new Date(); let a = n.getFullYear() - d.getFullYear(); if (n < new Date(n.getFullYear(), d.getMonth(), d.getDate())) a--; return a; }
function vAbout(p) {
  const row = (k, v) => v ? `<dt>${k}</dt><dd>${esc(v)}</dd>` : '';
  const sec = (title, rows) => rows ? `<h2 class="sec">${title}</h2><div class="card"><dl class="dl">${rows}</dl></div>` : '';
  const gp = contactById(p.gpId);
  const meds = medsOf(p.id);
  const health = row('Allergies', p.allergies) + row('Conditions', p.conditions) + row('Blood type', p.blood) + row('Height', p.height) + row('Weight', p.weight)
    + row('Implants', p.implants) + row('Hearing & sight', p.senses) + row('Mobility', p.mobility) + row('Diet', p.diet);
  const care = row('Care level', p.careLevel) + row('Insurance', p.insurance) + row('Insurance no.', p.insuranceNo) + row('Living will', p.livingWill)
    + row('Power of attorney', p.attorney) + row('Organ donor', p.organDonor);
  const life = row('Daily routine', p.routine) + row('Likes', p.likes) + row('Dislikes', p.dislikes) + row('What helps', p.calming) + row('Faith', p.faith);
  const basics = row('Called', p.nickname) + row('Birthday', p.birthdate ? fmtD(p.birthdate, { day: 'numeric', month: 'long', year: 'numeric' }) : '') + row('Language', p.language) + row('Phone', p.phone);
  return `<div class="screen-only">
    <div class="card profile-head">
      ${avatar(p, 'xl')}
      <div style="flex:1;min-width:0"><h1 style="font-size:1.5rem">${esc(p.name)}</h1>
      <p class="muted">${[p.relation, p.birthdate ? age(p.birthdate) + ' years' : ''].filter(Boolean).map(esc).join(' · ')}</p>
      <button class="btn sm" style="margin-top:10px" data-act="edit-person">Edit details</button></div>
    </div>
    ${p.emergencyPhone ? `<a class="btn primary big" style="margin-top:12px" href="${telHref(p.emergencyPhone)}">${icon('phone')} ${esc(p.emergencyName || 'Emergency contact')} · ${esc(p.emergencyPhone)}</a>` : ''}
    ${p.emergency2Phone ? `<a class="btn big" style="margin-top:8px" href="${telHref(p.emergency2Phone)}">${icon('phone')} ${esc(p.emergency2Name || 'Second contact')} · ${esc(p.emergency2Phone)}</a>` : ''}
    ${p.address ? `<div class="card" style="margin-top:12px"><p class="muted small">Home</p><p style="font-weight:600">${esc(p.address)}</p>${p.access ? `<p class="small" style="margin-top:4px">${esc(p.access)}</p>` : ''}
      <div class="actions" style="margin-top:10px"><a class="btn sm" href="${mapHref(p.address)}" target="_blank" rel="noopener">${icon('nav')} Directions</a></div></div>` : ''}
    ${sec('Personal', basics)}
    ${health ? sec('Health', health) : `<h2 class="sec">Health</h2><div class="card"><p class="muted">Add allergies and conditions so they’re at hand at every appointment. <button class="link" data-act="edit-person">Add now</button></p></div>`}
    ${gp ? `<h2 class="sec">Family doctor</h2><div class="card"><button class="item" data-act="open-contact" data-id="${gp.id}"><span class="ibadge">${icon('stetho')}</span><span class="body"><p class="t">${esc(gp.name)}</p>${statusPill(gp)}</span>${icon('chev')}</button></div>` : ''}
    ${sec('Care &amp; legal', care)}
    ${sec('Everyday life', life)}
    ${p.notes ? `<h2 class="sec">Good to know</h2><div class="card"><p style="white-space:pre-wrap">${esc(p.notes)}</p></div>` : ''}
    <h2 class="sec">About me</h2>
    ${meCard()}
    <h2 class="sec">People I care for</h2>
    <div class="card"><div class="stack">${S.people.map(x => `<button class="item" data-act="pick-person" data-id="${x.id}">${avatar(x)}<span class="body"><p class="t">${esc(x.name)}</p><p class="s">${x.id === p.id ? 'Selected' : 'Tap to switch'}</p></span></button>`).join('')}</div>
    <button class="btn" style="margin-top:12px;width:100%" data-act="add-person">${icon('plus')} Add someone</button></div>
    <h2 class="sec">Helpful</h2>
    <div class="stack">
      <button class="btn big" data-act="print">${icon('print')} Summary for the doctor</button>
      ${canNotify() ? `<button class="btn big" data-act="notify">${icon('bell')} ${S.settings.notify ? 'Reminders are on' : 'Turn on reminders'}</button>` : ''}
    </div>
    <h2 class="sec">My data</h2>
    <div class="card"><p class="muted small">Everything is saved privately on my phone. A backup now and then keeps it safe, or helps move to a new phone.</p>
      <div class="actions" style="margin-top:12px"><button class="btn sm" data-act="export">Save a backup</button><button class="btn sm" data-act="import">Restore a backup</button></div>
      <div class="actions" style="margin-top:8px"><button class="btn sm danger" data-act="delete-person">Remove ${esc(p.name)}</button></div></div>
  </div>
  <div class="print-only">
    <h1>${esc(p.name)}</h1>
    <p>${[p.birthdate ? 'Born ' + fmtD(p.birthdate, { day: 'numeric', month: 'long', year: 'numeric' }) : '', p.insurance, p.insuranceNo].filter(Boolean).map(esc).join(' · ')}</p>
    <p><b>Allergies:</b> ${esc(p.allergies || 'none known')}</p>
    <p><b>Conditions:</b> ${esc(p.conditions || '—')}</p>
    <h2 style="margin-top:16px">Current medicines</h2>
    <table><tr><th>Medicine</th><th>Dose</th><th>When</th><th>Notes</th></tr>
    ${meds.map(m => `<tr><td>${esc(m.name)}</td><td>${esc(m.dose || '')}</td><td>${m.asNeeded ? 'When needed' : (m.times || []).map(fmtT).join(', ')}</td><td>${esc(m.instructions || '')}</td></tr>`).join('')}</table>
    <p style="margin-top:12px">Printed ${fmtD(today(), { day: 'numeric', month: 'long', year: 'numeric' })}</p>
  </div>`;
}

/* ---------- Sheets (dialogs) ---------- */
let lastFocus;
function sheet(title, body, onMount) {
  closeSheet(true);
  lastFocus = document.activeElement;
  const el = document.createElement('div');
  el.className = 'overlay';
  el.innerHTML = `<div class="sheet" role="dialog" aria-modal="true" aria-label="${esc(title)}">
    <div class="sheet-head"><h2>${esc(title)}</h2><button class="iconbtn" data-close aria-label="Close">${icon('x')}</button></div>
    <div class="sheet-body">${body}</div></div>`;
  el.addEventListener('click', e => { if (e.target === el || e.target.closest('[data-close]')) closeSheet(); });
  $$('.overlay').forEach(o => o.remove());
  document.body.appendChild(el);
  document.body.classList.add('noscroll');
  const s = el.querySelector('.sheet');
  initPickers(s);
  if (onMount) onMount(s);
  const f = s.querySelector('[autofocus]') || s.querySelector('.sheet-body button, .sheet-body a, .sheet-body input');
  if (f && !matchMedia('(pointer:coarse)').matches) f.focus(); else s.querySelector('[data-close]').focus();
  return s;
}
function closeSheet(silent) {
  $$('.overlay').forEach(o => {
    if (silent || matchMedia('(prefers-reduced-motion: reduce)').matches) { o.remove(); return; }
    if (o.classList.contains('closing')) return;
    o.classList.add('closing');
    setTimeout(() => o.remove(), 240);
  });
  document.body.classList.remove('noscroll');
  if (!silent && lastFocus && document.contains(lastFocus)) lastFocus.focus();
}

const box = (label, inner, hint) => `<div class="field"><span>${label}</span>${inner}${hint ? `<p class="hint">${hint}</p>` : ''}</div>`;
const field = (label, input, hint) => `<label class="field"><span>${label}</span>${input}${hint ? `<p class="hint">${hint}</p>` : ''}</label>`;
const contactOptions = (sel, filter) => `<option value="">— none —</option>` + S.contacts.filter(filter || (() => true))
  .map(c => `<option value="${c.id}" ${c.id === sel ? 'selected' : ''}>${esc(c.name)}${c.role ? ' (' + esc(c.role) + ')' : ''}</option>`).join('');

/* Quick-add menu */
function addMenu() {
  sheet('What would you like to add?', `<div class="choices">
    <button class="choice" data-act="add-ev"><span class="ibadge">${icon('stetho')}</span><b>Appointment</b><small>Doctor, therapy, check-up</small></button>
    <button class="choice" data-act="add-errand"><span class="ibadge">${icon('car')}</span><b>Errand or to-do</b><small>Pick up, bring, go to, call</small></button>
    <button class="choice" data-act="add-med"><span class="ibadge">${icon('pill')}</span><b>Medicine</b><small>What, how much, when</small></button>
    <button class="choice" data-act="add-contact"><span class="ibadge">${icon('book')}</span><b>Contact or place</b><small>Phone, address, opening hours</small></button>
  </div>`);
}

function meCard() {
  const me = S.me || {};
  if (!me.name) return `<div class="card"><p class="muted">My own details, ready when a doctor, nurse or pharmacy asks who to contact.</p>
    <button class="btn" style="margin-top:12px;width:100%" data-act="edit-me">${icon('plus')} Add my details</button></div>`;
  const row = (k, v) => v ? `<dt>${k}</dt><dd>${esc(v)}</dd>` : '';
  const rows = row('Phone', me.phone) + row('Email', me.email) + row('Address', me.address) + row('Available', me.availability) + row('Notes', me.notes);
  return `<div class="card">
    <div style="display:flex;gap:14px;align-items:center">${avatar({ ...me, color: me.color || '#a08f7d' })}
      <div style="flex:1;min-width:0"><p class="t" style="font-weight:650">${esc(me.name)}</p><p class="muted small">${esc(me.relation || 'Caregiver')}</p></div>
      <button class="btn sm" data-act="edit-me">Edit</button></div>
    ${rows ? `<dl class="dl" style="margin-top:14px">${rows}</dl>` : ''}</div>`;
}
function meForm() {
  const me = S.me || {};
  const v = k => esc(me[k] || '');
  const inp = (k, ph = '', type = 'text') => `<input type="${type}" name="${k}" value="${v(k)}" placeholder="${esc(ph)}">`;
  sheet('About me', `<form id="f">
    <div class="photo-pick">
      <div id="ph-prev">${avatar({ ...me, name: me.name || '?', color: '#a08f7d' }, 'xl')}</div>
      <div class="stack" style="flex:1">
        <label class="btn sm">${icon('user')} ${me.photo ? 'Change photo' : 'Add a photo'}<input type="file" accept="image/*" hidden id="ph-in"></label>
        <button type="button" class="link small" id="ph-rm" ${me.photo ? '' : 'hidden'}>Remove photo</button>
      </div>
      <input type="hidden" name="photo" value="${v('photo')}">
    </div>
    ${field('My name', `<input name="name" required value="${v('name')}" placeholder="e.g. Anna">`)}
    <div class="grid2">${field('My phone', inp('phone', '', 'tel'))}${field('My email', inp('email', '', 'email'))}</div>
    ${field('My address', inp('address', 'Street, town'))}
    ${field('How I’m related', inp('relation', 'e.g. Daughter'))}
    ${field('When I’m available', inp('availability', 'e.g. Weekdays after 4 pm, all weekend'))}
    ${field('Notes for myself', `<textarea name="notes" placeholder="e.g. Book my own check-up. Take breaks — I matter too.">${v('notes')}</textarea>`)}
    <div style="margin-top:22px"><button class="btn primary big">Save</button></div>
  </form>`, s => {
    const f = $('#f', s);
    const preview = () => { $('#ph-prev', s).innerHTML = avatar({ name: f.name.value || '?', photo: f.photo.value, color: '#a08f7d' }, 'xl'); $('#ph-rm', s).hidden = !f.photo.value; };
    $('#ph-in', s).onchange = async ev => {
      const file = ev.target.files[0];
      if (!file) return;
      try { f.photo.value = await resizePhoto(file); preview(); } catch (e) { toast('That picture couldn’t be opened. Please try another one.'); }
    };
    $('#ph-rm', s).onclick = () => { f.photo.value = ''; preview(); };
    f.onsubmit = ev => {
      ev.preventDefault();
      S.me = { ...(S.me || {}), ...Object.fromEntries(new FormData(f)) };
      delete S.me.backupName; delete S.me.backupPhone;
      save(); closeSheet(); render(); toast('Saved');
    };
  });
}

/* Swipe left on an item in Today's plan to remove it (always asks first).
   Feels like iOS: the row follows the finger with gentle resistance, the bin icon grows and
   "pops" when letting go would remove it, the row glides away, and the question rises softly. */
const SPRING = 'transform .55s cubic-bezier(.3, 1.35, .5, 1)';
const GLIDE = 'transform .38s cubic-bezier(.4, 0, .2, 1)';
function springBack(el) {
  const r = el.querySelector('.row');
  if (!r) return;
  r.style.transition = SPRING;
  r.style.transform = '';
  el.style.setProperty('--p', 0);
  setTimeout(() => { el.classList.remove('swiping', 'armed'); r.style.transition = ''; }, 560);
}
function collapseThen(el, fn) {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) { fn(); return; }
  el.style.height = el.offsetHeight + 'px';
  el.style.overflow = 'hidden';
  void el.offsetHeight;
  el.style.transition = 'height .32s cubic-bezier(.4, 0, .2, 1), margin .32s cubic-bezier(.4, 0, .2, 1), opacity .25s';
  el.style.height = '0px'; el.style.marginTop = '0px'; el.style.opacity = '0';
  setTimeout(fn, 330);
}
function removeItem(el) {
  const kind = el.dataset.swipe, date = el.dataset.date;
  let decided = false;
  const ask = (title, body, onYes) => {
    const s = sheet(title, body);
    s.closest('.overlay').classList.add('gentle');
    s.addEventListener('click', ev => {
      const b = ev.target.closest('[data-r]');
      if (!b) return;
      decided = true;
      closeSheet();
      if (b.dataset.r === 'no') { setTimeout(() => springBack(el), 120); return; }
      collapseThen(el, () => onYes(b.dataset.r));
    });
    watchClose(s, () => { if (!decided) setTimeout(() => springBack(el), 60); });
  };
  if (kind === 'event') {
    const e = evById(el.dataset.id);
    if (!e) return springBack(el);
    const repeats = e.repeat && e.repeat !== 'none';
    ask('Remove from the plan?', `<p style="font-size:1.05rem"><b>${esc(e.title)}</b><br><span class="muted">${relDay(date)}${e.time ? ' · ' + fmtT(e.time) : ''}</span></p>
      <div class="stack" style="margin-top:20px">
        ${repeats ? `<button class="btn primary big" data-r="once">Remove just ${relDay(date) === 'Today' ? 'today’s' : 'this one'}</button><button class="btn big danger" data-r="all">Delete all repeats</button>`
        : '<button class="btn primary big" data-r="all">Yes, delete it</button>'}
        <button class="btn big" data-r="no">Keep it</button></div>`, r => {
      if (r === 'once') {
        e.skipDates = [...(e.skipDates || []), date]; save(); render();
        toast('Removed for today', () => { e.skipDates = e.skipDates.filter(d => d !== date); save(); render(); });
      } else {
        S.events = S.events.filter(x => x !== e); save(); render();
        toast('Deleted', () => { S.events.push(e); save(); render(); });
      }
    });
  } else {
    const time = el.dataset.time;
    const meds = agenda(P().id, date).filter(i => i.kind === 'med' && i.time === time);
    ask('Skip these medicines?', `<p style="font-size:1.05rem">Remove the ${fmtT(time)} medicines from ${relDay(date) === 'Today' ? 'today’s' : 'this day’s'} plan:</p>
      <p class="muted" style="margin-top:6px">${meds.map(i => esc(i.m.name)).join(', ')}</p>
      <p class="small muted" style="margin-top:8px">Only for this day — they’ll show up again as usual afterwards.</p>
      <div class="stack" style="margin-top:20px"><button class="btn primary big" data-r="yes">Yes, skip them</button><button class="btn big" data-r="no">Keep them</button></div>`, () => {
      S.skipLog = S.skipLog || {};
      meds.forEach(i => { S.skipLog[i.key] = 1; });
      save(); render();
      toast('Skipped for today', () => { meds.forEach(i => delete S.skipLog[i.key]); save(); render(); });
    });
  }
}
function watchClose(s, fn) {
  const obs = new MutationObserver(() => { if (!document.contains(s)) { obs.disconnect(); fn(); } });
  obs.observe(document.body, { childList: true });
}
(function swipeSupport() {
  let start = null, el = null, row = null, dx = 0, active = false, armed = false, last = null, vel = 0;
  const LIMIT = 120;
  document.addEventListener('pointerdown', ev => {
    const w = ev.target.closest('.swipe');
    if (!w || ev.button > 0 || $('.overlay')) return;
    start = { x: ev.clientX, y: ev.clientY }; el = w; row = w.querySelector('.row');
    dx = 0; active = false; armed = false; vel = 0; last = { x: ev.clientX, t: performance.now() };
  });
  document.addEventListener('pointermove', ev => {
    if (!start) return;
    const mx = ev.clientX - start.x, my = ev.clientY - start.y;
    if (!active) {
      if (Math.abs(my) > 10 && Math.abs(my) > Math.abs(mx)) { start = null; return; }
      if (mx < -10 && -mx > Math.abs(my) * 1.3) { active = true; el.classList.add('swiping'); row.style.transition = 'none'; }
      else return;
    }
    const now = performance.now();
    vel = (ev.clientX - last.x) / Math.max(1, now - last.t); // px per ms, negative = leftwards
    last = { x: ev.clientX, t: now };
    dx = Math.max(0, -mx);
    // Rubber band: easy at first, then heavier past the point of removal.
    const eased = dx <= LIMIT ? dx : LIMIT + (1 - 1 / ((dx - LIMIT) / 160 + 1)) * 160;
    row.style.transform = `translateX(${-eased}px)`;
    el.style.setProperty('--p', Math.min(1, dx / LIMIT).toFixed(3));
    const nowArmed = dx > LIMIT;
    if (nowArmed !== armed) {
      armed = nowArmed;
      el.classList.toggle('armed', armed);
      if (armed && navigator.vibrate) try { navigator.vibrate(8); } catch (e) { /* not supported */ }
    }
  });
  const end = () => {
    if (!start) return;
    const wasActive = active, w = el, r = row;
    const go = armed || (dx > 60 && vel < -0.7); // a quick flick counts too
    start = null; active = false; armed = false;
    if (!wasActive) return;
    window.__swiped = Date.now();
    if (go) {
      w.classList.add('armed');
      w.style.setProperty('--p', 1);
      r.style.transition = GLIDE;
      r.style.transform = 'translateX(-104%)';
      if (!S.settings.swipeTipDone) { S.settings.swipeTipDone = true; save(); }
      setTimeout(() => removeItem(w), 300);
    } else springBack(w);
  };
  document.addEventListener('pointerup', end);
  document.addEventListener('pointercancel', end);
  document.addEventListener('click', ev => { if (window.__swiped && Date.now() - window.__swiped < 400 && ev.target.closest('.swipe')) { ev.stopPropagation(); ev.preventDefault(); } }, true);
})();

/* Short opening screen: a greeting first, then who I care for, with the app name at the bottom. */
function splash() {
  const p = P();
  const me = S.me && S.me.name ? S.me.name.split(' ')[0] : '';
  const h = new Date().getHours();
  const greet = h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
  const el = document.createElement('div');
  el.className = 'splash';
  el.setAttribute('aria-hidden', 'true');
  el.innerHTML = `<div class="splash-mid">
      <h1 class="splash-hi">${greet}${me ? ', ' + esc(me) : ''}</h1>
      ${p ? `<div class="splash-who">${avatar(p)}<span>caring for <b>${esc(p.name)}</b></span></div>` : ''}
    </div>
    <div class="splash-foot">
      <svg class="logo" viewBox="0 0 512 512"><rect width="512" height="512" rx="112" fill="#8a7a6a"/><path d="M256 384s-118-70-118-156c0-40 30-68 66-68 24 0 42 12 52 30 10-18 28-30 52-30 36 0 66 28 66 68 0 86-118 156-118 156z" fill="#fffdf9"/></svg>
      <span>Care Companion</span>
    </div>`;
  document.body.appendChild(el);
  setTimeout(() => el.classList.add('out'), 2100);
  setTimeout(() => el.remove(), 2800);
}

/* Person form — grouped into short, collapsible sections */
function personForm(p) {
  const isNew = !p;
  p = p || { color: COLORS[S.people.length % COLORS.length] };
  const v = k => esc(p[k] || '');
  const inp = (k, ph = '', type = 'text') => `<input type="${type}" name="${k}" value="${v(k)}" placeholder="${esc(ph)}">`;
  const ta = (k, ph = '') => `<textarea name="${k}" placeholder="${esc(ph)}">${v(k)}</textarea>`;
  const group = (title, sub, inner, open) => `<details class="fgroup" ${open ? 'open' : ''}><summary><span><b>${title}</b><small>${sub}</small></span>${icon('down')}</summary><div class="fgroup-body">${inner}</div></details>`;
  sheet(isNew ? 'Add someone you care for' : `Edit ${p.name}`, `<form id="f">
    <div class="photo-pick">
      <div id="ph-prev">${avatar(p, 'xl')}</div>
      <div class="stack" style="flex:1">
        <label class="btn sm">${icon('user')} ${p.photo ? 'Change photo' : 'Add a photo'}<input type="file" accept="image/*" hidden id="ph-in"></label>
        <button type="button" class="link small" id="ph-rm" ${p.photo ? '' : 'hidden'}>Remove photo</button>
      </div>
      <input type="hidden" name="photo" value="${v('photo')}">
    </div>
    ${field('Name', `<input name="name" required value="${v('name')}" placeholder="e.g. Mum" ${isNew ? 'autofocus' : ''}>`)}
    <p class="hint" style="margin-top:14px">Fill in only what helps you. Everything below is optional.</p>
    ${group('Personal details', 'Relationship, birthday, home, language', `
      <div class="grid2">${field('Relationship', inp('relation', 'e.g. Mother'))}${field('Likes to be called', inp('nickname', 'e.g. Maggie'))}</div>
      ${box('Birthday', birthField(p.birthdate))}
      ${field('Home address', inp('address', 'Street, postcode, town'), 'Used for directions and to find doctors nearby.')}
      ${field('Getting in', inp('access', 'e.g. Key safe by the door, ring twice'))}
      <div class="grid2">${field('Phone', inp('phone', '', 'tel'))}${field('Language', inp('language', 'e.g. English, Polish'))}</div>`, isNew)}
    ${group('Health', 'Allergies, conditions, body, diet', `
      ${field('Allergies', inp('allergies', 'e.g. Penicillin'), 'Shown at the top of Today so it’s never forgotten.')}
      ${field('Conditions', ta('conditions', 'e.g. Type 2 diabetes, high blood pressure'))}
      <div class="grid3">${field('Blood type', inp('blood'))}${field('Height', inp('height', 'cm'))}${field('Weight', inp('weight', 'kg'))}</div>
      ${field('Pacemaker, implants, prostheses', inp('implants', 'e.g. Pacemaker since 2019'))}
      ${field('Hearing, sight, teeth', inp('senses', 'e.g. Hearing aid left, reading glasses, dentures'))}
      <div class="grid2">${field('Mobility', inp('mobility', 'e.g. walker outdoors'))}${field('Diet', inp('diet', 'e.g. diabetic, soft food'))}</div>`)}
    ${group('Care &amp; legal', 'Doctor, insurance, documents', `
      ${field('Family doctor', `<select name="gpId">${contactOptions(p.gpId)}</select>`, S.contacts.length ? '' : 'You can choose this later after adding contacts.')}
      <div class="grid2">${field('Health insurance', inp('insurance'))}${field('Insurance number', inp('insuranceNo'))}</div>
      ${field('Care level / support', inp('careLevel', 'e.g. Care level 2, home nurse twice a week'))}
      ${field('Living will', inp('livingWill', 'e.g. Yes — blue folder in the desk'))}
      ${field('Power of attorney', inp('attorney', 'e.g. Tom, copy in the blue folder'))}
      ${field('Organ donor card', inp('organDonor', 'e.g. Yes, in wallet'))}`)}
    ${group('Emergency contacts', 'Who to call first', `
      <div class="grid2">${field('Name', inp('emergencyName'))}${field('Phone', inp('emergencyPhone', '', 'tel'))}</div>
      <div class="grid2">${field('Second contact', inp('emergency2Name'))}${field('Phone', inp('emergency2Phone', '', 'tel'))}</div>`)}
    ${group('Everyday life', 'Routine, likes, what helps', `
      ${field('Daily routine', ta('routine', 'e.g. Up at 7, nap after lunch, bed at 9'))}
      ${field('Likes', ta('likes', 'e.g. Tea with milk, radio, gardening'))}
      ${field('Dislikes', ta('dislikes', 'e.g. Loud rooms, being rushed'))}
      ${field('What helps when upset', ta('calming', 'e.g. Talking about her garden, old photos'))}
      ${field('Faith / customs', inp('faith'))}
      ${field('Other notes', ta('notes', 'e.g. Hard of hearing on the left — sit on her right.'))}`)}
    ${p.photo ? '' : `<div class="field"><span>Colour <em>(when there’s no photo)</em></span><div class="chips">${COLORS.map(c => `<label class="cc"><input type="radio" name="color" value="${c}" ${c === p.color ? 'checked' : ''}><span style="background:${c};border-color:${c};width:44px;height:44px;border-radius:50%" aria-label="Colour"></span></label>`).join('')}</div></div>`}
    <div style="margin-top:22px"><button class="btn primary big">Save</button></div>
  </form>`, s => {
    const f = $('#f', s);
    const preview = () => { $('#ph-prev', s).innerHTML = avatar({ ...p, name: f.name.value || p.name, photo: f.photo.value }, 'xl'); $('#ph-rm', s).hidden = !f.photo.value; };
    $('#ph-in', s).onchange = async ev => {
      const file = ev.target.files[0];
      if (!file) return;
      try { f.photo.value = await resizePhoto(file); preview(); }
      catch (e) { toast('That picture couldn’t be opened. Please try another one.'); }
    };
    $('#ph-rm', s).onclick = () => { f.photo.value = ''; preview(); };
    f.onsubmit = ev => {
      ev.preventDefault();
      const fd = new FormData(f);
      const d = Object.fromEntries([...fd.entries()].filter(([k]) => !k.startsWith('bd_')));
      d.birthdate = readBirth(fd);
      if (!d.color) delete d.color;
      if (isNew) { const np = { id: uid(), color: p.color, ...d }; S.people.push(np); S.activeId = np.id; view = 'today'; }
      else { if (d.address !== p.address && p.loc && p.loc.label === p.address) delete p.loc; Object.assign(p, d); }
      save(); closeSheet(); render(); toast('Saved');
    };
  });
}

/* Event form (appointment or errand) */
function eventForm(e, type, date) {
  const isNew = !e;
  e = e || { type: type || 'appointment', date: date || today(), time: '', repeat: 'none', bring: [] };
  const c0 = contactById(e.contactId);
  sheet(isNew ? (e.type === 'errand' ? 'New errand or to-do' : 'New appointment') : 'Edit', `<form id="f">
    <div class="seg" role="radiogroup" aria-label="Type">
      <label><input type="radio" name="type" value="appointment" ${e.type !== 'errand' ? 'checked' : ''}><span>Appointment</span></label>
      <label><input type="radio" name="type" value="errand" ${e.type === 'errand' ? 'checked' : ''}><span>Errand / to-do</span></label>
    </div>
    <div class="chips errand-only" style="margin-top:14px">${['Pick up', 'Bring', 'Go to', 'Call', 'Buy'].map(w => `<button type="button" class="chip" data-title="${w} ">${w}…</button>`).join('')}</div>
    ${box('Doctor or place', placeSearchHTML(e.place || c0?.name || '', 'Type a name, e.g. Dr. Schmidt'), 'We’ll suggest saved contacts and places nearby, and fill in the address, phone and opening hours.')}
    <input type="hidden" name="contactId" value="${esc(e.contactId || '')}">
    <div id="picked">${pickedCard(c0)}</div>
    ${field('What', `<input name="title" required value="${esc(e.title || '')}" placeholder="${e.type === 'errand' ? 'e.g. Pick up prescription' : 'e.g. Check-up'}">`)}
    ${box('Day', dateField('date', e.date))}
    ${box('Time', timeField('time', e.time, { optional: true }))}
    ${field('Address <em>(for directions)</em>', `<input name="address" value="${esc(e.address || '')}" placeholder="Street, town">`)}
    ${field('Things to bring', `<textarea name="bring" placeholder="One per line, e.g.&#10;Insurance card&#10;Medicine list">${esc((e.bring || []).join('\n'))}</textarea>`)}
    ${field('Repeats', `<select name="repeat">${[['none', 'Does not repeat'], ['daily', 'Every day'], ['weekly', 'Every week'], ['monthly', 'Every month']].map(([v, l]) => `<option value="${v}" ${e.repeat === v ? 'selected' : ''}>${l}</option>`).join('')}</select>`)}
    <div class="until-only">${box('Repeat until', dateField('until', e.until, { optional: true, emptyLabel: 'No end date' }))}</div>
    ${field('Notes', `<textarea name="notes" placeholder="Questions to ask, who drives, …">${esc(e.notes || '')}</textarea>`)}
    <div style="margin-top:22px"><button class="btn primary big">Save</button></div>
  </form>`, s => {
    const f = $('#f', s);
    const sync = () => {
      $$('.errand-only', s).forEach(x => x.style.display = f.type.value === 'errand' ? '' : 'none');
      $$('.until-only', s).forEach(x => x.style.display = f.repeat.value === 'none' ? 'none' : '');
    };
    sync();
    f.addEventListener('change', ev => { if (ev.target.name === 'type' || ev.target.name === 'repeat') sync(); });
    let lastAddr = c0?.address || '';
    initPlaceSearch(s, {
      local: true,
      onPick: (r, saved) => {
        const c = saved ? r : contactFromResult(r);
        if (!saved) save();
        f.contactId.value = c.id;
        if (c.address && (!f.address.value || f.address.value === lastAddr)) f.address.value = c.address;
        lastAddr = c.address || '';
        if (!f.title.value) f.title.value = f.type.value === 'errand' ? '' : (/pharm/i.test(c.role) ? 'Pharmacy: ' : 'Appointment: ') + c.name;
        $('#picked', s).innerHTML = pickedCard(c);
      },
    });
    f.who.addEventListener('input', () => {
      const c = contactById(f.contactId.value);
      if (c && f.who.value.trim() !== c.name) { f.contactId.value = ''; $('#picked', s).innerHTML = ''; }
    });
    s.addEventListener('click', ev => {
      const b = ev.target.closest('[data-title]');
      if (b) { f.title.value = b.dataset.title; f.title.focus(); }
      if (ev.target.closest('[data-unpick]')) { f.contactId.value = ''; f.who.value = ''; $('#picked', s).innerHTML = ''; f.who.focus(); }
    });
    f.onsubmit = ev => {
      ev.preventDefault();
      const d = Object.fromEntries(new FormData(f));
      d.place = (d.who || '').trim(); delete d.who;
      d.bring = lines(d.bring);
      if (d.repeat === 'none') d.until = '';
      if (isNew) S.events.push({ id: uid(), personId: P().id, doneDates: [], packed: {}, ...d });
      else Object.assign(e, d);
      save(); closeSheet(); render(); toast(isNew ? 'Added' : 'Saved');
    };
  });
}

function eventDetail(id, date) {
  const e = evById(id); if (!e) return;
  const c = contactById(e.contactId);
  const addr = e.address || c?.address;
  const done = evDone(e, date);
  const packed = (e.packed && e.packed[date]) || [];
  const open = c && e.time ? openAt(c, date, e.time) : null;
  sheet(e.title, `
    <p style="font-size:1.15rem;font-weight:600">${relDay(date)}${e.time ? ' · ' + fmtT(e.time) : ''}</p>
    ${e.repeat && e.repeat !== 'none' ? `<p class="muted small">Repeats ${e.repeat === 'daily' ? 'every day' : e.repeat === 'weekly' ? 'every ' + DAYS_LONG[parseDs(e.date).getDay()] : 'monthly'}${e.until ? ' until ' + fmtD(e.until, { day: 'numeric', month: 'short' }) : ''}</p>` : ''}
    ${e.place || addr ? `<p style="margin-top:8px">${esc(e.place || '')}${e.place && addr ? '<br>' : ''}<span class="muted">${esc(addr || '')}</span></p>` : ''}
    <div class="actions" style="margin-top:14px">
      ${addr ? `<a class="btn primary" href="${mapHref(addr)}" target="_blank" rel="noopener">${icon('nav')} Directions</a>` : ''}
      ${c?.phone ? `<a class="btn" href="${telHref(c.phone)}">${icon('phone')} ${esc(c.name.split(' ').length > 3 ? '' : c.name)} · ${esc(c.phone)}</a>` : ''}
    </div>
    ${c ? `<div class="card" style="margin-top:14px"><button class="item" data-act="open-contact" data-id="${c.id}"><span class="ibadge">${icon('stetho')}</span><span class="body"><p class="t">${esc(c.name)}</p>
      <p class="s">${DAYS_LONG[parseDs(date).getDay()]}: ${esc(hoursText(c, parseDs(date).getDay()))}</p>
      ${open === false ? '<p style="margin-top:4px"><span class="pill warm">Usually closed at this time — worth confirming</span></p>' : ''}</span>${icon('chev')}</button></div>` : ''}
    ${(e.bring || []).length ? `<h3 class="sec">Things to bring</h3><div class="card" id="bring">${e.bring.map((b, i) => `<label class="bring"><input type="checkbox" data-i="${i}" ${packed.includes(i) ? 'checked' : ''}><span>${esc(b)}</span></label>`).join('')}</div>` : ''}
    ${e.notes ? `<h3 class="sec">Notes</h3><div class="card"><p style="white-space:pre-wrap">${esc(e.notes)}</p></div>` : ''}
    <div style="margin-top:20px" class="stack">
      <button class="btn ${done ? '' : 'primary'} big" data-act="toggle-ev" data-id="${e.id}" data-date="${date}">${icon('check')} ${done ? 'Mark as not done' : 'Mark as done'}</button>
      <div class="actions"><button class="btn" data-act="edit-ev" data-id="${e.id}">Edit</button><button class="btn danger" data-act="del-ev" data-id="${e.id}">Delete</button></div>
    </div>`, s => {
    const b = $('#bring', s);
    if (b) b.addEventListener('change', ev => {
      e.packed = e.packed || {};
      const set = new Set(e.packed[date] || []);
      ev.target.checked ? set.add(+ev.target.dataset.i) : set.delete(+ev.target.dataset.i);
      e.packed[date] = [...set];
      save();
    });
  });
}

/* Medicine form */
function medForm(m) {
  const isNew = !m;
  m = m || { times: ['08:00'], days: [], perDose: 1 };
  const timeRow = (t, open) => `<div class="timerow"><div style="flex:1">${timeField('time', t, { open })}</div><button type="button" class="iconbtn" data-rm aria-label="Remove this time">${icon('x')}</button></div>`;
  const allDays = !m.days || !m.days.length;
  sheet(isNew ? 'New medicine' : `Edit ${m.name}`, `<form id="f">
    ${field('Name', `<input name="name" required value="${esc(m.name || '')}" placeholder="e.g. Metformin" autofocus>`)}
    ${field('How much', `<input name="dose" value="${esc(m.dose || '')}" placeholder="e.g. 500 mg, 1 tablet">`)}
    <label class="checkrow"><input type="checkbox" name="asNeeded" ${m.asNeeded ? 'checked' : ''}> Only when needed (no fixed times)</label>
    <div class="sched">
      <div class="field"><span>When</span><div id="times">${(m.times || []).map(timeRow).join('')}</div>
        <div class="chips">${[['08:00', 'Morning'], ['12:00', 'Midday'], ['18:00', 'Evening'], ['22:00', 'Bedtime']].map(([t, l]) => `<button type="button" class="chip" data-t="${t}">+ ${l}</button>`).join('')}<button type="button" class="chip" data-t="">+ Other time</button></div></div>
      <div class="field"><span>Which days</span><div class="chips">${WEEK.map(d => `<label class="cc"><input type="checkbox" name="day" value="${d}" ${allDays || m.days.includes(d) ? 'checked' : ''}><span>${DAYS[d]}</span></label>`).join('')}</div><p class="hint">All selected = every day.</p></div>
    </div>
    ${field('How to take it <em>(optional)</em>', `<input name="instructions" value="${esc(m.instructions || '')}" placeholder="e.g. with food" list="instr">
      <datalist id="instr"><option value="With food"><option value="Before breakfast"><option value="With a full glass of water"><option value="Do not crush"><option value="Before bed"></datalist>`)}
    <div class="grid2">${field('Pills left <em>(optional)</em>', `<input type="number" min="0" inputmode="numeric" name="stock" value="${esc(m.stock ?? '')}">`, 'We’ll remind you to refill.')}
    ${field('Pills per dose', `<input type="number" min="0.25" step="0.25" inputmode="decimal" name="perDose" value="${esc(m.perDose || 1)}">`)}</div>
    ${field('Prescribed by <em>(optional)</em>', `<select name="doctorId">${contactOptions(m.doctorId, c => !/pharm/i.test(c.role || ''))}</select>`)}
    ${field('Pharmacy <em>(optional)</em>', `<select name="pharmacyId">${contactOptions(m.pharmacyId, c => /pharm|apothek/i.test(c.role || ''))}</select>`)}
    ${field('What it’s for / notes', `<textarea name="notes" placeholder="e.g. For blood pressure">${esc(m.notes || '')}</textarea>`)}
    <div style="margin-top:22px"><button class="btn primary big">Save</button></div>
  </form>`, s => {
    const f = $('#f', s);
    const sync = () => { $('.sched', s).style.display = f.asNeeded.checked ? 'none' : ''; };
    sync();
    f.asNeeded.addEventListener('change', sync);
    s.addEventListener('click', ev => {
      const add = ev.target.closest('[data-t]');
      if (add) {
        $('#times', s).insertAdjacentHTML('beforeend', timeRow(add.dataset.t, !add.dataset.t));
        initPickers(s);
      }
      const rm = ev.target.closest('[data-rm]');
      if (rm) rm.parentElement.remove();
    });
    f.onsubmit = ev => {
      ev.preventDefault();
      const fd = new FormData(f);
      const d = {
        name: fd.get('name').trim(), dose: fd.get('dose').trim(), asNeeded: !!fd.get('asNeeded'),
        times: [...new Set(fd.getAll('time').filter(Boolean))].sort(),
        days: fd.getAll('day').map(Number), instructions: fd.get('instructions').trim(),
        stock: fd.get('stock') === '' ? '' : +fd.get('stock'), perDose: +fd.get('perDose') || 1,
        doctorId: fd.get('doctorId'), pharmacyId: fd.get('pharmacyId'), notes: fd.get('notes'),
      };
      if (d.days.length === 7) d.days = [];
      if (!d.asNeeded && !d.times.length) { toast('Please add at least one time'); return; }
      if (!d.asNeeded && !fd.getAll('day').length) { toast('Please choose at least one day'); return; }
      if (isNew) S.meds.push({ id: uid(), personId: P().id, start: today(), ...d });
      else Object.assign(m, d);
      save(); closeSheet(); render(); toast(isNew ? 'Medicine added' : 'Saved');
    };
  });
}

function medDetail(id) {
  const m = medById(id); if (!m) return;
  const doc = contactById(m.doctorId), ph = contactById(m.pharmacyId);
  const d = daysLeft(m);
  let dots = '';
  if (!m.asNeeded) {
    for (let k = 6; k >= 0; k--) {
      const day = addDays(today(), -k);
      if (!medOn(m, day) || (m.start && day < m.start)) { dots += `<span><i class="none"></i>${DAYS[parseDs(day).getDay()]}</span>`; continue; }
      const n = (m.times || []).filter(t => S.medLog[logKey(day, m.id, t)]).length;
      dots += `<span><i class="${n === m.times.length ? 'full' : n ? 'part' : ''}"></i>${DAYS[parseDs(day).getDay()]}</span>`;
    }
  }
  sheet(m.name, `
    <p style="font-size:1.15rem;font-weight:600">${esc(m.dose || '')}${m.instructions ? ' · ' + esc(m.instructions) : ''}</p>
    <p class="muted">${m.asNeeded ? 'Only when needed' : (m.times || []).map(fmtT).join(', ') + ' · ' + (m.days && m.days.length ? m.days.map(x => DAYS[x]).join(', ') : 'every day')}</p>
    ${m.notes ? `<p style="margin-top:8px;white-space:pre-wrap">${esc(m.notes)}</p>` : ''}
    ${dots ? `<h3 class="sec">Last 7 days</h3><div class="card"><div class="dots">${dots}</div></div>` : ''}
    ${hasStock(m) ? `<h3 class="sec">Supply</h3><div class="card"><p><b>${+m.stock}</b> left${d !== null ? ` · enough for about ${plural(d, 'day')}` : ''}</p>
      <form id="restock" class="timerow" style="margin-top:12px"><input type="number" min="1" name="n" placeholder="Pills in new pack" aria-label="Pills in new pack" inputmode="numeric"><button class="btn">Add pack</button></form></div>` : ''}
    ${doc || ph ? `<h3 class="sec">Contacts</h3><div class="stack">${[doc, ph].filter(Boolean).map(c => `<div class="card"><button class="item" data-act="open-contact" data-id="${c.id}"><span class="body"><p class="t">${esc(c.name)}</p><p class="s">${esc(c.role || '')}</p></span>${icon('chev')}</button>
      ${c.phone ? `<div class="actions" style="margin-top:10px"><a class="btn sm" href="${telHref(c.phone)}">${icon('phone')} ${esc(c.phone)}</a></div>` : ''}</div>`).join('')}</div>` : ''}
    <div class="actions" style="margin-top:20px">${m.asNeeded ? `<button class="btn primary" data-act="prn" data-id="${m.id}">${icon('check')} Given now</button>` : ''}<button class="btn" data-act="edit-med" data-id="${m.id}">Edit</button><button class="btn danger" data-act="del-med" data-id="${m.id}">Delete</button></div>
  `, s => {
    const r = $('#restock', s);
    if (r) r.onsubmit = ev => { ev.preventDefault(); const n = +r.n.value; if (n > 0) { m.stock = +m.stock + n; save(); render(); medDetail(id); toast(`Added ${n}`); } };
  });
}

/* Contact form */
function contactForm(c, after) {
  const isNew = !c;
  c = c || { hours: {}, role: 'Family doctor' };
  sheet(isNew ? 'New contact or place' : `Edit ${c.name}`, `<form id="f">
    ${box('Name', placeSearchHTML(c.name, 'e.g. Dr. Sarah Lane or Riverside Pharmacy'), isNew ? 'Start typing — we’ll look for it nearby and fill in the details for you.' : '')}
    <div id="found"></div>
    ${field('Type', `<select name="role">${ROLES.map(r => `<option ${r === c.role ? 'selected' : ''}>${r}</option>`).join('')}</select>`)}
    ${field('Phone', `<input type="tel" name="phone" value="${esc(c.phone || '')}" placeholder="e.g. 0123 456789">`)}
    ${field('Address', `<input name="address" value="${esc(c.address || '')}" placeholder="Street, town">`, 'Used for one-tap directions.')}
    <div class="field"><span>Opening hours <em>(optional)</em></span>
      ${WEEK.map(d => `<div class="hrow"><b>${DAYS[d]}</b><input name="h${d}" value="${esc(c.hours?.[d] || '')}" placeholder="${d === 0 || d === 6 ? 'closed' : '08:00-12:00, 14:00-18:00'}" aria-label="${DAYS_LONG[d]} hours"></div>`).join('')}
      <button type="button" class="link" data-copy>Copy Monday to Tuesday – Friday</button>
      <p class="hint">Write times like “8:00-12:00, 14:00-18:00” or “closed”. Leave empty if you don’t know.</p>
    </div>
    ${field('Notes', `<textarea name="notes" placeholder="e.g. Ask for nurse Anna. Parking behind the building.">${esc(c.notes || '')}</textarea>`)}
    <div style="margin-top:22px"><button class="btn primary big">Save</button></div>
  </form>`, s => {
    const f = $('#f', s);
    let src = c.source;
    initPlaceSearch(s, {
      local: false,
      onPick: r => {
        if (ROLES.includes(r.role)) f.role.value = r.role;
        if (r.phone) f.phone.value = r.phone;
        if (r.address) f.address.value = r.address;
        if (hasHours(r)) WEEK.forEach(d => { f['h' + d].value = r.hours[d] || ''; });
        const extra = [r.speciality, r.website].filter(Boolean).join('\n');
        if (extra && !f.notes.value) f.notes.value = extra;
        src = r.source;
        $('#found', s).innerHTML = `<p class="ps-msg ${r.source === 'claude' ? 'warm' : ''}" style="margin-top:10px">${icon('check')} Filled in ${[r.phone && 'phone', r.address && 'address', hasHours(r) && 'opening hours'].filter(Boolean).join(', ') || 'what we found'}${r.source === 'claude' ? ' — suggested by Claude, please check' : ''}. You can change anything below.</p>`;
      },
    });
    s.addEventListener('click', ev => { if (ev.target.closest('[data-copy]')) [2, 3, 4, 5].forEach(d => { f['h' + d].value = f.h1.value; }); });
    f.onsubmit = ev => {
      ev.preventDefault();
      const fd = new FormData(f);
      const name = (fd.get('who') || '').trim();
      if (!name) { toast('Please enter a name'); f.who.focus(); return; }
      const d = { name, source: src, role: fd.get('role'), phone: fd.get('phone').trim(), address: fd.get('address').trim(), notes: fd.get('notes'), hours: {} };
      WEEK.forEach(x => { d.hours[x] = fd.get('h' + x).trim(); });
      if (isNew) { c = { id: uid(), ...d }; S.contacts.push(c); } else Object.assign(c, d);
      save(); closeSheet(); render(); toast(isNew ? 'Contact added' : 'Saved');
      if (after) after(c);
    };
  });
}

function contactDetail(id) {
  const c = contactById(id); if (!c) return;
  const tdy = new Date().getDay();
  const upcoming = [];
  for (let k = 0; k < 60 && upcoming.length < 3; k++) {
    const d = addDays(today(), k);
    S.events.filter(e => e.contactId === c.id && evOn(e, d) && !evDone(e, d)).forEach(e => upcoming.push({ e, d }));
  }
  sheet(c.name, `
    <p class="muted">${esc(c.role || '')}</p>
    ${statusPill(c) ? `<p style="margin-top:8px">${statusPill(c)}</p>` : ''}
    <div class="actions" style="margin-top:14px">
      ${c.phone ? `<a class="btn primary" href="${telHref(c.phone)}">${icon('phone')} Call ${esc(c.phone)}</a>` : ''}
      ${c.address ? `<a class="btn" href="${mapHref(c.address)}" target="_blank" rel="noopener">${icon('nav')} Directions</a>` : ''}
    </div>
    ${c.address ? `<p style="margin-top:10px">${esc(c.address)}</p>` : ''}
    <h3 class="sec">Opening hours</h3>
    <div class="card">${hasHours(c) ? `<table class="hours">${WEEK.map(d => `<tr class="${d === tdy ? 'today' : ''}"><td>${DAYS_LONG[d]}${d === tdy ? ' (today)' : ''}</td><td>${esc(hoursText(c, d))}</td></tr>`).join('')}</table>` :
      `<p class="muted">No opening hours saved yet.</p><div class="actions" style="margin-top:10px"><a class="btn sm" href="${searchHref(c.name + ' ' + (c.address || '') + ' opening hours')}" target="_blank" rel="noopener">${icon('search')} Look them up online</a><button class="btn sm" data-act="edit-contact" data-id="${c.id}">Add hours</button></div>`}</div>
    ${upcoming.length ? `<h3 class="sec">Coming up here</h3><div class="stack">${upcoming.map(u => `<div class="card"><button class="item" data-act="open-ev" data-id="${u.e.id}" data-date="${u.d}"><span class="body"><p class="t">${esc(u.e.title)}</p><p class="s">${relDay(u.d)}${u.e.time ? ' · ' + fmtT(u.e.time) : ''}</p></span>${icon('chev')}</button></div>`).join('')}</div>` : ''}
    ${c.notes ? `<h3 class="sec">Notes</h3><div class="card"><p style="white-space:pre-wrap">${esc(c.notes)}</p></div>` : ''}
    <div class="actions" style="margin-top:20px">
      <button class="btn" data-act="new-appt-with" data-id="${c.id}">${icon('plus')} Book appointment</button>
      <button class="btn" data-act="edit-contact" data-id="${c.id}">Edit</button>
      <button class="btn danger" data-act="del-contact" data-id="${c.id}">Delete</button></div>
  `);
}

function personSwitcher() {
  sheet('Who are you caring for right now?', `<div class="stack">${S.people.map(x => `<div class="card"><button class="item" data-act="pick-person" data-id="${x.id}">
    ${avatar(x)}<span class="body"><p class="t">${esc(x.name)}</p>
    <p class="s">${(() => { const a = agenda(x.id, today()); const open = a.filter(i => !i.done).length; return open ? `${plural(open, 'thing')} left today` : 'All done today'; })()}</p></span>
    ${x.id === S.activeId ? icon('check', 'kind') : ''}</button></div>`).join('')}</div>
    <button class="btn big" style="margin-top:14px" data-act="add-person">${icon('plus')} Add someone</button>`);
}

/* In-app confirmation (browser pop-ups are not always allowed). */
function ask(msg, ok = 'Yes, delete') {
  return new Promise(res => {
    let answered = false;
    const s = sheet('Are you sure?', `<p style="font-size:1.05rem">${esc(msg)}</p>
      <div class="stack" style="margin-top:20px"><button class="btn primary big" data-yes>${esc(ok)}</button><button class="btn big" data-no>Cancel</button></div>`);
    s.addEventListener('click', ev => {
      if (ev.target.closest('[data-yes]')) { answered = true; closeSheet(true); res(true); }
      else if (ev.target.closest('[data-no]')) { answered = true; closeSheet(true); res(false); }
    });
    const obs = new MutationObserver(() => { if (!document.contains(s)) { obs.disconnect(); if (!answered) res(false); } });
    obs.observe(document.body, { childList: true });
  });
}
async function copyText(t) {
  try { await navigator.clipboard.writeText(t); toast('Copied'); }
  catch (e) { toast('Select the text and copy it'); }
}

/* ---------- Actions ---------- */
function toggleMed(key, mid, on) {
  const m = medById(mid);
  const per = +m?.perDose || 1;
  const isOn = !!S.medLog[key];
  if (on === undefined) on = !isOn;
  if (on === isOn) return;
  if (on) { S.medLog[key] = Date.now(); if (m && hasStock(m)) m.stock = Math.max(0, +m.stock - per); }
  else { delete S.medLog[key]; if (m && hasStock(m)) m.stock = +m.stock + per; }
}

const actions = {
  nav: b => { view = b.dataset.v; render(); scrollTo(0, 0); },
  add: () => addMenu(),
  'add-ev': () => eventForm(null, 'appointment'),
  'add-errand': () => eventForm(null, 'errand'),
  'add-med': () => medForm(),
  'add-contact': () => contactForm(),
  'add-person': () => personForm(),
  'edit-person': () => personForm(P()),
  'edit-me': () => meForm(),
  'swipe-tip': () => { S.settings.swipeTipDone = true; save(); render(); },
  'switch-person': () => personSwitcher(),
  'pick-person': b => { S.activeId = b.dataset.id; save(); closeSheet(true); view = 'today'; render(); },
  'toggle-med': b => { toggleMed(b.dataset.k, b.dataset.m); save(); render(); },
  'round-all': b => {
    const items = agenda(P().id, b.dataset.date).filter(i => i.kind === 'med' && i.time === b.dataset.time && !i.done);
    items.forEach(i => toggleMed(i.key, i.m.id, true));
    save(); render();
    toast(items.length > 1 ? 'All marked as given' : 'Marked as given', () => { items.forEach(i => toggleMed(i.key, i.m.id, false)); save(); render(); });
  },
  'toggle-ev': b => {
    const e = evById(b.dataset.id), d = b.dataset.date;
    e.doneDates = e.doneDates || [];
    const was = e.doneDates.includes(d);
    e.doneDates = was ? e.doneDates.filter(x => x !== d) : [...e.doneDates, d];
    save();
    if ($('.overlay')) closeSheet(true);
    render();
    if (!was) toast('Done', () => { e.doneDates = e.doneDates.filter(x => x !== d); save(); render(); });
  },
  'open-ev': b => eventDetail(b.dataset.id, b.dataset.date),
  'edit-ev': b => eventForm(evById(b.dataset.id)),
  'del-ev': async b => { const e = evById(b.dataset.id); if (await ask(`Delete “${e.title}”${e.repeat !== 'none' ? ' and all its repeats' : ''}?`)) { S.events = S.events.filter(x => x !== e); save(); closeSheet(true); render(); toast('Deleted', () => { S.events.push(e); save(); render(); }); } },
  'open-med': b => medDetail(b.dataset.id),
  'edit-med': b => medForm(medById(b.dataset.id)),
  'del-med': async b => { const m = medById(b.dataset.id); if (await ask(`Remove ${m.name}?`)) { S.meds = S.meds.filter(x => x !== m); save(); closeSheet(true); render(); toast('Removed', () => { S.meds.push(m); save(); render(); }); } },
  prn: b => {
    const m = medById(b.dataset.id); const entry = { mid: m.id, ts: Date.now() };
    S.prnLog.push(entry); if (hasStock(m)) m.stock = Math.max(0, +m.stock - (+m.perDose || 1));
    save(); closeSheet(true); render();
    toast(`${m.name} noted at ${new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`, () => { S.prnLog = S.prnLog.filter(x => x !== entry); if (hasStock(m)) m.stock = +m.stock + (+m.perDose || 1); save(); render(); });
  },
  'open-contact': b => contactDetail(b.dataset.id),
  'edit-contact': b => contactForm(contactById(b.dataset.id)),
  'del-contact': async b => { const c = contactById(b.dataset.id); if (await ask(`Delete ${c.name}?`)) { S.contacts = S.contacts.filter(x => x !== c); save(); closeSheet(true); render(); toast('Deleted', () => { S.contacts.push(c); save(); render(); }); } },
  'new-appt-with': b => { const c = contactById(b.dataset.id); eventForm({ type: 'appointment', title: 'Appointment with ' + c.name, date: today(), time: '', repeat: 'none', bring: [], contactId: c.id, place: c.name, address: c.address || '' }); },
  demo: () => { S = demoData(); save(); view = 'today'; render(); },
  print: () => {
    const p = P(), meds = medsOf(p.id);
    const txt = [`${p.name}${p.birthdate ? ' (born ' + fmtD(p.birthdate, { day: 'numeric', month: 'long', year: 'numeric' }) + ')' : ''}`,
      `Allergies: ${p.allergies || 'none known'}`, `Conditions: ${p.conditions || '—'}`, '', 'Current medicines:',
      ...meds.map(m => `• ${m.name} ${m.dose || ''} — ${m.asNeeded ? 'when needed' : (m.times || []).map(fmtT).join(', ')}${m.instructions ? ' (' + m.instructions + ')' : ''}`)].join('\n');
    const s = sheet('Summary for the doctor', `<div class="card"><p style="white-space:pre-wrap">${esc(txt)}</p></div>
      <div class="stack" style="margin-top:16px"><button class="btn primary big" data-copy-sum>Copy text</button><button class="btn big" data-print>Print</button></div>
      <p class="hint">Copy it into a message or e-mail, or show this screen at the appointment.</p>`);
    s.addEventListener('click', ev => {
      if (ev.target.closest('[data-copy-sum]')) copyText(txt);
      if (ev.target.closest('[data-print]')) { closeSheet(true); try { window.print(); } catch (e) { toast('Printing isn’t available here'); } }
    });
  },
  notify: async () => {
    if (S.settings.notify) { S.settings.notify = false; save(); render(); toast('Reminders off'); return; }
    if (!('Notification' in window)) { toast('Reminders aren’t available here'); return; }
    const perm = await Notification.requestPermission();
    if (perm === 'granted') { S.settings.notify = true; save(); render(); toast('Reminders on'); }
    else toast('Reminders blocked in settings');
  },
  export: () => {
    const json = JSON.stringify(S);
    const s = sheet('Save a backup', `<p>Copy this text and keep it somewhere safe (for example in a note or an e-mail to yourself).</p>
      <textarea readonly style="margin-top:12px;min-height:140px;font-size:.8rem">${esc(json)}</textarea>
      <div class="stack" style="margin-top:14px"><button class="btn primary big" data-copy-b>Copy backup</button><button class="btn big" data-dl>Download as file</button></div>`);
    s.addEventListener('click', ev => {
      if (ev.target.closest('[data-copy-b]')) copyText(json);
      if (ev.target.closest('[data-dl]')) {
        try {
          const a = document.createElement('a');
          a.href = URL.createObjectURL(new Blob([json], { type: 'application/json' })); a.download = `care-companion-backup-${today()}.json`; a.click();
        } catch (e) { toast('Downloads aren’t available here — use Copy'); }
      }
    });
  },
  import: () => {
    const s = sheet('Restore a backup', `<p>Paste a backup you saved earlier, or choose the backup file.</p>
      <textarea id="bk" style="margin-top:12px;min-height:120px" placeholder="Paste backup here"></textarea>
      <label class="btn big" style="margin-top:10px">Choose file<input type="file" accept="application/json,.json,.txt" hidden id="bkf"></label>
      <button class="btn primary big" style="margin-top:10px" data-restore>Restore</button>`);
    $('#bkf', s).onchange = async ev => { try { $('#bk', s).value = await ev.target.files[0].text(); } catch (e) {} };
    s.addEventListener('click', async ev => {
      if (!ev.target.closest('[data-restore]')) return;
      let d;
      try { d = JSON.parse($('#bk', s).value); if (!Array.isArray(d.people)) throw new Error(); }
      catch { toast('That is not a Care Companion backup'); return; }
      if (await ask('Replace everything with the backup?', 'Yes, restore')) { S = Object.assign(blank(), d); save(); view = 'today'; render(); toast('Backup restored'); }
    });
  },
  'delete-person': async () => {
    const p = P();
    if (!await ask(`Remove ${p.name} and all their medicines and appointments? This can’t be undone.`, 'Yes, remove')) return;
    S.people = S.people.filter(x => x !== p); S.meds = S.meds.filter(m => m.personId !== p.id); S.events = S.events.filter(e => e.personId !== p.id);
    S.activeId = S.people[0]?.id || null; save(); view = 'today'; render();
  },
};

document.addEventListener('click', ev => {
  const b = ev.target.closest('[data-act]');
  if (!b) return;
  const fn = actions[b.dataset.act];
  if (fn) { ev.preventDefault(); fn(b); }
});
document.addEventListener('keydown', ev => { if (ev.key === 'Escape' && $('.overlay')) closeSheet(); });
document.addEventListener('submit', ev => {
  if (ev.target.id !== 'welcome-form') return;
  ev.preventDefault();
  const fd = new FormData(ev.target);
  const name = fd.get('name').trim();
  if (!name) return;
  const me = (fd.get('me') || '').trim();
  if (me) S.me = { ...(S.me || {}), name: me };
  const p = { id: uid(), name, color: COLORS[0] };
  S.people.push(p); S.activeId = p.id; save(); render();
  toast(`Welcome! Start by adding ${name}’s medicines or doctor.`);
  setTimeout(addMenu, 400);
});

/* ---------- Reminders (while the app is open) ---------- */
function canNotify() { try { return 'Notification' in window && window.top === window; } catch (e) { return false; } }
function notify(title, body) {
  if (navigator.serviceWorker?.controller) navigator.serviceWorker.ready.then(r => r.showNotification(title, { body, icon: 'icon.svg', tag: title + body }));
  else try { new Notification(title, { body, icon: 'icon.svg' }); } catch { /* ignore */ }
}
function checkReminders() {
  if (!S.settings.notify || !('Notification' in window) || Notification.permission !== 'granted') return;
  const t = today(), x = nowMin();
  const fired = JSON.parse(localStorage.getItem(KEY + '-fired') || '{}');
  Object.keys(fired).forEach(k => { if (!k.startsWith(t)) delete fired[k]; });
  S.people.forEach(p => grouped(agenda(p.id, t)).forEach(i => {
    if (i.done || !i.time) return;
    const at = i.kind === 'event' ? toMin(i.time) - 60 : toMin(i.time);
    const k = `${t}|${p.id}|${i.kind}|${i.time}|${i.e?.id || ''}`;
    if (x >= at && x < at + 10 && !fired[k]) {
      fired[k] = 1;
      if (i.kind === 'round') notify(`${p.name}: medicines at ${fmtT(i.time)}`, i.meds.filter(m => !m.done).map(m => `${m.m.name} ${m.m.dose || ''}`.trim()).join(', '));
      else notify(`${p.name}: ${i.e.title} in 1 hour`, [fmtT(i.time), i.e.place, (i.e.bring || []).length ? 'Bring: ' + i.e.bring.join(', ') : ''].filter(Boolean).join(' · '));
    }
  }));
  localStorage.setItem(KEY + '-fired', JSON.stringify(fired));
}

/* ---------- Example data ---------- */
const nextWeekday = s => { while ([0, 6].includes(parseDs(s).getDay())) s = addDays(s, 1); return s; };
function demoData() {
  const d = blank(), t = today();
  const gp = { id: uid(), name: 'Dr. Sarah Lane', role: 'Family doctor', phone: '+1 555 0142', address: '12 Elm Street, Springfield', notes: 'Ask for nurse Anna at reception. Parking behind the building.',
    hours: { 1: '08:00-12:00, 14:00-18:00', 2: '08:00-12:00, 14:00-18:00', 3: '08:00-12:00', 4: '08:00-12:00, 14:00-18:00', 5: '08:00-13:00', 6: 'closed', 0: 'closed' } };
  const ph = { id: uid(), name: 'Riverside Pharmacy', role: 'Pharmacy', phone: '+1 555 0199', address: '3 River Road, Springfield',
    hours: { 1: '08:00-19:00', 2: '08:00-19:00', 3: '08:00-19:00', 4: '08:00-19:00', 5: '08:00-19:00', 6: '09:00-14:00', 0: 'closed' } };
  const cardio = { id: uid(), name: 'Heart Clinic – Dr. Patel', role: 'Specialist', phone: '+1 555 0175', address: '200 Hospital Way, Springfield',
    hours: { 1: '09:00-16:00', 2: '09:00-16:00', 3: '09:00-16:00', 4: '09:00-16:00', 5: '09:00-12:00', 6: 'closed', 0: 'closed' } };
  const son = { id: uid(), name: 'Tom (brother)', role: 'Family', phone: '+1 555 0123', address: '', hours: {} };
  d.contacts = [gp, ph, cardio, son];
  const p = { id: uid(), name: 'Mum', relation: 'Mother', birthdate: '1944-05-21', color: COLORS[0], allergies: 'Penicillin', conditions: 'Type 2 diabetes, high blood pressure',
    blood: 'A+', mobility: 'Uses a walker outdoors', gpId: gp.id, insurance: 'HealthFirst', insuranceNo: 'HF 2231 9087', emergencyName: 'Tom (brother)', emergencyPhone: '+1 555 0123',
    notes: 'Hard of hearing on the left side — sit on her right.\nLikes a cup of tea before appointments.' };
  d.people = [p]; d.activeId = p.id;
  d.meds = [
    { id: uid(), personId: p.id, name: 'Metformin', dose: '500 mg', times: ['08:00', '19:00'], days: [], instructions: 'With food', stock: 46, perDose: 1, doctorId: gp.id, pharmacyId: ph.id, notes: 'For diabetes', start: addDays(t, -30) },
    { id: uid(), personId: p.id, name: 'Lisinopril', dose: '10 mg', times: ['08:00'], days: [], instructions: 'With water', stock: 5, perDose: 1, doctorId: cardio.id, pharmacyId: ph.id, notes: 'For blood pressure', start: addDays(t, -30) },
    { id: uid(), personId: p.id, name: 'Vitamin D', dose: '1 capsule', times: ['12:00'], days: [], instructions: '', stock: '', perDose: 1, notes: '', start: addDays(t, -30) },
    { id: uid(), personId: p.id, name: 'Paracetamol', dose: '500 mg', asNeeded: true, times: [], days: [], instructions: 'Max. 4 times a day', stock: 20, perDose: 1, notes: 'For knee pain' },
  ];
  d.events = [
    { id: uid(), personId: p.id, type: 'appointment', title: 'Check-up with Dr. Lane', date: t, time: '15:30', contactId: gp.id, place: 'Dr. Sarah Lane', address: gp.address, bring: ['Insurance card', 'Blood sugar diary', 'Medicine list'], notes: 'Ask about the swollen ankles.', repeat: 'none', doneDates: [], packed: {} },
    { id: uid(), personId: p.id, type: 'errand', title: 'Pick up prescription', date: addDays(t, 1), time: '10:00', contactId: ph.id, place: 'Riverside Pharmacy', address: ph.address, bring: ['Prescription', 'Insurance card'], notes: '', repeat: 'none', doneDates: [], packed: {} },
    { id: uid(), personId: p.id, type: 'appointment', title: 'Cardiology follow-up', date: nextWeekday(addDays(t, 5)), time: '10:30', contactId: cardio.id, place: 'Heart Clinic, 2nd floor', address: cardio.address, bring: ['ECG results', 'Blood pressure log'], notes: 'Tom drives.', repeat: 'none', doneDates: [], packed: {} },
    { id: uid(), personId: p.id, type: 'errand', title: 'Bring groceries', date: addDays(t, 2), time: '', place: 'Mum’s flat', address: '', bring: ['Milk', 'Bread', 'Fruit'], notes: '', repeat: 'weekly', doneDates: [], packed: {} },
  ];
  // Pretend the morning dose was already given if it's past 9.
  if (nowMin() > 9 * 60) d.meds.filter(m => m.times.includes('08:00')).forEach(m => { d.medLog[logKey(t, m.id, '08:00')] = Date.now() - 3600e3; m.stock -= 1; });
  return d;
}

/* ---------- Start ---------- */
render();
splash();
setInterval(() => { checkReminders(); if (!$('.overlay') && !document.activeElement?.matches('input,textarea,select')) render(); }, 60 * 1000);
document.addEventListener('visibilitychange', () => { if (!document.hidden && !$('.overlay')) render(); });
connectCloud();
try { if ('serviceWorker' in navigator && location.protocol !== 'file:' && window.top === window) navigator.serviceWorker.register('sw.js').catch(() => {}); } catch (e) { /* not available here */ }
