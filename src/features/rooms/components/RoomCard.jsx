import BedRow from './BedRow'
import Button from '../../../components/ui/Button'
import formatRupees from '../../../utils/formatRupees'

// One room with its list of beds, plus edit/delete actions.
export default function RoomCard({
  room,
  beds,
  assignableTenants,
  isSaving,
  onEdit,
  onDelete,
  onAssign,
  onFree,
}) {
  return (
    <div className="card p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-charcoal">
            Room {room.roomNumber}
          </h3>
          <p className="mt-0.5 text-xs text-charcoal/55">
            Floor {room.floor} · {formatRupees(room.rentPerMonth)}/month ·{' '}
            {beds.length} beds
          </p>
        </div>

        <div className="flex shrink-0 flex-wrap gap-2">
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

      <div className="mt-4 border-t border-line pt-2">
        <p className="eyebrow">Beds</p>

        {beds.length === 0 && (
          <p className="mt-2 text-sm text-charcoal/55">No beds in this room.</p>
        )}

        {beds.map((bed) => (
          <BedRow
            key={bed.id}
            bed={bed}
            assignableTenants={assignableTenants}
            isSaving={isSaving}
            onAssign={(targetBed, tenant) => onAssign(targetBed, tenant, room)}
            onFree={onFree}
          />
        ))}
      </div>
    </div>
  )
}
