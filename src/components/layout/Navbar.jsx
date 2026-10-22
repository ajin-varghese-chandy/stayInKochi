import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { NavLink, useNavigate } from 'react-router-dom'
import { LogOut, Menu, X } from 'lucide-react'
import Brand from '../ui/Brand'
import Button from '../ui/Button'
import NotificationBell from '../common/NotificationBell'
import { logout, selectCurrentUser } from '../../features/auth/authSlice'

function linkClass({ isActive }) {
  return `topbar-link ${isActive ? 'is-active' : ''}`
}

// Public navigation: a floating forest bar in the same material as the console
// dock — wordmark left, actions right. Collapses into a matching panel on
// small screens, which closes itself as soon as anything inside is tapped.
export default function Navbar() {
  const user = useSelector(selectCurrentUser)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  function handleLogout() {
    dispatch(logout())
    navigate('/')
  }

  const dashboardPath = user?.role === 'owner' ? '/owner' : '/tenant'

  const navLinks = (
    <>
      <NavLink to="/hostels" className={linkClass}>
        Branches
      </NavLink>
      {user && (
        <NavLink to={dashboardPath} className={linkClass}>
          {user.role === 'owner' ? 'Owner console' : 'My stay'}
        </NavLink>
      )}
    </>
  )

  return (
    <header className="px-3 pt-3 sm:px-4">
      <nav className="topbar mx-auto flex h-14 w-full max-w-6xl items-center justify-between gap-3 px-3 sm:px-4">
        <Brand tone="light" markSize="h-6 w-6" />

        {/* Desktop */}
        <div className="hidden items-center gap-1.5 md:flex">
          {navLinks}

          <span aria-hidden="true" className="mx-1.5 h-5 w-px bg-white/15" />

          {user ? (
            <div className="flex items-center gap-1.5">
              <NotificationBell user={user} to={dashboardPath} tone="light" />
              <button
                type="button"
                onClick={handleLogout}
                className="flex min-h-9 items-center gap-2 rounded-card px-2.5 text-sm text-ivory/75 transition-colors hover:bg-white/10 hover:text-ivory"
              >
                <LogOut size={16} strokeWidth={1.75} aria-hidden="true" />
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="outlineLight" size="sm" to="/login">
                Login
              </Button>
              <Button variant="light" size="sm" to="/register">
                Create account
              </Button>
            </div>
          )}
        </div>

        {/* Mobile trigger */}
        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          className="-mr-1 flex h-10 w-10 items-center justify-center rounded-lg text-ivory/75 transition-colors hover:bg-white/10 hover:text-ivory md:hidden"
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      {/* Mobile panel — same dock material, stacked full-width links */}
      {menuOpen && (
        <div
          onClick={() => setMenuOpen(false)}
          className="topbar mx-auto mt-2 w-full max-w-6xl p-2 md:hidden"
        >
          <div className="flex flex-col gap-0.5">{navLinks}</div>

          {user ? (
            <div className="mt-2 flex items-center justify-between border-t border-white/15 px-1 pt-2">
              <NotificationBell user={user} to={dashboardPath} tone="light" />
              <button
                type="button"
                onClick={handleLogout}
                className="flex min-h-10 items-center gap-2 rounded-card px-2.5 text-sm text-ivory/75 transition-colors hover:bg-white/10 hover:text-ivory"
              >
                <LogOut size={16} strokeWidth={1.75} aria-hidden="true" />
                Logout
              </button>
            </div>
          ) : (
            <div className="mt-2 flex gap-2 border-t border-white/15 px-1 pt-2">
              <Button
                variant="outlineLight"
                size="sm"
                to="/login"
                className="min-h-10 flex-1"
              >
                Login
              </Button>
              <Button
                variant="light"
                size="sm"
                to="/register"
                className="min-h-10 flex-1"
              >
                Create account
              </Button>
            </div>
          )}
        </div>
      )}
    </header>
  )
}
