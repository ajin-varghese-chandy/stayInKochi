import { Link } from 'react-router-dom'
import { MapPin } from 'lucide-react'
import formatRupees from '../../../utils/formatRupees'

// One branch in the public list.
//   variant="card"     vertical, image-led (default)
//   variant="feature"  horizontal, used for the first/result lead item
export default function HostelCard({ hostel, variant = 'card', meta }) {
  const image = (
    <img
      src={hostel.image}
      alt={hostel.name}
      loading="lazy"
      className="h-52 w-full object-cover transition-transform duration-300 group-hover:scale-[1.02] sm:h-56"
    />
  )

  const body = (
    <div className="flex flex-1 flex-col p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 className="font-serif text-xl leading-snug text-charcoal transition-colors group-hover:text-forest">
            {hostel.name}
          </h2>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-charcoal/60">
            <MapPin size={14} strokeWidth={1.75} aria-hidden="true" />
            {hostel.location}
          </p>
        </div>
        <p className="shrink-0 text-right">
          <span className="text-base font-semibold text-forest tabular-nums">
            {formatRupees(hostel.rentPerMonth)}
          </span>
          <span className="block text-xs text-charcoal/55">per month</span>
        </p>
      </div>

      <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-charcoal/70">
        {hostel.description}
      </p>

      {meta && <div className="mt-4">{meta}</div>}

      {hostel.amenities?.length > 0 && (
        <ul className="mt-4 flex flex-wrap gap-1.5">
          {hostel.amenities.slice(0, 4).map((amenity) => (
            <li
              key={amenity}
              className="rounded-card border border-line bg-ivory px-2 py-0.5 text-xs text-charcoal/70"
            >
              {amenity}
            </li>
          ))}
        </ul>
      )}

      <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-forest">
        View branch
        <span aria-hidden="true" className="transition-transform group-hover:translate-x-0.5">
          →
        </span>
      </span>
    </div>
  )

  if (variant === 'feature') {
    return (
      <Link
        to={`/hostels/${hostel.id}`}
        className="group card flex flex-col overflow-hidden sm:flex-row"
      >
        <div className="w-full shrink-0 overflow-hidden sm:w-1/2 lg:w-[55%]">
          <img
            src={hostel.image}
            alt={hostel.name}
            className="h-56 w-full object-cover transition-transform duration-300 group-hover:scale-[1.02] sm:h-full sm:min-h-64"
          />
        </div>
        {body}
      </Link>
    )
  }

  return (
    <Link
      to={`/hostels/${hostel.id}`}
      className="group card flex flex-col overflow-hidden"
    >
      <div className="overflow-hidden">{image}</div>
      {body}
    </Link>
  )
}
