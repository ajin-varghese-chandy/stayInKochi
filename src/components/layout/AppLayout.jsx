import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'

// Shared page shell: a top navigation bar plus the current page's content.
export default function AppLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  )
}
