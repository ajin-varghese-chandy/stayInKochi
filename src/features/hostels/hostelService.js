import api from '../../services/api'

// Fetch every hostel for the public browse list.
export function getHostels() {
  return api.get('/hostels')
}

// Fetch a single hostel by its id.
export function getHostel(hostelId) {
  return api.get(`/hostels/${hostelId}`)
}

// Owner: add a hostel.
export function createHostel(hostel) {
  return api.post('/hostels', hostel)
}

// Owner: edit a hostel.
export function updateHostel(hostelId, updates) {
  return api.patch(`/hostels/${hostelId}`, updates)
}

// Owner: remove a hostel.
export function deleteHostel(hostelId) {
  return api.delete(`/hostels/${hostelId}`)
}
