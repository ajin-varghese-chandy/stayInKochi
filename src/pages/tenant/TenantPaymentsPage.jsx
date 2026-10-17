import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import Spinner from '../../components/common/Spinner'
import TenantNav from '../../components/layout/TenantNav'
import { selectCurrentUser } from '../../features/auth/authSlice'
import PaymentSummary from '../../features/payments/components/PaymentSummary'
import {
  fetchMyPayments,
  payRent,
  selectPayments,
  selectPaymentsError,
  selectPaymentsLoading,
  selectPaymentsSaveError,
  selectPaymentsSaving,
} from '../../features/payments/paymentSlice'
import { getTenantsByUser } from '../../features/tenants/tenantService'

const STATUS_STYLES = {
  paid: 'bg-green-100 text-green-700',
  pending: 'bg-amber-100 text-amber-700',
  failed: 'bg-red-100 text-red-700',
  cancelled: 'bg-slate-100 text-slate-600',
}

// Tenant screen for paying rent through Razorpay and viewing payment history.
export default function TenantPaymentsPage() {
  const dispatch = useDispatch()
  const user = useSelector(selectCurrentUser)
  const payments = useSelector(selectPayments)
  const isLoading = useSelector(selectPaymentsLoading)
  const error = useSelector(selectPaymentsError)
  const isSaving = useSelector(selectPaymentsSaving)
  const saveError = useSelector(selectPaymentsSaveError)

  // The active tenancy supplies the rent amount and room/bed details.
  const [tenancy, setTenancy] = useState(null)
  const [tenancyLoading, setTenancyLoading] = useState(true)

  useEffect(() => {
    if (!user?.uid) return

    let cancelled = false
    dispatch(fetchMyPayments(user.uid))

    getTenantsByUser(user.uid)
      .then((tenants) => {
        if (cancelled) return
        setTenancy(tenants[0] ?? null)
        setTenancyLoading(false)
      })
      .catch(() => {
        if (cancelled) return
        setTenancy(null)
        setTenancyLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [dispatch, user?.uid])

  function handlePay(month) {
    dispatch(payRent({ tenant: tenancy, month }))
  }

  if (tenancyLoading) {
    return <Spinner label="Checking your tenancy..." />
  }

  if (!tenancy) {
    return (
      <section className="mx-auto max-w-4xl px-4 py-12">
        <h1 className="text-3xl font-bold text-slate-900">Rent</h1>
        <div className="mt-6">
          <TenantNav />
        </div>
        <p className="mt-6 text-slate-600">
          Only active tenants can pay rent.
        </p>
      </section>
    )
  }

  const currentMonth = new Date().toISOString().slice(0, 7)
  const paidThisMonth = payments.some(
    (payment) => payment.month === currentMonth && payment.status === 'paid',
  )

  return (
    <section className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-3xl font-bold text-slate-900">Rent</h1>
      <p className="mt-1 text-slate-600">{tenancy.hostelName}</p>

      <div className="mt-6">
        <TenantNav />
      </div>

      <div className="mt-6">
        <PaymentSummary
          tenant={tenancy}
          paidThisMonth={paidThisMonth}
          isSaving={isSaving}
          onPay={handlePay}
        />
      </div>

      {saveError && <p className="mt-4 text-red-600">{saveError}</p>}

      <div className="mt-8">
        <h2 className="text-xl font-semibold text-slate-900">Payment history</h2>

        {isLoading && <Spinner label="Loading payments..." />}

        {error && (
          <p className="mt-4 text-red-600">Could not load payments: {error}</p>
        )}

        {!isLoading && !error && payments.length === 0 && (
          <p className="mt-4 text-slate-600">No payments yet.</p>
        )}

        <div className="mt-4 space-y-3">
          {payments.map((payment) => (
            <div
              key={payment.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white p-4"
            >
              <div>
                <p className="font-medium text-slate-900">
                  {payment.month} · ₹{payment.amount?.toLocaleString('en-IN')}
                </p>
                <p className="text-sm text-slate-500">
                  {payment.status === 'paid' && payment.paidOn
                    ? `Paid on ${payment.paidOn}`
                    : `Created on ${payment.createdAt}`}
                </p>
              </div>

              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${STATUS_STYLES[payment.status] ?? 'bg-slate-100 text-slate-600'}`}
              >
                {payment.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
