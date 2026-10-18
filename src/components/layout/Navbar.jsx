import { useDispatch, useSelector } from 'react-redux'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { logout, selectCurrentUser } from '../../features/auth/authSlice'
import { useEffect } from 'react'
import { fetchMyNotifications, selectUnreadCount } from '../../features/notifications/notificationSlice'
import { OWNER_INBOX } from '../../features/notifications/notificationService'

function navLinkClass({ isActive }) {
  return isActive
    ? 'text-indigo-600 font-semibold'
    : 'text-slate-600 hover:text-indigo-600'
}

// Top navigation bar. Shows different links depending on the signed-in role.
export default function Navbar() {
  const user = useSelector(selectCurrentUser)
  const unreadCount = useSelector(selectUnreadCount)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  // Keep the unread badge live whenever the user is signed in.
  useEffect(() => {
    if (!user) return
    const recipientId = user.role === 'owner' ? OWNER_INBOX : user.uid
    dispatch(fetchMyNotifications(recipientId))
  }, [dispatch, user])

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
            <div className="flex items-center gap-4">
              {/* Notification bell with unread badge */}
              <NavLink
                to={user.role === 'owner' ? '/owner' : '/tenant'}
                className="relative text-slate-600 hover:text-indigo-600"
                title="Notifications"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {unreadCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </NavLink>

              <button
                type="button"
                onClick={handleLogout}
                className="text-slate-600 hover:text-indigo-600"
              >
                Logout
              </button>
            </div>
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
