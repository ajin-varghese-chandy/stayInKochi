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
    desc: 'Pay the month’s rent from your account and keep every receipt in your history.',
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

// Public landing page — editorial hero, service band, branch preview, CTA.
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
    <div>
      {/* Hero — editorial split: headline left, photograph right */}
      <section className="border-b border-line bg-ivory">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-12 sm:px-6 sm:py-14 lg:grid-cols-[1fr_1.05fr] lg:gap-14 lg:py-16">
          <div>
            <p className="eyebrow text-terracotta">
              Hostel &amp; PG living · Kochi
            </p>
            <h1 className="mt-4 font-serif text-[2.4rem] leading-[1.08] tracking-tight text-charcoal sm:text-[3.1rem]">
              A well-kept room in Kochi,
              <span className="text-forest"> from day one.</span>
            </h1>
            <p className="mt-5 max-w-lg text-base leading-relaxed text-charcoal/70">
              StayInKochi runs hostel and PG branches across the city — one
              owner, clear rent, food plans, and upkeep handled through a single
              account.
            </p>

            {/* Hostel search */}
            <form
              onSubmit={handleSearch}
              className="mt-7 flex max-w-md gap-2"
              role="search"
            >
              <div className="relative flex-1">
                <Search
                  size={16}
                  strokeWidth={1.75}
                  aria-hidden="true"
                  className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-charcoal/40"
                />
                <input
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Kakkanad, Vytilla…"
                  aria-label="Search branches by area"
                  className="field h-11 pl-9"
                />
              </div>
              <Button type="submit" size="lg" className="h-11 px-5">
                Find a hostel
              </Button>
            </form>

            <p className="mt-4 text-sm text-charcoal/55">
              or{' '}
              <Link to="/hostels" className="link">
                browse every branch
              </Link>
            </p>
          </div>

          <div className="relative">
            <div
              aria-hidden="true"
              className="absolute -top-3 -right-3 hidden h-full w-full border border-sand sm:block"
            />
            <img
              src="https://picsum.photos/seed/stayinkochi-hero/1400/1100"
              alt="Daylight in a well-kept residential room"
              className="relative h-64 w-full border border-line object-cover sm:h-80 lg:h-[26rem]"
            />
          </div>
        </div>
      </section>

      {/* Service band — top-ruled items, not cards */}
      <section className="border-b border-line bg-white">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
          <p className="eyebrow">Everything in one account</p>
          <div className="mt-7 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {SERVICES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="border-t border-line pt-4">
                <Icon
                  size={20}
                  strokeWidth={1.6}
                  className="text-forest"
                  aria-hidden="true"
                />
                <h2 className="mt-3 text-sm font-semibold text-charcoal">
                  {title}
                </h2>
                <p className="mt-1.5 text-sm leading-relaxed text-charcoal/65">
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Branch preview — lead card, then two beside it */}
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-14">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Where you can stay</p>
            <h2 className="mt-2 font-serif text-2xl text-charcoal sm:text-3xl">
              Branches
            </h2>
          </div>
          <Link to="/hostels" className="link inline-flex items-center gap-1.5">
            View all branches
            <ArrowRight size={15} strokeWidth={1.75} aria-hidden="true" />
          </Link>
        </div>

        {isLoading && hostels.length === 0 && (
          <Spinner label="Loading branches…" />
        )}

        {!isLoading && preview.length > 0 && (
          <div className="mt-7 space-y-5">
            <HostelCard hostel={preview[0]} variant="feature" />
            {preview.length > 1 && (
              <div className="grid gap-5 sm:grid-cols-2">
                {preview.slice(1).map((hostel) => (
                  <HostelCard key={hostel.id} hostel={hostel} />
                ))}
              </div>
            )}
          </div>
        )}
      </section>

      {/* Closing band — solid forest, no gradient */}
      <section className="bg-forest">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-12 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="font-serif text-2xl text-ivory sm:text-3xl">
              Ready to move in?
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-ivory/70">
              Pick a branch, send a stay request, and the owner approves it
              before you arrive. Rent, food, and upkeep all live in the same
              account.
            </p>
          </div>
          <div className="flex shrink-0 gap-3">
            <Button to="/hostels" variant="light" size="lg">
              Browse branches
            </Button>
            <Button to="/register" variant="outlineLight" size="lg">
              Create account
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
