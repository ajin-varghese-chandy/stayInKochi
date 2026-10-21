# Presentation Split — StayInKochi (6 speakers)

A ready-to-follow division of the project into 6 speaking slots. Assumes a
**~20 minute** slot (≈3 min each) + Q&A — scale the "Time" column up or down
for your actual slot. Each section lists **what to say**, **what to show in
the code**, and **what to demo live**.

---

## Before anyone speaks (whoever has the laptop)

Setup checklist, done 10 minutes early:

```bash
npm install
npm run server:install  # API deps in server/
npm run server     # terminal 1 — json-server on :5000
npm run dev        # terminal 2 — Vite on :5173
```

- `.env` filled in (Firebase keys, `VITE_OWNER_EMAIL`, `VITE_RAZORPAY_KEY_ID`)
- Two browser profiles ready:
  - **Owner**: the account matching `VITE_OWNER_EMAIL`
  - **Tenant**: any registered user (or a demo tenant with an approved tenancy)
- Backup: a screen recording / screenshots of the live demo in case anything
  fails on stage
- One person drives the screen; the current speaker talks while they navigate
  (or each speaker demos their own part if you demo section-by-section)

**Demo storyline** (runs through all sections so the demo feels like one story):
*visitor browses → requests a stay → owner approves → tenant pays rent →
books food → raises an issue → owner resolves it → tenant switches branch.*

---

## Speaker 1 — Introduction & Architecture
**Time:** 3 min · **Goal:** what this is and how it's built

**Say:**
- Problem: hostel/PG management across multiple Kochi branches — tenants,
  rent, food, upkeep, switches — all under one owner. One app, two roles.
- Tech stack: React 19 + Vite, Redux Toolkit, React Router 7, Tailwind CSS 4,
  Firebase Auth + Realtime DB, json-server REST, Razorpay.
- Three shells: public site, owner console, tenant portal — each with its own
  layout, protected by role-based routing.
- Feature-folder architecture: every domain owns `slice` (state + thunks),
  `service` (API calls), `components` (UI).

**Show in code:**
- `src/routes/AppRoutes.jsx` — the three route groups + `ProtectedRoute`
- `src/app/store.js` — all slices registered
- Folder tree: `src/features/*` (auth, hostels, rooms, payments, food, …)

**Demo:** the landing page; open DevTools → React DevTools/Redux to show it's
live. Mention `npm run server` serving `server/db.json`.

---

## Speaker 2 — Public Site & Authentication
**Time:** 3.5 min · **Goal:** the visitor journey up to an approved stay

**Say:**
- Modern minimal landing page: type-first hero, pill search, branch grid,
  quick features.
- Branch listing with search/filter; branch detail with photo gallery
  (`hostelPhotos.js` derives placeholder frames from the picsum seed).
- Stay request form on the branch detail page → creates a `stayRequest`.
- Register → Firebase creates a user → everyone is a tenant except the
  configured owner email; `ProtectedRoute` gates `/owner` and `/tenant`.

**Show in code:**
- `src/pages/LandingPage.jsx`, `HostelListPage.jsx`, `HostelDetailsPage.jsx`
- `src/features/auth/authSlice.js` + `authService.js` (Firebase)
- `src/routes/ProtectedRoute.jsx` (role check)
- `src/features/stayRequests/components/StayRequestForm.jsx`

**Demo:**
1. Search "Kakkanad" from the hero search → results page
2. Open a branch → gallery + amenities + rent
3. Submit a stay request (tenant account)
4. Show the 404 page quickly (route fallback)

---

## Speaker 3 — Owner Console (Core Operations)
**Time:** 3.5 min · **Goal:** managing the inventory: branches, rooms, beds, tenants

**Say:**
- Owner dashboard: financial summary (rent collected/pending, food income,
  switch fees) + notification inbox + announcements.
- Branch CRUD — brand name auto-prefixed ("StayInKochi …"), image is a pasted
  URL, amenities comma-separated.
- Rooms & beds per branch: add rooms, free/occupied bed states, assign a
  tenant to a bed.
- Tenants list: search, reset rent status, check out.

**Show in code:**
- `src/pages/owner/OwnerDashboardPage.jsx`, `OwnerHostelsPage.jsx`
- `src/features/hostels/components/HostelForm.jsx` (image URL field)
- `src/features/rooms/` — `roomsSlice`, `roomService`, `BedRow`, `RoomForm`
- `src/features/finance/FinancialSummary.jsx`

**Demo:**
1. Add a branch (paste an image URL) → it appears in the public list
2. Add a room to it → assign a tenant to a bed
3. Dashboard financial cards

---

## Speaker 4 — Owner Console (Business Operations)
**Time:** 4 min · **Goal:** money, food, upkeep, switches, communication

**Say:**
- Payments: full history with search, status filter, **CSV export**.
- Food: monthly plans + individual meals per branch; activity tab shows
  active subscriptions and bookings.
- Maintenance: status workflow `open → in-progress → resolved`, with the
  photo the tenant attached.
- Switch requests: tenant pays the fee, owner approves and the tenant record
  moves branches.
- Chat: per-branch group chat + private 1:1, on Firebase Realtime Database;
  broadcast announcements to all tenants or one branch.

**Show in code:**
- `src/pages/owner/OwnerPaymentsPage.jsx` (CSV export logic)
- `src/features/food/` — `FoodPlanForm`, `MealForm`, `SubscriptionCard`
- `src/features/maintenance/maintenanceSlice.js` (status update + notify)
- `src/features/notifications/notificationService.js` (owner inbox / broadcast)
- `src/services/razorpay.js`, `src/services/paymentGateway.js`

**Demo (continues the story):**
1. Approve the stay request from Speaker 2 → tenant becomes active
2. See the maintenance request + set it to `in-progress`
3. Payments table + download CSV
4. Send a broadcast announcement

---

## Speaker 5 — Tenant Portal
**Time:** 4 min · **Goal:** the tenant's day-to-day experience

**Say:**
- Redesigned portal: light header + underline tabs on desktop, **bottom tab
  bar on phones**, avatar chip, high-contrast text.
- Overview: welcome header, tenancy status card (branch, room, bed, rent
  badge), quick-action tiles, notifications, stay request history.
- Rent: rent due card + Razorpay checkout (test mode) + payment history with
  receipts.
- Food: subscribe to a plan or book a single meal.
- Upkeep: raise an issue with an optional pasted photo URL (no file upload —
  Cloudinary was removed by design).
- Switch branch: pay the switch fee → owner approves.
- Profile: edit name/phone; chat with the owner.

**Show in code:**
- `src/components/layout/TenantLayout.jsx` + `TenantNav.jsx` (two nav forms)
- `src/pages/tenant/TenantDashboardPage.jsx` (status card + quick actions)
- `src/pages/tenant/TenantPaymentsPage.jsx`, `TenantFoodPage.jsx`,
  `TenantMaintenancePage.jsx`
- `src/components/layout/tenantNavItems.js`

**Demo (the heart of the storyline):**
1. Overview → tenancy card + quick actions
2. Pay rent → Razorpay test checkout (card `4111 1111 1111 1111`) → status
   flips to paid
3. Book a meal / subscribe to a food plan
4. Raise an issue with a photo URL
5. Send a chat message to the owner

---

## Speaker 6 — Data Layer, State & Engineering (Closing)
**Time:** 3.5 min · **Goal:** how it works under the hood + wrap-up

**Say:**
- **API**: json-server in its own `server/` folder, serving `server/db.json`
  (13 collections: hostels, rooms, beds,
  tenants, stayRequests, maintenanceRequests, payments, foodPlans, meals,
  planSubscriptions, mealBookings, switchRequests, notifications). Started
  with `npm run server` (keeps `--foreign-key-suffix _ref` — explain why).
- **Single axios client** `src/services/api.js`: sets base URL, unwraps
  `response.data`, turns errors into UI-ready messages.
- **State**: Redux Toolkit — one slice per feature, `createAsyncThunk` for
  async, selectors exported per slice; optimistic-free, simple flow.
- **Notifications**: written to json-server, read per recipient with unread
  counts — powers the bell, inbox, and broadcast.
- **Quality**: ESLint config, `npm run build` clean, Tailwind design tokens
  in `src/index.css` (one font, one palette, no ad-hoc colors).
- **Future scope**: real file uploads, backend signature verification for
  Razorpay, pagination, PWA/offline, admin analytics.

**Show in code:**
- `server/db.json` (open it — show the seed size), `src/services/api.js`
- One slice end-to-end: e.g. `src/features/maintenance/` slice → service →
  component
- `src/index.css` design tokens
- Terminal: `npm run lint` + `npm run build`

**Demo:**
1. Add a branch in the UI → show the new record appear in `server/db.json`
2. Redux DevTools (if installed) showing thunks fire during the demo
3. Close: hand over to Q&A

---

## Time box (20 min example)

| # | Speaker | Section | Min |
|---|---------|---------|-----|
| — | Driver | Setup + storyline intro | 1 |
| 1 | Person 1 | Introduction & architecture | 3 |
| 2 | Person 2 | Public site & auth | 3.5 |
| 3 | Person 3 | Owner console — core ops | 3.5 |
| 4 | Person 4 | Owner console — business ops | 4 |
| 5 | Person 5 | Tenant portal | 4 |
| 6 | Person 6 | Data layer & closing | 3 |
| — | All | Q&A | balance |

## Likely questions (prepare one answer each)

- *Why json-server?* — no backend to build for a frontend-focused project;
  realistic REST shape, swappable for a real API later.
- *Why no file uploads?* — images are pasted URLs; keeps the app backend-free
  and the data model simple.
- *Is Razorpay real?* — test mode only; production needs signature
  verification on a server (honest known limitation).
- *Role security?* — Firebase Auth + `requiredRole` in `ProtectedRoute`;
  owner is the single configured email.
- *Hardest part?* — one answer each from whoever wants it: cross-feature
  notifications, chat on Firebase RTDB, the tenant portal redesign.
