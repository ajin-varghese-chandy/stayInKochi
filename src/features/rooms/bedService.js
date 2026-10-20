import api from '../../services/api'

// Every bed (public availability filter + list counts).
export function getAllBeds() {
  return api.get('/beds')
}

// Beds for one hostel or one room.
export function getBedsByHostel(hostelId) {
  return api.get(`/beds?hostelId=${hostelId}`)
}

export function getBedsByRoom(roomId) {
  return api.get(`/beds?roomId=${roomId}`)
}

export function createBed(bed) {
  return api.post('/beds', bed)
}

export function updateBed(bedId, updates) {
  return api.patch(`/beds/${bedId}`, updates)
}

export function deleteBed(bedId) {
  return api.delete(`/beds/${bedId}`)
}
