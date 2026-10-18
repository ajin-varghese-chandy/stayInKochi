import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import FormField from '../components/common/FormField'
import Brand from '../components/ui/Brand'
import Alert from '../components/ui/Alert'
import Button from '../components/ui/Button'
import Spinner from '../components/common/Spinner'
import {
  clearAuthError,
  register,
  selectAuthError,
  selectAuthLoading,
} from '../features/auth/authSlice'

// Registration for new tenants. There is only one owner, and that account is
// set up outside the app, so this form always creates a tenant.
export default function RegisterPage() {
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const dispatch = useDispatch()
  const isLoading = useSelector(selectAuthLoading)
  const error = useSelector(selectAuthError)
  const navigate = useNavigate()

  useEffect(() => {
    dispatch(clearAuthError())
  }, [dispatch])

  function handleSubmit(event) {
    event.preventDefault()

    dispatch(register({ displayName, email, password })).then((result) => {
      if (result.meta.requestStatus !== 'fulfilled') return

      navigate('/tenant', { replace: true })
    })
  }

  const waitingForSession = isLoading && !email && !password

  return (
    <section className="mx-auto flex max-w-md flex-col justify-center px-4 py-12 sm:py-16">
      <div className="mb-7 flex justify-center">
        <Brand />
      </div>

      <div className="card p-6 sm:p-8">
        <p className="eyebrow text-terracotta">Join StayInKochi</p>
        <h1 className="mt-2 font-serif text-[1.75rem] leading-tight text-charcoal">
          Create your account
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-charcoal/65">
          Accounts are for tenants. Once the owner approves your stay request,
          your branch, bed, and rent all show up here.
        </p>

        {error && (
          <Alert tone="error" className="mt-5">
            {error}
          </Alert>
        )}

        {waitingForSession ? (
          <div className="mt-6">
            <Spinner compact label="Checking your session…" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <FormField
              label="Full name"
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              autoComplete="name"
              placeholder="Your name"
            />
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
              autoComplete="new-password"
              placeholder="At least 6 characters"
              hint="Used to sign in to your tenant portal."
            />

            <Button type="submit" block disabled={isLoading}>
              {isLoading ? 'Creating account…' : 'Create account'}
            </Button>
          </form>
        )}
      </div>

      <p className="mt-5 text-center text-sm text-charcoal/65">
        Already have an account?{' '}
        <Link to="/login" className="link">
          Sign in
        </Link>
      </p>
    </section>
  )
}
