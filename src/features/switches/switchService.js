import { apiRequest } from '../../services/api'

// Switch requests raised by one tenant (tenant view).
export function getSwitchRequestsByUser(tenantUid) {
  return apiRequest(`/switchRequests?tenantUid=${tenantUid}`)
}

// Every switch request (owner view).
export function getAllSwitchRequests() {
  return apiRequest('/switchRequests')
}

export function createSwitchRequest(request) {
  return apiRequest('/switchRequests', {
    method: 'POST',
    body: JSON.stringify(request),
  })
}

// Used to move a switch request through unpaid → pending → approved/rejected.
export function updateSwitchRequest(requestId, updates) {
  return apiRequest(`/switchRequests/${requestId}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  })
}
