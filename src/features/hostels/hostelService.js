import { apiRequest } from '../../services/api'

// Fetch every hostel for the public browse list.
export function getHostels() {
  return apiRequest('/hostels')
}

// Fetch a single hostel by its id.
export function getHostel(hostelId) {
  return apiRequest(`/hostels/${hostelId}`)
}

// Owner: add a hostel.
export function createHostel(hostel) {
  return apiRequest('/hostels', {
    method: 'POST',
    body: JSON.stringify(hostel),
  })
}

// Owner: edit a hostel.
export function updateHostel(hostelId, updates) {
  return apiRequest(`/hostels/${hostelId}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  })
}

// Owner: remove a hostel.
export function deleteHostel(hostelId) {
  return apiRequest(`/hostels/${hostelId}`, { method: 'DELETE' })
}
