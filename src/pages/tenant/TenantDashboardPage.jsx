import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import Spinner from '../../components/common/Spinner'
import TenantNav from '../../components/layout/TenantNav'
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
    <section className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-3xl font-bold text-slate-900">Tenant dashboard</h1>
      <p className="mt-2 text-slate-600">
        Welcome back, {user?.displayName ?? 'tenant'}.
      </p>

      <div className="mt-6">
        <TenantNav />
      </div>

      <TenancyBanner tenancy={tenancy} isLoading={tenancyLoading} />

      <div className="mt-8">
        <NotificationInbox recipientId={user?.uid} />
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold text-slate-900">
          My stay requests
        </h2>

        {isLoading && <Spinner label="Loading your stay requests..." />}

        {error && (
          <p className="mt-4 text-red-600">
            Could not load your requests: {error}
          </p>
        )}

        {!isLoading && !error && requests.length === 0 && (
          <p className="mt-4 text-slate-600">
            You have not requested a stay yet.{' '}
            <Link to="/hostels" className="font-medium text-indigo-600 underline">
              Browse hostels
            </Link>{' '}
            to get started.
          </p>
        )}

        <div className="mt-4 space-y-4">
          {requests.map((request) => (
            <StayRequestCard key={request.id} request={request} />
          ))}
        </div>
      </div>
    </section>
  )
}

// Shows whether the user is an active tenant yet, plus the next useful step.
function TenancyBanner({ tenancy, isLoading }) {
  if (isLoading) {
    return <Spinner label="Checking your tenancy..." />
  }

  if (tenancy) {
    return (
      <div className="mt-6 rounded-md border border-green-200 bg-green-50 p-4 text-green-800">
        <p>
          Active tenant at <strong>{tenancy.hostelName}</strong>
          {tenancy.joinedOn ? ` · joined ${tenancy.joinedOn}` : ''}.
        </p>

        <div className="mt-3 flex flex-wrap gap-3 text-sm">
          <Link
            to="/tenant/payments"
            className="rounded-md border border-green-300 px-3 py-1.5 font-medium text-green-800 hover:bg-green-100"
          >
            Pay rent
          </Link>
          <Link
            to="/tenant/food"
            className="rounded-md border border-green-300 px-3 py-1.5 font-medium text-green-800 hover:bg-green-100"
          >
            Food plans
          </Link>
          <Link
            to="/tenant/maintenance"
            className="rounded-md border border-green-300 px-3 py-1.5 font-medium text-green-800 hover:bg-green-100"
          >
            Raise an issue
          </Link>
          <Link
            to="/tenant/switch"
            className="rounded-md border border-green-300 px-3 py-1.5 font-medium text-green-800 hover:bg-green-100"
          >
            Switch hostel
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="mt-6 rounded-md border border-slate-200 bg-slate-100 p-4 text-slate-600">
      You are not an active tenant yet.{' '}
      <Link to="/hostels" className="font-medium text-indigo-600 underline">
        Browse hostels
      </Link>{' '}
      and submit a stay request — the owner approves it before you can move in.
    </div>
  )
}
