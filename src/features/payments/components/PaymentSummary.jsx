import { useState } from 'react'
import formatRupees from '../../../utils/formatRupees'

// The current month as YYYY-MM.
function currentMonth() {
  return new Date().toISOString().slice(0, 7)
}

// Rent due + the Razorpay pay button for one tenant.
export default function PaymentSummary({
  tenant,
  paidThisMonth,
  isSaving,
  onPay,
}) {
  const [month, setMonth] = useState(currentMonth)

  // No rent set yet means no bed has been assigned (a fresh approval or a
  // just-approved switch), so there is nothing to charge for.
  const hasRent = Number(tenant.rentPerMonth) > 0
  const amount = tenant.rentPerMonth ?? 0

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Rent</h2>
          <p className="text-sm text-slate-500">
            Room {tenant.roomNumber ?? '-'} · Bed {tenant.bedNumber ?? '-'}
          </p>
        </div>

        {hasRent && (
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              paidThisMonth
                ? 'bg-green-100 text-green-700'
                : 'bg-amber-100 text-amber-700'
            }`}
          >
            {paidThisMonth ? 'Paid' : 'Due'}
          </span>
        )}
      </div>

      {hasRent ? (
        <>
          <p className="mt-3 text-2xl font-bold text-slate-900">
            {formatRupees(amount)}
            <span className="text-sm font-normal text-slate-500"> /month</span>
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <label htmlFor="rent-month" className="text-sm text-slate-600">
              Month
            </label>
            <input
              id="rent-month"
              type="month"
              value={month}
              onChange={(event) => setMonth(event.target.value)}
              className="rounded-md border border-slate-300 px-3 py-2 text-slate-800 focus:border-indigo-500 focus:outline-none"
            />
            <button
              type="button"
              onClick={() => onPay(month)}
              disabled={isSaving || !month}
              className="rounded-md bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
            >
              {isSaving
                ? 'Processing payment...'
                : `Pay ${formatRupees(amount)}`}
            </button>
          </div>
        </>
      ) : (
        <p className="mt-3 rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
          No rent has been set for you yet, so there is nothing to pay. The
          owner assigns a bed (and its rent) from the rooms screen — ask them
          if you are waiting on that.
        </p>
      )}
    </div>
  )
}
