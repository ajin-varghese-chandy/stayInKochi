import { useRef, useState } from 'react'
import { ImagePlus, X } from 'lucide-react'
import {
  maintenancePhotoUrl,
  uploadMaintenancePhoto,
} from '../maintenanceService'

const MAX_BYTES = 5 * 1024 * 1024 // 5 MB limit
const ACCEPT = 'image/jpeg,image/png,image/webp'
const ACCEPTED_TYPES = ACCEPT.split(',')

function fileSize(bytes) {
  if (!bytes) return ''
  return bytes >= 1024 * 1024
    ? `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    : `${Math.max(1, Math.round(bytes / 1024))} KB`
}

// Optional photo for a maintenance request. The file goes straight to
// Cloudinary as soon as it is picked; the request then stores the returned URL.
export default function MaintenancePhotoUploader({
  photo,
  onChange,
  onUploadingChange,
  disabled = false,
}) {
  const inputRef = useRef(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState(null)

  const isDisabled = disabled || uploading

  function setBusy(value) {
    setUploading(value)
    onUploadingChange?.(value)
  }

  async function handleFile(event) {
    const file = event.target.files?.[0]
    // Reset the input so the same file can be chosen again after removal.
    event.target.value = ''
    if (!file) return

    setError(null)

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError(`"${file.name}" must be a JPG, PNG or WEBP image.`)
      return
    }

    if (file.size > MAX_BYTES) {
      setError(`"${file.name}" is larger than 5 MB.`)
      return
    }

    setBusy(true)
    try {
      onChange(await uploadMaintenancePhoto(file))
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  function removePhoto() {
    setError(null)
    onChange(null)
  }

  return (
    <div>
      <span className="field-label">Photo (optional)</span>

      <div className="rounded-card border border-dashed border-line-strong bg-white p-3">
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          onChange={handleFile}
          disabled={isDisabled}
          className="sr-only"
        />

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={isDisabled}
            className="btn btn-secondary btn-sm disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ImagePlus size={15} strokeWidth={1.75} aria-hidden="true" />
            {uploading ? 'Uploading…' : photo ? 'Change photo' : 'Choose photo'}
          </button>
          <span className="text-xs leading-relaxed text-charcoal/55">
            A picture of the issue helps the owner — JPG, PNG or WEBP, up to 5 MB.
          </span>
        </div>

        {photo && (
          <div className="mt-3 flex items-center gap-2 border-t border-line pt-3">
            <img
              src={maintenancePhotoUrl(photo.path)}
              alt="Selected maintenance photo"
              className="size-12 shrink-0 rounded border border-line object-cover"
            />

            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium text-charcoal">
                {photo.name}
              </span>
              <span className="block text-xs text-charcoal/55">
                {fileSize(photo.size)}
              </span>
            </span>

            <button
              type="button"
              onClick={removePhoto}
              disabled={uploading || disabled}
              aria-label={`Remove ${photo.name}`}
              className="rounded p-1 text-charcoal/45 transition-colors hover:text-danger disabled:opacity-40"
            >
              <X size={15} strokeWidth={1.75} aria-hidden="true" />
            </button>
          </div>
        )}
      </div>

      {error && <span className="field-error block">{error}</span>}
    </div>
  )
}
