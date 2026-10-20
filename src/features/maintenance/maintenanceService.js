import api from '../../services/api'

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
