import { useEffect, useRef, useState } from 'react'
import {
  AtSign,
  Check,
  ChevronLeft,
  ShieldCheck,
  X,
} from 'lucide-react'
import Button from '../ui/Button'
import Spinner from './Spinner'
import formatRupees from '../../utils/formatRupees'
import {
  completeCheckout,
  dismissCheckout,
  onCheckoutOpen,
} from '../../services/paymentGateway'

// Mock UPI apps offered in the sheet. The mark is just a coloured initial so
// the list reads like a real app picker without shipping brand artwork.
const UPI_APPS = [
  {
    id: 'gpay',
    label: 'Google Pay',
    mark: 'G',
    tone: 'bg-[#e8f0fe] text-[#1a73e8]',
  },
  {
    id: 'phonepe',
    label: 'PhonePe',
    mark: 'P',
    tone: 'bg-[#f0e9ff] text-[#5f259f]',
  },
  {
    id: 'paytm',
    label: 'Paytm',
    mark: 'P',
    tone: 'bg-[#e6f4fd] text-[#0077b6]',
  },
  {
    id: 'bhim',
    label: 'BHIM UPI',
    mark: 'B',
    tone: 'bg-[#fdeceb] text-[#b3402f]',
  },
]

// A VPA looks like name@bank. Same shape the NPCI apps use, nothing more.
const upiIdValid = (value) => /^[\w.-]{2,}@[a-zA-Z]{2,}$/.test(value.trim())

// Payment sheet: opened by services/paymentGateway, so any screen can start a
// payment and simply await the result.
//
// Nothing here talks to a bank. The sheet mimics a UPI collect request: pick an
// app (or type a VPA), approve, and the mock settles after a short delay.
export default function PaymentSheet() {
  const [checkout, setCheckout] = useState(null)
  // form -> approve -> processing -> success
  const [status, setStatus] = useState('form')
  const [app, setApp] = useState(null)
  const [upiId, setUpiId] = useState('')
  const [payerName, setPayerName] = useState('')
  const timerRef = useRef(null)

  // Listen for the next checkout, and clear any pending timers on unmount.
  useEffect(() => {
    function handleOpen(next) {
      setPayerName(next.payer?.name ?? '')
      setApp(null)
      setUpiId('')
      setStatus('form')
      setCheckout(next)
    }

    return onCheckoutOpen(handleOpen)
  }, [])

  useEffect(() => () => clearTimeout(timerRef.current), [])

  const isProcessing = status === 'processing'

  function closeSheet() {
    clearTimeout(timerRef.current)
    setCheckout(null)
    setApp(null)
    setUpiId('')
    setStatus('form')
  }

  function handleCancel() {
    if (isProcessing) return
    dismissCheckout()
    closeSheet()
  }

  // Both paths end here: settle the mock payment, show the receipt briefly,
  // then close so the caller's page is visible again.
  function settle() {
    completeCheckout() // hands { paymentId } back to the caller
    setStatus('success')
    timerRef.current = setTimeout(closeSheet, 2000)
  }

  function handleApprove() {
    if (status !== 'approve') return
    setStatus('processing')
    timerRef.current = setTimeout(settle, 1400)
  }

  function handleSendRequest() {
    if (status !== 'form' || !upiIdValid(upiId)) return
    setApp(null)
    setStatus('processing')
    timerRef.current = setTimeout(settle, 1800)
  }

  function handleBack() {
    clearTimeout(timerRef.current)
    setApp(null)
    setStatus('form')
  }

  // Escape closes; lock body scroll while the sheet is open.
  useEffect(() => {
    if (!checkout) return undefined

    function onKeyDown(event) {
      if (event.key !== 'Escape' || status === 'processing') return
      dismissCheckout()
      setCheckout(null)
      setApp(null)
      setUpiId('')
      setStatus('form')
    }

    document.addEventListener('keydown', onKeyDown)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousOverflow
    }
  }, [checkout, status])

  if (!checkout) return null

  const { amountInRupees, description, paymentId } = checkout
  const title =
    status === 'form'
      ? 'Pay with UPI'
      : status === 'success'
        ? 'Receipt'
        : 'Confirm payment'
  const paidVia = app ? app.label : upiId.trim()

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-charcoal/40 p-4 sm:items-center"
      onMouseDown={(event) => {
        // Only the backdrop itself dismisses the sheet. Without this check a
        // click on a field or button inside the sheet bubbles up here and
        // closes it mid-payment.
        if (event.target === event.currentTarget) handleCancel()
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Complete payment"
        className="card w-full max-w-md p-5 shadow-lg"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-2">
            {status === 'approve' && (
              <button
                type="button"
                onClick={handleBack}
                aria-label="Back to UPI apps"
                className="-ml-1 mt-0.5 rounded-card p-1 text-charcoal/50 hover:bg-charcoal/5 hover:text-charcoal"
              >
                <ChevronLeft size={18} strokeWidth={1.75} />
              </button>
            )}
            <div>
              <p className="eyebrow">
                {status === 'form' ? 'UPI payment' : 'Payment'}
              </p>
              <h2 className="mt-1 text-base font-semibold text-charcoal">
                {title}
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={handleCancel}
            disabled={isProcessing}
            aria-label="Close"
            className="-m-1 rounded-card p-1 text-charcoal/50 hover:bg-charcoal/5 hover:text-charcoal disabled:opacity-40"
          >
            <X size={18} strokeWidth={1.75} />
          </button>
        </div>

        {/* What is being paid for */}
        <div className="mt-4 rounded-card border border-line bg-ivory px-4 py-3">
          <p className="text-sm text-charcoal/65">{description}</p>
          <p className="mt-0.5 text-2xl font-semibold tabular-nums text-forest">
            {formatRupees(amountInRupees)}
          </p>
          {payerName && (
            <p className="mt-1 text-xs text-charcoal/55">Paying as {payerName}</p>
          )}
        </div>

        {status === 'form' && (
          <div className="mt-4 space-y-4">
            <div>
              <p className="field-label">Choose an app</p>
              <div className="grid grid-cols-2 gap-2">
                {UPI_APPS.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => {
                      setApp(option)
                      setStatus('approve')
                    }}
                    className="flex items-center gap-2.5 rounded-card border border-line bg-white px-3 py-2.5 text-left text-sm font-medium text-charcoal transition-colors hover:border-forest hover:bg-ivory"
                  >
                    <span
                      aria-hidden="true"
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-card text-sm font-semibold ${option.tone}`}
                    >
                      {option.mark}
                    </span>
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="h-px flex-1 bg-line" />
              <span className="text-xs text-charcoal/50">or pay using UPI ID</span>
              <span className="h-px flex-1 bg-line" />
            </div>

            <div>
              <label htmlFor="pay-upi-id" className="field-label">
                UPI ID
              </label>
              <div className="relative">
                <AtSign
                  size={16}
                  strokeWidth={1.75}
                  aria-hidden="true"
                  className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-charcoal/40"
                />
                <input
                  id="pay-upi-id"
                  type="text"
                  inputMode="email"
                  autoComplete="off"
                  spellCheck="false"
                  placeholder="yourname@okhdfcbank"
                  value={upiId}
                  onChange={(event) => setUpiId(event.target.value.trim())}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') handleSendRequest()
                  }}
                  className="field pl-9"
                />
              </div>
              <p className="field-hint">
                We&apos;ll send a collect request to this UPI ID.
              </p>
            </div>

            <Button
              block
              size="lg"
              onClick={handleSendRequest}
              disabled={!upiIdValid(upiId)}
            >
              <ShieldCheck size={15} strokeWidth={1.9} aria-hidden="true" />
              Send payment request
            </Button>

            <p className="text-center text-xs text-charcoal/55">
              Demo checkout — no money is transferred.
            </p>
          </div>
        )}

        {status === 'approve' && app && (
          <div className="mt-4 space-y-3">
            <div className="flex items-center gap-3 rounded-card border border-line bg-ivory px-4 py-3">
              <span
                aria-hidden="true"
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-card text-base font-semibold ${app.tone}`}
              >
                {app.mark}
              </span>
              <div>
                <p className="text-sm font-medium text-charcoal">
                  Collect request sent
                </p>
                <p className="text-xs text-charcoal/60">
                  Approve in {app.label} to pay{' '}
                  {formatRupees(amountInRupees)}
                </p>
              </div>
            </div>

            <p className="text-xs text-charcoal/60">
              Open {app.label} on your phone and approve the request. In this
              demo, tap the button below instead.
            </p>

            <Button block size="lg" className="mt-2" onClick={handleApprove}>
              <ShieldCheck size={15} strokeWidth={1.9} aria-hidden="true" />
              Approve payment
            </Button>
            <Button block variant="secondary" onClick={handleCancel}>
              Decline
            </Button>
          </div>
        )}

        {status === 'processing' && (
          <div className="py-6">
            <Spinner
              compact
              label={
                paidVia
                  ? `Waiting for approval from ${paidVia}…`
                  : 'Sending payment request…'
              }
            />
            <p className="mt-3 text-center text-xs text-charcoal/55">
              Do not close this window.
            </p>
          </div>
        )}

        {status === 'success' && (
          <div className="flex flex-col items-center gap-2 py-5 text-center">
            <span
              aria-hidden="true"
              className="flex h-11 w-11 items-center justify-center rounded-card border border-success/25 bg-success-soft text-success"
            >
              <Check size={22} strokeWidth={2} />
            </span>
            <p className="text-sm font-semibold text-charcoal">
              Payment successful
            </p>
            {paidVia && (
              <p className="text-xs text-charcoal/60">Paid via {paidVia}</p>
            )}
            <p className="text-xs text-charcoal/55">UPI ref {paymentId}</p>
            <Button size="lg" className="mt-3 min-w-32" onClick={closeSheet}>
              Done
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
