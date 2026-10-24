import api from '../../services/api'
import { uploadFiles } from '../../services/cloudinary'

// Fetch every hostel for the public browse list.
export function getHostels() {
  return api.get('/hostels')
}

// Fetch a single hostel by its id.
export function getHostel(hostelId) {
  return api.get(`/hostels/${hostelId}`)
}

// Owner: upload gallery photos straight to Cloudinary. Each item in the
// returned array has a `path` which is the public Cloudinary URL.
export function uploadHostelImages(files) {
  return uploadFiles(files, 'stayinkochi/hostels')
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
