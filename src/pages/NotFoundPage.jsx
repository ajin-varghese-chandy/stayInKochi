import { Link } from 'react-router-dom'

// Shown for URLs that don't match any route.
export default function NotFoundPage() {
  return (
    <section className="mx-auto max-w-2xl px-4 py-20 text-center">
      <h1 className="text-4xl font-bold text-slate-900">Page not found</h1>
      <p className="mt-3 text-slate-600">
        The page you are looking for does not exist.
      </p>
      <Link
        to="/"
        className="mt-6 inline-block rounded-md bg-indigo-600 px-6 py-3 font-medium text-white hover:bg-indigo-700"
      >
        Back to home
      </Link>
    </section>
  )
}
