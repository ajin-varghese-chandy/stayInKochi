import { Link } from 'react-router-dom'

const STATUS_STYLES = {
  pending: 'bg-amber-100 text-amber-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  unpaid: 'bg-slate-100 text-slate-600',
  cancelled: 'bg-slate-100 text-slate-600',
}

// One hostel-switch request. Shows approve/reject only while it is pending.
export default function SwitchRequestCard({
  request,
  isSaving,
  onApprove,
  onReject,
}) {
  const isPending = request.status === 'pending'

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-medium text-slate-900">{request.tenantName}</p>
          <p className="text-sm text-slate-600">
            {request.fromHostelName} → {request.toHostelName}
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Fee ₹{request.amount?.toLocaleString('en-IN')} · requested{' '}
            {request.createdAt}
          </p>
        </div>

        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${STATUS_STYLES[request.status] ?? 'bg-slate-100 text-slate-600'}`}
        >
          {request.status}
        </span>
      </div>

      {isPending && (
        <div className="mt-4 flex gap-3">
          <button
            type="button"
            onClick={() => onApprove(request)}
            disabled={isSaving}
            className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-60"
          >
            Approve
          </button>
          <button
            type="button"
            onClick={() => onReject(request)}
            disabled={isSaving}
            className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
          >
            Reject
          </button>
        </div>
      )}

      {/* An approved switch frees the old bed but does not hand out a new
          one, so point the owner at the screen where they assign it. */}
      {request.status === 'approved' && request.toHostelId && (
        <div className="mt-4 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          {request.tenantName} now has no bed at {request.toHostelName}.{' '}
          <Link
            to={`/owner/hostels/${String(request.toHostelId)}`}
            className="font-medium text-indigo-600 underline"
          >
            Assign one
          </Link>
        </div>
      )}
    </div>
  )
}
