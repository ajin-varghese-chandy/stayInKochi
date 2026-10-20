import { Link } from 'react-router-dom'
import Brand from '../ui/Brand'

// Compact footer for the public site: wordmark, two short link groups, colophon.
export default function Footer() {
  return (
    <footer className="bg-charcoal">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="flex flex-col gap-8 sm:flex-row sm:justify-between">
          <div className="max-w-xs">
            <Brand tone="light" />
            <p className="mt-3 text-sm leading-relaxed text-white/55">
              Privately managed hostel and PG stays across Kochi — one owner,
              every branch, one account.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 text-sm">
            <div>
              <p className="eyebrow eyebrow-light">Explore</p>
              <ul className="mt-3 space-y-2">
                <li>
                  <Link
                    to="/hostels"
                    className="text-white/65 transition-colors hover:text-white"
                  >
                    Branches
                  </Link>
                </li>
                <li>
                  <Link
                    to="/register"
                    className="text-white/65 transition-colors hover:text-white"
                  >
                    Create account
                  </Link>
                </li>
                <li>
                  <Link
                    to="/login"
                    className="text-white/65 transition-colors hover:text-white"
                  >
                    Login
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <p className="eyebrow eyebrow-light">Your account</p>
              <ul className="mt-3 space-y-2">
                <li>
                  <Link
                    to="/tenant"
                    className="text-white/65 transition-colors hover:text-white"
                  >
                    Tenant portal
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-9 flex flex-col gap-1 border-t border-white/10 pt-5 text-xs text-white/40 sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} StayInKochi</span>
          <span>Kochi, Kerala</span>
        </div>
      </div>
    </footer>
  )
}
