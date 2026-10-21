import { useDispatch, useSelector } from 'react-redux'
import { Outlet } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import Brand from '../ui/Brand'
import NotificationBell from '../common/NotificationBell'
import FloatingDock from './FloatingDock'
import OwnerNav from './OwnerNav'
import { logout, selectCurrentUser } from '../../features/auth/authSlice'

// Owner console shell: a floating forest top bar in the same material as the
// bottom dock, ivory content, and a centered bottom tab menu fixed to the
// viewport (icons only below 520px, labels above). Content carries extra
// bottom padding so nothing sits under the tab bar.
export default function OwnerLayout() {
  const user = useSelector(selectCurrentUser)
  const dispatch = useDispatch()
  const name = user?.displayName ?? user?.email ?? 'Owner'

  return (
    <div className="min-h-screen bg-ivory">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-ivory px-3 pt-3 pb-1 sm:px-4">
        <div className="topbar mx-auto flex h-14 w-full max-w-6xl items-center justify-between gap-3 px-3 sm:px-4">
          <div className="flex min-w-0 items-center gap-4">
            <Brand tone="light" to="/owner" markSize="h-6 w-6" />
            <span className="eyebrow eyebrow-light hidden border-l border-white/20 pl-4 sm:inline">
              Owner console
            </span>
          </div>

          <div className="flex shrink-0 items-center gap-1.5">
            <NotificationBell user={user} to="/owner" tone="light" />
            <span className="hidden max-w-40 truncate text-sm text-ivory/70 md:inline">
              {name}
            </span>
            <button
              type="button"
              onClick={() => dispatch(logout())}
              className="flex min-h-9 items-center gap-2 rounded-card px-2.5 text-sm text-ivory/75 transition-colors hover:bg-white/10 hover:text-ivory"
            >
              <LogOut size={16} strokeWidth={1.75} aria-hidden="true" />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto w-full max-w-6xl px-4 py-6 pb-28 sm:px-6 sm:pt-8 sm:pb-32">
        <Outlet />
      </main>

      {/* Floating bottom tab menu */}
      <FloatingDock>
        <OwnerNav />
      </FloatingDock>
    </div>
  )
}
