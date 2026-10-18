import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import FormField from '../components/common/FormField'
import {
  clearAuthError,
  login,
  selectAuthError,
  selectAuthSubmitting,
} from '../features/auth/authSlice'

// Sign-in form for existing users.
export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const dispatch = useDispatch()
  const isSubmitting = useSelector(selectAuthSubmitting)
  const error = useSelector(selectAuthError)
  const navigate = useNavigate()
  const location = useLocation()

  // Where the user was originally heading before being sent to login.
  const redirectTo = location.state?.from?.pathname

  // Clear any leftover error from a previous attempt.
  useEffect(() => {
    dispatch(clearAuthError())
  }, [dispatch])

  function handleSubmit(event) {
    event.preventDefault()

    dispatch(login({ email, password })).then((result) => {
      if (result.meta.requestStatus !== 'fulfilled') return

      const user = result.payload
      const fallback = user.role === 'owner' ? '/owner' : '/tenant'
      navigate(redirectTo ?? fallback, { replace: true })
    })
  }

  return (
    <section className="mx-auto max-w-md px-4 py-16">
      <h1 className="text-3xl font-bold text-slate-900">Login</h1>
      <p className="mt-2 text-slate-600">Sign in to your StayInKochi account.</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <FormField
          label="Email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoComplete="email"
        />
        <FormField
          label="Password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="current-password"
        />

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-md bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
        >
          {isSubmitting ? 'Signing in...' : 'Login'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-600">
        No account yet?{' '}
        <Link to="/register" className="font-medium text-indigo-600">
          Register
        </Link>
      </p>
    </section>
  )
}
