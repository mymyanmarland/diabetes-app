# ဆီးချို Lifestyle Management System

Diabetes lifestyle tracking web app — **Tech Stack 2**: Node.js + Express + SQLite (`node:sqlite`) + vanilla JS. No build step, no frameworks, no CDN dependencies, no analytics.

## Run

```bash
cd ~/workspace/diabetes-app
npm install
npm start        # http://localhost:3000
```

On first run the SQLite database is created at `data/app.db` with the full
schema, ~20 Myanmar foods, and 6 Burmese education articles seeded automatically.

## Features (12 pages)

- **Dashboard** — today summary cards, quick-log buttons, 7-day glucose mini chart, reminders (meds due, low stock, next appointment), optional browser notifications
- **Glucose** — log (mg/dL or mmol/L), daily curve, 7/14/30/90-day trends, avg/min/max, time-in-range vs editable targets
- **Food diary** — Myanmar food search with carb estimates, custom foods, daily carb totals
- **Medications** — list, daily schedule view, taken/skipped marking, monthly adherence %, low-stock warnings
- **Activity** — exercise log, manual steps, CSV import (from phone health apps), weekly charts
- **Weight + BP** — log + trend charts
- **Lab results** — incl. HbA1c trend
- **Doctor visits** — appointments, next-visit reminders, questions list
- **Reports** — weekly/monthly summary + print-friendly view (`window.print()` → PDF)
- **Education** — 6 genuine Burmese articles (incl. hypoglycemia emergency action plan)
- **Settings** — language (မြန်မာ/English, Myanmar default), glucose units, target ranges, diabetes type, password change, CSV/JSON export, delete account
- **Auth** — signup/login/logout, scrypt hashing, httpOnly + sameSite session cookies, per-user data isolation on every query

## Notes

- Glucose is stored canonical as **mg/dL INTEGER**; mmol/L shown as `mg/dL ÷ 18`.
- All timestamps stored as UTC ISO; displayed in **Asia/Yangon**.
- This is a **self-tracking tool only** — no diagnosis, no prescriptions (disclaimer shown on first run and in Settings).
- SQLite on Render's free tier is ephemeral — for real deployment use the Postgres variant (Stack 2 v3 pattern) or persistent disk. **Do not deploy without deciding this with the user.**
