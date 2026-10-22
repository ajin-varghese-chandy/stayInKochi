import { API_BASE_URL } from '../services/api'

// Resolve a stored branch photo for display. Uploaded photos live on the API
// host as root-relative paths ("/uploads/hostels/…"); older records and pasted
// URLs are already absolute, so they pass through untouched.
export default function hostelImageUrl(storedPath) {
  if (!storedPath) return ''
  if (/^(?:[a-z]+:)?\/\//i.test(storedPath) || storedPath.startsWith('data:')) {
    return storedPath
  }

  const base = API_BASE_URL.replace(/\/+$/, '')
  return `${base}${storedPath.startsWith('/') ? '' : '/'}${storedPath}`
}
