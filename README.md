# StayInKochi

A web app for managing hostel and PG branches across Kochi — from one owner's
console and a tenant portal, to a public site where anyone can browse branches
and request a bed.

There are three parts to the app:

| Part | Who uses it | What it is |
| --- | --- | --- |
| Public site | Anyone | Browse branches, compare rent and beds, send a stay request |
| Tenant portal | Registered tenants | Pay rent, book food, raise issues, chat, switch or leave a branch |
| Owner console | The single owner | Manage branches, rooms, beds, tenants, money and requests |

---

## Features

### Public site (no login needed)

- Landing page with a branch search box.
- Browse all branches and filter by **area, rent, room size, amenity and bed
  availability**. Sort by rent or free beds.
- Open a branch to see photos, amenities, rooms, food plans, rent and live bed
  availability.
- **Send a stay request** with your details and an optional ID document
  (JPG, PNG, WEBP or PDF, up to 5 MB).
- Register and log in with email and password.

### Tenant portal

- **Dashboard** — your branch, room, bed, rent status, quick actions,
  notifications, and the history of your stay requests.
- **Rent** — pay the current month through a mock UPI checkout, see what is due,
  and keep every past payment and receipt.
- **Food plans** — subscribe to a monthly meal plan at your branch and pay for it.
- **Maintenance** — raise an issue with an optional photo, then track it as
  `open` → `in progress` → `resolved`.
- **Switch branch** — compare other branches by rent, amenities and free beds,
  request a move, then pay the switch fee and any rent difference.
- **Vacate** — give at least **5 days' notice** to end your stay.
- **Chat** — message the owner privately or talk in your branch group chat.
- **Profile** — edit your name and phone number, and log out.

### Owner console

- **Dashboard** — money summary (rent collected, rent pending, food income,
  switch fees), incoming stay requests, notifications, and announcements.
- **Branches** — add, edit and delete branches with photos, amenities and rent.
- **Rooms and beds** — add rooms, track free/occupied beds, assign a tenant to a
  bed, or free a bed again.
- **Tenants** — search tenants, view their ID document, change their bed, reset
  rent, check someone out, and approve or complete vacate requests.
- **Stay requests** — approve or reject new requests. Approving one creates the
  tenancy and assigns a bed.
- **Switch requests** — reserve a bed at the new branch and approve the move.
- **Payments** — search and filter every payment, and **export it as CSV**.
- **Food** — create and edit monthly plans, and see active subscriptions.
- **Maintenance** — see every issue, open the photo, and update its status.
- **Chat** — branch group chats and private chats with each tenant.
- **Announcements** — send a notification to all tenants or one branch.

### Notifications

- A bell with unread count, plus an inbox, for both the owner and tenants.
- The app notifies the right person when a request is sent, approved or
  rejected, when rent or food is paid, when an issue changes status, and when an
  announcement is broadcast.

---

## Tech stack

- **Frontend:** React 19, Vite 8, Tailwind CSS 4, React Router 7
- **State:** Redux Toolkit (one slice per feature)
- **Auth and chat:** Firebase Authentication + Firebase Realtime Database
- **API:** json-server + Express in `server/`, with data in `server/db.json`
- **HTTP:** axios
- **Icons:** lucide-react

---

## Run it locally

### What you need

- Node.js 18 or newer
- A Firebase project with **Email/Password sign-in** and a **Realtime Database**
  enabled

### 1. Install dependencies

```bash
npm install
npm run server:install   # installs the API inside server/
```

### 2. Add environment variables

Copy `.env.example` to `.env` and fill in the Firebase values:

```env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_DATABASE_URL=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...

VITE_OWNER_EMAIL=admin@stayinkochi.com
VITE_API_BASE_URL=http://localhost:5000
```

### 3. Start the API and the app

Use two terminals:

```bash
npm run server   # API on http://localhost:5000
npm run dev      # app on http://localhost:5173
```

### 4. Create the owner account

The owner does **not** register in the app.

1. Open the Firebase console → Authentication → Users.
2. Add a user with the same email you put in `VITE_OWNER_EMAIL`.
3. Log in with that account to reach the owner console.

Anyone who registers through the app becomes a tenant.

---

## Demo data

`server/db.json` is already filled with demo branches, rooms, beds, tenants,
payments, food plans and requests, so every screen has something to show.

- Changes made in the app are written back to this file.
- Reset the demo data any time:

  ```bash
  git checkout -- server/db.json
  ```

- Demo tenants (like `demo-uid-10`) appear in the owner console but cannot log
  in — they only exist in the data.
- Always start the API with `npm run server`, not `npx json-server`. The server
  applies a `_ref` foreign-key setting that stops related records being deleted
  along with a branch.

---

## How the main flows work

**Joining a branch**
Stay request → owner approves → tenant record and bed assignment are created →
tenant can use the portal.

**Paying rent**
The tenant pays through a simulated UPI sheet. No real money moves and no
payment gateway is involved — a payment id is generated locally and the record
is saved to the API.

**Switching branches**
Tenant requests a move → owner reserves a bed → tenant clears this month's rent
→ tenant pays the switch fee plus any prorated rent difference → the old bed is
released and the new tenancy starts. Unused days at the old branch are credited,
and any surplus carries over as rent credit.

**Food plans**
Plans are created by the owner per branch. A tenant subscribes for one month and
pays through the same checkout.

**Vacating**
The tenant picks a date at least 5 days away. The owner approves it, then marks
it complete, which frees the bed and ends the tenancy.

**Chat**
Branch group chats and owner–tenant private chats run on Firebase Realtime
Database, so messages appear instantly.

---

## Project structure

```text
src/
  app/          Redux store
  components/   shared UI and layouts (public, owner, tenant)
  features/     one folder per feature: auth, chat, finance, food, hostels,
                maintenance, notifications, payments, rooms, stayRequests,
                switches, tenants, vacates
                each has a slice (state), a service (API), and components
  pages/        screens for each route
  routes/       routes and role protection
  services/     axios client, Firebase setup, mock payment gateway
  utils/        helpers (rupee formatting, branch photos)

server/
  index.js      Express + json-server + upload endpoints
  db.json       demo data
  uploads/      tenant documents and maintenance photos
```

Routes are split into three groups:

- `/`, `/hostels`, `/hostels/:id`, `/login`, `/register` — public
- `/owner/...` — owner only
- `/tenant/...` — tenant only

`src/routes/ProtectedRoute.jsx` sends guests to login and wrong-role users to
their own dashboard.

---

## Deploying

### Frontend

Build with `npm run build` and deploy the `dist/` folder to any static host
(Vercel, Netlify, etc.). `vercel.json` already redirects all paths to
`index.html` so client-side routes work.

Set `VITE_API_BASE_URL` to your deployed API URL before building.

### API

The `server/` folder is a standalone Node app with its own `package.json`.

| Setting | Value |
| --- | --- |
| Root directory | `server` |
| Build command | `npm install` |
| Start command | `npm start` |
| Port | from the `PORT` environment variable |

Optional environment variables:

- `DB_FILE` — path to a persistent `db.json` (otherwise the bundled one is used)
- `UPLOAD_DIR` — path to a persistent folder for uploaded files

Hosts with an ephemeral filesystem will lose new records and uploads on restart,
which is fine for a demo but not for real use. See `server/README.md` for details.

---

## Good to know

- **Payments are simulated.** The checkout sheet only creates a payment record;
  it is not connected to UPI, Razorpay or any bank.
- **One owner only.** Owner access is granted solely by matching
  `VITE_OWNER_EMAIL`; there is no owner sign-up screen.
- **Uploads** are limited to 5 MB and stored under `server/uploads/`
  (documents: JPG/PNG/WEBP/PDF; maintenance photos: JPG/PNG/WEBP).
- **The API is a demo backend.** json-server is easy to replace with a real
  backend later, but it has no pagination, auth rules or concurrency handling.
