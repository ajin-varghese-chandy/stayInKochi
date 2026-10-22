import Button from '../../../components/ui/Button'
import StatusBadge from '../../../components/ui/StatusBadge'
import { VACATE_NOTICE_DAYS } from '../vacateSlice'

function roomLabel(request) {
  if (!request.roomNumber && !request.bedNumber) return 'Room not assigned'

  return [
    request.roomNumber ? `Room ${request.roomNumber}` : null,
    request.bedNumber ? `Bed ${request.bedNumber}` : null,
  ]
    .filter(Boolean)
    .join(' · ')
}

// One vacate request. Approving accepts the notice; "Mark vacated" is the
// action that actually frees the bed and ends the tenancy.
export default function VacateRequestCard({
  request,
  isSaving,
  onApprove,
  onReject,
  onComplete,
}) {
  const isPending = request.status === 'pending'
  const isApproved = request.status === 'approved'

  return (
    <div className="card p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-charcoal">
            {request.tenantName}
          </h3>
          <p className="mt-0.5 text-xs text-charcoal/55">
            {request.hostelName} · {roomLabel(request)}
          </p>
          <p className="mt-0.5 text-xs text-charcoal/55">
            Requested {request.requestedOn} · vacating {request.vacateOn} (
            {request.noticeDays ?? VACATE_NOTICE_DAYS}-day notice)
          </p>
          {request.reason && (
            <p className="mt-2 text-sm text-charcoal/70">“{request.reason}”</p>
          )}
        </div>

        <StatusBadge status={request.status} />
      </div>

      {isPending && (
        <div className="mt-4 flex flex-wrap justify-end gap-2 border-t border-line pt-3">
          <Button
            size="sm"
            onClick={() => onApprove(request)}
            disabled={isSaving}
          >
            Approve notice
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={() => onReject(request)}
            disabled={isSaving}
          >
            Reject
          </Button>
        </div>
      )}

      {isApproved && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-3">
          <p className="text-xs text-charcoal/55">
            Notice accepted — mark vacated once the room is handed over.
          </p>
          <Button
            size="sm"
            onClick={() => onComplete(request)}
            disabled={isSaving}
          >
            Mark vacated
          </Button>
        </div>
      )}
    </div>
  )
}
