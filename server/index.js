const fs = require('node:fs')
const path = require('node:path')
const jsonServer = require('json-server')

const PORT = Number(process.env.PORT) || 5000
const HOST = process.env.HOST || '0.0.0.0'
const WATCH = process.argv.includes('--watch')

const SEED_FILE = path.join(__dirname, 'db.json')
const DB_FILE = process.env.DB_FILE
  ? path.resolve(process.env.DB_FILE)
  : SEED_FILE

// If DB_FILE is somewhere else, copy db.json there the first time
if (DB_FILE !== SEED_FILE && !fs.existsSync(DB_FILE)) {
  fs.mkdirSync(path.dirname(DB_FILE), { recursive: true })
  fs.copyFileSync(SEED_FILE, DB_FILE)
  console.log('Copied db.json to ' + DB_FILE)
}

const app = jsonServer.create()

app.get('/', function (req, res) {
  res.json({ status: 'ok', service: 'stayinkochi-api' })
})

app.use(jsonServer.defaults())

// Uploads go from the browser to Cloudinary, so the API only stores URLs
let router = jsonServer.router(DB_FILE, { foreignKeySuffix: '_ref' })

app.use(function (req, res, next) {
  router(req, res, next)
})

app.listen(PORT, HOST, function () {
  console.log('StayInKochi API listening on http://' + HOST + ':' + PORT)
})

if (WATCH) {
  const dbDir = path.dirname(DB_FILE)
  const dbName = path.basename(DB_FILE)
  let timer

  fs.watch(dbDir, function (event, file) {
    if (file !== dbName) return

    clearTimeout(timer)
    timer = setTimeout(function () {
      try {
        router = jsonServer.router(DB_FILE, { foreignKeySuffix: '_ref' })
        console.log(dbName + ' changed, data reloaded')
      } catch (error) {
        console.error('Could not reload ' + dbName + ': ' + error.message)
      }
    }, 100)
  })

  console.log('Watching ' + dbName + ' for changes')
}
