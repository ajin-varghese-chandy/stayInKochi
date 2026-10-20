// Card checkout for StayInKochi.
//
// openCheckout() opens the payment sheet (components/common/PaymentSheet) and
// resolves once the payer is done with it:
//   resolves with { paymentId } when the payment goes through
//   resolves with null when the sheet is dismissed before paying

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
  if (activeCheckout) dismissCheckout()

  return new Promise((resolve) => {
    activeCheckout = {
      amountInRupees,
      description,
      payer,
      paymentId: createPaymentId(),
      resolve,
    }
    openListener?.(activeCheckout)
  })
}

// PaymentSheet subscribes on mount so it hears about the next checkout.
export function onCheckoutOpen(listener) {
  openListener = listener
  return () => {
    if (openListener === listener) openListener = null
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
