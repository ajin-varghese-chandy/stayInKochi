import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import OwnerNav from '../../components/layout/OwnerNav'
import Spinner from '../../components/common/Spinner'
import {
  fetchAllPayments,
  selectPayments,
  selectPaymentsError,
  selectPaymentsLoading,
} from '../../features/payments/paymentSlice'

const STATUS_STYLES = {
  paid: 'bg-green-100 text-green-700',
  pending: 'bg-amber-100 text-amber-700',
  failed: 'bg-red-100 text-red-700',
  cancelled: 'bg-slate-100 text-slate-600',
}

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

  return (
    <section className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-3xl font-bold text-slate-900">Payments</h1>

      <div className="mt-6">
        <OwnerNav />
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-500">Collected</p>
          <p className="mt-1 text-2xl font-bold text-green-700">
            ₹{collected.toLocaleString('en-IN')}
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-500">Pending</p>
          <p className="mt-1 text-2xl font-bold text-amber-700">
            ₹{pending.toLocaleString('en-IN')}
          </p>
        </div>
      </div>

      {isLoading && <Spinner label="Loading payments..." />}
      {error && <p className="mt-6 text-red-600">Could not load payments: {error}</p>}

      {/* Filters + export */}
      {!isLoading && !error && payments.length > 0 && (
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tenant, branch or month…"
            className="w-full max-w-xs rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-indigo-500 focus:outline-none"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-700 focus:border-indigo-500 focus:outline-none"
          >
            <option value="all">All statuses</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <button
            type="button"
            onClick={() => exportCsv(filtered)}
            className="ml-auto rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
          >
            Export CSV
          </button>
        </div>
      )}

      {!isLoading && !error && filtered.length === 0 && (
        <p className="mt-6 text-slate-600">
          {search || statusFilter !== 'all' ? 'No payments match your filters.' : 'No rent payments recorded yet.'}
        </p>
      )}

      <div className="mt-4 space-y-3">
        {filtered.map((payment) => (
          <div
            key={payment.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white p-4"
          >
            <div>
              <p className="font-medium text-slate-900">
                {payment.tenantName ?? 'Tenant'} · {payment.month} · ₹
                {payment.amount?.toLocaleString('en-IN')}
              </p>
              <p className="text-sm text-slate-500">
                {payment.hostelName ?? 'Branch'} ·{' '}
                {payment.status === 'paid' && payment.paidOn
                  ? `paid ${payment.paidOn}`
                  : `created ${payment.createdAt ?? ''}`}
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
    </section>
  )
}
