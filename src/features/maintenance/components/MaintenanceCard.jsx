const STATUS_STYLES = {
  open: 'bg-amber-100 text-amber-700',
  'in-progress': 'bg-blue-100 text-blue-700',
  resolved: 'bg-green-100 text-green-700',
}

// One maintenance request. Pass `onStatusChange` (owner view) to allow the
// status to be updated; otherwise the status is only displayed.
export default function MaintenanceCard({
  request,
  isSaving,
  onStatusChange,
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-slate-900">{request.title}</h3>
          <p className="text-sm text-slate-500">
            {request.hostelName ?? 'Hostel'} · {request.tenantName ?? 'Tenant'}{' '}
            · {request.createdAt?.slice(0, 10)}
          </p>
        </div>

        <span
          className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold capitalize ${STATUS_STYLES[request.status] ?? 'bg-slate-100 text-slate-600'}`}
        >
          {request.status?.replace('-', ' ')}
        </span>
      </div>

      {request.description && (
        <p className="mt-3 text-slate-600">{request.description}</p>
      )}

      {request.imageUrl && (
        <a
          href={request.imageUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-3 inline-block"
        >
          <img
            src={request.imageUrl}
            alt="Maintenance photo"
            className="h-40 rounded-md object-cover"
          />
        </a>
      )}

      {onStatusChange && (
        <div className="mt-4 flex items-center gap-2 text-sm">
          <label htmlFor={`status-${request.id}`} className="text-slate-500">
            Status:
          </label>
          <select
            id={`status-${request.id}`}
            value={request.status}
            onChange={(event) => onStatusChange(event.target.value)}
            disabled={isSaving}
            className="rounded-md border border-slate-300 px-2 py-1 text-slate-800 focus:border-indigo-500 focus:outline-none disabled:opacity-60"
          >
            <option value="open">Open</option>
            <option value="in-progress">In progress</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
      )}
    </div>
  )
}
