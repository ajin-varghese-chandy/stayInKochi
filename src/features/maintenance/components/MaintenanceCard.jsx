import Button from '../../../components/ui/Button'
import StatusBadge from '../../../components/ui/StatusBadge'

// Statuses the owner can move a request between. The current one renders as
// the active (primary) action.
const STATUS_OPTIONS = [
  { value: 'open', label: 'Open' },
  { value: 'in-progress', label: 'In progress' },
  { value: 'resolved', label: 'Resolved' },
]

// One maintenance request. Pass `onStatusChange` (owner view) to allow the
// status to be updated; otherwise the status is only displayed.
export default function MaintenanceCard({
  request,
  isSaving,
  onStatusChange,
}) {
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-charcoal">{request.title}</h3>
          <p className="mt-0.5 text-xs text-charcoal/55">
            {request.hostelName ?? 'Branch'} · {request.tenantName ?? 'Tenant'} ·{' '}
            {request.createdAt?.slice(0, 10)}
          </p>
        </div>

        <StatusBadge status={request.status} />
      </div>

      {request.description && (
        <p className="mt-3 text-sm leading-relaxed text-charcoal/70">
          {request.description}
        </p>
      )}

      {request.imageUrl && (
        <a
          href={request.imageUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-3 block"
        >
          <img
            src={request.imageUrl}
            alt="Maintenance photo"
            className="h-40 w-full rounded-card border border-line object-cover"
          />
        </a>
      )}

      {onStatusChange && (
        <div className="mt-4 flex flex-wrap justify-end gap-2 border-t border-line pt-3">
          {STATUS_OPTIONS.map((option) => (
            <Button
              key={option.value}
              size="sm"
              variant={
                request.status === option.value ? 'primary' : 'secondary'
              }
              onClick={() => onStatusChange(option.value)}
              disabled={isSaving}
            >
              {option.label}
            </Button>
          ))}
        </div>
      )}
    </div>
  )
}
