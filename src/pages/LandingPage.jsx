import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  Building2,
  IndianRupee,
  MessageSquare,
  MapPin,
  Search,
  UtensilsCrossed,
} from 'lucide-react'
import Button from '../components/ui/Button'
import { BrandMark } from '../components/ui/Brand'
import Spinner from '../components/common/Spinner'
import BranchZigZag from '../features/hostels/components/BranchZigZag'
import {
  fetchHostels,
  selectHostels,
  selectHostelsLoading,
} from '../features/hostels/hostelSlice'
import { getAllBeds } from '../features/rooms/bedService'

// What the platform actually does — four short statements, no card grid.
const SERVICES = [
  {
    icon: Building2,
    title: 'Branches across Kochi',
    desc: 'Every branch under one name and one owner, with beds listed as they open up.',
  },
  {
    icon: IndianRupee,
    title: 'Rent & receipts',
    desc: "Pay the month's rent from your account and keep every receipt in your history.",
  },
  {
    icon: UtensilsCrossed,
    title: 'Food plans',
    desc: 'Subscribe to a monthly meal plan at your branch.',
  },
  {
    icon: MessageSquare,
    title: 'Upkeep & messages',
    desc: 'Raise a maintenance request with a photo and talk to management directly.',
  },
]

// Public landing page — modern and minimal: type-first hero with one search,
// a connected zig-zag route through every branch, four quiet feature rows, and
// a dark closing band. Whitespace does the work; no grid, no decoration.
export default function LandingPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const hostels = useSelector(selectHostels)
  const isLoading = useSelector(selectHostelsLoading)

  const [query, setQuery] = useState('')

  // Beds power the availability pill on each branch card.
  const [beds, setBeds] = useState([])
  const [bedsLoaded, setBedsLoaded] = useState(false)

  useEffect(() => {
    dispatch(fetchHostels())
    getAllBeds()
      .then(setBeds)
      .catch(() => setBeds([]))
      .finally(() => setBedsLoaded(true))
  }, [dispatch])

  const freeBedsByHostel = useMemo(() => {
    const counts = new Map()
    beds.forEach((bed) => {
      if (bed.status === 'available') {
        const key = String(bed.hostelId)
        counts.set(key, (counts.get(key) ?? 0) + 1)
      }
    })
    return counts
  }, [beds])

  function handleSearch(event) {
    event.preventDefault()
    const params = query.trim() ? `?q=${encodeURIComponent(query.trim())}` : ''
    navigate(`/hostels${params}`)
  }

  return (
    <div className="bg-white">
      {/* Hero — headline and search beside an arrival photo */}
      <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 pt-14 pb-16 sm:px-6 sm:pt-20 lg:grid-cols-[0.95fr_1.05fr] lg:gap-12 lg:pt-24 lg:pb-24">
        <div className="text-center lg:text-left">
          <p className="eyebrow text-terracotta">Hostel &amp; PG living · Kochi</p>
          <h1 className="hero-title mx-auto mt-5 max-w-3xl text-4xl leading-[1.05] text-charcoal sm:text-5xl lg:mx-0 xl:text-[3.5rem]">
            A well-kept room in Kochi, from day one.
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-charcoal/60 sm:text-lg lg:mx-0">
            One owner across every branch — clear rent, food plans, and upkeep
            handled from a single account.
          </p>

          {/* Branch search */}
          <form
            onSubmit={handleSearch}
            role="search"
            className="mx-auto mt-9 flex max-w-lg items-center gap-1 rounded-full border border-line-strong bg-white py-1.5 pr-1.5 pl-4 shadow-[0_4px_20px_rgba(41,45,41,0.06)] transition-shadow focus-within:border-forest/40 focus-within:shadow-[0_4px_24px_rgba(36,76,58,0.12)] lg:mx-0"
          >
            <Search
              size={18}
              strokeWidth={1.75}
              aria-hidden="true"
              className="shrink-0 text-charcoal/40"
            />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Kakkanad, Vytilla…"
              aria-label="Search branches by area"
              className="h-11 min-w-0 flex-1 border-0 bg-transparent px-3 text-base text-charcoal focus:outline-none"
            />
            <Button
              type="submit"
              size="lg"
              className="h-11 shrink-0 rounded-full px-5"
            >
              Search
            </Button>
          </form>

          <p className="mt-5 text-sm text-charcoal/50">
            or{' '}
            <Link to="/hostels" className="link">
              browse every branch
            </Link>
          </p>
        </div>

        {/* Minimal SVG-style branch map — labels and location pins only */}
        <div className="relative mx-auto w-full max-w-xl lg:max-w-none">
          <div className="absolute inset-4 rounded-full bg-sage/35 blur-3xl" aria-hidden="true" />
          <div className="relative">
            <svg
              viewBox="0 0 560 500"
              role="img"
              aria-label={`Branch locations: ${hostels.map((hostel) => hostel.name).join(', ')}`}
              className="h-auto w-full overflow-visible"
            >
              <defs>
                <pattern id="branch-map-dots" width="18" height="18" patternUnits="userSpaceOnUse">
                  <circle cx="1.5" cy="1.5" r="1.2" fill="var(--color-forest)" opacity="0.14" />
                </pattern>
              </defs>
              <rect width="560" height="500" rx="28" fill="url(#branch-map-dots)" />
              {hostels.length > 1 && (
                <path
                  d={hostels.slice(0, 6).map((_, index) => {
                    const points = [
                      [105, 105], [280, 155], [460, 90],
                      [175, 255], [310, 290], [450, 390],
                    ]
                    const [x, y] = points[index]
                    return `${index === 0 ? 'M' : 'L'} ${x} ${y}`
                  }).join(' ')}
                  fill="none"
                  stroke="var(--color-forest)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray="5 7"
                  opacity="0.48"
                />
              )}
              {hostels.slice(0, 6).map((hostel, index) => {
                const positions = [
                  { x: 105, y: 105, tx: 105, ty: 78, anchor: 'middle' },
                  { x: 280, y: 155, tx: 280, ty: 128, anchor: 'middle' },
                  { x: 460, y: 90, tx: 460, ty: 63, anchor: 'middle' },
                  { x: 175, y: 255, tx: 175, ty: 286, anchor: 'middle' },
                  { x: 310, y: 290, tx: 310, ty: 321, anchor: 'middle' },
                  { x: 450, y: 390, tx: 450, ty: 421, anchor: 'middle' },
                ]
                const point = positions[index]
                return (
                  <Link key={hostel.id} to={`/hostels/${hostel.id}`} aria-label={hostel.name}>
                    <g className="cursor-pointer" role="link">
                      <circle cx={point.x} cy={point.y} r="25" fill="var(--color-sage)" opacity="0.45" />
                      <circle cx={point.x} cy={point.y} r="17" fill="var(--color-forest)" />
                      <path d={`M ${point.x} ${point.y + 8} C ${point.x - 2} ${point.y + 4}, ${point.x - 8} ${point.y - 2}, ${point.x - 8} ${point.y - 7} A 8 8 0 1 1 ${point.x + 8} ${point.y - 7} C ${point.x + 8} ${point.y - 2}, ${point.x + 2} ${point.y + 4}, ${point.x} ${point.y + 8} Z`} fill="white" />
                      <circle cx={point.x} cy={point.y - 7} r="2.5" fill="var(--color-forest)" />
                      <text x={point.tx} y={point.ty} textAnchor={point.anchor} fill="var(--color-charcoal)" fontSize="13" fontWeight="600" className="select-none">{hostel.name.length > 22 ? `${hostel.name.slice(0, 20)}…` : hostel.name}</text>
                    </g>
                  </Link>
                )
              })}
              {hostels.length === 0 && !isLoading && (
                <text x="280" y="250" textAnchor="middle" fill="var(--color-charcoal)" fontSize="15">Branch locations</text>
              )}
            </svg>
          </div>
        </div>
      </section>

      {/* Branches — alternating image/text rows, every branch shown */}
      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6 sm:pb-20">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 className="display text-2xl text-charcoal sm:text-3xl">
            Branches
          </h2>
          <Link to="/hostels" className="link inline-flex items-center gap-1.5">
            Browse with filters
            <ArrowRight size={15} strokeWidth={1.75} aria-hidden="true" />
          </Link>
        </div>

        <div className="mt-10 min-w-0 sm:mt-12">
          {isLoading && hostels.length === 0 && (
            <Spinner label="Loading branches…" />
          )}

          {!isLoading && hostels.length > 0 && (
            <BranchZigZag
              hostels={hostels}
              freeBedsByHostel={freeBedsByHostel}
              bedsLoaded={bedsLoaded}
            />
          )}

          {!isLoading && hostels.length === 0 && (
            <p className="text-sm text-charcoal/60">
              No branches have been published yet.
            </p>
          )}
        </div>
      </section>

      {/* Features — the four statements sit on the ring of one account. */}
      <section className="bg-ivory md:flex md:min-h-svh md:flex-col md:justify-center">
        <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 md:py-8">
          <h2 className="hero-title mx-auto max-w-xl text-center text-3xl leading-snug text-charcoal sm:text-4xl">
            Everything in one account
          </h2>

          {/* Small screens — plain rows keep the copy readable. */}
          <div className="mt-10 grid gap-10 sm:grid-cols-2 md:hidden">
            {SERVICES.map(({ icon: Icon, title, desc }) => (
              <div key={title}>
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-sage/70 text-forest">
                  <Icon size={20} strokeWidth={1.6} aria-hidden="true" />
                </span>
                <h3 className="mt-4 text-base font-bold text-charcoal">
                  {title}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-charcoal/60">
                  {desc}
                </p>
              </div>
            ))}
          </div>

          {/* md+ — the four features orbit a single circular account. The circle
              is sized from the viewport height and every element inside is sized
              in container units, so the whole section stays in one view. */}
          <div className="relative mx-auto mt-10 hidden aspect-square w-full max-w-[clamp(30rem,calc(100svh-11rem),44rem)] [container-type:inline-size] md:block">
            <div
              aria-hidden="true"
              className="absolute inset-[4%] rounded-full border border-charcoal/10"
            />
            <div
              aria-hidden="true"
              className="absolute inset-[16%] rounded-full bg-sage/35"
            />

            {/* Centre — the account itself. */}
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-[1.6cqw] text-center">
              <BrandMark className="h-[max(3rem,11.4cqw)] w-[max(3rem,11.4cqw)] shadow-sm" />
              <span className="display text-[max(0.8rem,2.27cqw)] leading-none text-charcoal/70">
                StayInKochi
              </span>
            </div>

            {SERVICES.map(({ icon: Icon, title, desc }, index) => {
              const position = [
                'left-1/2 top-0 w-[45cqw] -translate-x-1/2 flex-col items-center text-center',
                'right-0 top-1/2 w-[41cqw] -translate-y-1/2 flex-row-reverse items-center text-right',
                'left-1/2 bottom-0 w-[45cqw] -translate-x-1/2 flex-col-reverse items-center text-center',
                'left-0 top-1/2 w-[41cqw] -translate-y-1/2 items-center text-left',
              ][index]

              return (
                <div
                  key={title}
                  className={`absolute flex gap-[2cqw] ${position}`}
                >
                  <span className="flex h-[max(2.5rem,8cqw)] w-[max(2.5rem,8cqw)] shrink-0 items-center justify-center rounded-full bg-sage text-forest ring-4 ring-ivory">
                    <Icon
                      className="h-[46%] w-[46%]"
                      strokeWidth={1.6}
                      aria-hidden="true"
                    />
                  </span>
                  <div>
                    <h3 className="text-[max(1rem,2.55cqw)] font-bold text-charcoal">
                      {title}
                    </h3>
                    <p className="mt-2 text-[max(0.875rem,2.27cqw)] leading-relaxed text-charcoal/60">
                      {desc}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Closing band — dark, centred, two actions */}
      <section className="bg-charcoal">
        <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 sm:py-20">
          <img
            src="https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1000&q=85"
            alt="Calm, contemporary shared living interior"
            width="1024"
            height="1536"
            loading="lazy"
            className="mx-auto mb-8 aspect-[4/3] w-full max-w-2xl rounded-2xl object-cover shadow-2xl sm:mb-10"
          />
          <h2 className="hero-title text-4xl text-white sm:text-5xl lg:text-6xl">
            Kerivada makale, keri vaa...
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-white/60">
            Pick a branch, send a stay request, and the owner approves it
            before you arrive. Rent, food, and upkeep all live in the same
            account.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button to="/hostels" variant="light" size="lg" className="rounded-full">
              Browse branches
            </Button>
            <Button
              to="/register"
              variant="outlineLight"
              size="lg"
              className="rounded-full"
            >
              Create account
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
