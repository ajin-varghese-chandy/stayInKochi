import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useLocation } from 'react-router-dom'
import { ArrowLeftRight, BedDouble, MapPin } from 'lucide-react'
import Alert from '../../components/ui/Alert'
import Button from '../../components/ui/Button'
import EmptyState from '../../components/ui/EmptyState'
import PageHeader from '../../components/ui/PageHeader'
import StatusBadge from '../../components/ui/StatusBadge'
import Spinner from '../../components/common/Spinner'
import { selectCurrentUser } from '../../features/auth/authSlice'
import { fetchHostels, selectHostels } from '../../features/hostels/hostelSlice'
import { getPaymentsByUser } from '../../features/payments/paymentService'
import { getAllBeds } from '../../features/rooms/bedService'
import { getAllRooms } from '../../features/rooms/roomService'
import SwitchOptionCard from '../../features/switches/components/SwitchOptionCard'
import {
  cancelSwitch,
  clearSwitchSaveFeedback,
  fetchMySwitches,
  paySwitchFee,
  requestHostelSwitch,
  selectSwitchRequests,
  selectSwitchesLoading,
  selectSwitchesSaveError,
  selectSwitchesSaving,
  SWITCH_FEE_RUPEES,
} from '../../features/switches/switchSlice'
import { getTenantsByUser } from '../../features/tenants/tenantService'
import {
  applyRentCredit,
  computeSwitchSettlement,
  formatDaysLeft,
  monthRangeLabel,
} from '../../features/switches/switchSettlement'
import formatRupees from '../../utils/formatRupees'

const STEPS = [
  'Request a branch — this step is free.',
  'The owner checks availability and reserves a bed for you there.',
  'Clear this month’s rent, then pay the switch fee plus any prorated rent difference.',
  'Your old bed is released, unused rent days are credited, and the new rent starts.',
]

// Progress labels shown on each request. The index of the step in progress is
// derived from the request status.
const TRACK_STEPS = ['Requested', 'Bed reserved', 'Fee paid', 'Moved']

function stageIndex(status) {
  if (status === 'pending') return 1
  if (status === 'approved') return 2
  if (status === 'completed') return TRACK_STEPS.length
  return null
}

// Group rooms and beds by branch so each option can show real availability.
function indexInventory(rooms, beds) {
  const byHostel = {}

  rooms.forEach((room) => {
    const key = String(room.hostelId)
    byHostel[key] ??= { rooms: [], freeBeds: 0, totalBeds: 0 }
    byHostel[key].rooms.push(room)
  })

  beds.forEach((bed) => {
    const key = String(bed.hostelId)
    byHostel[key] ??= { rooms: [], freeBeds: 0, totalBeds: 0 }
    byHostel[key].totalBeds += 1
    if (bed.status === 'available') byHostel[key].freeBeds += 1
  })

  return byHostel
}

// Tenant screen for moving between branches: request, approval, payment, move.
export default function TenantSwitchPage() {
  const dispatch = useDispatch()
  const location = useLocation()
  const user = useSelector(selectCurrentUser)
  const hostels = useSelector(selectHostels)
  const switchRequests = useSelector(selectSwitchRequests)
  const isSaving = useSelector(selectSwitchesSaving)
  const switchesLoading = useSelector(selectSwitchesLoading)
  const saveError = useSelector(selectSwitchesSaveError)

  // The active tenancy tells us which hostel they are leaving.
  const [tenancy, setTenancy] = useState(null)
  const [tenancyLoading, setTenancyLoading] = useState(true)
  const [inventory, setInventory] = useState({})
  const [payments, setPayments] = useState([])

  useEffect(() => {
    if (!user?.uid) return

    let cancelled = false
    dispatch(clearSwitchSaveFeedback())
    dispatch(fetchHostels())
    dispatch(fetchMySwitches(user.uid))

    getPaymentsByUser(user.uid)
      .then((rows) => {
        if (!cancelled) setPayments(rows)
      })
      .catch(() => {
        if (!cancelled) setPayments([])
      })

    Promise.all([getAllRooms(), getAllBeds()])
      .then(([rooms, beds]) => {
        if (!cancelled) setInventory(indexInventory(rooms, beds))
      })
      .catch(() => {
        if (!cancelled) setInventory({})
      })

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

  // The request that is currently being settled (if any).
  const activeRequest = useMemo(
    () =>
      switchRequests.find(
        (request) =>
          request.status === 'pending' || request.status === 'approved',
      ) ?? null,
    [switchRequests],
  )

  const currentHostel = useMemo(
    () =>
      hostels.find(
        (hostel) => String(hostel.id) === String(tenancy?.hostelId),
      ) ?? null,
    [hostels, tenancy?.hostelId],
  )

  // The tenant's own room rent is authoritative; a branch can have rooms at
  // different rents, so fall back to the branch figure only when it is missing.
  const currentRent = tenancy?.rentPerMonth ?? currentHostel?.rentPerMonth

  function refreshInventory() {
    Promise.all([getAllRooms(), getAllBeds()])
      .then(([rooms, beds]) => setInventory(indexInventory(rooms, beds)))
      .catch(() => setInventory({}))
  }

  function handleSwitch(toHostel) {
    dispatch(requestHostelSwitch({ tenant: tenancy, toHostel }))
  }

  function handlePay(switchRequest) {
    dispatch(paySwitchFee(switchRequest)).then((result) => {
      if (result.meta.requestStatus !== 'fulfilled') return

      // The tenant record now points at the new branch; refresh the header and
      // the "current branch" card, plus the destination bed counts and the rent
      // history (the move may have added a rent-difference payment).
      getTenantsByUser(user.uid)
        .then((tenants) => setTenancy(tenants[0] ?? null))
        .catch(() => {})
      getPaymentsByUser(user.uid)
        .then((rows) => setPayments(rows))
        .catch(() => {})
      refreshInventory()
    })
  }

  function handleCancel(switchRequest) {
    if (
      window.confirm(
        `Cancel your switch to ${switchRequest.toHostelName}? Any reserved bed will be released.`,
      )
    ) {
      dispatch(cancelSwitch(switchRequest)).then((result) => {
        if (result.meta.requestStatus === 'fulfilled') refreshInventory()
      })
    }
  }

  if (tenancyLoading) {
    return (
      <section>
        <PageHeader
          eyebrow="Tenant portal"
          title="Switch branch"
          description="Move to another branch in four clear steps."
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
          title="Switch branch"
          description="Move to another branch in four clear steps."
        />
        <div className="mt-6">
          <EmptyState
            icon={ArrowLeftRight}
            title="Only active tenants can switch"
            hint="Once you have moved in, you can switch to any other branch from here."
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

  const otherHostels = hostels.filter(
    (hostel) => String(hostel.id) !== String(tenancy.hostelId),
  )

  // If the tenant arrived from a branch page, put that branch first.
  const requestedHostelId = location.state?.switchToHostelId
  const orderedHostels = requestedHostelId
    ? [...otherHostels].sort((a, b) => {
        if (String(a.id) === String(requestedHostelId)) return -1
        if (String(b.id) === String(requestedHostelId)) return 1
        return 0
      })
    : otherHostels

  return (
    <section>
      <PageHeader
        eyebrow="Tenant portal"
        title="Switch branch"
        description={`Currently at ${tenancy.hostelName}.`}
      />

      <div className="mt-6 space-y-8">
        {activeRequest?.status === 'pending' && (
          <Alert tone="warning">
            Your request to move to {activeRequest.toHostelName} is waiting for
            the owner to review and reserve a bed.
          </Alert>
        )}

        {activeRequest?.status === 'approved' && (
          <Alert tone={activeRequest.reservedBedId ? 'success' : 'warning'}>
            {activeRequest.reservedBedId ? (
              <>
                Your switch to {activeRequest.toHostelName} is approved
                {activeRequest.reservedBedNumber
                  ? ` — room ${activeRequest.reservedRoomNumber}, bed ${activeRequest.reservedBedNumber} is held for you`
                  : ''}
                . Settle the fee and any rent difference in My requests below.
              </>
            ) : (
              <>
                This older request was approved without a bed reservation, so it
                cannot be completed. Cancel it and raise a new request in My
                requests below.
              </>
            )}
          </Alert>
        )}

        {saveError && <Alert tone="error">{saveError}</Alert>}

        {/* Where the tenant lives right now */}
        <section
          className="card p-5"
          aria-labelledby="current-branch-heading"
        >
          <p id="current-branch-heading" className="eyebrow">
            Your current branch
          </p>
          <div className="mt-2 flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <h2 className="text-base font-semibold text-charcoal">
                {tenancy.hostelName}
              </h2>
              {currentHostel?.location && (
                <p className="mt-1 flex items-center gap-1.5 text-sm text-charcoal/60">
                  <MapPin size={14} strokeWidth={1.75} aria-hidden="true" />
                  {currentHostel.location}
                </p>
              )}
              <p className="mt-1 flex items-center gap-1.5 text-sm text-charcoal/60">
                <BedDouble size={14} strokeWidth={1.75} aria-hidden="true" />
                Room {tenancy.roomNumber ?? '—'} · Bed{' '}
                {tenancy.bedNumber ?? '—'}
              </p>
            </div>

            <p className="shrink-0 text-right text-sm">
              <span className="block text-xs text-charcoal/55">
                Current rent
              </span>
              <span className="font-semibold tabular-nums text-forest">
                {formatRupees(currentRent)}
              </span>
              <span className="text-xs text-charcoal/55">/month</span>
            </p>
          </div>
        </section>

        {/* How switching works */}
        <section className="card p-5" aria-labelledby="switch-process-heading">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <p id="switch-process-heading" className="eyebrow">
              How switching works
            </p>
            <p className="text-sm font-semibold tabular-nums text-forest">
              {formatRupees(SWITCH_FEE_RUPEES)}
              <span className="ml-1.5 text-xs font-normal text-charcoal/70">
                one-time fee, plus any rent difference
              </span>
            </p>
          </div>

          <ol className="mt-4 space-y-3">
            {STEPS.map((step, index) => (
              <li key={step} className="flex gap-3">
                <span className="eyebrow mt-0.5 shrink-0">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <p className="text-sm leading-relaxed text-charcoal/70">
                  {step}
                </p>
              </li>
            ))}
          </ol>
        </section>

        {/* Other branches */}
        <section aria-labelledby="other-branches-heading">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2
              id="other-branches-heading"
              className="text-base font-semibold text-charcoal"
            >
              Other branches
            </h2>
            <p className="text-xs text-charcoal/55">
              Rent, amenities, and live bed availability
            </p>
          </div>

          {requestedHostelId && (
            <p className="mt-2 text-sm text-charcoal/65">
              The branch you were just viewing is listed first.
            </p>
          )}

          <div className="mt-3">
            {orderedHostels.length === 0 ? (
              <EmptyState
                icon={ArrowLeftRight}
                title="No other branches yet"
                hint="There is nowhere to switch to just now — check back soon."
              />
            ) : (
              <div className="grid gap-5 sm:grid-cols-2">
                {orderedHostels.map((hostel) => (
                  <SwitchOptionCard
                    key={hostel.id}
                    hostel={hostel}
                    currentRent={currentRent}
                    inventory={inventory[String(hostel.id)]}
                    feeRupees={SWITCH_FEE_RUPEES}
                    disabled={Boolean(activeRequest) || switchesLoading}
                    isSaving={isSaving}
                    onSwitch={handleSwitch}
                  />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* My requests */}
        <section aria-labelledby="switch-requests-heading">
          <h2
            id="switch-requests-heading"
            className="text-base font-semibold text-charcoal"
          >
            My requests
          </h2>

          <div className="mt-3">
            {switchRequests.length === 0 ? (
              <EmptyState
                icon={ArrowLeftRight}
                title="No switch requests yet"
                hint="When you request a switch it will appear here with each step it reaches."
              />
            ) : (
              <div className="space-y-3">
                {switchRequests.map((request) => {
                  const requestedOn =
                    request.requestedOn ?? request.createdAt ?? '—'
                  const isCompleted = request.status === 'completed'
                  const isApproved = request.status === 'approved'
                  const isPending = request.status === 'pending'
                  const hasReservedBed = Boolean(request.reservedBedId)
                  const currentStage = stageIndex(request.status)

                  // What the move costs: fee + prorated rent difference, minus
                  // any credit already on the account.
                  const settlement =
                    isApproved && request.reservedRentPerMonth
                      ? computeSwitchSettlement({
                          fromRent: tenancy.rentPerMonth,
                          toRent: request.reservedRentPerMonth,
                        })
                      : null
                  const monthCleared = settlement
                    ? payments.some(
                        (payment) =>
                          payment.status === 'paid' &&
                          payment.month === settlement.month,
                      )
                    : true
                  const rentCredit = Math.max(
                    0,
                    Number(tenancy.rentCredit) || 0,
                  )
                  const credit = settlement
                    ? applyRentCredit(settlement.charge, rentCredit)
                    : null
                  const creditAfterMove = settlement
                    ? (credit?.creditLeft ?? 0) + settlement.credit
                    : rentCredit
                  const totalDue = settlement
                    ? (Number(request.amount) || 0) + credit.amountDue
                    : Number(request.amount) || 0
                  const canPay = Boolean(settlement) && monthCleared

                  return (
                    <div key={request.id} className="card p-4">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-charcoal">
                            {request.fromHostelName} → {request.toHostelName}
                          </p>
                          <p className="mt-0.5 text-xs text-charcoal/70">
                            Requested {requestedOn} ·{' '}
                            <span className="font-semibold tabular-nums text-forest">
                              {formatRupees(request.amount)}
                            </span>{' '}
                            switch fee
                          </p>
                        </div>

                        <StatusBadge status={request.status} />
                      </div>

                      {currentStage !== null && (
                        <ol
                          className="mt-3 grid grid-cols-4 gap-1.5"
                          aria-label="Switch progress"
                        >
                          {TRACK_STEPS.map((label, index) => {
                            const done = index < currentStage
                            const current = index === currentStage
                            return (
                              <li key={label}>
                                <span
                                  aria-hidden="true"
                                  className={`block h-1 rounded-full ${
                                    done || current ? 'bg-forest' : 'bg-line'
                                  }`}
                                />
                                <span
                                  className={`mt-1 block text-[11px] leading-tight ${
                                    current
                                      ? 'font-semibold text-charcoal'
                                      : done
                                        ? 'text-charcoal/65'
                                        : 'text-charcoal/40'
                                  }`}
                                >
                                  {label}
                                </span>
                              </li>
                            )
                          })}
                        </ol>
                      )}

                      {isPending && (
                        <p className="mt-2 text-sm text-charcoal/65">
                          Waiting for the owner to confirm availability. Nothing
                          has been charged.
                        </p>
                      )}

                      {isApproved && hasReservedBed && (
                        <div className="mt-3 rounded-card border border-success/25 bg-success-soft/60 p-3">
                          <p className="text-sm font-medium text-charcoal">
                            Reserved: room {request.reservedRoomNumber}, bed{' '}
                            {request.reservedBedNumber}
                            {request.reservedRentPerMonth
                              ? ` · ${formatRupees(request.reservedRentPerMonth)}/month`
                              : ''}
                          </p>
                          <p className="mt-1 text-xs text-charcoal/65">
                            Your current bed stays yours until this fee is paid.
                            {settlement
                              ? ` Rent changes from ${formatRupees(settlement.fromRent)} to ${formatRupees(settlement.toRent)}/month.`
                              : ''}
                          </p>

                          {settlement ? (
                            <>
                              <dl className="mt-3 space-y-1 border-t border-success/20 pt-2 text-xs">
                                <div className="flex justify-between gap-3">
                                  <dt className="text-charcoal/70">
                                    Switch fee
                                  </dt>
                                  <dd className="tabular-nums text-charcoal">
                                    +{formatRupees(request.amount)}
                                  </dd>
                                </div>
                                <div className="flex justify-between gap-3">
                                  <dt className="text-charcoal/70">
                                    Rent at {request.toHostelName} (
                                    {formatDaysLeft(settlement)} left in{' '}
                                    {monthRangeLabel(settlement)})
                                  </dt>
                                  <dd className="tabular-nums text-charcoal">
                                    +{formatRupees(settlement.toDue)}
                                  </dd>
                                </div>
                                <div className="flex justify-between gap-3">
                                  <dt className="text-charcoal/70">
                                    Unused days at {request.fromHostelName}
                                  </dt>
                                  <dd className="tabular-nums text-charcoal">
                                    −{formatRupees(settlement.fromCredit)}
                                  </dd>
                                </div>
                                <div className="flex justify-between gap-3 font-medium">
                                  <dt className="text-charcoal">
                                    {settlement.charge > 0
                                      ? 'Rent difference'
                                      : settlement.credit > 0
                                        ? 'Rent credit'
                                        : 'Rent difference'}
                                  </dt>
                                  <dd className="tabular-nums text-charcoal">
                                    {settlement.charge > 0
                                      ? `+${formatRupees(settlement.charge)}`
                                      : settlement.credit > 0
                                        ? `−${formatRupees(settlement.credit)}`
                                        : formatRupees(0)}
                                  </dd>
                                </div>
                                {credit?.creditApplied > 0 && (
                                  <div className="flex justify-between gap-3">
                                    <dt className="text-charcoal/70">
                                      Existing rent credit applied
                                    </dt>
                                    <dd className="tabular-nums text-charcoal">
                                      −{formatRupees(credit.creditApplied)}
                                    </dd>
                                  </div>
                                )}
                                <div className="flex justify-between gap-3 border-t border-success/20 pt-1.5 text-sm font-semibold">
                                  <dt className="text-charcoal">
                                    Total to pay now
                                  </dt>
                                  <dd className="tabular-nums text-forest">
                                    {formatRupees(totalDue)}
                                  </dd>
                                </div>
                              </dl>

                              {creditAfterMove > 0 && (
                                <p className="mt-2 text-xs text-charcoal/65">
                                  {formatRupees(creditAfterMove)} credit will be
                                  applied to next month&apos;s rent.
                                </p>
                              )}
                            </>
                          ) : (
                            <p className="mt-2 text-xs text-danger">
                              The rent difference could not be calculated — ask
                              the owner to check both room rents.
                            </p>
                          )}

                          {settlement && !monthCleared && (
                            <Alert tone="warning" className="mt-3">
                              Clear your {monthRangeLabel(settlement)} rent
                              before moving so unused days can be credited.{' '}
                              <Link to="/tenant/payments" className="link">
                                Pay rent
                              </Link>
                            </Alert>
                          )}

                          <Button
                            size="sm"
                            className="mt-3"
                            onClick={() => handlePay(request)}
                            disabled={isSaving || !canPay}
                          >
                            {isSaving
                              ? 'Processing...'
                              : !settlement
                                ? 'Contact owner'
                                : !monthCleared
                                  ? 'Clear rent first'
                                  : `Pay ${formatRupees(totalDue)} & move`}
                          </Button>
                        </div>
                      )}

                      {isApproved && !hasReservedBed && (
                        <Alert tone="warning" className="mt-3">
                          This older request was approved without a specific bed
                          being reserved, so it cannot be completed. Cancel it and
                          raise a new request so the owner can reserve a bed for
                          you.
                        </Alert>
                      )}

                      {isCompleted && (
                        <>
                          <p className="mt-2 text-sm text-charcoal/70">
                            Moved on{' '}
                            {request.completedOn ?? request.paidOn ?? '—'}
                            {hasReservedBed
                              ? ` to room ${request.reservedRoomNumber}, bed ${request.reservedBedNumber}`
                              : ''}
                            .{' '}
                            {request.reservedRentPerMonth
                              ? `New rent ${formatRupees(request.reservedRentPerMonth)}/month.`
                              : ''}
                          </p>
                          {request.rentSettlement && (
                            <p className="mt-1 text-xs text-charcoal/60">
                              Rent for {request.rentSettlement.month} was settled
                              at move time
                              {request.rentSettlement.charged > 0
                                ? `: ${formatRupees(request.rentSettlement.charged)} charged for the difference`
                                : ''}
                              {request.rentSettlement.creditLeft > 0
                                ? `${request.rentSettlement.charged > 0 ? ' and' : ':'} ${formatRupees(request.rentSettlement.creditLeft)} credit added to your next rent`
                                : '.'}
                            </p>
                          )}
                        </>
                      )}

                      {request.status === 'rejected' && (
                        <p className="mt-2 text-sm text-charcoal/70">
                          Declined by the owner
                          {request.decisionNote
                            ? `: ${request.decisionNote}`
                            : '.'}
                        </p>
                      )}

                      {request.status === 'cancelled' && (
                        <p className="mt-2 text-sm text-charcoal/70">
                          {request.cancelledByTenant
                            ? 'You cancelled this request.'
                            : 'The owner released the bed held for this request.'}
                          {request.decisionNote
                            ? ` ${request.decisionNote}`
                            : ''}
                        </p>
                      )}

                      {request.status === 'unpaid' && (
                        <p className="mt-2 text-sm text-charcoal/70">
                          This older request was never paid for and cannot be
                          completed. Start a new switch request above.
                        </p>
                      )}

                      {(isPending || isApproved) && (
                        <div className="mt-3 flex justify-end border-t border-line pt-3">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleCancel(request)}
                            disabled={isSaving}
                          >
                            Cancel request
                          </Button>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </section>
      </div>
    </section>
  )
}
