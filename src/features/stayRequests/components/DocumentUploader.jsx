import { useRef, useState } from 'react'
import { FileText, Paperclip, X } from 'lucide-react'
import {
  documentUrl,
  uploadVerificationDocument,
} from '../documentService'

const MAX_FILES = 3
const MAX_BYTES = 5 * 1024 * 1024 // 5 MB limit
const ACCEPT = 'image/jpeg,image/png,image/webp,application/pdf'
const ACCEPTED_TYPES = ACCEPT.split(',')

function fileSize(bytes) {
  if (!bytes) return ''
  return bytes >= 1024 * 1024
    ? `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    : `${Math.max(1, Math.round(bytes / 1024))} KB`
}

// Uploads ID/verification documents for a stay request. Files go straight to
// Cloudinary as soon as they are picked, so the request only stores their URLs.
export default function DocumentUploader({
  documents = [],
  onChange,
  onUploadingChange,
  disabled = false,
}) {
  const inputRef = useRef(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState(null)

  const atLimit = documents.length >= MAX_FILES
  const isDisabled = disabled || uploading || atLimit

  function setBusy(value) {
    setUploading(value)
    onUploadingChange?.(value)
  }

  async function handleFiles(event) {
    const files = Array.from(event.target.files ?? [])
    // Reset the input so the same file can be chosen again after removal.
    event.target.value = ''
    if (files.length === 0) return

    setError(null)

    const invalidType = files.find((file) => !ACCEPTED_TYPES.includes(file.type))
    if (invalidType) {
      setError(`"${invalidType.name}" must be a JPG, PNG, WEBP or PDF file.`)
      return
    }

    const tooLarge = files.find((file) => file.size > MAX_BYTES)
    if (tooLarge) {
      setError(`"${tooLarge.name}" is larger than 5 MB.`)
      return
    }

    const room = MAX_FILES - documents.length
    setBusy(true)
    try {
      const uploaded = []
      for (const file of files.slice(0, room)) {
        uploaded.push(await uploadVerificationDocument(file))
      }
      onChange([...documents, ...uploaded])
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  function removeDocument(index) {
    setError(null)
    onChange(documents.filter((_, i) => i !== index))
  }

  return (
    <div>
      <span className="field-label">ID / verification documents</span>

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
            <Paperclip size={15} strokeWidth={1.75} aria-hidden="true" />
            {uploading ? 'Uploading…' : 'Choose files'}
          </button>
          <span className="text-xs leading-relaxed text-charcoal/55">
            ID card, Aadhaar or student ID — JPG, PNG or PDF, up to 5 MB each.
          </span>
        </div>

        {documents.length > 0 && (
          <ul className="mt-3 space-y-2 border-t border-line pt-3">
            {documents.map((doc, index) => (
              <li key={doc.path ?? doc.name} className="flex items-center gap-2">
                {doc.mimeType?.startsWith('image/') ? (
                  <img
                    src={documentUrl(doc.path)}
                    alt=""
                    className="size-9 shrink-0 rounded border border-line object-cover"
                  />
                ) : (
                  <span className="grid size-9 shrink-0 place-items-center rounded border border-line bg-ivory text-forest">
                    <FileText size={16} strokeWidth={1.75} aria-hidden="true" />
                  </span>
                )}

                <span className="min-w-0 flex-1">
                  <a
                    href={documentUrl(doc.path)}
                    target="_blank"
                    rel="noreferrer"
                    className="block truncate text-sm font-medium text-charcoal hover:text-forest hover:underline"
                  >
                    {doc.name}
                  </a>
                  <span className="block text-xs text-charcoal/55">
                    {fileSize(doc.size)}
                  </span>
                </span>

                <button
                  type="button"
                  onClick={() => removeDocument(index)}
                  disabled={uploading || disabled}
                  aria-label={`Remove ${doc.name}`}
                  className="rounded p-1 text-charcoal/45 transition-colors hover:text-danger disabled:opacity-40"
                >
                  <X size={15} strokeWidth={1.75} aria-hidden="true" />
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
          Optional, but an ID proof helps the owner verify you faster. Up to{' '}
          {MAX_FILES} files.
        </span>
      )}
    </div>
  )
}
