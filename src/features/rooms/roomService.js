import { apiRequest } from '../../services/api'

// Every room (public room-size filter on the branch list).
export function getAllRooms() {
  return apiRequest('/rooms')
}

// Rooms for one hostel (owner's room management screen).
export function getRoomsByHostel(hostelId) {
  return apiRequest(`/rooms?hostelId=${hostelId}`)
}

export function createRoom(room) {
  return apiRequest('/rooms', {
    method: 'POST',
    body: JSON.stringify(room),
  })
}

export function updateRoom(roomId, updates) {
  return apiRequest(`/rooms/${roomId}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  })
}

export function deleteRoom(roomId) {
  return apiRequest(`/rooms/${roomId}`, { method: 'DELETE' })
}
