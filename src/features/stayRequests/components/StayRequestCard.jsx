const STATUS_STYLES = {
  pending: 'bg-amber-100 text-amber-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
}

// One stay request. The owner dashboard passes approve/reject handlers; the
// tenant dashboard omits them and only shows the status.
export default function StayRequestCard({ request, isDeciding, onApprove, onReject }) {
  const showActions =
    Boolean(onApprove) && Boolean(onReject) && request.status === 'pending'

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-slate-900">{request.hostelName}</h3>
          <p className="text-sm text-slate-500">
            {request.tenantName} · {request.tenantEmail}
          </p>
          <p className="text-sm text-slate-500">
            Requested on {request.requestedOn}
            {request.decidedOn ? ` · Decided on ${request.decidedOn}` : ''}
          </p>
        </div>

        <span
          className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold capitalize ${STATUS_STYLES[request.status] ?? 'bg-slate-100 text-slate-600'}`}
        >
          {request.status}
        </span>
      </div>

      {request.phone && (
        <p className="mt-3 text-sm text-slate-600">Phone: {request.phone}</p>
      )}

      {request.message && (
        <p className="mt-2 text-slate-600">“{request.message}”</p>
      )}

      {showActions && (
        <div className="mt-4 flex gap-3">
          <button
            type="button"
            onClick={onApprove}
            disabled={isDeciding}
            className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-60"
          >
            Approve
          </button>
          <button
            type="button"
            onClick={onReject}
            disabled={isDeciding}
            className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
          >
            Reject
          </button>
        </div>
      )}
    </div>
  )
}
