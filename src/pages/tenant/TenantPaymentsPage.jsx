import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Receipt } from 'lucide-react'
import Alert from '../../components/ui/Alert'
import Button from '../../components/ui/Button'
import EmptyState from '../../components/ui/EmptyState'
import PageHeader from '../../components/ui/PageHeader'
import StatusBadge from '../../components/ui/StatusBadge'
import Spinner from '../../components/common/Spinner'
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
import formatRupees from '../../utils/formatRupees'

// "2026-10" -> "October 2026" for the due-month line.
function monthLabel(month) {
  const date = new Date(`${month}-01T00:00:00`)
  return Number.isNaN(date.getTime())
    ? month
    : date.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
}

// Tenant screen for paying rent and viewing payment history.
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
    return (
      <section>
        <PageHeader
          eyebrow="Tenant portal"
          title="Rent"
          description="Pay your rent and track every payment."
        />
        <div className="mt-6">
          <Spinner compact label="Checking your tenancy…" />
        </div>
      </section>
    )
  }

  if (!tenancy) {
    return (
      <section>
        <PageHeader
          eyebrow="Tenant portal"
          title="Rent"
          description="Pay your rent and track every payment."
        />
        <div className="mt-6">
          <EmptyState
            icon={Receipt}
            title="Only active tenants can pay rent"
            hint="Once the owner approves a stay request, rent and receipts appear here."
            action={
              <Button to="/hostels" variant="secondary">
                Browse branches
              </Button>
            }
          />
        </div>
      </section>
    )
  }

  const currentMonth = new Date().toISOString().slice(0, 7)
  const paidThisMonth = payments.some(
    (payment) => payment.month === currentMonth && payment.status === 'paid',
  )
  const paidMonths = new Set(
    payments
      .filter((payment) => payment.status === 'paid')
      .map((payment) => payment.month),
  )
  const rentAmount = Number(tenancy.rentPerMonth) || 0
  const hasRent = rentAmount > 0

  return (
    <section>
      <PageHeader
        eyebrow="Tenant portal"
        title="Rent"
        description={tenancy.hostelName}
      />

      <div className="mt-6 space-y-6">
        {/* Rent due */}
        <section className="card p-5" aria-label="Rent due">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="eyebrow">Rent due</p>
              <p className="mt-2 text-2xl font-semibold tabular-nums text-charcoal">
                {hasRent ? formatRupees(rentAmount) : 'Rent not set'}
              </p>
              <p className="mt-1 text-sm text-charcoal/70">
                {hasRent
                  ? `For ${monthLabel(currentMonth)}`
                  : 'The owner assigns a bed and its rent before you can pay.'}
              </p>
            </div>

            {hasRent && (
              <StatusBadge status={paidThisMonth ? 'paid' : 'unpaid'} />
            )}
          </div>

          {hasRent && (
            <div className="mt-4">
              <Button
                size="lg"
                block
                onClick={() => handlePay(currentMonth)}
                disabled={isSaving || paidThisMonth}
              >
                {paidThisMonth
                  ? `Paid for ${monthLabel(currentMonth)}`
                  : isSaving
                    ? 'Processing payment…'
                    : `Pay ${formatRupees(rentAmount)}`}
              </Button>
            </div>
          )}
        </section>

        {saveError && <Alert tone="error">{saveError}</Alert>}

        <PaymentSummary
          tenant={tenancy}
          paidThisMonth={paidThisMonth}
          paidMonths={paidMonths}
          isSaving={isSaving}
          onPay={handlePay}
        />

        {/* Payment history */}
        <section aria-labelledby="payment-history-heading">
          <h2
            id="payment-history-heading"
            className="text-base font-semibold text-charcoal"
          >
            Payment history
          </h2>

          <div className="mt-3">
            {isLoading && <Spinner compact label="Loading payments…" />}

            {error && (
              <Alert tone="error">Could not load payments: {error}</Alert>
            )}

            {!isLoading && !error && payments.length === 0 && (
              <EmptyState
                icon={Receipt}
                title="No payments yet"
                hint="Every rent payment you make will show up here with its receipt details."
              />
            )}

            {!isLoading && !error && payments.length > 0 && (
              <>
                {/* Stacked cards — the mobile view */}
                <div className="space-y-3 sm:hidden">
                  {payments.map((payment) => (
                    <div key={payment.id} className="card p-4">
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-sm font-semibold text-charcoal">
                          {payment.month}
                        </p>

                        <StatusBadge status={payment.status} />
                      </div>

                      <p className="mt-2 text-base font-semibold tabular-nums text-forest">
                        {formatRupees(payment.amount)}
                      </p>

                      <p className="mt-1 text-xs text-charcoal/70">
                        {payment.status === 'paid' && payment.paidOn
                          ? `Paid on ${payment.paidOn}`
                          : `Created on ${payment.createdAt}`}
                        {payment.paymentId ? ` · ${payment.paymentId}` : ''}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Table — from sm up */}
                <div className="table-wrap card hidden sm:block">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Month</th>
                        <th className="align-right">Amount</th>
                        <th>Status</th>
                        <th>Paid on</th>
                        <th>Payment ID</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payments.map((payment) => (
                        <tr key={payment.id}>
                          <td className="font-medium text-charcoal">
                            {payment.month}
                          </td>
                          <td className="num align-right">
                            <span className="text-base font-semibold tabular-nums text-forest">
                              {formatRupees(payment.amount)}
                            </span>
                          </td>
                          <td>
                            <StatusBadge status={payment.status} />
                          </td>
                          <td>
                            <span className="text-sm text-charcoal">
                              {payment.paidOn ?? '—'}
                            </span>
                            {!payment.paidOn && payment.createdAt && (
                              <span className="block text-xs text-charcoal/70">
                                Created {payment.createdAt}
                              </span>
                            )}
                          </td>
                          <td className="text-xs text-charcoal/70">
                            {payment.paymentId || '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </section>
      </div>
    </section>
  )
}
