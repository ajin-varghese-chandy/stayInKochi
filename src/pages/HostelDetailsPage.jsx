import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useLocation, useParams } from 'react-router-dom'
import Spinner from '../components/common/Spinner'
import { selectCurrentUser } from '../features/auth/authSlice'
import StayRequestForm from '../features/stayRequests/components/StayRequestForm'
import {
  clearSelectedHostel,
  fetchHostelById,
  selectHostelsError,
  selectHostelsLoading,
  selectSelectedHostel,
} from '../features/hostels/hostelSlice'
import { getTenantsByUser } from '../features/tenants/tenantService'
import formatRupees from '../utils/formatRupees'

// Public detail page for a single hostel, including the stay-request flow.
export default function HostelDetailsPage() {
  const { hostelId } = useParams()
  const dispatch = useDispatch()
  const location = useLocation()
  const user = useSelector(selectCurrentUser)
  const hostel = useSelector(selectSelectedHostel)
  const isLoading = useSelector(selectHostelsLoading)
  const error = useSelector(selectHostelsError)

  const [showRequestForm, setShowRequestForm] = useState(false)

  // A signed-in tenant's existing tenancy decides which UI to show below:
  // already living here, or living elsewhere (switch instead of request).
  // Stored with the uid it was fetched for, so a record from a previous
  // account can never be mistaken for the current user's.
  const [tenancyFor, setTenancyFor] = useState(null)

  useEffect(() => {
    dispatch(fetchHostelById(hostelId))

    // Forget the hostel (and hide the form) when navigating away.
    return () => {
      dispatch(clearSelectedHostel())
      setShowRequestForm(false)
    }
  }, [dispatch, hostelId])

  useEffect(() => {
    if (user?.role !== 'tenant' || !user.uid) return undefined

    let cancelled = false
    getTenantsByUser(user.uid)
      .then((tenants) => {
        if (cancelled) return
        setTenancyFor({ uid: user.uid, tenancy: tenants[0] ?? null })
      })
      .catch(() => {
        if (cancelled) return
        setTenancyFor({ uid: user.uid, tenancy: null })
      })

    return () => {
      cancelled = true
    }
  }, [user?.role, user?.uid])

  // Only trust the lookup once it has settled for the signed-in user.
  const tenancy = tenancyFor?.uid === user?.uid ? tenancyFor.tenancy : null
  const tenancyLoading =
    user?.role === 'tenant' &&
    Boolean(user.uid) &&
    tenancyFor?.uid !== user.uid

  if (isLoading) {
    return <Spinner label="Loading hostel..." />
  }

  if (error) {
    return (
      <section className="mx-auto max-w-3xl px-4 py-16 text-center">
        <p className="text-red-600">Could not load this hostel: {error}</p>
        <Link to="/hostels" className="mt-4 inline-block text-indigo-600">
          Back to hostels
        </Link>
      </section>
    )
  }

  if (!hostel) {
    return null
  }

  // Pick the stay-request UI for the current viewer: guests are sent to login,
  // owners cannot request a stay, active tenants are routed to the switch flow
  // (a second stay request would never move them), and everyone else gets the
  // request form.
  let stayRequestSection
  if (!user) {
    stayRequestSection = (
      <Link
        to="/login"
        state={{ from: location }}
        className="inline-block rounded-md bg-indigo-600 px-6 py-3 font-medium text-white hover:bg-indigo-700"
      >
        Login to request a stay
      </Link>
    )
  } else if (user.role === 'owner') {
    stayRequestSection = (
      <p className="text-slate-500">Owner accounts cannot request stays.</p>
    )
  } else if (tenancyLoading) {
    stayRequestSection = <Spinner label="Checking your tenancy..." />
  } else if (tenancy && String(tenancy.hostelId) === String(hostel.id)) {
    stayRequestSection = (
      <div className="rounded-md border border-green-200 bg-green-50 p-4 text-green-800">
        You already live here.
        <Link
          to="/tenant"
          className="ml-2 font-medium text-indigo-600 underline"
        >
          Go to your dashboard
        </Link>
      </div>
    )
  } else if (tenancy) {
    stayRequestSection = (
      <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
        <p className="text-slate-700">
          You are an active tenant at{' '}
          <strong>{tenancy.hostelName}</strong>. Moving here is a{' '}
          <strong>hostel switch</strong>, which the owner approves after a
          small fee.
        </p>
        <Link
          to="/tenant/switch"
          className="mt-3 inline-block rounded-md bg-indigo-600 px-6 py-3 font-medium text-white hover:bg-indigo-700"
        >
          Switch to this hostel
        </Link>
      </div>
    )
  } else if (!showRequestForm) {
    stayRequestSection = (
      <button
        type="button"
        onClick={() => setShowRequestForm(true)}
        className="rounded-md bg-indigo-600 px-6 py-3 font-medium text-white hover:bg-indigo-700"
      >
        Request a stay
      </button>
    )
  } else {
    stayRequestSection = (
      <div>
        <StayRequestForm hostel={hostel} />
        <button
          type="button"
          onClick={() => setShowRequestForm(false)}
          className="mt-2 text-sm text-slate-500 hover:text-slate-700"
        >
          Cancel
        </button>
      </div>
    )
  }

  return (
    <section className="mx-auto max-w-4xl px-4 py-12">
      <Link to="/hostels" className="text-indigo-600">
        &larr; Back to branches
      </Link>

      <img
        src={hostel.image}
        alt={hostel.name}
        className="mt-4 h-72 w-full rounded-lg object-cover"
      />

      <div className="mt-6 flex items-start justify-between gap-4">
        <div>
      <h1 className="text-3xl font-bold text-slate-900">{hostel.name}</h1>
          <p className="mt-1 text-slate-500">{hostel.location}</p>
        </div>
        <p className="font-semibold text-indigo-600">
          {formatRupees(hostel.rentPerMonth)}
          <span className="font-normal text-slate-500"> /month</span>
        </p>
      </div>

      <p className="mt-4 text-slate-600">{hostel.description}</p>

      {hostel.amenities?.length > 0 && (
        <div className="mt-6">
          <h2 className="text-lg font-semibold text-slate-900">Amenities</h2>
          <ul className="mt-2 flex flex-wrap gap-2">
            {hostel.amenities.map((amenity) => (
              <li
                key={amenity}
                className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700"
              >
                {amenity}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-8">{stayRequestSection}</div>
    </section>
  )
}
