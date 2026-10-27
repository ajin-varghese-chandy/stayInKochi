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

        {/* Hero branch locator — live locations replace the editorial photo */}
        <div className="relative mx-auto w-full max-w-xl lg:max-w-none">
          <div aria-hidden="true" className="absolute -inset-3 rounded-[2rem] bg-sage/45 rotate-2" />
          <div className="relative overflow-hidden rounded-[1.75rem] border border-line bg-ivory shadow-[0_28px_60px_-28px_rgba(25,45,33,0.3)]">
            <div className="relative overflow-hidden bg-forest px-6 pb-7 pt-6 text-white sm:px-8 sm:pt-8">
              <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-[0.12]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '18px 18px' }} />
              <div className="relative flex items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/65">StayInKochi · Locations</p>
                  <h2 className="display mt-2 text-2xl leading-tight sm:text-3xl">Find your place in Kochi.</h2>
                  <p className="mt-2 max-w-sm text-sm leading-relaxed text-white/70">Explore our branches by area and choose the location that works for you.</p>
                </div>
                <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl border border-white/15 bg-white/10">
                  <MapPin size={23} strokeWidth={1.7} aria-hidden="true" />
                </span>
              </div>
              <div className="relative mt-5 flex items-center gap-2 text-xs text-white/75">
                <span className="size-2 rounded-full bg-[#b9d9b2] shadow-[0_0_0_4px_rgba(185,217,178,0.14)]" />
                {hostels.length} {hostels.length === 1 ? 'branch' : 'branches'} listed
              </div>
            </div>
            <div className="p-3 sm:p-4">
              {isLoading && hostels.length === 0 ? (
                <div className="flex min-h-40 items-center justify-center"><Spinner label="Loading branch locations…" /></div>
              ) : hostels.length > 0 ? (
                <ul className="divide-y divide-line">
                  {hostels.slice(0, 5).map((hostel, index) => (
                    <li key={hostel.id}>
                      <Link to={`/hostels/${hostel.id}`} className="group flex items-center gap-3 rounded-xl px-3 py-3.5 transition-colors hover:bg-white">
                        <span className="flex size-10 shrink-0 items-center justify-center rounded-full border border-forest/10 bg-sage/55 text-forest">
                          <MapPin size={17} strokeWidth={1.8} aria-hidden="true" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-semibold text-charcoal group-hover:text-forest">{hostel.name}</span>
                          <span className="mt-0.5 block truncate text-xs text-charcoal/55">{hostel.location || 'Kochi, Kerala'}</span>
                        </span>
                        <span className="shrink-0 text-[10px] font-semibold uppercase tracking-[0.12em] text-charcoal/35">{String(index + 1).padStart(2, '0')}</span>
                        <ArrowRight size={15} className="shrink-0 text-forest/60 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="px-4 py-8 text-center text-sm text-charcoal/55">Branch locations will appear here once published.</p>
              )}
              {hostels.length > 5 && (
                <Link to="/hostels" className="mt-2 flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-forest transition-colors hover:bg-white">
                  View all {hostels.length} branches <ArrowRight size={15} aria-hidden="true" />
                </Link>
              )}
            </div>
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
