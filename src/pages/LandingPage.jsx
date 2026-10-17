import { Link } from 'react-router-dom'

const FEATURES = [
  {
    icon: '🏠',
    title: 'Multiple branches',
    desc: 'All under the StayInKochi brand — Kakkanad, Vytilla, and more across Kochi.',
  },
  {
    icon: '🍽️',
    title: 'Food plans & meals',
    desc: 'Subscribe to monthly meal plans or book individual meals at your branch.',
  },
  {
    icon: '🔧',
    title: 'Maintenance requests',
    desc: 'Raise issues directly to management and track resolution in real time.',
  },
  {
    icon: '💬',
    title: 'Direct chat',
    desc: 'Message your branch group or talk privately with the owner anytime.',
  },
]

// Public landing page introducing StayInKochi.
export default function LandingPage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-indigo-50 to-white">
        <div className="mx-auto max-w-4xl px-4 py-20 text-center">
          <span className="inline-block rounded-full bg-indigo-100 px-4 py-1 text-sm font-medium text-indigo-700">
            Premium PG &amp; Hostel Living · Kochi
          </span>
          <h1 className="mt-4 text-4xl font-bold text-slate-900 sm:text-5xl">
            Welcome to <span className="text-indigo-600">StayInKochi</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600">
            One brand, multiple branches across Kochi. Fully managed
            accommodation — pay rent, book food, chat with management, and
            handle everything from one place.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/hostels"
              className="rounded-md bg-indigo-600 px-6 py-3 font-medium text-white hover:bg-indigo-700"
            >
              View branches
            </Link>
            <Link
              to="/register"
              className="rounded-md border border-slate-300 px-6 py-3 font-medium text-slate-700 hover:bg-slate-100"
            >
              Create an account
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-5xl px-4 py-16">
        <h2 className="text-center text-2xl font-bold text-slate-900">
          Everything included
        </h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="rounded-lg border border-slate-200 bg-white p-5 text-center shadow-sm"
            >
              <span className="text-3xl">{f.icon}</span>
              <h3 className="mt-3 font-semibold text-slate-900">{f.title}</h3>
              <p className="mt-2 text-sm text-slate-500">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-indigo-600">
        <div className="mx-auto max-w-3xl px-4 py-12 text-center">
          <h2 className="text-2xl font-bold text-white">
            Ready to move in?
          </h2>
          <p className="mt-2 text-indigo-200">
            Browse our branches and submit a stay request in minutes.
          </p>
          <Link
            to="/hostels"
            className="mt-6 inline-block rounded-md bg-white px-6 py-3 font-medium text-indigo-600 hover:bg-indigo-50"
          >
            Browse branches
          </Link>
        </div>
      </section>
    </div>
  )
}
