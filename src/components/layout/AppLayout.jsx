import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'

// Shared page shell: top nav + page content + footer.
export default function AppLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-sm text-slate-400">
        © {new Date().getFullYear()} StayInKochi · Premium PG &amp; Hostel Living, Kochi
      </footer>
    </div>
  )
}
