import { Link } from 'react-router-dom'
import Alert from '../../../components/ui/Alert'
import Button from '../../../components/ui/Button'
import StatusBadge from '../../../components/ui/StatusBadge'

// One hostel-switch request. Shows approve/reject only while it is pending.
export default function SwitchRequestCard({
  request,
  isSaving,
  onApprove,
  onReject,
}) {
  const isPending = request.status === 'pending'

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
            Fee ₹{request.amount?.toLocaleString('en-IN')} · requested{' '}
            {request.createdAt}
          </p>
        </div>

        <StatusBadge status={request.status} />
      </div>

      {isPending && (
        <div className="mt-4 flex flex-wrap justify-end gap-2 border-t border-line pt-3">
          <Button size="sm" onClick={() => onApprove(request)} disabled={isSaving}>
            Approve
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

      {/* An approved switch frees the old bed but does not hand out a new
          one, so point the owner at the screen where they assign it. */}
      {request.status === 'approved' && request.toHostelId && (
        <Alert tone="warning" className="mt-4">
          {request.tenantName} now has no bed at {request.toHostelName}.{' '}
          <Link
            to={`/owner/hostels/${String(request.toHostelId)}`}
            className="link"
          >
            Assign one
          </Link>
        </Alert>
      )}
    </div>
  )
}
