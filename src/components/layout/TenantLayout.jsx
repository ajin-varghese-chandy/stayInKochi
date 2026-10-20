import { useDispatch, useSelector } from 'react-redux'
import { Outlet } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import Brand from '../ui/Brand'
import NotificationBell from '../common/NotificationBell'
import TenantNav from './TenantNav'
import { logout, selectCurrentUser } from '../../features/auth/authSlice'

// Tenant portal shell: a light sticky header (wordmark, avatar, bell, logout)
// with an underline tab strip from sm up, and a fixed bottom tab bar on
// phones where navigation sits under the thumb. Main content is padded clear
// of the bar, and every control keeps a comfortable touch target.
export default function TenantLayout() {
  const user = useSelector(selectCurrentUser)
  const dispatch = useDispatch()

  const name = user?.displayName ?? user?.email ?? 'Tenant'
  const initial = name.trim().charAt(0).toUpperCase() || 'T'

  return (
    <div className="flex min-h-screen flex-col bg-ivory">
      <header className="sticky top-0 z-40 border-b border-line bg-white">
        <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between gap-3 px-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <Brand markSize="h-6 w-6" />
            <span className="eyebrow hidden border-l border-line-strong pl-3 text-charcoal/70 sm:inline">
              Tenant portal
            </span>
          </div>

          <div className="flex shrink-0 items-center gap-1.5">
            <NotificationBell user={user} to="/tenant" />
            <span
              aria-hidden="true"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-sage text-sm font-semibold text-forest"
            >
              {initial}
            </span>
            <span className="hidden max-w-36 truncate text-sm text-charcoal/70 md:inline">
              {name}
            </span>
            <button
              type="button"
              onClick={() => dispatch(logout())}
              className="flex min-h-9 items-center gap-1.5 rounded-card px-2.5 text-sm font-medium text-charcoal/70 transition-colors hover:bg-charcoal/5 hover:text-charcoal"
            >
              <LogOut size={16} strokeWidth={1.75} aria-hidden="true" />
              Logout
            </button>
          </div>
        </div>

        {/* Underline tab strip — sm and up */}
        <div className="mx-auto hidden w-full max-w-5xl px-4 sm:block sm:px-6">
          <TenantNav variant="tabs" />
        </div>
      </header>

      <main className="flex-1 px-4 py-6 pb-28 sm:px-6 sm:py-8">
        <div className="mx-auto w-full max-w-5xl">
          <Outlet />
        </div>
      </main>

      {/* Bottom tab bar — phones only */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_16px_rgba(41,45,41,0.07)] sm:hidden">
        <TenantNav variant="bottom" />
      </div>
    </div>
  )
}
