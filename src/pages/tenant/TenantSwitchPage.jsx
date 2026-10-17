import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import Spinner from '../../components/common/Spinner'
import TenantNav from '../../components/layout/TenantNav'
import { selectCurrentUser } from '../../features/auth/authSlice'
import { fetchHostels, selectHostels } from '../../features/hostels/hostelSlice'
import SwitchOptionCard from '../../features/switches/components/SwitchOptionCard'
import {
  fetchMySwitches,
  requestHostelSwitch,
  selectSwitchesSaveError,
  selectSwitchesSaving,
  selectSwitchRequests,
  SWITCH_FEE_RUPEES,
} from '../../features/switches/switchSlice'
import { getTenantsByUser } from '../../features/tenants/tenantService'

// Tenant screen for paying the switching fee and moving to another hostel.
export default function TenantSwitchPage() {
  const dispatch = useDispatch()
  const user = useSelector(selectCurrentUser)
  const hostels = useSelector(selectHostels)
  const switchRequests = useSelector(selectSwitchRequests)
  const isSaving = useSelector(selectSwitchesSaving)
  const saveError = useSelector(selectSwitchesSaveError)

  // The active tenancy tells us which hostel they are leaving.
  const [tenancy, setTenancy] = useState(null)
  const [tenancyLoading, setTenancyLoading] = useState(true)

  useEffect(() => {
    if (!user?.uid) return

    let cancelled = false
    dispatch(fetchHostels())
    dispatch(fetchMySwitches(user.uid))

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

  function handleSwitch(toHostel) {
    dispatch(
      requestHostelSwitch({
        tenant: tenancy,
        toHostel,
        amount: SWITCH_FEE_RUPEES,
      }),
    )
  }

  if (tenancyLoading) {
    return <Spinner label="Checking your tenancy..." />
  }

  if (!tenancy) {
    return (
      <section className="mx-auto max-w-4xl px-4 py-12">
        <h1 className="text-3xl font-bold text-slate-900">Switch hostel</h1>
        <div className="mt-6">
          <TenantNav />
        </div>
        <p className="mt-6 text-slate-600">Only active tenants can switch.</p>
      </section>
    )
  }

  // One switch at a time: block new payments while a request is undecided.
  const hasPendingRequest = switchRequests.some(
    (request) => request.status === 'pending',
  )

  const otherHostels = hostels.filter(
    (hostel) => hostel.id !== tenancy.hostelId,
  )

  return (
    <section className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-3xl font-bold text-slate-900">Switch hostel</h1>
      <p className="mt-1 text-slate-600">
        Currently at {tenancy.hostelName} · fee ₹
        {SWITCH_FEE_RUPEES.toLocaleString('en-IN')}
      </p>

      <div className="mt-6">
        <TenantNav />
      </div>

      {hasPendingRequest && (
        <p className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-800">
          You already have a switch request awaiting the owner's approval.
        </p>
      )}

      <div className="mt-8">
        <h2 className="text-xl font-semibold text-slate-900">Other hostels</h2>

        {otherHostels.length === 0 && (
          <p className="mt-4 text-slate-600">There are no other hostels yet.</p>
        )}

        <div className="mt-4 space-y-3">
          {otherHostels.map((hostel) => (
            <SwitchOptionCard
              key={hostel.id}
              hostel={hostel}
              feeRupees={SWITCH_FEE_RUPEES}
              disabled={hasPendingRequest}
              isSaving={isSaving}
              onSwitch={handleSwitch}
            />
          ))}
        </div>
      </div>

      {saveError && <p className="mt-4 text-red-600">{saveError}</p>}

      <div className="mt-8">
        <h2 className="text-xl font-semibold text-slate-900">My requests</h2>

        {switchRequests.length === 0 && (
          <p className="mt-4 text-slate-600">No switch requests yet.</p>
        )}

        <div className="mt-4 space-y-3">
          {switchRequests.map((request) => (
            <div
              key={request.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white p-4"
            >
              <div>
                <p className="font-medium text-slate-900">
                  {request.fromHostelName} → {request.toHostelName}
                </p>
                <p className="text-sm text-slate-500">
                  Requested {request.createdAt} · ₹
                  {request.amount?.toLocaleString('en-IN')} paid
                </p>
              </div>

              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold capitalize text-slate-700">
                {request.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
