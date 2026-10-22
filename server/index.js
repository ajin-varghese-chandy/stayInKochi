
const fs = require('node:fs')
const path = require('node:path')
const express = require('express')
const jsonServer = require('json-server')
const multer = require('multer')

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

// Verification documents (ID cards, etc.) uploaded from the stay request form,
// maintenance photos uploaded from the tenant upkeep form, and branch gallery
// photos uploaded from the owner console are written to disk here and served
// back from /uploads. UPLOAD_DIR can point at a persistent disk on hosts that
// wipe the app directory on deploy.
const UPLOAD_ROOT = process.env.UPLOAD_DIR
  ? path.resolve(process.env.UPLOAD_DIR)
  : path.join(__dirname, 'uploads')
const TENANT_UPLOAD_DIR = path.join(UPLOAD_ROOT, 'tenants')
const MAINTENANCE_UPLOAD_DIR = path.join(UPLOAD_ROOT, 'maintenance')
const HOSTEL_UPLOAD_DIR = path.join(UPLOAD_ROOT, 'hostels')
fs.mkdirSync(TENANT_UPLOAD_DIR, { recursive: true })
fs.mkdirSync(MAINTENANCE_UPLOAD_DIR, { recursive: true })
fs.mkdirSync(HOSTEL_UPLOAD_DIR, { recursive: true })

// Only the formats a tenant can realistically photograph an ID card in, plus
// PDF for scanned documents. The extension is derived from the type rather
// than trusting the uploaded file name.
const DOCUMENT_UPLOAD_TYPES = new Map([
  ['image/jpeg', '.jpg'],
  ['image/png', '.png'],
  ['image/webp', '.webp'],
  ['application/pdf', '.pdf'],
])

// Maintenance photos are displayed inline, so PDFs are not accepted.
const PHOTO_UPLOAD_TYPES = new Map([
  ['image/jpeg', '.jpg'],
  ['image/png', '.png'],
  ['image/webp', '.webp'],
])

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024 // 5 MB
const MAX_HOSTEL_PHOTOS = 8

// Builds a multipart handler for one upload folder. The stored name is a
// sanitized version of the original with a timestamp prefix, so two files with
// the same name never collide. Single-file endpoints read the `file` field;
// multi-file endpoints read repeated `files` fields.
function createUploader(
  directory,
  allowedTypes,
  invalidMessage,
  { multiple = false, maxFiles = 1 } = {},
) {
  const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, directory),
    filename: (req, file, cb) => {
      const label =
        path
          .basename(file.originalname, path.extname(file.originalname))
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '')
          .slice(0, 40) || 'file'
      const extension = allowedTypes.get(file.mimetype) ?? '.bin'
      cb(null, `${Date.now()}-${label}${extension}`)
    },
  })

  const upload = multer({
    storage,
    limits: { fileSize: MAX_UPLOAD_BYTES, files: maxFiles },
    fileFilter: (req, file, cb) => {
      if (!allowedTypes.has(file.mimetype)) {
        cb(new Error(invalidMessage))
        return
      }
      cb(null, true)
    },
  })

  return multiple ? upload.array('files', maxFiles) : upload.single('file')
}

const uploadDocument = createUploader(
  TENANT_UPLOAD_DIR,
  DOCUMENT_UPLOAD_TYPES,
  'Upload a JPG, PNG, WEBP or PDF file.',
)
const uploadPhoto = createUploader(
  MAINTENANCE_UPLOAD_DIR,
  PHOTO_UPLOAD_TYPES,
  'Upload a JPG, PNG or WEBP image.',
)
const uploadHostelPhotos = createUploader(
  HOSTEL_UPLOAD_DIR,
  PHOTO_UPLOAD_TYPES,
  'Upload a JPG, PNG or WEBP image.',
  { multiple: true, maxFiles: MAX_HOSTEL_PHOTOS },
)

// Shared response handling for every upload endpoint: multer errors come back
// as a 400 with a message the UI can show directly. Single-file endpoints reply
// with one file object; multi-file endpoints reply with `{ files: [...] }`.
function handleUpload(uploader, folder, req, res, { multiple = false } = {}) {
  uploader(req, res, (error) => {
    if (error) {
      const message =
        error.code === 'LIMIT_FILE_SIZE'
          ? 'File is larger than 5 MB.'
          : error.code === 'LIMIT_FILE_COUNT' ||
              error.code === 'LIMIT_UNEXPECTED_FILE'
            ? `Too many files — upload up to ${MAX_HOSTEL_PHOTOS} at a time.`
            : error.message || 'Could not upload that file.'
      res.status(400).json({ message })
      return
    }

    const files = multiple ? req.files ?? [] : req.file ? [req.file] : []

    if (files.length === 0) {
      res.status(400).json({ message: 'No file received.' })
      return
    }

    const uploaded = files.map((file) => ({
      name: file.originalname,
      path: `/uploads/${folder}/${file.filename}`,
      size: file.size,
      mimeType: file.mimetype,
      uploadedAt: new Date().toISOString(),
    }))

    res.status(201).json(multiple ? { files: uploaded } : uploaded[0])
  })
}

const app = jsonServer.create()

// Plain health check for the hosting platform. Registered before json-server's
// defaults so its bundled demo page does not take over `/`.
app.get('/', (req, res) => {
  res.json({ status: 'ok', service: 'stayinkochi-api' })
})

app.use(jsonServer.defaults())

// POST /uploads/tenants — multipart/form-data with a single `file` field.
// Responds with the metadata the frontend keeps on the stay request.
// Registered before the static handler because express.static only accepts
// GET/HEAD and would answer this POST with a 405.
app.post('/uploads/tenants', (req, res) => {
  handleUpload(uploadDocument, 'tenants', req, res)
})

// POST /uploads/maintenance — a photo attached to a tenant's maintenance
// request. Same contract as above, images only.
app.post('/uploads/maintenance', (req, res) => {
  handleUpload(uploadPhoto, 'maintenance', req, res)
})

// POST /uploads/hostels — up to 8 gallery photos for one branch, sent as
// repeated `files` fields. Responds with `{ files: [...] }`; the owner console
// stores the returned paths on the hostel record.
app.post('/uploads/hostels', (req, res) => {
  handleUpload(uploadHostelPhotos, 'hostels', req, res, { multiple: true })
})

// Uploaded files are read straight off disk. The URL is stored on the stay
// request, not the file itself, so records stay small.
app.use('/uploads', express.static(UPLOAD_ROOT, { fallthrough: false }))

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
