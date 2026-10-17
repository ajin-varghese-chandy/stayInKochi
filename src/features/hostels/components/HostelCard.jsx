import { Link } from 'react-router-dom'
import formatRupees from '../../../utils/formatRupees'

// Card summarising one hostel in the public browse list.
export default function HostelCard({ hostel }) {
  return (
    <Link
      to={`/hostels/${hostel.id}`}
      className="group overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm hover:shadow-md"
    >
      <img
        src={hostel.image}
        alt={hostel.name}
        className="h-48 w-full object-cover"
      />

      <div className="p-4">
        <h2 className="text-lg font-semibold text-slate-900 group-hover:text-indigo-600">
          {hostel.name}
        </h2>
        <p className="mt-1 text-sm text-slate-500">{hostel.location}</p>
        <p className="mt-3 line-clamp-2 text-slate-600">{hostel.description}</p>

        <p className="mt-3 font-semibold text-indigo-600">
          {formatRupees(hostel.rentPerMonth)}
          <span className="font-normal text-slate-500"> /month</span>
        </p>
      </div>
    </Link>
  )
}
