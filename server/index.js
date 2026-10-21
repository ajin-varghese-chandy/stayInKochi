// Standalone json-server for the StayInKochi API.
//
// The API has its own package.json so it can be installed and deployed on its
// own, without the React app. The frontend reaches it through the
// VITE_API_BASE_URL environment variable.
//
//   npm start      production (`node index.js`)
//   npm run dev    local, reloads db.json when the file changes
//
// PORT and HOST are read from the environment because hosting providers assign
// them. DB_FILE optionally points at a persistent disk (see README).
const fs = require('node:fs')
const path = require('node:path')
const jsonServer = require('json-server')

const PORT = Number(process.env.PORT) || 5000
const HOST = process.env.HOST || '0.0.0.0'
const WATCH = process.argv.includes('--watch')

// db.json ships next to this file. Point DB_FILE at a mounted disk on hosts
// where the app directory is read-only or wiped on deploy; the seed data is
// copied there on first start.
const SEED_FILE = path.join(__dirname, 'db.json')
const DB_FILE = process.env.DB_FILE ? path.resolve(process.env.DB_FILE) : SEED_FILE

if (DB_FILE !== SEED_FILE && !fs.existsSync(DB_FILE)) {
  fs.mkdirSync(path.dirname(DB_FILE), { recursive: true })
  fs.copyFileSync(SEED_FILE, DB_FILE)
  console.log(`Seeded ${DB_FILE} from db.json`)
}

// The `_ref` suffix keeps json-server from cascading deletes into related
// records (deleting a hostel no longer removes its rooms and tenants), which
// is why the old npm script passed --foreign-key-suffix _ref.
const ROUTER_OPTIONS = { foreignKeySuffix: '_ref' }

const app = jsonServer.create()

// Plain health check for the hosting platform. Registered before json-server's
// defaults so its bundled demo page does not take over `/`.
app.get('/', (req, res) => {
  res.json({ status: 'ok', service: 'stayinkochi-api' })
})

app.use(jsonServer.defaults())

// The router is held in a variable so the watcher can swap in a fresh one
// without restarting the process (json-server's own --watch restarts the
// HTTP server, which drops connections).
let router = jsonServer.router(DB_FILE, ROUTER_OPTIONS)
app.use((req, res, next) => router(req, res, next))

app.listen(PORT, HOST, () => {
  console.log(`StayInKochi API listening on http://${HOST}:${PORT}`)
})

if (WATCH) {
  let timer
  const dbDir = path.dirname(DB_FILE)
  const dbName = path.basename(DB_FILE)

  fs.watch(dbDir, (event, file) => {
    if (file !== dbName) return

    clearTimeout(timer)
    timer = setTimeout(() => {
      try {
        router = jsonServer.router(DB_FILE, ROUTER_OPTIONS)
        console.log(`${dbName} changed, data reloaded`)
      } catch (error) {
        console.error(`Could not reload ${dbName}:`, error.message)
      }
    }, 100)
  })

  console.log(`Watching ${dbName} for changes`)
}
