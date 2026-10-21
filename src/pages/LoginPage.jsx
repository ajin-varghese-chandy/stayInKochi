import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import FormField from '../components/common/FormField'
import Brand from '../components/ui/Brand'
import Alert from '../components/ui/Alert'
import Button from '../components/ui/Button'
import {
  clearAuthError,
  login,
  selectAuthError,
  selectAuthSubmitting,
  selectCurrentUser,
} from '../features/auth/authSlice'

// Sign-in screen. Centre column on ivory; serif title is one of the few
// display-type moments outside the landing page.
export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const dispatch = useDispatch()
  const user = useSelector(selectCurrentUser)
  const isSubmitting = useSelector(selectAuthSubmitting)
  const error = useSelector(selectAuthError)
  const navigate = useNavigate()
  const location = useLocation()

  // Where the user was originally heading before being sent to login.
  const redirectTo = location.state?.from?.pathname

  useEffect(() => {
    dispatch(clearAuthError())
  }, [dispatch])

  // Already signed in (arrived from an old link, or just finished signing in):
  // leave the form straight away instead of asking for credentials again.
  useEffect(() => {
    if (!user) return
    const fallback = user.role === 'owner' ? '/owner' : '/tenant'
    navigate(redirectTo ?? fallback, { replace: true })
  }, [navigate, redirectTo, user])

  function handleSubmit(event) {
    event.preventDefault()
    dispatch(login({ email, password }))
  }

  return (
    <section className="mx-auto flex max-w-md flex-col justify-center px-4 py-12 sm:py-16">
      <div className="mb-7 flex justify-center">
        <Brand />
      </div>

      <div className="card p-6 sm:p-8">
        <p className="eyebrow text-terracotta">Welcome back</p>
        <h1 className="mt-2 display text-[1.75rem] leading-tight text-charcoal">
          Sign in to your stay
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-charcoal/65">
          Rent, food, upkeep, and messages for your branch — all in one account.
        </p>

        {error && (
          <Alert tone="error" className="mt-5">
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <FormField
            label="Email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            placeholder="you@example.com"
          />
          <FormField
            label="Password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            placeholder="••••••••"
          />

          <Button type="submit" block disabled={isSubmitting}>
            {isSubmitting ? 'Signing in…' : 'Sign in'}
          </Button>
        </form>
      </div>

      <p className="mt-5 text-center text-sm text-charcoal/65">
        New to StayInKochi?{' '}
        <Link to="/register" className="link">
          Create an account
        </Link>
      </p>
    </section>
  )
}
