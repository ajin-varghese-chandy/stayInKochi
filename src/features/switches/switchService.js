import api from '../../services/api'

// Switch requests raised by one tenant (tenant view).
export function getSwitchRequestsByUser(tenantUid) {
  return api.get(`/switchRequests?tenantUid=${tenantUid}`)
}

// Every switch request (owner view).
export function getAllSwitchRequests() {
  return api.get('/switchRequests')
}

export function createSwitchRequest(request) {
  return api.post('/switchRequests', request)
}

// Used to move a switch request through unpaid -> pending -> approved/rejected.
export function updateSwitchRequest(requestId, updates) {
  return api.patch(`/switchRequests/${requestId}`, updates)
}
