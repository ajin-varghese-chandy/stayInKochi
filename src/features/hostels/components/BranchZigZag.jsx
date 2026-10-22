import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, BedDouble, MapPin } from 'lucide-react'
import formatRupees from '../../../utils/formatRupees'
import { hostelCoverPhoto } from '../../../utils/hostelPhotos'

// Layout maths for the connected path. One row = 100 SVG units tall, every
// card is 46% of the row wide, so the inner card edges sit at x=46%/54%.
const ROW_UNITS = 100
const CARD_WIDTH_PCT = 46
const CARD_INNER_LEFT = CARD_WIDTH_PCT * 10 // 460
const CARD_INNER_RIGHT = (100 - CARD_WIDTH_PCT) * 10 // 540

// Distance the traveller slides to sit in the empty half of the row. The
// wrapper is one card wide (46% of the row), so shifting it by 54% of the row
// equals 54/46 of its own width.
const IMAGE_SLOT_SHIFT = ((100 - CARD_WIDTH_PCT) / CARD_WIDTH_PCT) * 100 // ≈117.39%

// One swooping S-curve per gap, from the previous card's edge to the next.
function connectorPath(index) {
  const y0 = (index + 0.5) * ROW_UNITS
  const y1 = (index + 1.5) * ROW_UNITS
  const fromLeft = index % 2 === 0

  if (fromLeft) {
    return `M ${CARD_INNER_LEFT} ${y0} C ${CARD_INNER_LEFT + 180} ${y0}, ${CARD_INNER_RIGHT} ${y1 - 25}, ${CARD_INNER_RIGHT} ${y1}`
  }
  return `M ${CARD_INNER_RIGHT} ${y0} C ${CARD_INNER_RIGHT - 180} ${y0}, ${CARD_INNER_LEFT} ${y1 - 25}, ${CARD_INNER_LEFT} ${y1}`
}

// Availability pill floating over each branch photograph.
function AvailabilityBadge({ free, loaded }) {
  if (!loaded) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-charcoal/60 backdrop-blur">
        <BedDouble size={13} strokeWidth={1.9} aria-hidden="true" />
        Checking beds…
      </span>
    )
  }

  if (free === 0) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-charcoal/60 backdrop-blur">
        <span
          className="size-1.5 rounded-full bg-charcoal/35"
          aria-hidden="true"
        />
        Fully occupied
      </span>
    )
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-success shadow-sm backdrop-blur">
      <span className="size-1.5 rounded-full bg-success" aria-hidden="true" />
      {free} {free === 1 ? 'bed' : 'beds'} free
    </span>
  )
}

// Every branch on the landing page, as rounded cards that alternate left and
// right. A hand-drawn style S-curve joins each card's edge to the next one,
// through a small node — a connected route down the page.
export default function BranchZigZag({
  hostels,
  freeBedsByHostel,
  bedsLoaded = true,
}) {
  const itemRefs = useRef([])
  const imageRef = useRef(null)
  const [activeIndex, setActiveIndex] = useState(0)

  // Work out which branch sits nearest the pinned traveller, so it can hop
  // into the empty side of the zig-zag as the next card takes over. Comparing
  // against the image's own centre lines the switch up with the moment a card
  // slides in front of it. Scroll work is batched into one animation frame.
  useEffect(() => {
    if (hostels.length < 2) return undefined

    let frame = 0

    function updateActiveIndex() {
      frame = 0

      const imageRect = imageRef.current?.getBoundingClientRect()
      const pivot = imageRect
        ? imageRect.top + imageRect.height / 2
        : window.innerHeight / 2

      let closest = 0
      let closestDistance = Infinity

      itemRefs.current.forEach((node, index) => {
        if (!node) return
        const rect = node.getBoundingClientRect()
        const distance = Math.abs(rect.top + rect.height / 2 - pivot)
        if (distance < closestDistance) {
          closestDistance = distance
          closest = index
        }
      })

      setActiveIndex(closest)
    }

    function handleScroll() {
      if (frame) return
      frame = window.requestAnimationFrame(updateActiveIndex)
    }

    updateActiveIndex()
    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', handleScroll)

    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleScroll)
      if (frame) window.cancelAnimationFrame(frame)
    }
  }, [hostels.length])

  // Even rows keep the card on the left, so the traveller waits on the right.
  const imageOnRight = activeIndex % 2 === 0

  return (
    <div className="relative">
      {/* The connected route: hidden on mobile, where cards simply stack */}
      <svg
        className="pointer-events-none absolute inset-0 z-0 hidden h-full w-full sm:block"
        viewBox={`0 0 1000 ${hostels.length * ROW_UNITS}`}
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        {hostels.slice(0, -1).map((hostel, index) => (
          <path
            key={hostel.id}
            d={connectorPath(index)}
            fill="none"
            stroke="var(--color-forest)"
            strokeOpacity="0.28"
            strokeWidth="2.5"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
        ))}
      </svg>

      {/* The traveller waits in the empty half of the zig-zag, pinned while the
          list scrolls, then slides across to the other side for the next
          branch. Desktop only — on mobile the cards simply stack. */}
      {hostels.length > 1 && (
        <div
          className="pointer-events-none absolute inset-0 z-0 hidden sm:block"
          aria-hidden="true"
        >
          <div className="sticky top-24">
            <div
              ref={imageRef}
              className="w-[46%] transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform motion-reduce:transition-none"
              style={{
                transform: `translateX(${imageOnRight ? IMAGE_SLOT_SHIFT : 0}%)`,
              }}
            >
              <img
                src="/movinghero.png"
                alt=""
                width="1112"
                height="1414"
                loading="lazy"
                className={`mx-auto w-full max-w-[19rem]   rounded-2xl drop-shadow-[0_24px_32px_rgba(41,45,41,0.18)] transition-transform duration-700 motion-reduce:transition-none ${
                  imageOnRight ? '' : '-scale-x-100'
                }`}
              />
            </div>
          </div>
        </div>
      )}

      <ol className="relative z-10 flex flex-col gap-6 sm:gap-0">
        {hostels.map((hostel, index) => {
          const flipped = index % 2 === 1
          const free = freeBedsByHostel?.get(String(hostel.id)) ?? 0
          const cover = hostelCoverPhoto(hostel)

          return (
            <li
              key={hostel.id}
              ref={(node) => {
                itemRefs.current[index] = node
              }}
              className={`relative flex sm:h-[460px] ${
                flipped ? 'sm:justify-end' : 'sm:justify-start'
              }`}
            >
              {/* Node on the edge shared by the two connecting curves */}
              <span
                aria-hidden="true"
                className="absolute top-1/2 hidden size-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-forest bg-ivory shadow-sm sm:block"
                style={{ left: flipped ? '54%' : '46%' }}
              />

              <Link
                to={`/hostels/${hostel.id}`}
                className="group relative flex w-full flex-col overflow-hidden rounded-[28px] border border-line bg-white shadow-[0_24px_55px_-38px_rgba(41,45,41,0.55)] transition-shadow duration-300 hover:shadow-[0_30px_70px_-36px_rgba(41,45,41,0.45)] sm:w-[46%]"
              >
                <div className="relative overflow-hidden">
                  <img
                    src={cover}
                    alt={hostel.name}
                    loading={index === 0 ? 'eager' : 'lazy'}
                    className="h-44 w-full object-cover transition-transform duration-700 group-hover:scale-[1.03] lg:h-48"
                  />
                  <div className="absolute top-4 left-4">
                    <AvailabilityBadge free={free} loaded={bedsLoaded} />
                  </div>
                </div>

                <div className="flex flex-1 flex-col p-5 sm:p-6">
                  <p className="eyebrow text-terracotta">
                    Branch {String(index + 1).padStart(2, '0')}
                  </p>

                  <h3 className="display mt-2 text-xl leading-snug text-charcoal transition-colors group-hover:text-forest sm:text-2xl">
                    {hostel.name}
                  </h3>

                  <p className="mt-1.5 flex items-center gap-1.5 text-sm text-charcoal/60">
                    <MapPin size={14} strokeWidth={1.75} aria-hidden="true" />
                    {hostel.location}
                  </p>

                  <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-charcoal/70">
                    {hostel.description}
                  </p>

                  {hostel.amenities?.length > 0 && (
                    <ul className="mt-3 hidden flex-wrap gap-1.5 sm:flex">
                      {hostel.amenities.slice(0, 2).map((amenity) => (
                        <li
                          key={amenity}
                          className="rounded-full border border-line bg-ivory px-2.5 py-0.5 text-xs text-charcoal/70"
                        >
                          {amenity}
                        </li>
                      ))}
                      {hostel.amenities.length > 2 && (
                        <li className="rounded-full border border-line px-2.5 py-0.5 text-xs text-charcoal/55">
                          +{hostel.amenities.length - 2}
                        </li>
                      )}
                    </ul>
                  )}

                  <div className="mt-auto flex flex-wrap items-end justify-between gap-3 pt-5">
                    <p>
                      <span className="text-lg font-semibold text-forest tabular-nums">
                        {formatRupees(hostel.rentPerMonth)}
                      </span>
                      <span className="ml-1 text-xs text-charcoal/55">
                        /month
                      </span>
                    </p>
                    <span className="inline-flex items-center gap-1.5 text-sm font-medium text-forest">
                      View branch
                      <ArrowRight
                        size={15}
                        strokeWidth={1.9}
                        aria-hidden="true"
                        className="transition-transform group-hover:translate-x-0.5"
                      />
                    </span>
                  </div>
                </div>
              </Link>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
