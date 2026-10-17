import { apiRequest } from '../../services/api'

// Beds for one hostel or one room.
export function getBedsByHostel(hostelId) {
  return apiRequest(`/beds?hostelId=${hostelId}`)
}

export function getBedsByRoom(roomId) {
  return apiRequest(`/beds?roomId=${roomId}`)
}

export function createBed(bed) {
  return apiRequest('/beds', {
    method: 'POST',
    body: JSON.stringify(bed),
  })
}

export function updateBed(bedId, updates) {
  return apiRequest(`/beds/${bedId}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  })
}

export function deleteBed(bedId) {
  return apiRequest(`/beds/${bedId}`, { method: 'DELETE' })
}
