import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Wrench } from 'lucide-react'
import Alert from '../../components/ui/Alert'
import Button from '../../components/ui/Button'
import EmptyState from '../../components/ui/EmptyState'
import PageHeader from '../../components/ui/PageHeader'
import Spinner from '../../components/common/Spinner'
import { selectCurrentUser } from '../../features/auth/authSlice'
import MaintenanceCard from '../../features/maintenance/components/MaintenanceCard'
import MaintenanceForm from '../../features/maintenance/components/MaintenanceForm'
import {
  fetchMyMaintenance,
  selectMaintenanceError,
  selectMaintenanceLoading,
  selectMaintenanceRequests,
} from '../../features/maintenance/maintenanceSlice'
import { getTenantsByUser } from '../../features/tenants/tenantService'

// Status filters for the request list. Presentation only — the list itself
// always holds every request fetched from the slice.
const STATUS_FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'open', label: 'Open' },
  { value: 'in-progress', label: 'In progress' },
  { value: 'resolved', label: 'Resolved' },
]

// Tenant screen for raising maintenance requests and tracking their status.
export default function TenantMaintenancePage() {
  const dispatch = useDispatch()
  const user = useSelector(selectCurrentUser)
  const requests = useSelector(selectMaintenanceRequests)
  const isLoading = useSelector(selectMaintenanceLoading)
  const error = useSelector(selectMaintenanceError)

  // The active tenancy tells us which hostel/room the request is for.
  const [tenancy, setTenancy] = useState(null)
  const [tenancyLoading, setTenancyLoading] = useState(true)

  // Which status the tenant is currently looking at.
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    if (!user?.uid) return

    let cancelled = false
    dispatch(fetchMyMaintenance(user.uid))

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

  if (tenancyLoading) {
    return (
      <section>
        <PageHeader
          eyebrow="Tenant portal"
          title="Upkeep"
          description="Raise issues in your room and track how they are fixed."
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
          title="Upkeep"
          description="Raise issues in your room and track how they are fixed."
        />
        <div className="mt-6">
          <EmptyState
            icon={Wrench}
            title="Only active tenants can raise requests"
            hint="Join a branch first and upkeep requests will be available here."
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

  const visibleRequests =
    statusFilter === 'all'
      ? requests
      : requests.filter((request) => request.status === statusFilter)

  return (
    <section>
      <PageHeader
        eyebrow="Tenant portal"
        title="Upkeep"
        description={tenancy.hostelName}
      />

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        {/* Raise a request */}
        <section className="card p-5" aria-label="Raise a maintenance request">
          <MaintenanceForm tenancy={tenancy} />
        </section>

        {/* My requests */}
        <section aria-labelledby="my-requests-heading">
          <h2
            id="my-requests-heading"
            className="text-base font-semibold text-charcoal"
          >
            My requests
          </h2>

          <div
            className="mt-3 flex flex-wrap gap-2"
            role="group"
            aria-label="Filter requests by status"
          >
            {STATUS_FILTERS.map((filter) => {
              const isActive = statusFilter === filter.value

              return (
                <button
                  key={filter.value}
                  type="button"
                  onClick={() => setStatusFilter(filter.value)}
                  aria-pressed={isActive}
                  className={`min-h-10 rounded-card border px-3 py-1.5 text-xs font-medium transition-colors ${
                    isActive
                      ? 'border-forest bg-forest text-white'
                      : 'border-line-strong bg-white text-charcoal/70 hover:border-charcoal hover:text-charcoal'
                  }`}
                >
                  {filter.label}
                </button>
              )
            })}
          </div>

          <div className="mt-3">
            {isLoading && <Spinner compact label="Loading your requests…" />}

            {error && (
              <Alert tone="error">
                Could not load your requests: {error}
              </Alert>
            )}

            {!isLoading && !error && requests.length === 0 && (
              <EmptyState
                icon={Wrench}
                title="No requests yet"
                hint="Raise an issue with the form and the owner will be notified straight away."
              />
            )}

            {!isLoading &&
              !error &&
              requests.length > 0 &&
              visibleRequests.length === 0 && (
                <p className="text-sm text-charcoal/70">
                  No requests with this status.
                </p>
              )}

            <div className="mt-3 space-y-4">
              {visibleRequests.map((request) => (
                <MaintenanceCard key={request.id} request={request} />
              ))}
            </div>
          </div>
        </section>
      </div>
    </section>
  )
}
