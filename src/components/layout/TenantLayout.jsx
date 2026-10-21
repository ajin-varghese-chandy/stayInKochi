import { useDispatch, useSelector } from 'react-redux'
import { Outlet } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import Brand from '../ui/Brand'
import NotificationBell from '../common/NotificationBell'
import FloatingDock from './FloatingDock'
import TenantNav from './TenantNav'
import { logout, selectCurrentUser } from '../../features/auth/authSlice'

// Tenant portal shell: a floating forest top bar in the same material as the
// console dock (wordmark, avatar, bell, logout) and a centered bottom tab menu
// fixed to the viewport at every width. Main content is padded clear of the
// bar, and every control keeps a comfortable touch target.
export default function TenantLayout() {
  const user = useSelector(selectCurrentUser)
  const dispatch = useDispatch()

  const name = user?.displayName ?? user?.email ?? 'Tenant'
  const initial = name.trim().charAt(0).toUpperCase() || 'T'

  return (
    <div className="flex min-h-screen flex-col bg-ivory">
      <header className="sticky top-0 z-40 bg-ivory px-3 pt-3 pb-1 sm:px-4">
        <div className="topbar mx-auto flex h-14 w-full max-w-5xl items-center justify-between gap-3 px-3 sm:px-4">
          <div className="flex min-w-0 items-center gap-3">
            <Brand tone="light" markSize="h-6 w-6" />
            <span className="eyebrow eyebrow-light hidden border-l border-white/20 pl-3 sm:inline">
              Tenant portal
            </span>
          </div>

          <div className="flex shrink-0 items-center gap-1.5">
            <NotificationBell user={user} to="/tenant" tone="light" />
            <span
              aria-hidden="true"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-sage text-sm font-semibold text-forest"
            >
              {initial}
            </span>
            <span className="hidden max-w-36 truncate text-sm text-ivory/70 md:inline">
              {name}
            </span>
            <button
              type="button"
              onClick={() => dispatch(logout())}
              className="flex min-h-9 items-center gap-1.5 rounded-card px-2.5 text-sm font-medium text-ivory/75 transition-colors hover:bg-white/10 hover:text-ivory"
            >
              <LogOut size={16} strokeWidth={1.75} aria-hidden="true" />
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 px-4 py-6 pb-28 sm:px-6 sm:pt-8 sm:pb-32">
        <div className="mx-auto w-full max-w-5xl">
          <Outlet />
        </div>
      </main>

      {/* Floating bottom tab menu */}
      <FloatingDock>
        <TenantNav />
      </FloatingDock>
    </div>
  )
}
