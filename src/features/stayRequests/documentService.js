import api, { API_BASE_URL } from '../../services/api'

// Verification documents (ID cards and the like) are uploaded straight to the
// API, which writes them to `server/uploads/tenants` and replies with the
// details we keep on the stay request.
export function uploadVerificationDocument(file) {
  const formData = new FormData()
  formData.append('file', file)

  // Uploads can take longer than the client's normal request timeout.
  return api.post('/uploads/tenants', formData, { timeout: 30000 })
}

// The API stores a root-relative path ("/uploads/tenants/…"). Resolve it
// against the API host, not the React app's own origin.
export function documentUrl(storedPath) {
  if (!storedPath) return ''
  if (/^https?:\/\//i.test(storedPath)) return storedPath

  const base = API_BASE_URL.replace(/\/+$/, '')
  return `${base}${storedPath.startsWith('/') ? '' : '/'}${storedPath}`
}
