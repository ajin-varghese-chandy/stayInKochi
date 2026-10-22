import { useCallback, useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { ArrowLeftRight } from 'lucide-react'
import Alert from '../../components/ui/Alert'
import EmptyState from '../../components/ui/EmptyState'
import PageHeader from '../../components/ui/PageHeader'
import Spinner from '../../components/common/Spinner'
import SwitchRequestCard from '../../features/switches/components/SwitchRequestCard'
import { getAllBeds } from '../../features/rooms/bedService'
import { getAllRooms } from '../../features/rooms/roomService'
import {
  approveSwitch,
  clearSwitchSaveFeedback,
  fetchAllSwitches,
  rejectSwitch,
  releaseSwitchReservation,
  selectSwitchesError,
  selectSwitchesLoading,
  selectSwitchesSaveError,
  selectSwitchesSaving,
  selectSwitchRequests,
} from '../../features/switches/switchSlice'

// Pending first, then approved and waiting on payment, then history.
const STATUS_ORDER = {
  pending: 0,
  approved: 1,
  completed: 2,
  rejected: 3,
  cancelled: 4,
  unpaid: 5,
}

// Owner screen for the branch-switch queue: reserve a bed, approve, or decline.
export default function OwnerSwitchesPage() {
  const dispatch = useDispatch()
  const switchRequests = useSelector(selectSwitchRequests)
  const isLoading = useSelector(selectSwitchesLoading)
  const error = useSelector(selectSwitchesError)
  const isSaving = useSelector(selectSwitchesSaving)
  const saveError = useSelector(selectSwitchesSaveError)

  // Destination inventory, so the owner can pick a real free bed while
  // approving instead of assigning one after the tenant has already moved.
  const [rooms, setRooms] = useState([])
  const [beds, setBeds] = useState([])
  const [inventoryLoading, setInventoryLoading] = useState(true)

  const refreshInventory = useCallback(() => {
    Promise.all([getAllRooms(), getAllBeds()])
      .then(([roomList, bedList]) => {
        setRooms(roomList)
        setBeds(bedList)
      })
      .catch(() => {
        setRooms([])
        setBeds([])
      })
      .finally(() => setInventoryLoading(false))
  }, [])

  useEffect(() => {
    dispatch(clearSwitchSaveFeedback())
    dispatch(fetchAllSwitches())
    refreshInventory()
  }, [dispatch, refreshInventory])

  // Re-read beds so a reserved bed stops being offered to the next request.
  function handleApprove(payload) {
    dispatch(approveSwitch(payload)).then((result) => {
      if (result.meta.requestStatus === 'fulfilled') refreshInventory()
    })
  }

  function handleRelease(request) {
    if (
      window.confirm(
        `Release the bed reserved for ${request.tenantName}? They will need to request the switch again.`,
      )
    ) {
      dispatch(releaseSwitchReservation({ switchRequest: request })).then(
        (result) => {
          if (result.meta.requestStatus === 'fulfilled') refreshInventory()
        },
      )
    }
  }

  const sorted = useMemo(
    () =>
      [...switchRequests].sort(
        (a, b) =>
          (STATUS_ORDER[a.status] ?? 9) - (STATUS_ORDER[b.status] ?? 9),
      ),
    [switchRequests],
  )

  const pendingCount = switchRequests.filter(
    (request) => request.status === 'pending',
  ).length
  const awaitingPaymentCount = switchRequests.filter(
    (request) => request.status === 'approved',
  ).length

  return (
    <section>
      <PageHeader
        eyebrow="Owner console"
        title="Switch requests"
        description="Reserve a free bed to approve a move. The tenant clears this month's rent, pays the fee plus any prorated rent difference, and the move completes automatically."
      />

      <div className="mt-4 flex flex-wrap gap-2 text-xs text-charcoal/65">
        <span className="rounded-card border border-line bg-white px-2.5 py-1">
          {pendingCount} waiting for you
        </span>
        <span className="rounded-card border border-line bg-white px-2.5 py-1">
          {awaitingPaymentCount} awaiting tenant payment
        </span>
      </div>

      <div className="mt-6 space-y-4">
        {isLoading && <Spinner compact label="Loading switch requests…" />}

        {error && (
          <Alert tone="error">Could not load requests: {error}</Alert>
        )}

        {saveError && <Alert tone="error">{saveError}</Alert>}

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
            rooms={rooms}
            beds={beds}
            inventoryLoading={inventoryLoading}
            isSaving={isSaving}
            onApprove={handleApprove}
            onReject={(payload) => dispatch(rejectSwitch(payload))}
            onRelease={handleRelease}
          />
        ))}
      </div>
    </section>
  )
}
