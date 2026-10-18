import { NavLink } from 'react-router-dom'

const TABS = [
  { to: '/tenant', label: 'Dashboard', end: true },
  { to: '/tenant/food', label: 'Food' },
  { to: '/tenant/chat', label: 'Chat' },
  { to: '/tenant/maintenance', label: 'Maintenance' },
  { to: '/tenant/payments', label: 'Rent' },
  { to: '/tenant/switch', label: 'Switch Branch' },
  { to: '/tenant/profile', label: 'Profile' },
]

// Secondary navigation shown on every tenant page.
export default function TenantNav() {
  return (
    <nav className="flex flex-wrap gap-x-6 gap-y-1 border-b border-slate-200">
      {TABS.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          end={tab.end}
          className={({ isActive }) =>
            isActive
              ? 'border-b-2 border-indigo-600 pb-2 font-semibold text-indigo-600'
              : 'pb-2 text-slate-600 hover:text-indigo-600'
          }
        >
          {tab.label}
        </NavLink>
      ))}
    </nav>
  )
}
