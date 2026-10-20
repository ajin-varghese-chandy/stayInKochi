import { useEffect, useRef, useState } from 'react'
import { Check, CreditCard, Lock, X } from 'lucide-react'
import Button from '../ui/Button'
import Spinner from './Spinner'
import formatRupees from '../../utils/formatRupees'
import {
  completeCheckout,
  dismissCheckout,
  onCheckoutOpen,
} from '../../services/paymentGateway'

// The sheet only checks the shape of the card details — they are typed for
// the payer's own benefit and are never sent anywhere.
const digitsOnly = (value) => value.replace(/\D/g, '')
const cardNumberValid = (value) => digitsOnly(value).length === 16
const expiryValid = (value) => /^(0[1-9]|1[0-2])\/\d{2}$/.test(value)
const cvvValid = (value) => /^\d{3,4}$/.test(value)

function formatCardNumber(value) {
  return digitsOnly(value).slice(0, 16).replace(/(\d{4})(?=\d)/g, '$1 ')
}

function formatExpiry(value) {
  const raw = digitsOnly(value).slice(0, 4)
  return raw.length > 2 ? `${raw.slice(0, 2)}/${raw.slice(2)}` : raw
}

// Payment sheet: opened by services/paymentGateway, so any screen can start a
// payment and simply await the result.
export default function PaymentSheet() {
  const [checkout, setCheckout] = useState(null)
  const [status, setStatus] = useState('form') // form | processing | success
  const [payerName, setPayerName] = useState('')
  const [cardNumber, setCardNumber] = useState('')
  const [expiry, setExpiry] = useState('')
  const [cvv, setCvv] = useState('')
  const timerRef = useRef(null)

  // Listen for the next checkout, and clear any pending timers on unmount.
  useEffect(() => {
    function handleOpen(next) {
      setPayerName(next.payer?.name ?? '')
      setCardNumber('')
      setExpiry('')
      setCvv('')
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
    setStatus('form')
  }

  function handleCancel() {
    if (isProcessing) return
    dismissCheckout()
    closeSheet()
  }

  function handlePay() {
    setStatus('processing')
    timerRef.current = setTimeout(() => {
      completeCheckout() // hands { paymentId } back to the caller
      setStatus('success')
      timerRef.current = setTimeout(closeSheet, 1600)
    }, 1600)
  }

  function handleDone() {
    closeSheet()
  }

  // Escape closes; lock body scroll while the sheet is open.
  useEffect(() => {
    if (!checkout) return undefined

    function onKeyDown(event) {
      if (event.key !== 'Escape' || status === 'processing') return
      dismissCheckout()
      setCheckout(null)
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
  const canPay =
    payerName.trim().length > 1 &&
    cardNumberValid(cardNumber) &&
    expiryValid(expiry) &&
    cvvValid(cvv)

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-charcoal/40 p-4 sm:items-center"
      onMouseDown={handleCancel}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Complete payment"
        className="card w-full max-w-md p-5 shadow-lg"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="eyebrow">Payment</p>
            <h2 className="mt-1 text-base font-semibold text-charcoal">
              {status === 'success' ? 'Receipt' : 'Complete your payment'}
            </h2>
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
        </div>

        {status === 'form' && (
          <div className="mt-4 space-y-3">
            <div>
              <label htmlFor="pay-card-number" className="field-label">
                Card number
              </label>
              <div className="relative">
                <CreditCard
                  size={16}
                  strokeWidth={1.75}
                  aria-hidden="true"
                  className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-charcoal/40"
                />
                <input
                  id="pay-card-number"
                  type="text"
                  inputMode="numeric"
                  autoComplete="cc-number"
                  placeholder="0000 0000 0000 0000"
                  value={cardNumber}
                  onChange={(event) =>
                    setCardNumber(formatCardNumber(event.target.value))
                  }
                  className="field pl-9"
                />
              </div>
            </div>

            <div>
              <label htmlFor="pay-card-name" className="field-label">
                Name on card
              </label>
              <input
                id="pay-card-name"
                type="text"
                autoComplete="cc-name"
                value={payerName}
                onChange={(event) => setPayerName(event.target.value)}
                className="field"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="pay-card-expiry" className="field-label">
                  Expiry
                </label>
                <input
                  id="pay-card-expiry"
                  type="text"
                  inputMode="numeric"
                  autoComplete="cc-exp"
                  placeholder="MM/YY"
                  value={expiry}
                  onChange={(event) =>
                    setExpiry(formatExpiry(event.target.value))
                  }
                  className="field"
                />
              </div>
              <div>
                <label htmlFor="pay-card-cvv" className="field-label">
                  CVV
                </label>
                <input
                  id="pay-card-cvv"
                  type="password"
                  inputMode="numeric"
                  autoComplete="cc-csc"
                  placeholder="123"
                  value={cvv}
                  onChange={(event) =>
                    setCvv(digitsOnly(event.target.value).slice(0, 4))
                  }
                  className="field"
                />
              </div>
            </div>

            <Button
              block
              size="lg"
              className="mt-2"
              onClick={handlePay}
              disabled={!canPay}
            >
              <Lock size={15} strokeWidth={1.9} aria-hidden="true" />
              Pay {formatRupees(amountInRupees)}
            </Button>

            <p className="text-center text-xs text-charcoal/55">
              A receipt is added to your payment history once the payment goes
              through.
            </p>
          </div>
        )}

        {status === 'processing' && (
          <div className="py-6">
            <Spinner compact label="Authorising payment…" />
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
            <p className="text-xs text-charcoal/55">{paymentId}</p>
            <Button size="lg" className="mt-3 min-w-32" onClick={handleDone}>
              Done
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
