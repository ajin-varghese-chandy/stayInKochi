import { Link } from 'react-router-dom'
import formatRupees from '../../../utils/formatRupees'

// One branch row on the owner's branch management screen.
export default function OwnerHostelCard({ hostel, isSaving, onEdit, onDelete }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-slate-900">{hostel.name}</h3>
          <p className="text-sm text-slate-500">{hostel.location}</p>
          {hostel.description && (
            <p className="mt-1 line-clamp-1 text-sm text-slate-500">{hostel.description}</p>
          )}
          <p className="mt-1 font-semibold text-indigo-600">
            {formatRupees(hostel.rentPerMonth)}
            <span className="font-normal text-slate-500"> /month</span>
          </p>
        </div>
        <div className="shrink-0 text-right text-sm text-slate-500">
          <p>{hostel.amenities?.length ?? 0} amenities</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-3 text-sm">
        <Link
          to={`/owner/hostels/${hostel.id}`}
          className="rounded-md bg-indigo-600 px-3 py-1.5 font-medium text-white hover:bg-indigo-700"
        >
          Manage rooms
        </Link>
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
  )
}
