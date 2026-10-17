import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import Spinner from '../components/common/Spinner'
import HostelCard from '../features/hostels/components/HostelCard'
import {
  fetchHostels,
  selectHostels,
  selectHostelsError,
  selectHostelsLoading,
} from '../features/hostels/hostelSlice'

// Public page that lists every StayInKochi branch for browsing.
export default function HostelListPage() {
  const dispatch = useDispatch()
  const hostels = useSelector(selectHostels)
  const isLoading = useSelector(selectHostelsLoading)
  const error = useSelector(selectHostelsError)

  const [search, setSearch] = useState('')

  useEffect(() => {
    dispatch(fetchHostels())
  }, [dispatch])

  const filtered = hostels.filter((hostel) => {
    const q = search.toLowerCase()
    return (
      hostel.name.toLowerCase().includes(q) ||
      hostel.location.toLowerCase().includes(q) ||
      (hostel.description ?? '').toLowerCase().includes(q)
    )
  })

  const showEmptyMessage = !isLoading && !error && filtered.length === 0

  return (
    <section className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="text-3xl font-bold text-slate-900">Our Branches</h1>
      <p className="mt-2 text-slate-600">
        StayInKochi is available at multiple locations across Kochi.
      </p>

      <div className="mt-6">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by branch name or location…"
          className="w-full max-w-md rounded-md border border-slate-300 px-4 py-2 text-slate-800 focus:border-indigo-500 focus:outline-none"
        />
      </div>

      {isLoading && <Spinner label="Loading branches..." />}

      {error && (
        <p className="mt-8 text-red-600">Could not load branches: {error}</p>
      )}

      {showEmptyMessage && (
        <p className="mt-8 text-slate-600">
          {search ? 'No branches match your search.' : 'No branches available yet.'}
        </p>
      )}

      {!isLoading && !error && filtered.length > 0 && (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((hostel) => (
            <HostelCard key={hostel.id} hostel={hostel} />
          ))}
        </div>
      )}
    </section>
  )
}
