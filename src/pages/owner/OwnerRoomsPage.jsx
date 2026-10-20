import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useParams } from 'react-router-dom'
import { BedDouble } from 'lucide-react'
import Alert from '../../components/ui/Alert'
import Button from '../../components/ui/Button'
import EmptyState from '../../components/ui/EmptyState'
import PageHeader from '../../components/ui/PageHeader'
import Spinner from '../../components/common/Spinner'
import RoomForm from '../../features/rooms/components/RoomForm'
import RoomCard from '../../features/rooms/components/RoomCard'
import {
  assignBedToTenant,
  deleteRoomWithBeds,
  fetchHostelRoomsAndBeds,
  freeBedFromTenant,
  selectRooms,
  selectRoomsBeds,
  selectRoomsError,
  selectRoomsLoading,
  selectRoomsSaveError,
  selectRoomsSaving,
} from '../../features/rooms/roomsSlice'
import {
  clearSelectedHostel,
  fetchHostelById,
  selectSelectedHostel,
} from '../../features/hostels/hostelSlice'
import { fetchTenants, selectTenants } from '../../features/tenants/tenantSlice'

// Owner screen for managing one hostel's rooms, beds, and bed assignments.
export default function OwnerRoomsPage() {
  const { hostelId } = useParams()
  const dispatch = useDispatch()

  const hostel = useSelector(selectSelectedHostel)
  const rooms = useSelector(selectRooms)
  const beds = useSelector(selectRoomsBeds)
  const isLoading = useSelector(selectRoomsLoading)
  const error = useSelector(selectRoomsError)
  const saveError = useSelector(selectRoomsSaveError)
  const isSaving = useSelector(selectRoomsSaving)
  const tenants = useSelector(selectTenants)

  // null = form closed; null-room = adding; otherwise editing that room.
  const [isAdding, setIsAdding] = useState(false)
  const [editingRoom, setEditingRoom] = useState(null)

  useEffect(() => {
    dispatch(fetchHostelById(hostelId))
    dispatch(fetchHostelRoomsAndBeds(hostelId))
    dispatch(fetchTenants())

    return () => {
      dispatch(clearSelectedHostel())
    }
  }, [dispatch, hostelId])

  // Tenants who can be assigned to a free bed.
  const assignableTenants = useMemo(
    () => tenants.filter((tenant) => !tenant.bedId),
    [tenants],
  )

  function handleAssign(bed, tenant, room) {
    dispatch(assignBedToTenant({ bed, tenant, room })).then((result) => {
      // Refresh tenants so names/dropdowns stay correct after assignment.
      if (result.meta.requestStatus === 'fulfilled') {
        dispatch(fetchTenants())
      }
    })
  }

  function handleFree(bed) {
    dispatch(freeBedFromTenant({ bed })).then((result) => {
      if (result.meta.requestStatus === 'fulfilled') {
        dispatch(fetchTenants())
      }
    })
  }

  function handleDeleteRoom(room) {
    if (window.confirm(`Delete room ${room.roomNumber} and its beds?`)) {
      dispatch(deleteRoomWithBeds(room.id))
    }
  }

  const showForm = isAdding || editingRoom !== null

  return (
    <section>
      <Link to="/owner/hostels" className="link text-sm">
        ← Back to branches
      </Link>

      <div className="mt-3">
        <PageHeader
          eyebrow="Owner console"
          title={hostel ? `${hostel.name} — rooms` : 'Manage rooms'}
          description="Rooms, beds, and who is assigned to each bed."
          actions={
            showForm ? null : (
              <Button onClick={() => setIsAdding(true)}>Add room</Button>
            )
          }
        />
      </div>

      <div className="mt-6 space-y-4">
        {!isLoading && !error && !showForm && rooms.length === 0 && (
          <EmptyState
            icon={BedDouble}
            title="No rooms yet"
            hint="Add a room to start assigning beds."
          />
        )}

        {showForm && (
          <div className="card p-5">
            <RoomForm
              hostelId={hostelId}
              room={editingRoom}
              onDone={() => {
                setIsAdding(false)
                setEditingRoom(null)
              }}
            />
          </div>
        )}

        {isLoading && <Spinner compact label="Loading rooms and beds…" />}

        {error && <Alert tone="error">Could not load rooms: {error}</Alert>}
        {saveError && <Alert tone="error">{saveError}</Alert>}

        {rooms.map((room) => (
          <RoomCard
            key={room.id}
            room={room}
            beds={beds.filter((bed) => bed.roomId === room.id)}
            assignableTenants={assignableTenants}
            isSaving={isSaving}
            onEdit={() => {
              setIsAdding(false)
              setEditingRoom(room)
            }}
            onDelete={() => handleDeleteRoom(room)}
            onAssign={handleAssign}
            onFree={handleFree}
          />
        ))}
      </div>
    </section>
  )
}
