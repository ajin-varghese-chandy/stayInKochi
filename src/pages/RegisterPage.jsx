import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import FormField from '../components/common/FormField'
import {
  clearAuthError,
  register,
  selectAuthError,
  selectAuthLoading,
} from '../features/auth/authSlice'

// Registration form for new tenants. There is only one owner, and that account
// is set up outside the app, so this form always creates a tenant.
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

  return (
    <section className="mx-auto max-w-md px-4 py-16">
      <h1 className="text-3xl font-bold text-slate-900">Create an account</h1>
      <p className="mt-2 text-slate-600">Join StayInKochi as a tenant.</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <FormField
          label="Full name"
          value={displayName}
          onChange={(event) => setDisplayName(event.target.value)}
          autoComplete="name"
        />
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
          autoComplete="new-password"
        />

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-md bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
        >
          {isLoading ? 'Creating account...' : 'Register'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-600">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-indigo-600">
          Login
        </Link>
      </p>
    </section>
  )
}
