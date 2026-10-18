import Button from '../../../components/ui/Button'
import formatRupees from '../../../utils/formatRupees'

// One branch row on the owner's branch management screen.
export default function OwnerHostelCard({ hostel, isSaving, onEdit, onDelete }) {
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-charcoal">{hostel.name}</h3>
          <p className="mt-0.5 text-xs text-charcoal/55">
            {hostel.location} · {hostel.amenities?.length ?? 0} amenities
          </p>
        </div>

        <p className="shrink-0 text-right">
          <span className="text-sm font-semibold tabular-nums text-forest">
            {formatRupees(hostel.rentPerMonth)}
          </span>
          <span className="block text-xs text-charcoal/55">per month</span>
        </p>
      </div>

      {hostel.description && (
        <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-charcoal/70">
          {hostel.description}
        </p>
      )}

      <div className="mt-4 flex flex-wrap justify-end gap-2 border-t border-line pt-3">
        <Button to={`/owner/hostels/${hostel.id}`} size="sm">
          Manage rooms
        </Button>
        <Button size="sm" variant="secondary" onClick={onEdit}>
          Edit
        </Button>
        <Button
          size="sm"
          variant="danger"
          onClick={onDelete}
          disabled={isSaving}
        >
          Delete
        </Button>
      </div>
    </div>
  )
}
