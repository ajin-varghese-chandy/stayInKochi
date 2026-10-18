import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import OwnerNav from '../../components/layout/OwnerNav'
import Spinner from '../../components/common/Spinner'
import SwitchRequestCard from '../../features/switches/components/SwitchRequestCard'
import {
  approveSwitch,
  fetchAllSwitches,
  rejectSwitch,
  selectSwitchesError,
  selectSwitchesLoading,
  selectSwitchesSaving,
  selectSwitchRequests,
} from '../../features/switches/switchSlice'

// Owner screen for approving paid hostel-switch requests.
export default function OwnerSwitchesPage() {
  const dispatch = useDispatch()
  const switchRequests = useSelector(selectSwitchRequests)
  const isLoading = useSelector(selectSwitchesLoading)
  const error = useSelector(selectSwitchesError)
  const isSaving = useSelector(selectSwitchesSaving)

  useEffect(() => {
    dispatch(fetchAllSwitches())
  }, [dispatch])

  // Pending first, everything else after.
  const sorted = [...switchRequests].sort((a, b) =>
    a.status === 'pending' ? -1 : b.status === 'pending' ? 1 : 0,
  )

  return (
    <section className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-3xl font-bold text-slate-900">Switch requests</h1>
      <p className="mt-1 text-slate-600">
        Approving frees the old bed and moves the tenant to the new branch.
      </p>

      <div className="mt-6">
        <OwnerNav />
      </div>

      {isLoading && <Spinner label="Loading switch requests..." />}

      {error && (
        <p className="mt-6 text-red-600">Could not load requests: {error}</p>
      )}

      {!isLoading && !error && sorted.length === 0 && (
        <p className="mt-6 text-slate-600">No switch requests yet.</p>
      )}

      <div className="mt-6 space-y-4">
        {sorted.map((request) => (
          <SwitchRequestCard
            key={request.id}
            request={request}
            isSaving={isSaving}
            onApprove={(item) => dispatch(approveSwitch(item))}
            onReject={(item) => dispatch(rejectSwitch(item))}
          />
        ))}
      </div>
    </section>
  )
}
