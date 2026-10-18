import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useLocation, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Bath,
  BedDouble,
  Check,
  MapPin,
  Utensils,
} from 'lucide-react'
import Spinner from '../components/common/Spinner'
import Alert from '../components/ui/Alert'
import Button from '../components/ui/Button'
import { selectCurrentUser } from '../features/auth/authSlice'
import StayRequestForm from '../features/stayRequests/components/StayRequestForm'
import {
  clearSelectedHostel,
  fetchHostelById,
  selectHostelsError,
  selectHostelsLoading,
  selectSelectedHostel,
} from '../features/hostels/hostelSlice'
import { getBedsByHostel } from '../features/rooms/bedService'
import { getRoomsByHostel } from '../features/rooms/roomService'
import { getFoodPlansByHostel } from '../features/food/foodPlanService'
import { getMealsByHostel } from '../features/food/mealService'
import { getTenantsByUser } from '../features/tenants/tenantService'
import formatRupees from '../utils/formatRupees'
import hostelPhotos from '../utils/hostelPhotos'

// Public detail page for a single branch: gallery, facts, room list, food,
// availability, and the stay-request flow.
export default function HostelDetailsPage() {
  const { hostelId } = useParams()
  const dispatch = useDispatch()
  const location = useLocation()
  const user = useSelector(selectCurrentUser)
  const hostel = useSelector(selectSelectedHostel)
  const isLoading = useSelector(selectHostelsLoading)
  const error = useSelector(selectHostelsError)

  const [showRequestForm, setShowRequestForm] = useState(false)
  const [activePhoto, setActivePhoto] = useState(0)

  // Branch facts loaded straight from the API (read-only, public).
  const [rooms, setRooms] = useState([])
  const [beds, setBeds] = useState([])
  const [foodPlans, setFoodPlans] = useState([])
  const [meals, setMeals] = useState([])

  // A signed-in tenant's existing tenancy decides which UI to show below:
  // already living here, or living elsewhere (switch instead of request).
  const [tenancyFor, setTenancyFor] = useState(null)

  useEffect(() => {
    dispatch(fetchHostelById(hostelId))
    setActivePhoto(0)
    setShowRequestForm(false)

    getRoomsByHostel(hostelId).then(setRooms).catch(() => setRooms([]))
    getBedsByHostel(hostelId).then(setBeds).catch(() => setBeds([]))
    getFoodPlansByHostel(hostelId).then(setFoodPlans).catch(() => setFoodPlans([]))
    getMealsByHostel(hostelId).then(setMeals).catch(() => setMeals([]))

    return () => {
      dispatch(clearSelectedHostel())
    }
  }, [dispatch, hostelId])

  useEffect(() => {
    if (user?.role !== 'tenant' || !user.uid) return undefined

    let cancelled = false
    getTenantsByUser(user.uid)
      .then((tenants) => {
        if (cancelled) return
        setTenancyFor({ uid: user.uid, tenancy: tenants[0] ?? null })
      })
      .catch(() => {
        if (cancelled) return
        setTenancyFor({ uid: user.uid, tenancy: null })
      })

    return () => {
      cancelled = true
    }
  }, [user?.role, user?.uid])

  // Only trust the lookup once it has settled for the signed-in user.
  // (Guard on tenancyFor itself: for a guest, both uids are undefined and the
  // equality alone would pass with tenancyFor still null.)
  const tenancy =
    tenancyFor && tenancyFor.uid === user?.uid ? tenancyFor.tenancy : null
  const tenancyLoading =
    user?.role === 'tenant' &&
    Boolean(user.uid) &&
    (!tenancyFor || tenancyFor.uid !== user.uid)

  const photos = useMemo(() => hostelPhotos(hostel), [hostel])

  const freeBeds = beds.filter((bed) => bed.status === 'available').length
  const freeByRoom = useMemo(() => {
    const counts = new Map()
    beds.forEach((bed) => {
      if (bed.status === 'available') {
        counts.set(String(bed.roomId), (counts.get(String(bed.roomId)) ?? 0) + 1)
      }
    })
    return counts
  }, [beds])

  if (isLoading && !hostel) {
    return <Spinner label="Loading hostel…" />
  }

  if (error) {
    return (
      <section className="mx-auto max-w-3xl px-4 py-16 text-center">
        <Alert tone="error">Could not load this hostel: {error}</Alert>
        <Link to="/hostels" className="link mt-4 inline-block">
          Back to branches
        </Link>
      </section>
    )
  }

  if (!hostel) return null

  // Primary action for the current viewer.
  let primaryAction
  if (!user) {
    primaryAction = (
      <Button to="/login" state={{ from: location }} block>
        Login to request a stay
      </Button>
    )
  } else if (user.role === 'owner') {
    primaryAction = (
      <p className="text-sm text-charcoal/60">
        Owner accounts request stays from the console instead.
      </p>
    )
  } else if (tenancyLoading) {
    primaryAction = <Spinner compact label="Checking your tenancy…" />
  } else if (tenancy && String(tenancy.hostelId) === String(hostel.id)) {
    primaryAction = (
      <>
        <Alert tone="success">You already live here.</Alert>
        <Button to="/tenant" variant="secondary" block className="mt-3">
          Go to your dashboard
        </Button>
      </>
    )
  } else if (tenancy) {
    primaryAction = (
      <>
        <Alert tone="info">
          You live at <strong>{tenancy.hostelName}</strong>. Moving here is a
          hostel switch, approved by the owner after a small fee.
        </Alert>
        <Button to="/tenant/switch" block className="mt-3">
          Switch to this hostel
        </Button>
      </>
    )
  } else {
    primaryAction = (
      <Button
        block
        size="lg"
        onClick={() => setShowRequestForm(true)}
        disabled={showRequestForm}
      >
        Request a stay
      </Button>
    )
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <Link to="/hostels" className="link inline-flex items-center gap-1.5 text-sm">
        <ArrowLeft size={15} strokeWidth={1.75} aria-hidden="true" />
        All branches
      </Link>

      {/* Title */}
      <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-serif text-3xl leading-tight text-charcoal sm:text-4xl">
            {hostel.name}
          </h1>
          <p className="mt-2 flex items-center gap-1.5 text-sm text-charcoal/65">
            <MapPin size={15} strokeWidth={1.75} aria-hidden="true" />
            {hostel.location}
          </p>
        </div>
        <p className="shrink-0 sm:text-right">
          <span className="text-xl font-semibold text-forest tabular-nums">
            {formatRupees(hostel.rentPerMonth)}
          </span>
          <span className="block text-xs text-charcoal/55">per month, per bed</span>
        </p>
      </div>

      {/* Gallery */}
      <div className="mt-6">
        <img
          src={photos[activePhoto]}
          alt={`${hostel.name} — photo ${activePhoto + 1}`}
          className="h-60 w-full border border-line object-cover sm:h-96 lg:h-[26rem]"
        />
        {photos.length > 1 && (
          <div className="mt-2 grid grid-cols-3 gap-2">
            {photos.map((photo, index) => (
              <button
                key={photo}
                type="button"
                onClick={() => setActivePhoto(index)}
                aria-label={`Show photo ${index + 1}`}
                aria-current={index === activePhoto}
                className={`overflow-hidden border transition-colors ${
                  index === activePhoto
                    ? 'border-forest'
                    : 'border-line hover:border-line-strong'
                }`}
              >
                <img
                  src={photo}
                  alt=""
                  loading="lazy"
                  className="h-16 w-full object-cover sm:h-20"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        {/* Facts */}
        <div className="min-w-0 space-y-8">
          {hostel.description && (
            <p className="max-w-2xl text-base leading-relaxed text-charcoal/75">
              {hostel.description}
            </p>
          )}

          {/* Amenities */}
          {hostel.amenities?.length > 0 && (
            <div>
              <h2 className="text-base font-semibold text-charcoal">
                What this branch has
              </h2>
              <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                {hostel.amenities.map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-2.5 border-t border-line pt-2 text-sm text-charcoal/75"
                  >
                    <Check
                      size={15}
                      strokeWidth={2}
                      className="shrink-0 text-forest"
                      aria-hidden="true"
                    />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Rooms */}
          <div>
            <div className="flex items-baseline justify-between gap-4">
              <h2 className="text-base font-semibold text-charcoal">
                Rooms &amp; beds
              </h2>
              <span className="text-xs text-charcoal/55">
                {freeBeds > 0
                  ? `${freeBeds} ${freeBeds === 1 ? 'bed free' : 'beds free'}`
                  : 'Fully occupied'}
              </span>
            </div>

            {rooms.length === 0 ? (
              <p className="mt-3 text-sm text-charcoal/60">
                Room details for this branch have not been published yet.
              </p>
            ) : (
              <div className="table-wrap card mt-3">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Room</th>
                      <th>Floor</th>
                      <th>Beds</th>
                      <th className="align-right">Rent</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rooms.map((room) => {
                      const free = freeByRoom.get(String(room.id)) ?? 0
                      return (
                        <tr key={room.id}>
                          <td className="font-medium text-charcoal">
                            {room.roomNumber}
                          </td>
                          <td className="num">{room.floor ?? '—'}</td>
                          <td className="num">
                            {free} of {room.bedCount} free
                          </td>
                          <td className="num align-right">
                            {formatRupees(room.rentPerMonth)}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Food */}
          <div>
            <h2 className="text-base font-semibold text-charcoal">Food here</h2>
            {foodPlans.length === 0 && meals.length === 0 ? (
              <p className="mt-3 text-sm text-charcoal/60">
                No food plan has been published for this branch yet.
              </p>
            ) : (
              <div className="mt-3 space-y-3">
                {foodPlans.map((plan) => (
                  <div key={plan.id} className="card flex items-start gap-3 p-4">
                    <Utensils
                      size={17}
                      strokeWidth={1.75}
                      className="mt-0.5 shrink-0 text-forest"
                      aria-hidden="true"
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-charcoal">
                        {plan.name}
                      </p>
                      <p className="mt-0.5 text-sm text-charcoal/65">
                        {(plan.includes ?? []).join(' · ') || 'Meal plan'}
                      </p>
                    </div>
                    <p className="ml-auto shrink-0 text-sm font-semibold text-forest tabular-nums">
                      {formatRupees(plan.pricePerMonth)}
                      <span className="block text-xs font-normal text-charcoal/55">
                        per month
                      </span>
                    </p>
                  </div>
                ))}

                {meals.length > 0 && (
                  <p className="text-sm text-charcoal/65">
                    Single meals:{' '}
                    {meals
                      .map((meal) => `${meal.name} ${formatRupees(meal.price)}`)
                      .join(' · ')}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Stay request form (opens full width) */}
          {showRequestForm && (
            <div className="card p-5">
              <h2 className="text-base font-semibold text-charcoal">
                Request a stay at {hostel.name}
              </h2>
              <div className="mt-4">
                <StayRequestForm hostel={hostel} />
              </div>
              <button
                type="button"
                onClick={() => setShowRequestForm(false)}
                className="mt-3 text-sm text-charcoal/55 hover:text-charcoal"
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        {/* Booking panel */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="card p-5">
            <div className="flex items-baseline justify-between border-b border-line pb-4">
              <span className="text-sm text-charcoal/65">Rent</span>
              <span className="text-lg font-semibold text-forest tabular-nums">
                {formatRupees(hostel.rentPerMonth)}
                <span className="text-xs font-normal text-charcoal/55"> /mo</span>
              </span>
            </div>

            <dl className="space-y-2.5 border-b border-line py-4 text-sm">
              <div className="flex items-center gap-2.5">
                <BedDouble
                  size={15}
                  strokeWidth={1.75}
                  className="text-charcoal/50"
                  aria-hidden="true"
                />
                <dt className="text-charcoal/65">Beds</dt>
                <dd className="ml-auto font-medium text-charcoal">
                  {beds.length > 0
                    ? `${freeBeds} of ${beds.length} free`
                    : 'Not listed'}
                </dd>
              </div>
              <div className="flex items-center gap-2.5">
                <Bath
                  size={15}
                  strokeWidth={1.75}
                  className="text-charcoal/50"
                  aria-hidden="true"
                />
                <dt className="text-charcoal/65">Rooms</dt>
                <dd className="ml-auto font-medium text-charcoal">
                  {rooms.length > 0 ? `${rooms.length} listed` : 'Not listed'}
                </dd>
              </div>
            </dl>

            <div className="pt-4">{primaryAction}</div>
          </div>

          <p className="mt-3 px-1 text-xs leading-relaxed text-charcoal/55">
            Stay requests go straight to the owner. Nothing is charged until
            your request is approved.
          </p>
        </aside>
      </div>
    </section>
  )
}
