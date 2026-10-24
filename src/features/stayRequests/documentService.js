import { API_BASE_URL } from '../../services/api'
import { uploadFile } from '../../services/cloudinary'

// Verification documents go straight to Cloudinary. The stay request keeps
// the returned details, and `path` is the public Cloudinary URL.
export function uploadVerificationDocument(file) {
  return uploadFile(file, 'stayinkochi/tenants')
}

// New uploads are already absolute Cloudinary URLs. Older records may still
// use root-relative paths, so those are resolved against the API host.
export function documentUrl(storedPath) {
  if (!storedPath) return ''
  if (/^https?:\/\//i.test(storedPath)) return storedPath

  const base = API_BASE_URL.replace(/\/+$/, '')
  return `${base}${storedPath.startsWith('/') ? '' : '/'}${storedPath}`
}
