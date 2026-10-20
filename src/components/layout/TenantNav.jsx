import { NavLink } from 'react-router-dom'
import { TENANT_NAV_ITEMS } from './tenantNavItems'

// Tenant portal navigation in two forms:
//   variant="tabs"   underline tab strip for sm+ screens (sits in the header)
//   variant="bottom" fixed bottom tab bar for phones (mounted by the layout)
// Both use the same items and the same active language: forest text on a
// sage highlight — high contrast against white in either form.
export default function TenantNav({ variant = 'tabs' }) {
  if (variant === 'bottom') {
    return (
      <nav
        aria-label="Tenant sections"
        className="grid grid-cols-7 gap-0.5 px-1.5 py-1.5"
      >
        {TENANT_NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            title={label}
            className={({ isActive }) =>
              `flex min-h-12 flex-col items-center justify-center gap-1 rounded-card px-0.5 py-1.5 text-[10px] font-medium leading-none transition-colors ${
                isActive
                  ? 'bg-sage/70 text-forest'
                  : 'text-charcoal/70 hover:bg-charcoal/5 hover:text-charcoal'
              }`
            }
          >
            <Icon size={19} strokeWidth={1.75} aria-hidden="true" />
            <span className="hidden min-[400px]:block">{label}</span>
          </NavLink>
        ))}
      </nav>
    )
  }

  return (
    <nav
      aria-label="Tenant sections"
      className="nav-scroll items-center gap-5 sm:gap-6"
    >
      {TENANT_NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            `tab flex shrink-0 items-center gap-2 text-charcoal/80 ${
              isActive ? 'is-active' : ''
            }`
          }
        >
          <Icon size={15} strokeWidth={1.75} aria-hidden="true" />
          {label}
        </NavLink>
      ))}
    </nav>
  )
}
