import { apiRequest } from '../../services/api'

// Today as YYYY-MM-DD, used for request/decision dates.
const today = () => new Date().toISOString().slice(0, 10)

// Every stay request (owner view).
export function getStayRequests() {
  return apiRequest('/stayRequests')
}

// Stay requests submitted by one user (tenant view).
export function getStayRequestsByUser(tenantUid) {
  return apiRequest(`/stayRequests?tenantUid=${tenantUid}`)
}

// Requests this user already made for a given hostel (blocks duplicates).
export function getStayRequestsForHostel(hostelId, tenantUid) {
  return apiRequest(`/stayRequests?hostelId=${hostelId}&tenantUid=${tenantUid}`)
}

// Every request made against one hostel (used when deleting that hostel).
export function getStayRequestsByHostel(hostelId) {
  return apiRequest(`/stayRequests?hostelId=${hostelId}`)
}

// Create a new pending stay request.
export function createStayRequest(stayRequest) {
  return apiRequest('/stayRequests', {
    method: 'POST',
    body: JSON.stringify({
      ...stayRequest,
      status: 'pending',
      requestedOn: today(),
    }),
  })
}

// Approve or reject an existing request.
export function updateStayRequest(requestId, updates) {
  return apiRequest(`/stayRequests/${requestId}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  })
}

// Remove a request outright (used when its hostel is deleted).
export function deleteStayRequest(requestId) {
  return apiRequest(`/stayRequests/${requestId}`, { method: 'DELETE' })
}
