import BedRow from './BedRow'
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
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-slate-900">
            Room {room.roomNumber}
          </h3>
          <p className="text-sm text-slate-500">
            Floor {room.floor} · {formatRupees(room.rentPerMonth)}
            /month · {beds.length} beds
          </p>
        </div>

        <div className="flex gap-2 text-sm">
          <button
            type="button"
            onClick={onEdit}
            className="rounded-md border border-slate-300 px-3 py-1.5 text-slate-700 hover:bg-slate-100"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={onDelete}
            disabled={isSaving}
            className="rounded-md border border-red-300 px-3 py-1.5 text-red-600 hover:bg-red-50 disabled:opacity-60"
          >
            Delete
          </button>
        </div>
      </div>

      <div className="mt-3">
        <h4 className="text-sm font-medium text-slate-500">Beds</h4>

        {beds.length === 0 && (
          <p className="mt-1 text-sm text-slate-400">No beds in this room.</p>
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
