import { Link } from 'react-router-dom'
import { ArrowRight, MapPin } from 'lucide-react'
import formatRupees from '../../../utils/formatRupees'
import { hostelCoverPhoto } from '../../../utils/hostelPhotos'

// One branch in the public list.
//   variant="card"     uniform catalogue card (default) — `meta` renders as a
//                      badge over the photograph
//   variant="feature"  horizontal lead card (landing page) — `meta` renders in
//                      the body
export default function HostelCard({ hostel, variant = 'card', meta }) {
  const cover = hostelCoverPhoto(hostel)

  const body = (showMeta) => (
    <div className="flex flex-1 flex-col p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="display text-lg leading-snug text-charcoal transition-colors group-hover:text-forest">
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
          <span className="block text-xs text-charcoal/55">/month</span>
        </p>
      </div>

      <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-charcoal/70">
        {hostel.description}
      </p>

      {showMeta && meta && <div className="mt-3">{meta}</div>}

      {hostel.amenities?.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-1.5">
          {hostel.amenities.slice(0, 3).map((amenity) => (
            <li
              key={amenity}
              className="rounded-card border border-line bg-ivory px-2 py-0.5 text-xs text-charcoal/70"
            >
              {amenity}
            </li>
          ))}
          {hostel.amenities.length > 3 && (
            <li className="rounded-card border border-line px-2 py-0.5 text-xs text-charcoal/55">
              +{hostel.amenities.length - 3}
            </li>
          )}
        </ul>
      )}

      {/* Pushed to the bottom so every card in a row ends level */}
      <span className="mt-auto inline-flex items-center gap-1.5 pt-4 text-sm font-medium text-forest">
        View branch
        <ArrowRight
          size={15}
          strokeWidth={1.9}
          aria-hidden="true"
          className="transition-transform group-hover:translate-x-0.5"
        />
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
            src={cover}
            alt={hostel.name}
            className="h-56 w-full object-cover transition-transform duration-300 group-hover:scale-[1.02] sm:h-full sm:min-h-64"
          />
        </div>
        {body(true)}
      </Link>
    )
  }

  return (
    <Link
      to={`/hostels/${hostel.id}`}
      className="group card flex flex-col overflow-hidden"
    >
      <div className="relative overflow-hidden">
        <img
          src={cover}
          alt={hostel.name}
          loading="lazy"
          className="h-44 w-full object-cover transition-transform duration-300 group-hover:scale-[1.03] sm:h-48"
        />
        {meta && <div className="absolute top-3 left-3">{meta}</div>}
      </div>
      {body(false)}
    </Link>
  )
}
