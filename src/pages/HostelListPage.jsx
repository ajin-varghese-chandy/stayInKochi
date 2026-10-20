import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useSearchParams } from 'react-router-dom'
import { SearchX, SlidersHorizontal } from 'lucide-react'
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

const SORTS = [
  { key: 'recommended', label: 'Recommended' },
  { key: 'rent-asc', label: 'Rent: low to high' },
  { key: 'rent-desc', label: 'Rent: high to low' },
  { key: 'availability', label: 'Most beds free' },
]

// Availability badge shown over each branch photograph.
function AvailabilityBadge({ free }) {
  if (free === 0) {
    return <span className="badge badge-neutral">Fully occupied</span>
  }
  return (
    <span className="badge badge-success">
      {free} {free === 1 ? 'bed free' : 'beds free'}
    </span>
  )
}

// Public branch list: a slim sticky filter bar over a uniform card grid.
// Search and sort stay on screen while the results scroll underneath.
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
  const [sort, setSort] = useState('recommended')
  const [showFilters, setShowFilters] = useState(false)

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
    () =>
      [...new Set(hostels.map((h) => h.rentPerMonth))]
        .filter(Number.isFinite)
        .sort((a, b) => a - b),
    [hostels],
  )

  const freeBedsByHostel = useMemo(() => {
    const counts = new Map()
    beds.forEach((bed) => {
      if (bed.status === 'available') {
        counts.set(
          String(bed.hostelId),
          (counts.get(String(bed.hostelId)) ?? 0) + 1,
        )
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

  const freeBeds = (hostel) => freeBedsByHostel.get(String(hostel.id)) ?? 0

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

    if (onlyAvailable && freeBeds(hostel) === 0) return false

    if (roomSize !== 'all') {
      const sizes = roomSizesByHostel.get(String(hostel.id))
      if (!sizes || !sizes.has(Number(roomSize))) return false
    }

    return true
  })

  const sorted = useMemo(() => {
    const free = (hostel) => freeBedsByHostel.get(String(hostel.id)) ?? 0
    const list = [...filtered]
    if (sort === 'rent-asc') {
      return list.sort((a, b) => a.rentPerMonth - b.rentPerMonth)
    }
    if (sort === 'rent-desc') {
      return list.sort((a, b) => b.rentPerMonth - a.rentPerMonth)
    }
    if (sort === 'availability') {
      return list.sort((a, b) => free(b) - free(a))
    }
    return list
  }, [filtered, sort, freeBedsByHostel])

  const activeFilterCount = [
    location !== 'all',
    maxPrice !== 'all',
    roomSize !== 'all',
    amenity !== 'all',
    onlyAvailable,
  ].filter(Boolean).length

  const hasFilters = query.trim() !== '' || activeFilterCount > 0

  function clearFilters() {
    setQuery('')
    setLocation('all')
    setMaxPrice('all')
    setRoomSize('all')
    setAmenity('all')
    setOnlyAvailable(false)
  }

  const sortLabel = SORTS.find((option) => option.key === sort)?.label

  return (
    <section className="pb-12">
      {/* Header */}
      <div className="mx-auto max-w-6xl px-4 pt-8 sm:px-6 sm:pt-10">
        <p className="eyebrow text-terracotta">StayInKochi · Kochi</p>
        <h1 className="mt-2 display text-3xl text-charcoal sm:text-4xl">
          Branches
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-charcoal/70">
          Every branch is run by the same owner, with the same rules for rent,
          food, and upkeep. Filter by what matters to you.
        </p>
      </div>

      {/* Sticky filter bar — full-bleed band so results scroll under it */}
      <div className="sticky top-0 z-30 mt-6 border-y border-line bg-ivory/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-2 px-4 py-3 sm:px-6">
          <SearchInput
            value={query}
            onChange={setQuery}
            placeholder="Branch name, area, or description…"
            className="min-w-0 flex-1 basis-56"
          />

          <select
            value={sort}
            onChange={(event) => setSort(event.target.value)}
            aria-label="Sort branches"
            className="field w-auto"
          >
            {SORTS.map((option) => (
              <option key={option.key} value={option.key}>
                {option.label}
              </option>
            ))}
          </select>

          <label className="flex min-h-11 cursor-pointer items-center gap-2 rounded-card border border-line bg-white px-3 text-sm text-charcoal/80">
            <input
              type="checkbox"
              checked={onlyAvailable}
              onChange={(event) => setOnlyAvailable(event.target.checked)}
              className="size-4 accent-forest"
            />
            Free beds
          </label>

          <Button
            variant={showFilters ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setShowFilters((open) => !open)}
            aria-expanded={showFilters}
          >
            <SlidersHorizontal size={15} strokeWidth={1.9} aria-hidden="true" />
            Filters
            {activeFilterCount > 0 && ` (${activeFilterCount})`}
          </Button>

          {hasFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              Clear
            </Button>
          )}
        </div>

        {/* Area / rent / room size / amenity */}
        {showFilters && (
          <div className="mx-auto grid max-w-6xl gap-3 border-t border-line px-4 py-3 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
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
          </div>
        )}
      </div>

      {/* Results */}
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {error && (
          <Alert tone="error" className="mt-6">
            Could not load branches: {error}
          </Alert>
        )}

        {!error && (
          <p
            className="mt-5 text-sm text-charcoal/60"
            aria-live="polite"
          >
            {isLoading
              ? 'Loading branches…'
              : `${sorted.length} of ${hostels.length} ${
                  hostels.length === 1 ? 'branch' : 'branches'
                }`}
            {!isLoading && sorted.length > 0 && (
              <span className="text-charcoal/45"> · {sortLabel}</span>
            )}
          </p>
        )}

        {isLoading && <Spinner label="Loading branches…" />}

        {!isLoading && !error && sorted.length === 0 && (
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

        {!isLoading && !error && sorted.length > 0 && (
          <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {sorted.map((hostel) => (
              <HostelCard
                key={hostel.id}
                hostel={hostel}
                meta={<AvailabilityBadge free={freeBeds(hostel)} />}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
