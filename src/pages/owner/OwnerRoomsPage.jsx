import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useParams } from 'react-router-dom'
import OwnerNav from '../../components/layout/OwnerNav'
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
    <section className="mx-auto max-w-4xl px-4 py-12">
      <Link to="/owner/hostels" className="text-indigo-600">
        &larr; Back to hostels
      </Link>

      <h1 className="mt-3 text-3xl font-bold text-slate-900">
        {hostel ? `${hostel.name} — rooms` : 'Manage rooms'}
      </h1>

      <div className="mt-6">
        <OwnerNav />
      </div>

      <div className="mt-6 flex items-center justify-between">
        <p className="text-slate-600">{rooms.length} rooms</p>
        {!showForm && (
          <button
            type="button"
            onClick={() => setIsAdding(true)}
            className="rounded-md bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700"
          >
            Add room
          </button>
        )}
      </div>

      {showForm && (
        <div className="mt-4">
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

      {isLoading && <Spinner label="Loading rooms and beds..." />}

      {error && (
        <p className="mt-6 text-red-600">Could not load rooms: {error}</p>
      )}

      {saveError && <p className="mt-6 text-red-600">{saveError}</p>}

      {!isLoading && !error && rooms.length === 0 && (
        <p className="mt-6 text-slate-600">
          No rooms yet. Add a room to start assigning beds.
        </p>
      )}

      <div className="mt-4 space-y-4">
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
