import { useDispatch, useSelector } from 'react-redux'
import { Outlet } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import Brand from '../ui/Brand'
import NotificationBell from '../common/NotificationBell'
import TenantNav from './TenantNav'
import { logout, selectCurrentUser } from '../../features/auth/authSlice'

// Tenant portal shell: compact white header (wordmark, notifications, logout)
// with the section tab strip directly beneath it. Optimised for phones —
// the strip scrolls horizontally instead of wrapping, content is padded
// by the layout, and every control keeps a comfortable touch target.
export default function TenantLayout() {
  const user = useSelector(selectCurrentUser)
  const dispatch = useDispatch()

  return (
    <div className="flex min-h-screen flex-col bg-ivory">
      <header className="sticky top-0 z-40 border-b border-line bg-white">
        <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between gap-3 px-4 sm:px-6">
          <Brand markSize="h-6 w-6" />

          <div className="flex items-center gap-1.5">
            <NotificationBell user={user} to="/tenant" />
            <span className="hidden text-sm text-charcoal/70 sm:inline">
              {user?.displayName ?? user?.email ?? ''}
            </span>
            <button
              type="button"
              onClick={() => dispatch(logout())}
              title="Logout"
              aria-label="Logout"
              className="flex h-9 w-9 items-center justify-center rounded-card text-charcoal/60 transition-colors hover:bg-charcoal/5 hover:text-charcoal"
            >
              <LogOut size={17} strokeWidth={1.75} aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className="border-t border-line">
          <div className="mx-auto w-full max-w-5xl px-4 sm:px-6">
            <TenantNav />
          </div>
        </div>
      </header>

      <main className="flex-1 px-4 py-5 sm:px-6 sm:py-7">
        <div className="mx-auto w-full max-w-5xl">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
