import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, BedDouble, MapPin } from 'lucide-react'
import formatRupees from '../../../utils/formatRupees'
import { hostelCoverPhoto } from '../../../utils/hostelPhotos'

const ROW_UNITS = 100
const CARD_WIDTH = 46

// Edge positions in the 1000-unit-wide SVG.
const CARD_EDGE_LEFT = CARD_WIDTH * 10
const CARD_EDGE_RIGHT = (100 - CARD_WIDTH) * 10

// Slides the traveller image into the empty half of a row.
const IMAGE_SLIDE = ((100 - CARD_WIDTH) / CARD_WIDTH) * 100

function getCurvePath(rowIndex) {
  const startY = (rowIndex + 0.5) * ROW_UNITS
  const endY = (rowIndex + 1.5) * ROW_UNITS
  const startsOnLeft = rowIndex % 2 === 0

  if (startsOnLeft) {
    return `M ${CARD_EDGE_LEFT} ${startY} C ${CARD_EDGE_LEFT + 180} ${startY}, ${CARD_EDGE_RIGHT} ${endY - 25}, ${CARD_EDGE_RIGHT} ${endY}`
  }

  return `M ${CARD_EDGE_RIGHT} ${startY} C ${CARD_EDGE_RIGHT - 180} ${startY}, ${CARD_EDGE_LEFT} ${endY - 25}, ${CARD_EDGE_LEFT} ${endY}`
}

function AvailabilityBadge({ freeBeds, loaded }) {
  const normalPill =
    'inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-charcoal/60 backdrop-blur'

  if (!loaded) {
    return (
      <span className={normalPill}>
        <BedDouble size={13} strokeWidth={1.9} aria-hidden="true" />
        Checking beds…
      </span>
    )
  }

  if (freeBeds === 0) {
    return (
      <span className={normalPill}>
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
      {freeBeds} {freeBeds === 1 ? 'bed' : 'beds'} free
    </span>
  )
}

function BranchCard({ hostel, index, freeBeds, bedsLoaded, onRight, cardRef }) {
  const coverPhoto = hostelCoverPhoto(hostel)

  return (
    <li
      ref={cardRef}
      className={`relative flex sm:h-[460px] ${
        onRight ? 'sm:justify-end' : 'sm:justify-start'
      }`}
    >
      <span
        aria-hidden="true"
        className="absolute top-1/2 hidden size-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-forest bg-ivory shadow-sm sm:block"
        style={{ left: onRight ? '54%' : '46%' }}
      />

      <Link
        to={`/hostels/${hostel.id}`}
        className="group relative flex w-full flex-col overflow-hidden rounded-[28px] border border-line bg-white shadow-[0_24px_55px_-38px_rgba(41,45,41,0.55)] transition-shadow duration-300 hover:shadow-[0_30px_70px_-36px_rgba(41,45,41,0.45)] sm:w-[46%]"
      >
        <div className="relative overflow-hidden">
          <img
            src={coverPhoto}
            alt={hostel.name}
            loading={index === 0 ? 'eager' : 'lazy'}
            className="h-44 w-full object-cover transition-transform duration-700 group-hover:scale-[1.03] lg:h-48"
          />
          <div className="absolute top-4 left-4">
            <AvailabilityBadge freeBeds={freeBeds} loaded={bedsLoaded} />
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
              <span className="ml-1 text-xs text-charcoal/55">/month</span>
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
}

export default function BranchZigZag({
  hostels,
  freeBedsByHostel,
  bedsLoaded = true,
}) {
  const cardRefs = useRef([])
  const travellerRef = useRef(null)
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    if (hostels.length < 2) {
      
      return undefined
    
    }

    let frameId = null

    function updateActiveIndex() {
      frameId = null

      const traveller = travellerRef.current
      const travellerBox = traveller?.getBoundingClientRect()
      const travellerMiddle = travellerBox
        ? travellerBox.top + travellerBox.height / 2
        : window.innerHeight / 2

      let closestIndex = 0
      let closestDistance = Infinity

      cardRefs.current.forEach((card, index) => {
        if (!card) return

        const box = card.getBoundingClientRect()
        const cardMiddle = box.top + box.height / 2
        const distance = Math.abs(cardMiddle - travellerMiddle)

        if (distance < closestDistance) {
          closestDistance = distance
          closestIndex = index
        }
      })

      setActiveIndex(closestIndex)
    }

    // Runs at most once per animation frame.
    function handleScroll() {
      if (frameId !== null) return
      frameId = window.requestAnimationFrame(updateActiveIndex)
    }

    updateActiveIndex()
    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', handleScroll)

    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleScroll)
      if (frameId !== null) window.cancelAnimationFrame(frameId)
    }
  }, [hostels.length])

  const travellerOnRight = activeIndex % 2 === 0

  return (
    <div className="relative">
      <svg
        className="pointer-events-none absolute inset-0 z-0 hidden h-full w-full sm:block"
        viewBox={`0 0 1000 ${hostels.length * ROW_UNITS}`}
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        {hostels.slice(0, -1).map((hostel, index) => (
          <path
            key={hostel.id}
            d={getCurvePath(index)}
            fill="none"
            stroke="var(--color-forest)"
            strokeOpacity="0.28"
            strokeWidth="2.5"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
        ))}
      </svg>

      {hostels.length > 1 && (
        <div
          className="pointer-events-none absolute inset-0 z-0 hidden sm:block"
          aria-hidden="true"
        >
          <div className="sticky top-24">
            <div
              ref={travellerRef}
              className="w-[46%] transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform motion-reduce:transition-none"
              style={{
                transform: `translateX(${travellerOnRight ? IMAGE_SLIDE : 0}%)`,
              }}
            >
              <img
                src="/movinghero.png"
                alt=""
                width="1112"
                height="1414"
                loading="lazy"
                className={`mx-auto w-full max-w-[19rem] rounded-2xl drop-shadow-[0_24px_32px_rgba(41,45,41,0.18)] transition-transform duration-700 motion-reduce:transition-none ${
                  travellerOnRight ? '' : '-scale-x-100'
                }`}
              />
            </div>
          </div>
        </div>
      )}

      <ol className="relative z-10 flex flex-col gap-6 sm:gap-0">
        {hostels.map((hostel, index) => {
          const hostelId = String(hostel.id)
          const freeBeds = freeBedsByHostel?.get(hostelId) ?? 0

          return (
            <BranchCard
              key={hostel.id}
              cardRef={(node) => {
                cardRefs.current[index] = node
              }}
              hostel={hostel}
              index={index}
              freeBeds={freeBeds}
              bedsLoaded={bedsLoaded}
              onRight={index % 2 === 1}
            />
          )
        })}
      </ol>
    </div>
  )
}
