import { apiRequest } from '../../services/api'

// Rent payments for one tenant (tenant view).
export function getPaymentsByUser(tenantUid) {
  return apiRequest(`/payments?tenantUid=${tenantUid}`)
}

// Every rent payment (owner view).
export function getAllPayments() {
  return apiRequest('/payments')
}

export function createPayment(payment) {
  return apiRequest('/payments', {
    method: 'POST',
    body: JSON.stringify(payment),
  })
}

// Used to move a payment from pending to paid/failed/cancelled.
export function updatePayment(paymentId, updates) {
  return apiRequest(`/payments/${paymentId}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  })
}
