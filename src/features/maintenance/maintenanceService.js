import api, { API_BASE_URL } from '../../services/api'
import { uploadFile } from '../../services/cloudinary'

// The photo goes straight to Cloudinary; the request stores its URL.
export function uploadMaintenancePhoto(file) {
  return uploadFile(file, 'stayinkochi/maintenance')
}

// New uploads are absolute Cloudinary URLs. Older records may still use
// root-relative paths, so resolve those against the API host.
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
