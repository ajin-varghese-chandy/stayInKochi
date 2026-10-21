# StayInKochi

A hostel management app for **StayInKochi**, which runs hostel and PG branches across Kochi.
One owner manages everything; tenants use the app to find a branch, move in, pay rent, and talk to the owner.

## What it does

- **Anyone** — browse the branches, search by area or price, and send a stay request.
- **Tenants** — see their room and rent status, pay rent, book food plans, raise maintenance requests (with a photo), chat with the owner, and request a switch to another branch.
- **Owner** — one console for all branches: dashboard, branches, rooms and beds, tenants, stay/switch approvals, payments, food plans, maintenance, and chat.

## Tech

- React 19 + Vite + Tailwind CSS 4
- Redux Toolkit (state)
- Firebase (login and chat)
- json-server (separate `server/` API, data in `server/db.json`)
- axios (API calls)

## Run it

**1. Install**

```bash
npm install             # React app
npm run server:install  # API in server/ (or: cd server && npm install)
```

**2. Configure**

Copy `.env.example` to `.env` and fill in your Firebase values:

```
VITE_API_BASE_URL=http://localhost:5000
VITE_OWNER_EMAIL=admin@stayinkochi.com
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_DATABASE_URL=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

**3. Start both servers** (two terminals)

```bash
npm run server   # API from server/ on http://localhost:5000
npm run dev      # app on http://localhost:5173
```

**4. Create the owner account**

The owner does not register in the app. Add a user in the Firebase console with the email you set in `VITE_OWNER_EMAIL`.
Anyone who registers in the app becomes a tenant.

## Data

`server/db.json` holds all the demo data: 6 branches, rooms, beds, tenants, payments, food plans, meals, requests, and notifications — enough to try every screen.

- Records you create in the app are written back to this file.
- Reset it any time with `git checkout server/db.json`.
- Demo tenants (`demo-uid-10`, `demo-uid-11`, …) exist in the data only, so they appear in the owner console but cannot log in.
- Start the API with `npm run server` (or `cd server && npm run dev`), not `npx json-server db.json` — the server applies a flag that stops json-server deleting related records when you delete something.

## Deploy the API

The API lives in its own folder (`server/`) with its own `package.json`, so it deploys on its own Node host — Render, Railway, Fly.io, or a VPS.

- **Root directory:** `server`
- **Build command:** `npm install`
- **Start command:** `npm start`
- **Port:** read from `PORT`, which the host provides

Then set `VITE_API_BASE_URL=https://your-api-host` in the frontend's environment and rebuild.

Hosts with an ephemeral filesystem lose records written to `db.json` on restart — fine for a demo, but see `server/README.md` for persistence notes.

## Notes

- **Payments** — rent and the branch-switch fee are paid through the card checkout sheet in the app.
- **Images** — no upload service; wherever a photo is needed, paste a hosted image URL.

## Where things live

```
src/
  components/   shared UI (navbar, layouts, buttons, dialogs)
  features/     one folder per feature (auth, chat, food, hostels,
                maintenance, notifications, payments, rooms,
                stayRequests, switches, tenants) — slice + service + UI
  pages/        the screens for each route
  routes/       routing and access control
  services/     api (axios), firebase, paymentGateway
server/         standalone json-server API (own package.json)
  db.json       the data the API serves
  index.js      entry point (PORT from env, _ref foreign keys)
```
