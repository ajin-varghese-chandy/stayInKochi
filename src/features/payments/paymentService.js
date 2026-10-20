import api from '../../services/api'

// Rent payments for one tenant (tenant view).
export function getPaymentsByUser(tenantUid) {
  return api.get(`/payments?tenantUid=${tenantUid}`)
}

// Every rent payment (owner view).
export function getAllPayments() {
  return api.get('/payments')
}

export function createPayment(payment) {
  return api.post('/payments', payment)
}

// Used to move a payment from pending to paid/failed/cancelled.
export function updatePayment(paymentId, updates) {
  return api.patch(`/payments/${paymentId}`, updates)
}
