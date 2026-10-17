// Razorpay checkout + server-side verification.
//
// The key id is public, but it is still served by the API (server/index.js) so
// .env only needs one set of Razorpay values. The key SECRET never leaves the
// server: paymentSlice/switchSlice call verifyRazorpayPayment() before marking
// anything paid.

const baseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000'

let cachedKeyId = null

async function getKeyId() {
  if (cachedKeyId) return cachedKeyId

  const response = await fetch(`${baseUrl}/razorpay/config`)
  if (!response.ok) {
    throw new Error('Razorpay is not configured. Is the API server running?')
  }

  cachedKeyId = (await response.json()).keyId
  return cachedKeyId
}

// Load the official Razorpay checkout script once.
function loadRazorpayScript() {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) {
      resolve(window.Razorpay)
      return
    }

    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => resolve(window.Razorpay)
    script.onerror = () => reject(new Error('Could not load Razorpay.'))
    document.body.appendChild(script)
  })
}

// Open the Razorpay checkout for one payment.
//   resolves with the Razorpay handler response when the payment succeeds
//   resolves with null when the user closes the checkout
//   rejects when the payment fails or Razorpay cannot start
export async function openRazorpayCheckout({ amountInRupees, description, prefill }) {
  const key = await getKeyId()
  const Razorpay = await loadRazorpayScript()

  return new Promise((resolve, reject) => {
    const options = {
      key,
      amount: Math.round(amountInRupees * 100), // Razorpay uses paise
      currency: 'INR',
      name: 'StayInKochi',
      description,
      image: '/favicon.svg',
      prefill,
      theme: { color: '#4f46e5' },
      handler: (response) => resolve(response),
      modal: {
        ondismiss: () => resolve(null),
      },
    }

    const checkout = new Razorpay(options)
    checkout.on('payment.failed', (response) => {
      reject(new Error(response.error?.description ?? 'Payment failed.'))
    })
    checkout.open()
  })
}

// Ask the server to check the Razorpay signature with RAZORPAY_KEY_SECRET.
// Returns true only when Razorpay really signed this payment.
export async function verifyRazorpayPayment({
  razorpayPaymentId,
  razorpayOrderId,
  razorpaySignature,
}) {
  if (!razorpayPaymentId || !razorpaySignature) return false

  const response = await fetch(`${baseUrl}/razorpay/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      razorpay_payment_id: razorpayPaymentId,
      razorpay_order_id: razorpayOrderId,
      razorpay_signature: razorpaySignature,
    }),
  })

  if (!response.ok) return false

  const { verified } = await response.json()
  return verified === true
}
