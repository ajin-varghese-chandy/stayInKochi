import { BedDouble, Building2, MapPin, MoveRight } from 'lucide-react'
import Button from '../../../components/ui/Button'
import formatRupees from '../../../utils/formatRupees'

// How a branch's rent compares with where the tenant lives right now.
function rentComparison(rent, currentRent) {
  if (!Number.isFinite(rent) || !Number.isFinite(currentRent)) return null

  const difference = rent - currentRent
  if (difference === 0) return 'Same rent as your current branch'

  return difference < 0
    ? `${formatRupees(Math.abs(difference))}/month less than now`
    : `${formatRupees(difference)}/month more than now`
}

// One branch the tenant could move to, with enough detail to compare it with
// their current home: photo, address, amenities, rent difference, and beds.
export default function SwitchOptionCard({
  hostel,
  currentRent,
  inventory,
  feeRupees,
  disabled,
  isSaving,
  onSwitch,
}) {
  const rooms = inventory?.rooms ?? []
  const freeBeds = inventory?.freeBeds ?? 0
  const totalBeds = inventory?.totalBeds ?? 0
  const hasInventory = rooms.length > 0 || totalBeds > 0
  const hasBeds = totalBeds > 0
  const fullyOccupied = hasBeds && freeBeds === 0
  const comparison = rentComparison(hostel.rentPerMonth, currentRent)

  let availability = 'Room details not published yet'
  if (hasBeds) {
    availability =
      freeBeds > 0
        ? `${freeBeds} of ${totalBeds} ${totalBeds === 1 ? 'bed' : 'beds'} free`
        : 'Fully occupied right now'
  } else if (hasInventory) {
    availability = 'Beds not listed yet'
  }

  const amenities = hostel.amenities ?? []
  const roomRents = rooms
    .map((room) => Number(room.rentPerMonth))
    .filter((rent) => Number.isFinite(rent))
  const lowestRent = roomRents.length ? Math.min(...roomRents) : null
  const highestRent = roomRents.length ? Math.max(...roomRents) : null
  const roomRentRange =
    lowestRent === null
      ? null
      : lowestRent === highestRent
        ? formatRupees(lowestRent)
        : `${formatRupees(lowestRent)}–${formatRupees(highestRent)}`

  return (
    <article className="card flex flex-col overflow-hidden">
      {hostel.image && (
        <img
          src={hostel.image}
          alt={`${hostel.name} branch`}
          loading="lazy"
          className="h-36 w-full object-cover"
        />
      )}

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-base font-semibold leading-snug text-charcoal">
              {hostel.name}
            </h3>
            <p className="mt-1 flex items-center gap-1.5 text-xs text-charcoal/60">
              <MapPin size={13} strokeWidth={1.75} aria-hidden="true" />
              {hostel.location ?? 'Kochi'}
            </p>
          </div>

          <p className="shrink-0 text-right">
            <span className="text-base font-semibold text-forest tabular-nums">
              {formatRupees(hostel.rentPerMonth)}
            </span>
            <span className="block text-xs text-charcoal/55">/month</span>
          </p>
        </div>

        {hostel.description && (
          <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-charcoal/70">
            {hostel.description}
          </p>
        )}

        {comparison && (
          <p className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-charcoal/70">
            <MoveRight size={13} strokeWidth={1.75} aria-hidden="true" />
            {comparison}
          </p>
        )}

        {amenities.length > 0 && (
          <ul className="mt-3 flex flex-wrap gap-1.5">
            {amenities.slice(0, 4).map((amenity) => (
              <li
                key={amenity}
                className="rounded-card border border-line bg-ivory px-2 py-0.5 text-xs text-charcoal/70"
              >
                {amenity}
              </li>
            ))}
            {amenities.length > 4 && (
              <li className="rounded-card border border-line px-2 py-0.5 text-xs text-charcoal/55">
                +{amenities.length - 4}
              </li>
            )}
          </ul>
        )}

        <dl className="mt-4 space-y-1.5 border-t border-line pt-3 text-xs">
          <div className="flex items-center gap-1.5">
            <BedDouble
              size={13}
              strokeWidth={1.75}
              className="text-charcoal/45"
              aria-hidden="true"
            />
            <dt className="text-charcoal/60">Beds</dt>
            <dd
              className={`ml-auto font-medium ${
                fullyOccupied ? 'text-danger' : 'text-charcoal'
              }`}
            >
              {availability}
            </dd>
          </div>
          {rooms.length > 0 && (
            <div className="flex items-center gap-1.5">
              <Building2
                size={13}
                strokeWidth={1.75}
                className="text-charcoal/45"
                aria-hidden="true"
              />
              <dt className="text-charcoal/60">Rooms</dt>
              <dd className="ml-auto font-medium text-charcoal">
                {rooms.length} listed
                {totalBeds > 0 ? ` · ${totalBeds} beds` : ''}
              </dd>
            </div>
          )}
          {roomRentRange && (
            <div className="flex items-center gap-1.5">
              <span
                aria-hidden="true"
                className="w-[13px] text-center text-charcoal/45"
              >
                ₹
              </span>
              <dt className="text-charcoal/60">Room rents</dt>
              <dd className="ml-auto font-medium text-charcoal">
                {roomRentRange}/month
              </dd>
            </div>
          )}
        </dl>

        <div className="mt-auto pt-4">
          <div className="flex items-end justify-between gap-3 border-t border-line pt-3">
            <p className="text-xs text-charcoal/55">
              <span className="block text-base font-semibold tabular-nums text-forest">
                {formatRupees(feeRupees)}
              </span>
              one-time switch fee
            </p>

            <Button
              size="sm"
              onClick={() => onSwitch(hostel)}
              disabled={disabled || isSaving || fullyOccupied}
              title={
                fullyOccupied
                  ? 'No free beds at this branch right now'
                  : undefined
              }
            >
              {isSaving
                ? 'Sending...'
                : fullyOccupied
                  ? 'Fully occupied'
                  : 'Request switch'}
            </Button>
          </div>
        </div>
      </div>
    </article>
  )
}
