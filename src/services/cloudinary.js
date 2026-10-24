// Uploads go straight from the browser to Cloudinary. The API server never
// touches the files; it only stores the secure URLs that Cloudinary returns.
const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET

export async function uploadFile(file, folder) {
  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    throw new Error(
      'Uploads are not set up. Add VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET to .env.',
    )
  }

  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', UPLOAD_PRESET)
  formData.append('folder', folder)

  let response
  try {
    response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`,
      { method: 'POST', body: formData },
    )
  } catch {
    throw new Error(
      'Could not reach Cloudinary. Check your internet connection and try again.',
    )
  }

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error?.message ?? 'Could not upload that file.')
  }

  return {
    name: file.name,
    path: data.secure_url,
    size: file.size,
    mimeType: file.type,
    uploadedAt: new Date().toISOString(),
  }
}

export function uploadFiles(files, folder) {
  return Promise.all(files.map((file) => uploadFile(file, folder)))
}
