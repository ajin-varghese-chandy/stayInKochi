import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import OwnerNav from '../../components/layout/OwnerNav'
import Spinner from '../../components/common/Spinner'
import HostelForm from '../../features/hostels/components/HostelForm'
import OwnerHostelCard from '../../features/hostels/components/OwnerHostelCard'
import {
  deleteHostel,
  fetchHostels,
  selectHostels,
  selectHostelsError,
  selectHostelsLoading,
  selectHostelsSaving,
} from '../../features/hostels/hostelSlice'

// Owner screen for adding, editing, and removing StayInKochi branches.
export default function OwnerHostelsPage() {
  const dispatch = useDispatch()
  const hostels = useSelector(selectHostels)
  const isLoading = useSelector(selectHostelsLoading)
  const error = useSelector(selectHostelsError)
  const isSaving = useSelector(selectHostelsSaving)

  // null = form closed; null-hostel = adding; otherwise editing that hostel.
  const [editingHostel, setEditingHostel] = useState(null)
  const [isAdding, setIsAdding] = useState(false)

  useEffect(() => {
    dispatch(fetchHostels())
  }, [dispatch])

  function handleDelete(hostel) {
    const confirmed = window.confirm(`Delete "${hostel.name}"?`)
    if (confirmed) {
      dispatch(deleteHostel(hostel.id))
    }
  }

  const showForm = isAdding || editingHostel !== null

  return (
    <section className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-3xl font-bold text-slate-900">Manage branches</h1>

      <div className="mt-6">
        <OwnerNav />
      </div>

      <div className="mt-6 flex items-center justify-between">
        <p className="text-slate-600">{hostels.length} branches</p>
        {!showForm && (
          <button
            type="button"
            onClick={() => setIsAdding(true)}
            className="rounded-md bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700"
          >
            Add branch
          </button>
        )}
      </div>

      {showForm && (
        <div className="mt-4">
          <HostelForm
            hostel={editingHostel}
            onDone={() => {
              setIsAdding(false)
              setEditingHostel(null)
            }}
          />
        </div>
      )}

      {isLoading && <Spinner label="Loading hostels..." />}

      {error && <p className="mt-6 text-red-600">Could not load branches: {error}</p>}

      {!isLoading && !error && hostels.length === 0 && (
        <p className="mt-6 text-slate-600">
          No branches yet. Add your first branch to get started.
        </p>
      )}

      <div className="mt-4 space-y-4">
        {hostels.map((hostel) => (
          <OwnerHostelCard
            key={hostel.id}
            hostel={hostel}
            isSaving={isSaving}
            onEdit={() => {
              setIsAdding(false)
              setEditingHostel(hostel)
            }}
            onDelete={() => handleDelete(hostel)}
          />
        ))}
      </div>
    </section>
  )
}
