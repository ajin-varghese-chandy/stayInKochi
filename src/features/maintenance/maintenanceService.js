import api, { API_BASE_URL } from '../../services/api'

// Maintenance photos are uploaded to the API, which writes them to
// `server/uploads/maintenance` and replies with `{ name, path, size, … }`.
// Only the path is stored on the request, so db.json stays small.
export function uploadMaintenancePhoto(file) {
  const formData = new FormData()
  formData.append('file', file)

  // Uploads can take longer than the client's normal request timeout.
  return api.post('/uploads/maintenance', formData, { timeout: 30000 })
}

// Photos are stored as root-relative paths ("/uploads/maintenance/…"), so
// resolve them against the API host. Absolute URLs (older records) pass
// through untouched.
export function maintenancePhotoUrl(storedPath) {
  if (!storedPath) return ''
  if (/^https?:\/\//i.test(storedPath)) return storedPath

  const base = API_BASE_URL.replace(/\/+$/, '')
  return `${base}${storedPath.startsWith('/') ? '' : '/'}${storedPath}`
}

// Every maintenance request (owner view).
export function getMaintenanceRequests() {
  return api.get('/maintenanceRequests')
}

// Maintenance requests raised by one tenant (tenant view).
export function getMaintenanceRequestsByUser(tenantUid) {
  return api.get(`/maintenanceRequests?tenantUid=${tenantUid}`)
}

// Maintenance requests raised at one hostel (used when deleting that hostel).
export function getMaintenanceRequestsByHostel(hostelId) {
  return api.get(`/maintenanceRequests?hostelId=${hostelId}`)
}

export function createMaintenanceRequest(request) {
  return api.post('/maintenanceRequests', request)
}

// Used by the owner to change a request's status.
export function updateMaintenanceRequest(requestId, updates) {
  return api.patch(`/maintenanceRequests/${requestId}`, updates)
}

// Remove a request outright (used when its hostel is deleted).
export function deleteMaintenanceRequest(requestId) {
  return api.delete(`/maintenanceRequests/${requestId}`)
}
