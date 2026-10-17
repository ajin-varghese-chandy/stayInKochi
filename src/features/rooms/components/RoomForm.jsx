import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import FormField from '../../../components/common/FormField'
import {
  clearRoomSaveFeedback,
  createRoomWithBeds,
  selectRoomsSaveError,
  selectRoomsSaving,
  updateRoomDetails,
} from '../roomsSlice'

// Add or edit a room. Pass `room` to edit (bed count can't change on edit).
export default function RoomForm({ hostelId, room, onDone }) {
  const [roomNumber, setRoomNumber] = useState(room?.roomNumber ?? '')
  const [floor, setFloor] = useState(room?.floor ?? 1)
  const [rentPerMonth, setRentPerMonth] = useState(room?.rentPerMonth ?? '')
  const [bedCount, setBedCount] = useState(2)

  const dispatch = useDispatch()
  const isSaving = useSelector(selectRoomsSaving)
  const saveError = useSelector(selectRoomsSaveError)

  useEffect(() => {
    dispatch(clearRoomSaveFeedback())
  }, [dispatch])

  function handleSubmit(event) {
    event.preventDefault()

    const action = room
      ? updateRoomDetails({
          roomId: room.id,
          updates: {
            roomNumber,
            floor: Number(floor),
            rentPerMonth: Number(rentPerMonth),
          },
        })
      : createRoomWithBeds({
          hostelId,
          roomNumber,
          floor: Number(floor),
          rentPerMonth: Number(rentPerMonth),
          bedCount: Number(bedCount),
        })

    dispatch(action).then((result) => {
      if (result.meta.requestStatus === 'fulfilled') {
        onDone()
      }
    })
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-lg border border-slate-200 bg-white p-4"
    >
      <h2 className="text-lg font-semibold text-slate-900">
        {room ? 'Edit room' : 'Add room'}
      </h2>

      <div className="grid gap-4 sm:grid-cols-3">
        <FormField
          label="Room number"
          value={roomNumber}
          onChange={(event) => setRoomNumber(event.target.value)}
        />
        <FormField
          label="Floor"
          type="number"
          value={floor}
          onChange={(event) => setFloor(event.target.value)}
        />
        <FormField
          label="Rent per month (₹)"
          type="number"
          value={rentPerMonth}
          onChange={(event) => setRentPerMonth(event.target.value)}
        />
      </div>

      {!room && (
        <FormField
          label="Number of beds"
          type="number"
          value={bedCount}
          onChange={(event) => setBedCount(event.target.value)}
        />
      )}

      {saveError && <p className="text-sm text-red-600">{saveError}</p>}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isSaving}
          className="rounded-md bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
        >
          {isSaving ? 'Saving...' : room ? 'Save changes' : 'Add room'}
        </button>
        <button
          type="button"
          onClick={onDone}
          className="rounded-md border border-slate-300 px-4 py-2 text-slate-700 hover:bg-slate-100"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
