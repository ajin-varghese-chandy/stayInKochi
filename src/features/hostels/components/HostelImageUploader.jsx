import { useRef, useState } from 'react'
import { ImagePlus, X } from 'lucide-react'
import hostelImageUrl from '../../../utils/hostelImageUrl'
import { uploadHostelImages } from '../hostelService'

const MAX_PHOTOS = 8
const MAX_BYTES = 5 * 1024 * 1024 // 5 MB limit
const ACCEPT = 'image/jpeg,image/png,image/webp'
const ACCEPTED_TYPES = ACCEPT.split(',')

// Gallery photos for a branch. Files go straight to Cloudinary as soon as they
// are picked; the hostel record then only stores the returned URLs.
export default function HostelImageUploader({
  images = [],
  onChange,
  onUploadingChange,
  disabled = false,
}) {
  const inputRef = useRef(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState(null)

  const room = Math.max(0, MAX_PHOTOS - images.length)
  const atLimit = room === 0
  const isDisabled = disabled || uploading || atLimit

  function setBusy(value) {
    setUploading(value)
    onUploadingChange?.(value)
  }

  async function handleFiles(event) {
    const files = Array.from(event.target.files ?? [])
    // Reset the input so the same files can be chosen again after removal.
    event.target.value = ''
    if (files.length === 0) return

    setError(null)

    if (atLimit) {
      setError(`This branch already has the maximum of ${MAX_PHOTOS} photos.`)
      return
    }

    const invalidType = files.find((file) => !ACCEPTED_TYPES.includes(file.type))
    if (invalidType) {
      setError(`"${invalidType.name}" must be a JPG, PNG or WEBP image.`)
      return
    }

    const tooLarge = files.find((file) => file.size > MAX_BYTES)
    if (tooLarge) {
      setError(`"${tooLarge.name}" is larger than 5 MB.`)
      return
    }

    const accepted = files.slice(0, room)
    const skipped = files.length - accepted.length

    setBusy(true)
    try {
      const uploaded = await uploadHostelImages(accepted)
      onChange([...images, ...uploaded.map((file) => file.path)])

      if (skipped > 0) {
        setError(
          `Only ${room} more ${room === 1 ? 'photo' : 'photos'} could be added; the rest were skipped.`,
        )
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  function removeImage(index) {
    setError(null)
    onChange(images.filter((_, i) => i !== index))
  }

  return (
    <div>
      <span className="field-label">Photos</span>

      <div className="rounded-card border border-dashed border-line-strong bg-white p-3">
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          multiple
          onChange={handleFiles}
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
            {uploading ? 'Uploading…' : atLimit ? 'Photo limit reached' : 'Upload photos'}
          </button>
          <span className="text-xs leading-relaxed text-charcoal/55">
            JPG, PNG or WEBP, up to 5 MB each — {images.length} of {MAX_PHOTOS}{' '}
            added.
          </span>
        </div>

        {images.length > 0 && (
          <ul className="mt-3 grid grid-cols-3 gap-2 border-t border-line pt-3 sm:grid-cols-4">
            {images.map((photo, index) => (
              <li
                key={`${photo}-${index}`}
                className="relative overflow-hidden rounded border border-line"
              >
                <img
                  src={hostelImageUrl(photo)}
                  alt={`Branch photo ${index + 1}`}
                  className="h-20 w-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  disabled={uploading || disabled}
                  aria-label={`Remove photo ${index + 1}`}
                  className="absolute top-1 right-1 rounded-full bg-white/90 p-1 text-charcoal/60 shadow-sm transition-colors hover:text-danger disabled:opacity-40"
                >
                  <X size={13} strokeWidth={2} aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {error ? (
        <span className="field-error block">{error}</span>
      ) : (
        <span className="field-hint block">
          Shown in the gallery on this branch&apos;s page. The first photo also
          becomes the cover if the URL above is empty.
        </span>
      )}
    </div>
  )
}
