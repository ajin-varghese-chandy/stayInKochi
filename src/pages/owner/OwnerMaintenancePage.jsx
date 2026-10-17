import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import OwnerNav from '../../components/layout/OwnerNav'
import Spinner from '../../components/common/Spinner'
import MaintenanceCard from '../../features/maintenance/components/MaintenanceCard'
import {
  fetchAllMaintenance,
  selectMaintenanceError,
  selectMaintenanceLoading,
  selectMaintenanceRequests,
  selectMaintenanceSaveError,
  selectMaintenanceSaving,
  updateMaintenanceStatus,
} from '../../features/maintenance/maintenanceSlice'

// Owner screen for reviewing and updating maintenance requests.
export default function OwnerMaintenancePage() {
  const dispatch = useDispatch()
  const requests = useSelector(selectMaintenanceRequests)
  const isLoading = useSelector(selectMaintenanceLoading)
  const error = useSelector(selectMaintenanceError)
  const isSaving = useSelector(selectMaintenanceSaving)
  const saveError = useSelector(selectMaintenanceSaveError)

  const [statusFilter, setStatusFilter] = useState('all')
  const [search, setSearch] = useState('')

  useEffect(() => {
    dispatch(fetchAllMaintenance())
  }, [dispatch])

  function handleStatusChange(request, status) {
    dispatch(updateMaintenanceStatus({ requestId: request.id, status }))
  }

  const filtered = requests.filter((r) => {
    const matchStatus = statusFilter === 'all' || r.status === statusFilter
    const q = search.toLowerCase()
    const matchSearch =
      !q ||
      r.tenantName?.toLowerCase().includes(q) ||
      r.hostelName?.toLowerCase().includes(q) ||
      r.title?.toLowerCase().includes(q)
    return matchStatus && matchSearch
  })

  const openCount = requests.filter((r) => r.status !== 'resolved').length

  return (
    <section className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-3xl font-bold text-slate-900">Maintenance</h1>

      <div className="mt-6">
        <OwnerNav />
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <span className="text-sm text-slate-500">{openCount} unresolved</span>
        <div className="flex flex-wrap gap-3">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tenant, branch or issue…"
            className="w-full max-w-xs rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-indigo-500 focus:outline-none"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-700 focus:border-indigo-500 focus:outline-none"
          >
            <option value="all">All statuses</option>
            <option value="open">Open</option>
            <option value="in_progress">In progress</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
      </div>

      {isLoading && <Spinner label="Loading maintenance requests..." />}
      {error && <p className="mt-6 text-red-600">Could not load requests: {error}</p>}
      {saveError && <p className="mt-6 text-red-600">{saveError}</p>}

      {!isLoading && !error && filtered.length === 0 && (
        <p className="mt-6 text-slate-600">
          {search || statusFilter !== 'all' ? 'No requests match your filters.' : 'No maintenance requests yet.'}
        </p>
      )}

      <div className="mt-4 space-y-4">
        {filtered.map((request) => (
          <MaintenanceCard
            key={request.id}
            request={request}
            isSaving={isSaving}
            onStatusChange={(status) => handleStatusChange(request, status)}
          />
        ))}
      </div>
    </section>
  )
}
