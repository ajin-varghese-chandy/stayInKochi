import api from '../../services/api'

// --- Food plan subscriptions ---

// Every subscription across all tenants (owner's financial summary).
export function getAllSubscriptions() {
  return api.get('/planSubscriptions')
}

// The plan this user is subscribed to (array; empty means none).
export function getSubscriptionByUser(tenantUid) {
  return api.get(`/planSubscriptions?tenantUid=${tenantUid}`)
}

// Every subscription taken at one hostel (used when deleting that hostel).
export function getSubscriptionsByHostel(hostelId) {
  return api.get(`/planSubscriptions?hostelId=${hostelId}`)
}

export function createSubscription(subscription) {
  return api.post('/planSubscriptions', subscription)
}

export function updateSubscription(subscriptionId, updates) {
  return api.patch(`/planSubscriptions/${subscriptionId}`, updates)
}

export function deleteSubscription(subscriptionId) {
  return api.delete(`/planSubscriptions/${subscriptionId}`)
}

// --- Food plan subscription payments ---

// Older persisted databases may not have this collection yet; treat that as
// "no payments" instead of breaking the food screens.
function getFoodPayments(path) {
  return api.get(path).catch((error) => {
    if (error.status === 404) return []
    throw error
  })
}

// Every food payment across all tenants (owner's activity view).
export function getAllFoodPayments() {
  return getFoodPayments('/foodPayments')
}

// Food payments made by one tenant (tenant's food screen).
export function getFoodPaymentsByUser(tenantUid) {
  return getFoodPayments(`/foodPayments?tenantUid=${tenantUid}`)
}

export function createFoodPayment(payment) {
  return api.post('/foodPayments', payment)
}

// Used to move a food payment from pending to paid/failed/cancelled.
export function updateFoodPayment(paymentId, updates) {
  return api.patch(`/foodPayments/${paymentId}`, updates)
}
