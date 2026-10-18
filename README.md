# StayInKochi

A full-stack hostel management platform for a single owner running multiple **StayInKochi** branches across Kochi. Tenants browse branches, request stays, pay rent, book food, raise maintenance issues, and chat — all from one app.

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite, Redux Toolkit, React Router 7, Tailwind CSS 4 |
| Auth & Chat | Firebase (Authentication + Realtime Database) |
| REST data | json-server (wrapped in a custom Node.js server) |
| Payments | Razorpay |
| Image uploads | Cloudinary |

## Getting started

### 1. Clone and install

```bash
npm install
```

### 2. Configure environment

Copy `.env.example` to `.env` and fill in your values:

```
VITE_API_BASE_URL=http://localhost:5000
VITE_OWNER_EMAIL=owner@yourdomain.com

VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_DATABASE_URL=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...

RAZORPAY_KEY_ID=...
RAZORPAY_KEY_SECRET=...

CLOUDINARY_URL=cloudinary://api_key:api_secret@cloud_name
```

### 3. Create the owner account

The owner never registers through the app. Create a Firebase Auth user manually in the Firebase console using the email set in `VITE_OWNER_EMAIL`. Everyone else who registers becomes a tenant.

### 4. Run

Start the API server and the Vite dev server in separate terminals:

```bash
# Terminal 1 – API (json-server + secrets proxy)
npm run server

# Terminal 2 – Frontend
npm run dev
```

## Features

### Owner
- **Dashboard** — financial summary (rent collected, pending, food income, switch fees), notification inbox, broadcast announcements to all tenants or a specific branch
- **Branches** — add / edit / delete StayInKochi branches; branch names are auto-prefixed with "StayInKochi"
- **Rooms & Beds** — per-branch room management; assign tenants to beds
- **Tenants** — list all active tenants with search; reset rent status; check out tenants
- **Stay requests** — approve or reject incoming requests; approved requests activate a tenant record
- **Payments** — payment history with search, status filter, and CSV export
- **Maintenance** — review and update issue status with search and status filter
- **Food** — manage monthly food plans and individual bookable meals; activity tab shows all active subscriptions and meal bookings
- **Switch requests** — approve paid branch-switch requests
- **Chat** — group chat per branch + private 1:1 chat with each tenant

### Tenant
- **Dashboard** — tenancy status, stay request history, notification inbox
- **Profile** — view active tenancy details; edit name and phone
- **Rent** — pay monthly rent via Razorpay; payment history
- **Food** — subscribe to monthly plans or book individual meals
- **Maintenance** — raise requests with optional photo upload (Cloudinary)
- **Switch branch** — pay the switching fee via Razorpay; owner approves the move
- **Chat** — branch group chat + private chat with the owner

### Public
- Browse all StayInKochi branches with search
- Branch detail page with amenities and stay request form

## Project structure

```
src/
  app/            Redux store
  components/     Shared UI (Navbar, layouts, FormField, Spinner)
  features/       Feature slices: auth, chat, finance, food, hostels,
                  maintenance, notifications, payments, rooms, stayRequests,
                  switches, tenants
  hooks/          useAuthListener
  pages/          Route-level page components
  routes/         AppRoutes, ProtectedRoute
  services/       api, firebase, razorpay, cloudinary
  utils/          formatRupees
server/           Node.js API server (json-server + secrets proxy)
```
