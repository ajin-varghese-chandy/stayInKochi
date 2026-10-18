import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import Alert from '../../../components/ui/Alert'
import Button from '../../../components/ui/Button'
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
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-base font-semibold text-charcoal">
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

      {saveError && <Alert tone="error">{saveError}</Alert>}

      <div className="mt-5 flex justify-end gap-2">
        <Button type="submit" disabled={isSaving}>
          {isSaving ? 'Saving...' : room ? 'Save changes' : 'Add room'}
        </Button>
        <Button type="button" variant="secondary" onClick={onDone}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
