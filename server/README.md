# StayInKochi API

The REST API for StayInKochi: a [json-server](https://github.com/typicode/json-server)
instance that serves `db.json`. It lives in its own folder with its own
`package.json` so it can be installed, run, and deployed without the React app.

Image and document uploads are **not** handled here. The React app uploads them
straight to [Cloudinary](https://cloudinary.com/) and stores the returned URLs in
the database.

## Run locally

```bash
cd server
npm install
npm run dev      # http://localhost:5000, reloads when db.json changes
```

The frontend expects `VITE_API_BASE_URL=http://localhost:5000` in the repo-root
`.env`. From the repo root you can also start this API with `npm run server`.

## Endpoints

- `GET /` — health check, returns `{ "status": "ok" }`
- `GET /db` — the whole database
- `/hostels`, `/rooms`, `/beds`, `/tenants`, `/payments`, `/foodPlans`,
  `/planSubscriptions`, `/stayRequests`,
  `/switchRequests`, `/maintenanceRequests`, `/notifications` — standard
  json-server CRUD

Chat runs on Firebase Realtime Database, so it is not served from here.

Unknown ids and missing routes return json-server's normal 404.

## Deploy

Any host that runs Node can serve it. The entry point is `index.js`, which
reads `PORT` (and optionally `HOST`) from the environment.

- **Build command:** `npm install`
- **Start command:** `npm start`
- **Root directory:** `server` (if the host builds from the repo root)
- **Environment:** `PORT` is set by the host; `HOST` defaults to `0.0.0.0`

Then point the deployed frontend at this API by setting
`VITE_API_BASE_URL=https://your-api-host` and rebuilding the React app.

### Persistence

json-server writes changes straight back into `db.json`. Some hosts (Render
free, Railway without a volume, most serverless platforms) use an ephemeral
filesystem, so records created in the app reset on redeploy or restart.

- For a demo, that is usually fine.
- For durable data, attach a persistent disk/volume and set `DB_FILE` to a path
  on it, e.g. `DB_FILE=/var/data/db.json`. On first start the server copies
  `db.json` there as seed data, then reads and writes that file.

## Notes

- `--foreign-key-suffix _ref` is applied in `index.js` (`foreignKeySuffix:
  '_ref'`). It stops json-server deleting related records when you delete one
  — for example, deleting a hostel keeps its rooms and tenants.
- Reset the demo data any time with `git checkout -- server/db.json` from the
  repo root.
