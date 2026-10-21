import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  Building2,
  IndianRupee,
  MessageSquare,
  Search,
  UtensilsCrossed,
} from 'lucide-react'
import Button from '../components/ui/Button'
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
    desc: 'Subscribe to a monthly meal plan at your branch, or book single meals.',
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

        {/* Arrival photo — a cut-out, so it sits inside a soft verandah arch */}
        <div className="relative mx-auto w-full max-w-xl lg:max-w-none">
          <div
            aria-hidden="true"
            className="absolute inset-x-4 top-8 bottom-0 rounded-t-[999px] rounded-b-card bg-sage/70"
          />
          <img
            src="/hero1.png"
            alt="Two young men arriving in Kochi with their bags"
            width="926"
            height="521"
            loading="eager"
            fetchPriority="high"
            className="relative z-10 w-full drop-shadow-[0_22px_32px_rgba(41,45,41,0.16)]"
          />
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

      {/* Features — icon, title, one line. No borders, no cards. */}
      <section className="bg-ivory">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <h2 className="display max-w-md text-2xl leading-snug text-charcoal sm:text-3xl">
            Everything in one account
          </h2>
          <div className="mt-10 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {SERVICES.map(({ icon: Icon, title, desc }) => (
              <div key={title}>
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sage/70 text-forest">
                  <Icon size={20} strokeWidth={1.6} aria-hidden="true" />
                </span>
                <h3 className="mt-4 text-base font-semibold text-charcoal">
                  {title}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-charcoal/60">
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Closing band — dark, centred, two actions */}
      <section className="bg-charcoal">
        <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 sm:py-20">
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
