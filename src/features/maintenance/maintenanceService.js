import { apiRequest } from '../../services/api'

// Every maintenance request (owner view).
export function getMaintenanceRequests() {
  return apiRequest('/maintenanceRequests')
}

// Maintenance requests raised by one tenant (tenant view).
export function getMaintenanceRequestsByUser(tenantUid) {
  return apiRequest(`/maintenanceRequests?tenantUid=${tenantUid}`)
}

// Maintenance requests raised at one hostel (used when deleting that hostel).
export function getMaintenanceRequestsByHostel(hostelId) {
  return apiRequest(`/maintenanceRequests?hostelId=${hostelId}`)
}

export function createMaintenanceRequest(request) {
  return apiRequest('/maintenanceRequests', {
    method: 'POST',
    body: JSON.stringify(request),
  })
}

// Used by the owner to change a request's status.
export function updateMaintenanceRequest(requestId, updates) {
  return apiRequest(`/maintenanceRequests/${requestId}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  })
}

// Remove a request outright (used when its hostel is deleted).
export function deleteMaintenanceRequest(requestId) {
  return apiRequest(`/maintenanceRequests/${requestId}`, { method: 'DELETE' })
}
