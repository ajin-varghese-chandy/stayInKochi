import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { IndianRupee } from 'lucide-react'
import Alert from '../../components/ui/Alert'
import Button from '../../components/ui/Button'
import EmptyState from '../../components/ui/EmptyState'
import PageHeader from '../../components/ui/PageHeader'
import SearchInput from '../../components/ui/SearchInput'
import Spinner from '../../components/common/Spinner'
import StatusBadge from '../../components/ui/StatusBadge'
import {
  fetchAllPayments,
  selectPayments,
  selectPaymentsError,
  selectPaymentsLoading,
} from '../../features/payments/paymentSlice'

function exportCsv(payments) {
  const header = ['Tenant', 'Branch', 'Month', 'Amount (₹)', 'Status', 'Paid On', 'Created At']
  const rows = payments.map((p) => [
    p.tenantName ?? '',
    p.hostelName ?? '',
    p.month ?? '',
    p.amount ?? 0,
    p.status ?? '',
    p.paidOn ?? '',
    p.createdAt ?? '',
  ])
  const csv = [header, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `payments-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

// Owner screen: rent collected, pending rent, and every payment record.
export default function OwnerPaymentsPage() {
  const dispatch = useDispatch()
  const payments = useSelector(selectPayments)
  const isLoading = useSelector(selectPaymentsLoading)
  const error = useSelector(selectPaymentsError)

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    dispatch(fetchAllPayments())
  }, [dispatch])

  const filtered = payments.filter((p) => {
    const q = search.toLowerCase()
    const matchSearch =
      !q ||
      p.tenantName?.toLowerCase().includes(q) ||
      p.hostelName?.toLowerCase().includes(q) ||
      p.month?.includes(q)
    const matchStatus = statusFilter === 'all' || p.status === statusFilter
    return matchSearch && matchStatus
  })

  const collected = payments
    .filter((p) => p.status === 'paid')
    .reduce((t, p) => t + (p.amount ?? 0), 0)

  const pending = payments
    .filter((p) => p.status === 'pending')
    .reduce((t, p) => t + (p.amount ?? 0), 0)

  const isFiltering = Boolean(search) || statusFilter !== 'all'

  return (
    <section>
      <PageHeader
        eyebrow="Owner console"
        title="Rent"
        description="Collected rent, pending dues, and every payment record."
      />

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="card p-4">
          <p className="eyebrow">Collected</p>
          <p className="mt-1.5 text-lg font-semibold tabular-nums text-success">
            ₹{collected.toLocaleString('en-IN')}
          </p>
        </div>
        <div className="card p-4">
          <p className="eyebrow">Pending</p>
          <p className="mt-1.5 text-lg font-semibold tabular-nums text-warning">
            ₹{pending.toLocaleString('en-IN')}
          </p>
        </div>
      </div>

      <div className="mt-4 space-y-4">
        {isLoading && <Spinner compact label="Loading payments…" />}

        {error && (
          <Alert tone="error">Could not load payments: {error}</Alert>
        )}

        {/* Filters + export */}
        {!isLoading && !error && payments.length > 0 && (
          <div className="flex flex-wrap items-center gap-3">
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Search tenant, branch or month…"
              className="w-full sm:max-w-xs"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              aria-label="Filter by status"
              className="field w-auto"
            >
              <option value="all">All statuses</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <Button
              variant="secondary"
              size="sm"
              className="sm:ml-auto"
              onClick={() => exportCsv(filtered)}
            >
              Export CSV
            </Button>
          </div>
        )}

        {!isLoading && !error && filtered.length === 0 && (
          <EmptyState
            icon={IndianRupee}
            title={isFiltering ? 'No payments match your filters' : 'No rent payments yet'}
            hint={
              isFiltering
                ? 'Try another status or search term.'
                : 'Rent paid through the portal will be listed here.'
            }
          />
        )}

        {filtered.map((payment) => (
          <div
            key={payment.id}
            className="card flex flex-wrap items-center justify-between gap-3 p-4"
          >
            <div className="min-w-0">
              <p className="text-sm font-medium text-charcoal">
                {payment.tenantName ?? 'Tenant'} · {payment.month} · ₹
                {payment.amount?.toLocaleString('en-IN')}
              </p>
              <p className="mt-0.5 text-xs text-charcoal/55">
                {payment.hostelName ?? 'Branch'} ·{' '}
                {payment.status === 'paid' && payment.paidOn
                  ? `paid ${payment.paidOn}`
                  : `created ${payment.createdAt ?? ''}`}
              </p>
              {payment.note && (
                <p className="mt-0.5 text-xs text-charcoal/50">
                  {payment.note}
                </p>
              )}
            </div>

            <StatusBadge status={payment.status} />
          </div>
        ))}
      </div>
    </section>
  )
}
