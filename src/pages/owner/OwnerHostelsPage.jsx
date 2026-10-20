import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Building2 } from 'lucide-react'
import Alert from '../../components/ui/Alert'
import Button from '../../components/ui/Button'
import EmptyState from '../../components/ui/EmptyState'
import PageHeader from '../../components/ui/PageHeader'
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
    <section>
      <PageHeader
        eyebrow="Owner console"
        title="Branches"
        description="Add, edit, and remove the hostels you run."
        actions={
          showForm ? null : (
            <Button onClick={() => setIsAdding(true)}>Add branch</Button>
          )
        }
      />

      <div className="mt-6 space-y-4">
        {showForm && (
          <div className="card p-5">
            <HostelForm
              hostel={editingHostel}
              onDone={() => {
                setIsAdding(false)
                setEditingHostel(null)
              }}
            />
          </div>
        )}

        {isLoading && <Spinner compact label="Loading branches…" />}

        {error && <Alert tone="error">Could not load branches: {error}</Alert>}

        {!isLoading && !error && hostels.length === 0 && (
          <EmptyState
            icon={Building2}
            title="No branches yet"
            hint="Add your first branch to get started."
          />
        )}

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
