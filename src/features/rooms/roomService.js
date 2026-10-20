import api from '../../services/api'

// Every room (public room-size filter on the branch list).
export function getAllRooms() {
  return api.get('/rooms')
}

// Rooms for one hostel (owner's room management screen).
export function getRoomsByHostel(hostelId) {
  return api.get(`/rooms?hostelId=${hostelId}`)
}

export function createRoom(room) {
  return api.post('/rooms', room)
}

export function updateRoom(roomId, updates) {
  return api.patch(`/rooms/${roomId}`, updates)
}

export function deleteRoom(roomId) {
  return api.delete(`/rooms/${roomId}`)
}
