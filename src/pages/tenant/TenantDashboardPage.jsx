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

// Tenant home base: active tenancy status plus this user's stay requests.
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

  return (
    <section>
      <PageHeader
        eyebrow="Tenant portal"
        title="Overview"
        description={`Welcome back, ${user?.displayName ?? 'tenant'}.`}
      />

      <div className="mt-6 space-y-6">
        <TenancyBanner tenancy={tenancy} isLoading={tenancyLoading} />

        <NotificationInbox recipientId={user?.uid} />

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

// Shows whether the user is an active tenant yet, plus the next useful step.
function TenancyBanner({ tenancy, isLoading }) {
  if (isLoading) {
    return <Spinner compact label="Checking your tenancy…" />
  }

  if (!tenancy) {
    return (
      <EmptyState
        icon={BedDouble}
        title="You are not an active tenant yet"
        hint="Browse branches and submit a stay request — the owner approves it before you can move in."
        action={<Button to="/hostels">Browse branches</Button>}
      />
    )
  }

  return (
    <section className="card p-5" aria-labelledby="tenancy-heading">
      <p id="tenancy-heading" className="eyebrow">
        Active tenancy
      </p>

      <dl className="mt-3">
        <div className="flex justify-between border-b border-line py-2 text-sm last:border-0">
          <dt className="text-charcoal/55">Branch</dt>
          <dd className="font-medium text-charcoal">{tenancy.hostelName}</dd>
        </div>
        <div className="flex justify-between border-b border-line py-2 text-sm last:border-0">
          <dt className="text-charcoal/55">Room</dt>
          <dd className="font-medium text-charcoal">
            {tenancy.roomNumber ?? '—'}
          </dd>
        </div>
        <div className="flex justify-between border-b border-line py-2 text-sm last:border-0">
          <dt className="text-charcoal/55">Bed</dt>
          <dd className="font-medium text-charcoal">
            {tenancy.bedNumber ?? '—'}
          </dd>
        </div>
        <div className="flex justify-between border-b border-line py-2 text-sm last:border-0">
          <dt className="text-charcoal/55">Joined on</dt>
          <dd className="font-medium text-charcoal">
            {tenancy.joinedOn ?? '—'}
          </dd>
        </div>
        <div className="flex justify-between border-b border-line py-2 text-sm last:border-0">
          <dt className="text-charcoal/55">Rent</dt>
          <dd className="flex items-center gap-2">
            <span className="font-semibold tabular-nums text-forest">
              {formatRupees(tenancy.rentPerMonth)}
            </span>
            <StatusBadge status={tenancy.rentStatus ?? 'unpaid'} />
          </dd>
        </div>
      </dl>

      <div className="mt-4 flex flex-wrap gap-2">
        <Button to="/tenant/payments" size="sm" variant="secondary">
          Pay rent
        </Button>
        <Button to="/tenant/food" size="sm" variant="secondary">
          Food plans
        </Button>
        <Button to="/tenant/maintenance" size="sm" variant="secondary">
          Raise an issue
        </Button>
        <Button to="/tenant/switch" size="sm" variant="secondary">
          Switch branch
        </Button>
      </div>
    </section>
  )
}
