import { useSelector } from 'react-redux'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import Spinner from '../components/common/Spinner'
import {
  selectAuthLoading,
  selectCurrentUser,
} from '../features/auth/authSlice'

// Guard private pages: wait for auth to load, send guests to login, and send
// wrong-role users to their own dashboard.
export default function ProtectedRoute({ requiredRole }) {
  const user = useSelector(selectCurrentUser)
  const isLoading = useSelector(selectAuthLoading)
  const location = useLocation()

  // Still figuring out who is signed in — don't redirect yet.
  if (isLoading) {
    return <Spinner label="Checking your session..." />
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to={user.role === 'owner' ? '/owner' : '/tenant'} replace />
  }

  return <Outlet />
}
