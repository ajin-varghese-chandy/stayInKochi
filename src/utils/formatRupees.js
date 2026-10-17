// Format a rupee amount for display. Missing or non-numeric values (a hostel
// with no rent set, a tenant with no bed assigned) show as ₹0 instead of
// crashing the page.
export default function formatRupees(amount) {
  const value = Number(amount)
  const safeAmount = Number.isFinite(value) ? value : 0
  return `₹${safeAmount.toLocaleString('en-IN')}`
}
