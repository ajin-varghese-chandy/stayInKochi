import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { BedDouble, FileText } from 'lucide-react'
import Alert from '../../components/ui/Alert'
import Button from '../../components/ui/Button'
import EmptyState from '../../components/ui/EmptyState'
import PageHeader from '../../components/ui/PageHeader'
import StatusBadge from '../../components/ui/StatusBadge'
import Spinner from '../../components/common/Spinner'
import { selectCurrentUser } from '../../features/auth/authSlice'
import NotificationInbox from '../../features/notifications/components/NotificationInbox'
import StayRequestCard from '../../features/stayRequests/components/StayRequestCard'
import {
  fetchMyStayRequests,
  selectStayRequests,
  selectStayRequestsError,
  selectStayRequestsLoading,
} from '../../features/stayRequests/stayRequestSlice'
import { getTenantsByUser } from '../../features/tenants/tenantService'
import formatRupees from '../../utils/formatRupees'

// Tenant home base, ordered the way a tenant needs it: tenancy status first,
// then notifications and stay request history.
export default function TenantDashboardPage() {
  const dispatch = useDispatch()
  const user = useSelector(selectCurrentUser)
  const requests = useSelector(selectStayRequests)
  const isLoading = useSelector(selectStayRequestsLoading)
  const error = useSelector(selectStayRequestsError)

  // The active tenancy record (created when a request is approved), if any.
  const [tenancy, setTenancy] = useState(null)
  const [tenancyLoading, setTenancyLoading] = useState(true)

  useEffect(() => {
    if (!user?.uid) return

    dispatch(fetchMyStayRequests(user.uid))

    // tenancyLoading already starts as true on mount, so it only needs to be
    // turned off once this lookup settles.
    let cancelled = false
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

  const firstName = (user?.displayName ?? '').trim().split(' ')[0]

  return (
    <section>
      <PageHeader
        eyebrow="Tenant portal"
        title={firstName ? `Welcome back, ${firstName}` : 'Overview'}
        description={
          tenancy
            ? `${tenancy.hostelName} · Room ${tenancy.roomNumber ?? '—'} · Bed ${tenancy.bedNumber ?? '—'}`
            : 'Your stay, rent, food, and requests — all in one place.'
        }
      />

      <div className="mt-6 space-y-6">
        {/* Tenancy status */}
        <TenancyStatus tenancy={tenancy} isLoading={tenancyLoading} />

        {/* Notifications */}
        <NotificationInbox recipientId={user?.uid} />

        {/* Stay requests */}
        <section aria-labelledby="stay-requests-heading">
          <h2
            id="stay-requests-heading"
            className="text-base font-semibold text-charcoal"
          >
            My stay requests
          </h2>

          <div className="mt-3">
            {isLoading && <Spinner compact label="Loading your stay requests…" />}

            {error && (
              <Alert tone="error">Could not load your requests: {error}</Alert>
            )}

            {!isLoading && !error && requests.length === 0 && (
              <EmptyState
                icon={FileText}
                title="No stay requests yet"
                hint="Request a stay at any branch and the owner will review it."
                action={
                  <Button to="/hostels" variant="secondary">
                    Browse branches
                  </Button>
                }
              />
            )}

            <div className="mt-3 space-y-4">
              {requests.map((request) => (
                <StayRequestCard key={request.id} request={request} />
              ))}
            </div>
          </div>
        </section>
      </div>
    </section>
  )
}

// Shows whether the user is an active tenant yet: a scannable status card
// (branch name, rent badge, four stat tiles) or a clear next step.
function TenancyStatus({ tenancy, isLoading }) {
  if (isLoading) {
    return <Spinner compact label="Checking your tenancy…" />
  }

  if (!tenancy) {
    return (
      <EmptyState
        icon={BedDouble}
        title="You are not an active tenant yet"
        hint="Browse branches and send a stay request — the owner approves it before you move in."
        action={<Button to="/hostels">Browse branches</Button>}
      />
    )
  }

  const stats = [
    { label: 'Room', value: tenancy.roomNumber ?? '—' },
    { label: 'Bed', value: tenancy.bedNumber ?? '—' },
    { label: 'Rent / month', value: formatRupees(tenancy.rentPerMonth) },
    { label: 'Joined on', value: tenancy.joinedOn ?? '—' },
  ]

  return (
    <section className="card p-5" aria-labelledby="tenancy-heading">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p id="tenancy-heading" className="eyebrow">
            Active tenancy
          </p>
          <p className="display mt-1.5 text-xl text-charcoal">
            {tenancy.hostelName}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-charcoal/70">Rent</span>
          <StatusBadge status={tenancy.rentStatus ?? 'unpaid'} />
        </div>
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map(({ label, value }) => (
          <div key={label} className="rounded-card bg-ivory px-3.5 py-3">
            <dt className="text-xs font-medium text-charcoal/70">{label}</dt>
            <dd className="mt-1 text-sm font-semibold tabular-nums text-charcoal">
              {value}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
