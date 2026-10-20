import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Wrench } from 'lucide-react'
import Alert from '../../components/ui/Alert'
import EmptyState from '../../components/ui/EmptyState'
import PageHeader from '../../components/ui/PageHeader'
import SearchInput from '../../components/ui/SearchInput'
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
  const isFiltering = Boolean(search) || statusFilter !== 'all'

  return (
    <section>
      <PageHeader
        eyebrow="Owner console"
        title="Upkeep"
        description="Review tenant issues and mark them resolved."
      />

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <span className="text-sm text-charcoal/55">{openCount} unresolved</span>
        <div className="flex w-full flex-wrap gap-3 sm:w-auto">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search tenant, branch or issue…"
            className="w-full sm:max-w-xs"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            aria-label="Filter by status"
            className="field w-auto"
          >
            <option value="all">All statuses</option>
            <option value="open">Open</option>
            <option value="in_progress">In progress</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
      </div>

      <div className="mt-4 space-y-4">
        {isLoading && <Spinner compact label="Loading upkeep requests…" />}

        {error && (
          <Alert tone="error">Could not load requests: {error}</Alert>
        )}
        {saveError && <Alert tone="error">{saveError}</Alert>}

        {!isLoading && !error && filtered.length === 0 && (
          <EmptyState
            icon={Wrench}
            title={
              isFiltering ? 'No requests match your filters' : 'No upkeep requests yet'
            }
            hint={
              isFiltering
                ? 'Try another status or search term.'
                : 'Tenant requests will appear here as they are raised.'
            }
          />
        )}

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
