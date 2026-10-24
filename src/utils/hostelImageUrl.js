import { API_BASE_URL } from '../services/api'

// Resolve a stored branch photo for display. New uploads and pasted URLs are
// already absolute (Cloudinary, picsum, …) and pass through untouched. Older
// records may still use root-relative paths, so resolve those against the API.
export default function hostelImageUrl(storedPath) {
  if (!storedPath) return ''
  if (/^(?:[a-z]+:)?\/\//i.test(storedPath) || storedPath.startsWith('data:')) {
    return storedPath
  }

  const base = API_BASE_URL.replace(/\/+$/, '')
  return `${base}${storedPath.startsWith('/') ? '' : '/'}${storedPath}`
}
