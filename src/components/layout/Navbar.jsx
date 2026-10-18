import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { LogOut, Menu, X } from 'lucide-react'
import Brand from '../ui/Brand'
import Button from '../ui/Button'
import NotificationBell from '../common/NotificationBell'
import { logout, selectCurrentUser } from '../../features/auth/authSlice'

function linkClass({ isActive }) {
  return isActive
    ? 'text-forest font-semibold'
    : 'text-charcoal/65 hover:text-forest'
}

// Public navigation: restrained bar, wordmark left, actions right.
// Collapses into a tap-friendly panel on small screens.
export default function Navbar() {
  const user = useSelector(selectCurrentUser)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  // Close the mobile panel whenever the route changes.
  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname])

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
      {!user && (
        <NavLink to="/login" className={linkClass}>
          Login
        </NavLink>
      )}
    </>
  )

  return (
    <header className="border-b border-line bg-white">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-6 px-4 sm:px-6">
        <Brand />

        {/* Desktop */}
        <div className="hidden items-center gap-7 md:flex">
          {navLinks}

          {user ? (
            <div className="flex items-center gap-2">
              <NotificationBell user={user} to={dashboardPath} />
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut size={15} strokeWidth={1.75} aria-hidden="true" />
                Logout
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="secondary" size="sm" to="/login">
                Login
              </Button>
              <Button size="sm" to="/register">
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
          className="-mr-2 flex h-10 w-10 items-center justify-center rounded-card text-charcoal/70 hover:bg-charcoal/5 md:hidden"
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      {/* Mobile panel */}
      {menuOpen && (
        <div className="border-t border-line bg-white md:hidden">
          <div className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-3 sm:px-6">
            {navLinks}

            {user ? (
              <div className="mt-1 flex items-center justify-between border-t border-line pt-3">
                <NotificationBell user={user} to={dashboardPath} />
                <Button variant="secondary" size="sm" onClick={handleLogout}>
                  <LogOut size={15} strokeWidth={1.75} aria-hidden="true" />
                  Logout
                </Button>
              </div>
            ) : (
              <div className="mt-1 flex gap-2 border-t border-line pt-3">
                <Button variant="secondary" size="sm" to="/login" className="flex-1">
                  Login
                </Button>
                <Button size="sm" to="/register" className="flex-1">
                  Create account
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
