import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { subscribeToAuthChange } from '../features/auth/authService'
import { authStateChanged } from '../features/auth/authSlice'

// Keep the Redux auth state in sync with Firebase for the whole app.
export default function useAuthListener() {
  const dispatch = useDispatch()

  useEffect(() => {
    return subscribeToAuthChange((user) => dispatch(authStateChanged(user)))
  }, [dispatch])
}
