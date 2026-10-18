import { NavLink } from 'react-router-dom'
import {
  ArrowLeftRight,
  IndianRupee,
  LayoutDashboard,
  MessageSquare,
  User,
  UtensilsCrossed,
  Wrench,
} from 'lucide-react'

// Tenant portal navigation: a horizontally scrollable tab strip that never
// wraps and keeps 44px touch targets on mobile.
export const TENANT_NAV_ITEMS = [
  { to: '/tenant', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/tenant/payments', label: 'Rent', icon: IndianRupee },
  { to: '/tenant/food', label: 'Food', icon: UtensilsCrossed },
  { to: '/tenant/maintenance', label: 'Upkeep', icon: Wrench },
  { to: '/tenant/chat', label: 'Messages', icon: MessageSquare },
  { to: '/tenant/switch', label: 'Switch', icon: ArrowLeftRight },
  { to: '/tenant/profile', label: 'Profile', icon: User },
]

export default function TenantNav() {
  return (
    <nav className="nav-scroll" aria-label="Tenant sections">
      {TENANT_NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            `tab inline-flex min-h-11 items-center gap-2 ${
              isActive ? 'is-active' : ''
            }`
          }
        >
          <Icon size={16} strokeWidth={1.75} aria-hidden="true" />
          {label}
        </NavLink>
      ))}
    </nav>
  )
}
