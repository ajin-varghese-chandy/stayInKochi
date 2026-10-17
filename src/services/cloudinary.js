// Cloudinary config lives on the server (server/index.js): it holds
// CLOUDINARY_URL and hands out one-time signatures, so the api secret never
// reaches the browser bundle.

const baseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000'

// Ask the server to sign this upload, then send the file straight to Cloudinary.
export async function uploadImage(file, { folder } = {}) {
  const signResponse = await fetch(`${baseUrl}/cloudinary/sign`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ folder }),
  })

  if (!signResponse.ok) {
    throw new Error('Image upload failed. Is the API server running?')
  }

  const sign = await signResponse.json()

  const formData = new FormData()
  formData.append('file', file)
  formData.append('api_key', sign.apiKey)
  formData.append('timestamp', String(sign.timestamp))
  formData.append('signature', sign.signature)
  if (sign.folder) formData.append('folder', sign.folder)

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${sign.cloudName}/image/upload`,
    { method: 'POST', body: formData },
  )

  if (!response.ok) {
    throw new Error('Image upload failed. Check your Cloudinary settings.')
  }

  const data = await response.json()
  return data.secure_url
}
