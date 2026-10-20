import api from '../../services/api'

// Active tenants linked to one Firebase user id.
export function getTenantsByUser(uid) {
  return api.get(`/tenants?uid=${uid}`)
}

// Every tenant (owner's tenants screen).
export function getAllTenants() {
  return api.get('/tenants')
}

// Active tenants living at one hostel (used before deleting that hostel).
export function getTenantsByHostel(hostelId) {
  return api.get(`/tenants?hostelId=${hostelId}`)
}

// Update a tenant (e.g. record which bed they occupy).
export function updateTenant(tenantId, updates) {
  return api.patch(`/tenants/${tenantId}`, updates)
}

// Create an active tenant record (used when a stay request is approved).
export function createTenant(tenant) {
  return api.post('/tenants', tenant)
}

// Remove a tenant record (used when the owner checks someone out).
export function deleteTenant(tenantId) {
  return api.delete(`/tenants/${tenantId}`)
}
