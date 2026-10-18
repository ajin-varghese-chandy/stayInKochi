import { NavLink } from 'react-router-dom'
import {
  ArrowLeftRight,
  Building2,
  LayoutDashboard,
  MessagesSquare,
  Users,
  UtensilsCrossed,
  Wrench,
  IndianRupee,
} from 'lucide-react'

// Navigation for the owner console, ordered by operational frequency.
export const OWNER_NAV_ITEMS = [
  { to: '/owner', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/owner/hostels', label: 'Branches', icon: Building2 },
  { to: '/owner/tenants', label: 'Tenants', icon: Users },
  { to: '/owner/payments', label: 'Rent', icon: IndianRupee },
  { to: '/owner/food', label: 'Food', icon: UtensilsCrossed },
  { to: '/owner/maintenance', label: 'Upkeep', icon: Wrench },
  { to: '/owner/switches', label: 'Switches', icon: ArrowLeftRight },
  { to: '/owner/chat', label: 'Messages', icon: MessagesSquare },
]

// Centered bottom tab menu (fixed to the viewport bottom by the layout).
// Icons stay visible at every width; labels join in from 400px up so the
// bar never crowds a narrow phone. Every target is ≥48px tall.
export default function OwnerNav() {
  return (
    <nav
      aria-label="Owner sections"
      className="mx-auto grid w-full max-w-3xl grid-cols-8 gap-1 px-1.5 py-1.5 sm:max-w-4xl sm:px-3"
    >
      {OWNER_NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          title={label}
          className={({ isActive }) =>
            `tabbar-link ${isActive ? 'is-active' : ''}`
          }
        >
          <Icon size={19} strokeWidth={1.75} aria-hidden="true" />
          <span className="hidden text-[10px] leading-none min-[400px]:block">
            {label}
          </span>
        </NavLink>
      ))}
    </nav>
  )
}
