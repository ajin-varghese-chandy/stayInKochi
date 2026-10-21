import { NavLink } from 'react-router-dom'
import { TENANT_NAV_ITEMS } from './tenantNavItems'

// Centered bottom tab menu (fixed to the viewport bottom by the layout), using
// the same dock language as the owner console so both portals feel like one
// product. Icons stay visible at every width; labels join in from 520px up so
// the bar never crowds a narrow phone. Every target is ≥46px tall.
export default function TenantNav() {
  return (
    <nav
      aria-label="Tenant sections"
      className="tabbar-dock pointer-events-auto"
    >
      {TENANT_NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
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
          <span className="hidden text-[10px] leading-none whitespace-nowrap min-[520px]:block">
            {label}
          </span>
        </NavLink>
      ))}
    </nav>
  )
}
