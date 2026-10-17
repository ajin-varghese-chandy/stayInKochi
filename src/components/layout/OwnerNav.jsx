import { NavLink } from 'react-router-dom'

const TABS = [
  { to: '/owner', label: 'Dashboard', end: true },
  { to: '/owner/hostels', label: 'Branches' },
  { to: '/owner/food', label: 'Food' },
  { to: '/owner/chat', label: 'Chat' },
  { to: '/owner/maintenance', label: 'Maintenance' },
  { to: '/owner/payments', label: 'Payments' },
  { to: '/owner/tenants', label: 'Tenants' },
  { to: '/owner/switches', label: 'Switches' },
]

// Secondary navigation shown on every owner page.
export default function OwnerNav() {
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
