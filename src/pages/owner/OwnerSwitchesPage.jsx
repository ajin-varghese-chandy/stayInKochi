import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { ArrowLeftRight } from 'lucide-react'
import Alert from '../../components/ui/Alert'
import EmptyState from '../../components/ui/EmptyState'
import PageHeader from '../../components/ui/PageHeader'
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
    <section>
      <PageHeader
        eyebrow="Owner console"
        title="Switch requests"
        description="Approving frees the old bed and moves the tenant to the new branch."
      />

      <div className="mt-6 space-y-4">
        {isLoading && <Spinner compact label="Loading switch requests…" />}

        {error && (
          <Alert tone="error">Could not load requests: {error}</Alert>
        )}

        {!isLoading && !error && sorted.length === 0 && (
          <EmptyState
            icon={ArrowLeftRight}
            title="No switch requests yet"
            hint="Tenants ask to move between branches and those requests arrive here."
          />
        )}

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
