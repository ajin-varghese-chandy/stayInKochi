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

export function deleteSubscription(subscriptionId) {
  return api.delete(`/planSubscriptions/${subscriptionId}`)
}

// --- Individual meal bookings ---

// Every booking across all tenants (owner's financial summary).
export function getAllBookings() {
  return api.get('/mealBookings')
}

// Every booking made at one hostel (used when deleting that hostel).
export function getBookingsByHostel(hostelId) {
  return api.get(`/mealBookings?hostelId=${hostelId}`)
}

// Every booking this user has made.
export function getBookingsByUser(tenantUid) {
  return api.get(`/mealBookings?tenantUid=${tenantUid}`)
}

export function createBooking(booking) {
  return api.post('/mealBookings', booking)
}

// Used to cancel a booking (sets status to cancelled).
export function updateBooking(bookingId, updates) {
  return api.patch(`/mealBookings/${bookingId}`, updates)
}

// Remove a booking outright (used when its hostel is deleted).
export function deleteBooking(bookingId) {
  return api.delete(`/mealBookings/${bookingId}`)
}
