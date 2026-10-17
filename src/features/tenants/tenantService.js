import { apiRequest } from '../../services/api'

// Active tenants linked to one Firebase user id.
export function getTenantsByUser(uid) {
  return apiRequest(`/tenants?uid=${uid}`)
}

// Every tenant (owner's tenants screen).
export function getAllTenants() {
  return apiRequest('/tenants')
}

// Active tenants living at one hostel (used before deleting that hostel).
export function getTenantsByHostel(hostelId) {
  return apiRequest(`/tenants?hostelId=${hostelId}`)
}

// Update a tenant (e.g. record which bed they occupy).
export function updateTenant(tenantId, updates) {
  return apiRequest(`/tenants/${tenantId}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  })
}

// Create an active tenant record (used when a stay request is approved).
export function createTenant(tenant) {
  return apiRequest('/tenants', {
    method: 'POST',
    body: JSON.stringify(tenant),
  })
}

// Remove a tenant record (used when the owner checks someone out).
export function deleteTenant(tenantId) {
  return apiRequest(`/tenants/${tenantId}`, { method: 'DELETE' })
}
