import { useDispatch, useSelector } from 'react-redux'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { logout, selectCurrentUser } from '../../features/auth/authSlice'

function navLinkClass({ isActive }) {
  return isActive
    ? 'text-indigo-600 font-semibold'
    : 'text-slate-600 hover:text-indigo-600'
}

// Top navigation bar. Shows different links depending on the signed-in role.
export default function Navbar() {
  const user = useSelector(selectCurrentUser)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  function handleLogout() {
    dispatch(logout())
    navigate('/')
  }

  return (
    <header className="bg-white border-b border-slate-200">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link to="/" className="text-xl font-bold text-indigo-600">
          StayInKochi
        </Link>

        <div className="flex items-center gap-6">
          <NavLink to="/hostels" className={navLinkClass}>
            Branches
          </NavLink>

          {user?.role === 'owner' && (
            <NavLink to="/owner" className={navLinkClass}>
              Dashboard
            </NavLink>
          )}
          {user?.role === 'tenant' && (
            <NavLink to="/tenant" className={navLinkClass}>
              Dashboard
            </NavLink>
          )}

          {user ? (
            <button
              type="button"
              onClick={handleLogout}
              className="text-slate-600 hover:text-indigo-600"
            >
              Logout
            </button>
          ) : (
            <>
              <NavLink to="/login" className={navLinkClass}>
                Login
              </NavLink>
              <NavLink to="/register" className={navLinkClass}>
                Register
              </NavLink>
            </>
          )}
        </div>
      </nav>
    </header>
  )
}
