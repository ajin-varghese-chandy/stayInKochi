import api from '../../services/api'

// Fetch every hostel for the public browse list.
export function getHostels() {
  return api.get('/hostels')
}

// Fetch a single hostel by its id.
export function getHostel(hostelId) {
  return api.get(`/hostels/${hostelId}`)
}

// Owner: upload one or more gallery photos for a branch. The API writes them to
// `server/uploads/hostels` and replies with `{ files: [{ name, path, … }] }`.
export function uploadHostelImages(files) {
  const formData = new FormData()
  files.forEach((file) => formData.append('files', file))

  // Uploads can take longer than the client's normal request timeout.
  return api
    .post('/uploads/hostels', formData, { timeout: 60000 })
    .then((response) => response.files ?? [])
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
