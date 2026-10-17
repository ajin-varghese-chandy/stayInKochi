import { apiRequest } from '../../services/api'

// --- Food plan subscriptions ---

// Every subscription across all tenants (owner's financial summary).
export function getAllSubscriptions() {
  return apiRequest('/planSubscriptions')
}

// The plan this user is subscribed to (array; empty means none).
export function getSubscriptionByUser(tenantUid) {
  return apiRequest(`/planSubscriptions?tenantUid=${tenantUid}`)
}

// Every subscription taken at one hostel (used when deleting that hostel).
export function getSubscriptionsByHostel(hostelId) {
  return apiRequest(`/planSubscriptions?hostelId=${hostelId}`)
}

export function createSubscription(subscription) {
  return apiRequest('/planSubscriptions', {
    method: 'POST',
    body: JSON.stringify(subscription),
  })
}

export function deleteSubscription(subscriptionId) {
  return apiRequest(`/planSubscriptions/${subscriptionId}`, {
    method: 'DELETE',
  })
}

// --- Individual meal bookings ---

// Every booking across all tenants (owner's financial summary).
export function getAllBookings() {
  return apiRequest('/mealBookings')
}

// Every booking made at one hostel (used when deleting that hostel).
export function getBookingsByHostel(hostelId) {
  return apiRequest(`/mealBookings?hostelId=${hostelId}`)
}

// Every booking this user has made.
export function getBookingsByUser(tenantUid) {
  return apiRequest(`/mealBookings?tenantUid=${tenantUid}`)
}

export function createBooking(booking) {
  return apiRequest('/mealBookings', {
    method: 'POST',
    body: JSON.stringify(booking),
  })
}

// Used to cancel a booking (sets status to cancelled).
export function updateBooking(bookingId, updates) {
  return apiRequest(`/mealBookings/${bookingId}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  })
}

// Remove a booking outright (used when its hostel is deleted).
export function deleteBooking(bookingId) {
  return apiRequest(`/mealBookings/${bookingId}`, { method: 'DELETE' })
}
