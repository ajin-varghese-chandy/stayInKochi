import { useState } from 'react'
import { Link } from 'react-router-dom'
import Alert from '../../../components/ui/Alert'
import Button from '../../../components/ui/Button'
import StatusBadge from '../../../components/ui/StatusBadge'
import formatRupees from '../../../utils/formatRupees'

// One hostel-switch request. While it is pending, the owner picks the exact
// bed to reserve at the destination before approving; the tenant pays after.
export default function SwitchRequestCard({
  request,
  rooms = [],
  beds = [],
  inventoryLoading = false,
  isSaving,
  onApprove,
  onReject,
  onRelease,
}) {
  const [roomId, setRoomId] = useState('')
  const [bedId, setBedId] = useState('')
  const [showReject, setShowReject] = useState(false)
  const [reason, setReason] = useState('')

  const isPending = request.status === 'pending'
  const isApproved = request.status === 'approved'
  const isCompleted = request.status === 'completed'
  const requestedOn = request.requestedOn ?? request.createdAt ?? '—'

  const branchRooms = rooms.filter(
    (room) => String(room.hostelId) === String(request.toHostelId),
  )
  const freeBeds = beds.filter(
    (bed) =>
      String(bed.hostelId) === String(request.toHostelId) &&
      bed.status === 'available',
  )
  const roomsWithFreeBeds = branchRooms.filter((room) =>
    freeBeds.some((bed) => String(bed.roomId) === String(room.id)),
  )

  const selectedRoom = roomsWithFreeBeds.find(
    (room) => String(room.id) === String(roomId),
  )
  const selectableBeds = freeBeds.filter(
    (bed) => String(bed.roomId) === String(roomId),
  )
  const selectedBed = selectableBeds.find(
    (bed) => String(bed.id) === String(bedId),
  )

  function handleRoomChange(event) {
    setRoomId(event.target.value)
    setBedId('')
  }

  function handleApprove() {
    if (!selectedRoom || !selectedBed) return
    onApprove({ switchRequest: request, room: selectedRoom, bed: selectedBed })
  }

  function handleReject() {
    onReject({ switchRequest: request, reason })
    setShowReject(false)
    setReason('')
  }

  return (
    <div className="card p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-charcoal">
            {request.tenantName}
          </h3>
          <p className="mt-0.5 text-xs text-charcoal/55">
            {request.fromHostelName} → {request.toHostelName}
          </p>
          <p className="mt-0.5 text-xs text-charcoal/55">
            Fee {formatRupees(request.amount)} · requested {requestedOn}
          </p>
        </div>

        <StatusBadge status={request.status} />
      </div>

      {isPending && (
        <div className="mt-4 border-t border-line pt-3">
          <p className="eyebrow">Step 1 — reserve a bed at {request.toHostelName}</p>

          {inventoryLoading ? (
            <p className="mt-2 text-sm text-charcoal/60">
              Checking bed availability at {request.toHostelName}…
            </p>
          ) : roomsWithFreeBeds.length === 0 ? (
            <Alert tone="warning" className="mt-2">
              No free beds at {request.toHostelName}. Free a bed or add a room,
              then come back.{' '}
              <Link
                to={`/owner/hostels/${String(request.toHostelId)}`}
                className="link"
              >
                Open rooms
              </Link>
            </Alert>
          ) : (
            <>
              <p className="mt-1 text-xs text-charcoal/60">
                The bed is held for this tenant once you approve. They keep their
                current bed until the fee is paid, then any prorated rent
                difference is settled with the move.
              </p>

              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <label className="block">
                  <span className="field-label">Room</span>
                  <select
                    value={roomId}
                    onChange={handleRoomChange}
                    className="field"
                  >
                    <option value="">Select a room…</option>
                    {roomsWithFreeBeds.map((room) => (
                      <option key={room.id} value={room.id}>
                        Room {room.roomNumber} · Floor {room.floor} ·{' '}
                        {formatRupees(room.rentPerMonth)}/month
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="field-label">Bed</span>
                  <select
                    value={bedId}
                    onChange={(event) => setBedId(event.target.value)}
                    className="field"
                    disabled={!selectedRoom}
                  >
                    <option value="">
                      {selectedRoom ? 'Select a bed…' : 'Choose a room first'}
                    </option>
                    {selectableBeds.map((bed) => (
                      <option key={bed.id} value={bed.id}>
                        Bed {bed.bedNumber} · available
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              {selectedRoom &&
                request.fromRentPerMonth &&
                Number(selectedRoom.rentPerMonth) !==
                  Number(request.fromRentPerMonth) && (
                  <p className="mt-2 text-xs text-charcoal/60">
                    Rent will change from{' '}
                    {formatRupees(request.fromRentPerMonth)} to{' '}
                    {formatRupees(selectedRoom.rentPerMonth)}/month. The tenant
                    pays a prorated difference for the rest of this month.
                  </p>
                )}
            </>
          )}

          {showReject ? (
            <div className="mt-4 rounded-card border border-line bg-ivory p-3">
              <label className="block">
                <span className="field-label">
                  Reason for declining (optional)
                </span>
                <textarea
                  rows={2}
                  value={reason}
                  onChange={(event) => setReason(event.target.value)}
                  className="field"
                  placeholder="No suitable room at this branch, dates clash…"
                />
              </label>
              <div className="mt-3 flex flex-wrap justify-end gap-2">
                <Button
                  size="sm"
                  variant="danger"
                  onClick={handleReject}
                  disabled={isSaving}
                >
                  Confirm decline
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setShowReject(false)}
                  disabled={isSaving}
                >
                  Back
                </Button>
              </div>
            </div>
          ) : (
            <div className="mt-4 flex flex-wrap justify-end gap-2 border-t border-line pt-3">
              <Button
                size="sm"
                onClick={handleApprove}
                disabled={
                  isSaving || roomsWithFreeBeds.length === 0 || !selectedBed
                }
              >
                {isSaving ? 'Saving…' : 'Approve & reserve bed'}
              </Button>
              <Button
                size="sm"
                variant="danger"
                onClick={() => setShowReject(true)}
                disabled={isSaving}
              >
                Decline
              </Button>
            </div>
          )}
        </div>
      )}

      {isApproved && (
        <div className="mt-4 border-t border-line pt-3">
          {request.reservedBedId ? (
            <>
              <Alert tone="success">
                Room {request.reservedRoomNumber}, bed{' '}
                {request.reservedBedNumber}
                {request.reservedRentPerMonth
                  ? ` · ${formatRupees(request.reservedRentPerMonth)}/month`
                  : ''}{' '}
                is reserved. Waiting for {request.tenantName} to pay the{' '}
                {formatRupees(request.amount)} fee
                {request.fromRentPerMonth &&
                request.reservedRentPerMonth &&
                request.fromRentPerMonth !== request.reservedRentPerMonth
                  ? ' plus the mid-month rent difference'
                  : ''}
                .
              </Alert>
              <div className="mt-3 flex justify-end">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => onRelease(request)}
                  disabled={isSaving}
                >
                  Release reservation
                </Button>
              </div>
            </>
          ) : (
            <Alert tone="warning">
              Approved without a reserved bed. Ask the tenant to cancel and
              raise a new request so a bed can be held.
            </Alert>
          )}
        </div>
      )}

      {isCompleted && (
        <div className="mt-3 border-t border-line pt-3">
          <p className="text-sm text-charcoal/70">
            Moved on {request.completedOn ?? request.paidOn ?? '—'}
            {request.reservedBedId
              ? ` into room ${request.reservedRoomNumber}, bed ${request.reservedBedNumber}`
              : ''}
            . Fee paid{request.paymentId ? ` · ${request.paymentId}` : ''}.
          </p>
          {request.rentSettlement && (
            <p className="mt-1 text-xs text-charcoal/60">
              Rent settled for {request.rentSettlement.month}:{' '}
              {formatRupees(request.rentSettlement.fromCredit)} credited from{' '}
              {request.rentSettlement.fromHostelName},{' '}
              {formatRupees(request.rentSettlement.toDue)} charged at{' '}
              {request.rentSettlement.toHostelName}
              {request.rentSettlement.charged > 0
                ? ` — ${formatRupees(request.rentSettlement.charged)} collected.`
                : '.'}
            </p>
          )}
        </div>
      )}

      {request.status === 'rejected' && (
        <p className="mt-3 border-t border-line pt-3 text-sm text-charcoal/70">
          Declined{request.decidedOn ? ` on ${request.decidedOn}` : ''}
          {request.decisionNote ? `: ${request.decisionNote}` : '.'}
        </p>
      )}

      {request.status === 'cancelled' && (
        <p className="mt-3 border-t border-line pt-3 text-sm text-charcoal/70">
          {request.cancelledByTenant
            ? `Cancelled by ${request.tenantName}`
            : 'Reservation released'}
          {request.decidedOn ? ` on ${request.decidedOn}` : ''}.
          {request.decisionNote ? ` ${request.decisionNote}` : ''}
        </p>
      )}

      {request.status === 'unpaid' && (
        <p className="mt-3 border-t border-line pt-3 text-sm text-charcoal/70">
          This older request was never paid for and cannot be completed. Ask the
          tenant to raise a new request.
        </p>
      )}
    </div>
  )
}
