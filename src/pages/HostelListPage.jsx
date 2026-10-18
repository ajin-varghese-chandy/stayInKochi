import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useSearchParams } from 'react-router-dom'
import { BedDouble, SearchX } from 'lucide-react'
import EmptyState from '../components/ui/EmptyState'
import Alert from '../components/ui/Alert'
import Button from '../components/ui/Button'
import SearchInput from '../components/ui/SearchInput'
import Spinner from '../components/common/Spinner'
import HostelCard from '../features/hostels/components/HostelCard'
import {
  fetchHostels,
  selectHostels,
  selectHostelsError,
  selectHostelsLoading,
} from '../features/hostels/hostelSlice'
import { getAllBeds } from '../features/rooms/bedService'
import { getAllRooms } from '../features/rooms/roomService'
import formatRupees from '../utils/formatRupees'

// Public branch list: search + filters for area, price, room size, amenities,
// and availability — all evaluated against live branch, room, and bed data.
export default function HostelListPage() {
  const dispatch = useDispatch()
  const hostels = useSelector(selectHostels)
  const isLoading = useSelector(selectHostelsLoading)
  const error = useSelector(selectHostelsError)

  // Seed the search box from ?q= (the landing-page hero posts into it).
  const [searchParams] = useSearchParams()
  const [query, setQuery] = useState(() => searchParams.get('q') ?? '')

  const [location, setLocation] = useState('all')
  const [maxPrice, setMaxPrice] = useState('all')
  const [roomSize, setRoomSize] = useState('all')
  const [amenity, setAmenity] = useState('all')
  const [onlyAvailable, setOnlyAvailable] = useState(false)

  // Availability and room sizes come from beds/rooms, fetched once per load.
  const [beds, setBeds] = useState([])
  const [rooms, setRooms] = useState([])

  useEffect(() => {
    dispatch(fetchHostels())
    getAllBeds().then(setBeds).catch(() => setBeds([]))
    getAllRooms().then(setRooms).catch(() => setRooms([]))
  }, [dispatch])

  const locations = useMemo(
    () => [...new Set(hostels.map((h) => h.location))].sort(),
    [hostels],
  )
  const amenities = useMemo(
    () => [...new Set(hostels.flatMap((h) => h.amenities ?? []))].sort(),
    [hostels],
  )
  const priceOptions = useMemo(
    () => [...new Set(hostels.map((h) => h.rentPerMonth))]
      .filter(Number.isFinite)
      .sort((a, b) => a - b),
    [hostels],
  )

  const freeBedsByHostel = useMemo(() => {
    const counts = new Map()
    beds.forEach((bed) => {
      if (bed.status === 'available') {
        counts.set(String(bed.hostelId), (counts.get(String(bed.hostelId)) ?? 0) + 1)
      }
    })
    return counts
  }, [beds])

  const roomSizesByHostel = useMemo(() => {
    const sizes = new Map()
    rooms.forEach((room) => {
      const key = String(room.hostelId)
      if (!sizes.has(key)) sizes.set(key, new Set())
      sizes.get(key).add(Number(room.bedCount))
    })
    return sizes
  }, [rooms])

  const filtered = hostels.filter((hostel) => {
    const q = query.trim().toLowerCase()
    if (
      q &&
      !hostel.name.toLowerCase().includes(q) &&
      !hostel.location.toLowerCase().includes(q) &&
      !(hostel.description ?? '').toLowerCase().includes(q)
    ) {
      return false
    }

    if (location !== 'all' && hostel.location !== location) return false

    if (maxPrice !== 'all' && hostel.rentPerMonth > Number(maxPrice)) {
      return false
    }

    if (amenity !== 'all' && !(hostel.amenities ?? []).includes(amenity)) {
      return false
    }

    if (onlyAvailable && (freeBedsByHostel.get(String(hostel.id)) ?? 0) === 0) {
      return false
    }

    if (roomSize !== 'all') {
      const sizes = roomSizesByHostel.get(String(hostel.id))
      if (!sizes || !sizes.has(Number(roomSize))) return false
    }

    return true
  })

  const hasFilters =
    query.trim() !== '' ||
    location !== 'all' ||
    maxPrice !== 'all' ||
    roomSize !== 'all' ||
    amenity !== 'all' ||
    onlyAvailable

  function clearFilters() {
    setQuery('')
    setLocation('all')
    setMaxPrice('all')
    setRoomSize('all')
    setAmenity('all')
    setOnlyAvailable(false)
  }

  function availabilityLabel(hostel) {
    const free = freeBedsByHostel.get(String(hostel.id)) ?? 0
    if (free === 0) {
      return (
        <span className="inline-flex items-center gap-1.5 text-xs text-charcoal/55">
          <BedDouble size={14} strokeWidth={1.75} aria-hidden="true" />
          No beds free right now
        </span>
      )
    }
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-success">
        <BedDouble size={14} strokeWidth={1.75} aria-hidden="true" />
        {free} {free === 1 ? 'bed free' : 'beds free'}
      </span>
    )
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
      <p className="eyebrow text-terracotta">StayInKochi</p>
      <h1 className="mt-2 font-serif text-3xl text-charcoal sm:text-4xl">
        Branches
      </h1>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-charcoal/70">
        Every branch is run by the same owner, with the same rules for rent,
        food, and upkeep. Filter by what matters to you.
      </p>

      {/* Filters */}
      <div className="card mt-7 p-4 sm:p-5">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2">
            <SearchInput
              label="Search"
              value={query}
              onChange={setQuery}
              placeholder="Branch name, area, or description…"
            />
          </div>

          <label className="block">
            <span className="field-label">Area</span>
            <select
              value={location}
              onChange={(event) => setLocation(event.target.value)}
              className="field"
            >
              <option value="all">All areas</option>
              {locations.map((place) => (
                <option key={place} value={place}>
                  {place}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="field-label">Rent up to</span>
            <select
              value={maxPrice}
              onChange={(event) => setMaxPrice(event.target.value)}
              className="field"
            >
              <option value="all">Any rent</option>
              {priceOptions.map((price) => (
                <option key={price} value={price}>
                  {formatRupees(price)}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="field-label">Room size</span>
            <select
              value={roomSize}
              onChange={(event) => setRoomSize(event.target.value)}
              className="field"
            >
              <option value="all">Any size</option>
              <option value="1">1-bed room</option>
              <option value="2">2-bed room</option>
              <option value="3">3-bed or larger</option>
            </select>
          </label>

          <label className="block">
            <span className="field-label">Amenity</span>
            <select
              value={amenity}
              onChange={(event) => setAmenity(event.target.value)}
              className="field"
            >
              <option value="all">Any amenity</option>
              {amenities.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>

          <label className="flex min-h-11 cursor-pointer items-center gap-2.5 self-end rounded-card border border-line bg-ivory px-3 py-2.5 text-sm text-charcoal/80">
            <input
              type="checkbox"
              checked={onlyAvailable}
              onChange={(event) => setOnlyAvailable(event.target.checked)}
              className="size-4 accent-forest"
            />
            Only branches with free beds
          </label>

          <div className="flex items-end justify-between gap-3 lg:col-span-4">
            <p className="text-sm text-charcoal/60" aria-live="polite">
              {isLoading
                ? 'Loading branches…'
                : `${filtered.length} of ${hostels.length} ${
                    hostels.length === 1 ? 'branch' : 'branches'
                  }`}
            </p>
            {hasFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Clear filters
              </Button>
            )}
          </div>
        </div>
      </div>

      {error && (
        <Alert tone="error" className="mt-6">
          Could not load branches: {error}
        </Alert>
      )}

      {isLoading && <Spinner label="Loading branches…" />}

      {!isLoading && !error && filtered.length === 0 && (
        <EmptyState
          className="mt-6"
          icon={SearchX}
          title="No branches match these filters"
          hint={
            hasFilters
              ? 'Try widening the rent, area, or amenity filter.'
              : 'No branches have been published yet.'
          }
          action={
            hasFilters ? (
              <Button variant="secondary" onClick={clearFilters}>
                Clear filters
              </Button>
            ) : null
          }
        />
      )}

      {!isLoading && !error && filtered.length > 0 && (
        <div className="mt-6 space-y-5">
          <HostelCard
            hostel={filtered[0]}
            variant="feature"
            meta={availabilityLabel(filtered[0])}
          />
          {filtered.length > 1 && (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.slice(1).map((hostel) => (
                <HostelCard
                  key={hostel.id}
                  hostel={hostel}
                  meta={availabilityLabel(hostel)}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  )
}
