
let activeCheckout = null
let openListener = null

// Payment ids look like pay_9xk2vb41mq8dzt7q.
export function createPaymentId() {
  const random = Math.random().toString(36).slice(2, 14)
  const stamp = Date.now().toString(36).slice(-4)
  return `pay_${random}${stamp}`
}

// Show the sheet for one payment and wait for the outcome.
export function openCheckout({ amountInRupees, description, payer = {} }) {
  const amount = Number(amountInRupees)

  if (!Number.isFinite(amount) || amount <= 0) {
    return Promise.reject(new Error('There is no amount due to pay.'))
  }

  if (typeof openListener !== 'function') {
    return Promise.reject(
      new Error('Payment checkout is unavailable. Reload the page and try again.'),
    )
  }

  if (activeCheckout) dismissCheckout()

  return new Promise((resolve) => {
    activeCheckout = {
      amountInRupees: amount,
      description,
      payer,
      paymentId: createPaymentId(),
      resolve,
    }
    openListener(activeCheckout)
  })
}

// PaymentSheet subscribes on mount so it hears about the next checkout. If the
// sheet goes away mid-checkout, settle the promise so the caller is not stuck.
export function onCheckoutOpen(listener) {
  openListener = listener
  return () => {
    if (openListener === listener) {
      openListener = null
      if (activeCheckout) dismissCheckout()
    }
  }
}

// The payer confirmed the payment: hand the id back to whoever opened it.
export function completeCheckout() {
  const checkout = activeCheckout
  activeCheckout = null
  checkout?.resolve({ paymentId: checkout.paymentId })
}

// The payer closed the sheet without paying.
export function dismissCheckout() {
  const checkout = activeCheckout
  activeCheckout = null
  checkout?.resolve(null)
}
