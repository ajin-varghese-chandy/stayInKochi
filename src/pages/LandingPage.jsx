import { useEffect, useState } from 'react'
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
import HostelCard from '../features/hostels/components/HostelCard'
import {
  fetchHostels,
  selectHostels,
  selectHostelsLoading,
} from '../features/hostels/hostelSlice'

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
// a clean branch grid, four quiet feature rows, and a dark closing band.
// Whitespace does the work; no backdrops, frames, or decoration.
export default function LandingPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const hostels = useSelector(selectHostels)
  const isLoading = useSelector(selectHostelsLoading)

  const [query, setQuery] = useState('')

  useEffect(() => {
    dispatch(fetchHostels())
  }, [dispatch])

  function handleSearch(event) {
    event.preventDefault()
    const params = query.trim() ? `?q=${encodeURIComponent(query.trim())}` : ''
    navigate(`/hostels${params}`)
  }

  const preview = hostels.slice(0, 3)

  return (
    <div className="bg-white">
      {/* Hero — centred, type-first, one search field */}
      <section className="mx-auto max-w-3xl px-4 pt-16 pb-16 text-center sm:px-6 sm:pt-24">
        <p className="eyebrow text-terracotta">Hostel &amp; PG living · Kochi</p>
        <h1 className="display mt-5 text-4xl leading-[1.05] text-charcoal sm:text-6xl">
          A well-kept room in Kochi,
          <br className="hidden sm:block" /> from day one.
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-charcoal/60 sm:text-lg">
          One owner across every branch — clear rent, food plans, and upkeep
          handled from a single account.
        </p>

        {/* Branch search */}
        <form
          onSubmit={handleSearch}
          role="search"
          className="mx-auto mt-9 flex max-w-lg items-center gap-1 rounded-full border border-line-strong bg-white py-1.5 pr-1.5 pl-4 shadow-[0_4px_20px_rgba(41,45,41,0.06)] transition-shadow focus-within:border-forest/40 focus-within:shadow-[0_4px_24px_rgba(36,76,58,0.12)]"
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
      </section>

      {/* Branches — one uniform grid */}
      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6 sm:pb-20">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 className="display text-2xl text-charcoal sm:text-3xl">
            Branches
          </h2>
          <Link to="/hostels" className="link inline-flex items-center gap-1.5">
            View all
            <ArrowRight size={15} strokeWidth={1.75} aria-hidden="true" />
          </Link>
        </div>

        {isLoading && hostels.length === 0 && (
          <Spinner label="Loading branches…" />
        )}

        {!isLoading && preview.length > 0 && (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {preview.map((hostel) => (
              <HostelCard key={hostel.id} hostel={hostel} />
            ))}
          </div>
        )}
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
          <h2 className="display text-3xl text-white sm:text-4xl">
            Ready to move in?
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
