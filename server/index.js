// Local API server: json-server for the app's REST data, plus three routes that
// hold the secret keys so they never reach the browser bundle.
//
//   GET  /razorpay/config  -> public Razorpay key id (for the checkout widget)
//   POST /razorpay/verify  -> confirms Razorpay really signed a payment
//   POST /cloudinary/sign  -> signs one image upload
//
// json-server 1.0 dropped its --middlewares flag, so we build its app ourselves
// and dispatch to it for every path we do not own.
import { createServer } from 'node:http'
import { readFileSync, writeFileSync } from 'node:fs'
import { createHash, createHmac, timingSafeEqual } from 'node:crypto'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createApp } from 'json-server/lib/app.js'

const rootDir = join(dirname(fileURLToPath(import.meta.url)), '..')

// Same .env Vite reads, so `npm run server` needs no extra setup. Real
// deployments should inject these vars instead of shipping the file.
try {
  process.loadEnvFile(join(rootDir, '.env'))
} catch {
  // .env is optional.
}

const PORT = Number(process.env.PORT ?? 5000)

// Minimal stand-in for lowdb: json-server only reads `data` and calls `write()`.
const dbFile = join(rootDir, 'db.json')
const db = {
  data: {},
  read() {
    this.data = JSON.parse(readFileSync(dbFile, 'utf8'))
  },
  write() {
    writeFileSync(dbFile, JSON.stringify(this.data, null, 2))
  },
}
db.read()

const api = createApp(db, { logger: false, static: [] })

// ---------------------------------------------------------------------------
// Razorpay
// ---------------------------------------------------------------------------

// Razorpay signs `order_id|payment_id` when an order was created first, and
// just `payment_id` for plain checkout sessions. Support both.
function isRazorpaySignatureValid({ razorpay_payment_id, razorpay_order_id, razorpay_signature }) {
  const secret = process.env.RAZORPAY_KEY_SECRET
  if (!secret) {
    throw new Error('RAZORPAY_KEY_SECRET is not set in .env')
  }

  const payload = razorpay_order_id
    ? `${razorpay_order_id}|${razorpay_payment_id}`
    : razorpay_payment_id
  const expected = createHmac('sha256', secret).update(payload).digest('hex')
  const given = Buffer.from(String(razorpay_signature), 'utf8')
  const wanted = Buffer.from(expected, 'utf8')

  // Length check first: timingSafeEqual throws on a length mismatch.
  return given.length === wanted.length && timingSafeEqual(given, wanted)
}

// ---------------------------------------------------------------------------
// Cloudinary
// ---------------------------------------------------------------------------

// CLOUDINARY_URL=cloudinary://<api_key>:<api_secret>@<cloud_name>
function cloudinaryCredentials() {
  const url = process.env.CLOUDINARY_URL
  if (!url) {
    throw new Error('CLOUDINARY_URL is not set in .env')
  }

  const match = /^cloudinary:\/\/([^:]+):([^@]+)@(.+)$/.exec(url)
  if (!match) {
    throw new Error('CLOUDINARY_URL must look like cloudinary://key:secret@cloud')
  }

  return { apiKey: match[1], apiSecret: match[2], cloudName: match[3] }
}

// Cloudinary expects sha1 over the alphabetically sorted params, then the secret.
function cloudinarySignature(params, apiSecret) {
  const toSign = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join('&')

  return createHash('sha1').update(toSign + apiSecret).digest('hex')
}

// ---------------------------------------------------------------------------
// Routing
// ---------------------------------------------------------------------------

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let raw = ''
    req.on('data', (chunk) => {
      raw += chunk
    })
    req.on('end', () => {
      if (!raw.trim()) {
        resolve({})
        return
      }
      try {
        resolve(JSON.parse(raw))
      } catch {
        reject(new Error('Body must be JSON.'))
      }
    })
    req.on('error', reject)
  })
}

function sendJson(res, statusCode, payload) {
  const body = JSON.stringify(payload)
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  })
  res.end(body)
}

async function handleSecretsRoute(req, res, pathname) {
  // Preflight for the Vite dev server.
  if (req.method === 'OPTIONS') {
    sendJson(res, 204, {})
    return
  }

  try {
    if (pathname === '/razorpay/config' && req.method === 'GET') {
      const keyId = process.env.RAZORPAY_KEY_ID
      if (!keyId) {
        sendJson(res, 500, { error: 'RAZORPAY_KEY_ID is not set in .env' })
        return
      }
      // The key id is public by design; the secret stays here.
      sendJson(res, 200, { keyId })
      return
    }

    if (pathname === '/razorpay/verify' && req.method === 'POST') {
      const body = await readJsonBody(req)
      const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = body

      if (!razorpay_payment_id || !razorpay_signature) {
        sendJson(res, 400, {
          verified: false,
          error: 'razorpay_payment_id and razorpay_signature are required.',
        })
        return
      }

      const verified = isRazorpaySignatureValid({
        razorpay_payment_id,
        razorpay_order_id,
        razorpay_signature,
      })
      sendJson(res, 200, { verified, paymentId: razorpay_payment_id })
      return
    }

    if (pathname === '/cloudinary/sign' && req.method === 'POST') {
      const { apiKey, apiSecret, cloudName } = cloudinaryCredentials()
      const { folder, public_id: publicId } = await readJsonBody(req)

      const timestamp = Math.floor(Date.now() / 1000)
      const params = { timestamp }
      if (folder) params.folder = folder
      if (publicId) params.public_id = publicId

      sendJson(res, 200, {
        apiKey,
        cloudName,
        timestamp,
        signature: cloudinarySignature(params, apiSecret),
        ...(folder ? { folder } : {}),
        ...(publicId ? { public_id: publicId } : {}),
      })
      return
    }

    sendJson(res, 404, { error: 'Not Found' })
  } catch (error) {
    sendJson(res, 500, { error: error.message })
  }
}

const server = createServer((req, res) => {
  const { pathname } = new URL(req.url, 'http://localhost')

  if (pathname.startsWith('/razorpay') || pathname.startsWith('/cloudinary')) {
    void handleSecretsRoute(req, res, pathname)
    return
  }

  // Everything else is plain json-server.
  api.handler(req, res)
})

server.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`)
  console.log('  POST /razorpay/verify  (uses RAZORPAY_KEY_SECRET)')
  console.log('  GET  /razorpay/config')
  console.log('  POST /cloudinary/sign  (uses CLOUDINARY_URL)')
})
