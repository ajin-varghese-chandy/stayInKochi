import api from '../../services/api'

// Vacate requests raised by one tenant (tenant view).
export function getVacateRequestsByUser(tenantUid) {
  return api.get(`/vacateRequests?tenantUid=${tenantUid}`)
}

// Every vacate request (owner view).
export function getAllVacateRequests() {
  return api.get('/vacateRequests')
}

export function createVacateRequest(request) {
  return api.post('/vacateRequests', request)
}

// Used to move a request through pending -> approved/rejected/completed.
export function updateVacateRequest(requestId, updates) {
  return api.patch(`/vacateRequests/${requestId}`, updates)
}
