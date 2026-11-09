# Care Companion

A calm, simple helper for people who care for a sick or elderly loved one.

## What it does
- **Today**: the next thing to do is shown in one large card. Below it is the day's plan: medicines grouped by time (one tap marks a dose as given), appointments and errands. Allergies always show at the top.
- **Thinking ahead**: things to prepare tonight for tomorrow, medicines that are running low (with a button to call the pharmacy), and appointments booked at a time when the practice is usually closed.
- **Plan**: appointments and errands for the next 8 weeks. Each one can hold a place, an address, a list of things to bring (with checkboxes), notes, and a repeat (daily, weekly or monthly).
- **Medicines**: dose, times, days and how to take each one. Also tracks pills left, shows a 7-day history, and has an "only when needed" type with a "Given now" log.
- **Contacts**: doctors, the pharmacy and family, with one-tap Call and Directions buttons, opening hours, and an open/closed status. Contacts with no hours saved get a link to look them up online.
- **About**: health info, insurance, an emergency call button, notes, and a printable medicine summary for the doctor.
- Several people can be cared for. Switch between them at the top of the screen.
- Optional reminders: medicines at their time, appointments 1 hour before (only while the app is open).
- All data stays on the device. Backup and restore are under About → Your data.

## Run it
It is a static web app: no build step and no server code.

```bash
cd care-companion && python3 -m http.server 8000
```

Open http://localhost:8000. On a phone, use the browser's **Add to Home Screen** to install it like an app. It also works offline.

To use it on a phone without running a server, put the folder on any static host, such as GitHub Pages or Netlify.
