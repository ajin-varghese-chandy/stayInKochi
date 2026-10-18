import { useEffect } from 'react'
import { X } from 'lucide-react'
import Button from './Button'

// Confirmation dialog replacing window.confirm everywhere.
// Controlled by the parent: <ConfirmDialog open ... onConfirm onCancel />.
export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  destructive,
  busy,
  onConfirm,
  onCancel,
}) {
  // Escape closes; lock body scroll while open.
  useEffect(() => {
    if (!open) return undefined

    function onKeyDown(event) {
      if (event.key === 'Escape' && !busy) onCancel?.()
    }
    document.addEventListener('keydown', onKeyDown)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousOverflow
    }
  }, [open, busy, onCancel])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-charcoal/40 p-4 sm:items-center"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !busy) onCancel?.()
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="card w-full max-w-md p-5 shadow-lg"
      >
        <div className="flex items-start justify-between gap-4">
          <h2 className="text-base font-semibold text-charcoal">{title}</h2>
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            aria-label="Close"
            className="-m-1 rounded-card p-1 text-charcoal/50 hover:bg-charcoal/5 hover:text-charcoal"
          >
            <X size={18} strokeWidth={1.75} />
          </button>
        </div>

        {message && (
          <p className="mt-2 text-sm leading-relaxed text-charcoal/70">
            {message}
          </p>
        )}

        <div className="mt-5 flex justify-end gap-2">
          <Button variant="secondary" onClick={onCancel} disabled={busy}>
            {cancelLabel}
          </Button>
          <Button
            variant={destructive ? 'danger' : 'primary'}
            onClick={onConfirm}
            disabled={busy}
          >
            {busy ? 'Working…' : confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}
