import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import Alert from '../../../components/ui/Alert'
import Button from '../../../components/ui/Button'
import Spinner from '../../../components/common/Spinner'
import formatRupees from '../../../utils/formatRupees'
import { getBedsByHostel } from '../../rooms/bedService'
import { getRoomsByHostel } from '../../rooms/roomService'
import {
  assignTenantBed,
  clearTenantSaveFeedback,
  selectTenantsSaveError,
  selectTenantsSaving,
} from '../tenantSlice'

// Inline room/bed picker for one tenant. Loads the branch's inventory when it
// opens so the options are always current, and frees the old bed on a move.
export default function TenantBedPicker({ tenant, onDone, onCancel }) {
  const dispatch = useDispatch()
  const isSaving = useSelector(selectTenantsSaving)
  const saveError = useSelector(selectTenantsSaveError)

  const [rooms, setRooms] = useState([])
  const [beds, setBeds] = useState([])
  const [isLoading, setIsLoading] = useState(Boolean(tenant.hostelId))
  const [loadError, setLoadError] = useState(
    tenant.hostelId ? null : 'This tenant has no branch assigned.',
  )

  const [roomId, setRoomId] = useState(tenant.roomId ?? '')
  const [bedId, setBedId] = useState(tenant.bedId ?? '')

  useEffect(() => {
    dispatch(clearTenantSaveFeedback())
  }, [dispatch])

  // Only the branch the tenant belongs to is relevant.
  useEffect(() => {
    if (!tenant.hostelId) return undefined

    let cancelled = false

    Promise.all([
      getRoomsByHostel(tenant.hostelId),
      getBedsByHostel(tenant.hostelId),
    ])
      .then(([roomList, bedList]) => {
        if (cancelled) return
        setRooms(roomList)
        setBeds(bedList)
      })
      .catch((error) => {
        if (!cancelled) setLoadError(error.message)
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [tenant.hostelId])

  const selectedRoom = rooms.find(
    (room) => String(room.id) === String(roomId),
  )

  // A bed is selectable when it is free or already belongs to this tenant.
  const selectableBeds = useMemo(
    () =>
      beds.filter(
        (bed) =>
          String(bed.roomId) === String(roomId) &&
          (bed.status === 'available' ||
            String(bed.tenantId) === String(tenant.id)),
      ),
    [beds, roomId, tenant.id],
  )

  const selectedBed = selectableBeds.find(
    (bed) => String(bed.id) === String(bedId),
  )

  const roomsWithSpace = rooms.filter((room) =>
    beds.some(
      (bed) =>
        String(bed.roomId) === String(room.id) &&
        (bed.status === 'available' ||
          String(bed.tenantId) === String(tenant.id)),
    ),
  )

  function handleRoomChange(event) {
    setRoomId(event.target.value)
    setBedId('')
  }

  function handleSubmit(event) {
    event.preventDefault()
    if (!selectedRoom || !selectedBed) return

    dispatch(
      assignTenantBed({
        tenant,
        room: selectedRoom,
        bed: selectedBed,
      }),
    ).then((result) => {
      if (result.meta.requestStatus === 'fulfilled') {
        onDone()
      }
    })
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-4 border-t border-line pt-3"
      aria-label={`Room and bed for ${tenant.name}`}
    >
      <p className="eyebrow">Room &amp; bed</p>

      {isLoading && <Spinner compact label="Loading rooms and beds…" />}

      {loadError && (
        <Alert tone="error" className="mt-2">
          Could not load this branch&apos;s rooms: {loadError}
        </Alert>
      )}

      {!isLoading && !loadError && roomsWithSpace.length === 0 && (
        <p className="mt-2 text-sm text-charcoal/60">
          No free beds in {tenant.hostelName ?? 'this branch'}. Add a room or
          free a bed first.
        </p>
      )}

      {!isLoading && !loadError && roomsWithSpace.length > 0 && (
        <div className="mt-2 grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="field-label">Room</span>
            <select
              value={selectedRoom ? String(roomId) : ''}
              onChange={handleRoomChange}
              className="field"
            >
              <option value="">Select a room…</option>
              {roomsWithSpace.map((room) => (
                <option key={room.id} value={room.id}>
                  Room {room.roomNumber} · Floor {room.floor} ·{' '}
                  {formatRupees(room.rentPerMonth)}/month
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="field-label">Bed</span>
            <select
              value={selectedBed ? String(bedId) : ''}
              onChange={(event) => setBedId(event.target.value)}
              className="field"
              disabled={!selectedRoom}
            >
              <option value="">
                {selectedRoom ? 'Select a bed…' : 'Choose a room first'}
              </option>
              {selectableBeds.map((bed) => (
                <option key={bed.id} value={bed.id}>
                  Bed {bed.bedNumber}
                  {String(bed.id) === String(tenant.bedId)
                    ? ' · current'
                    : ' · available'}
                </option>
              ))}
            </select>
          </label>
        </div>
      )}

      {saveError && (
        <Alert tone="error" className="mt-3">
          {saveError}
        </Alert>
      )}

      <div className="mt-3 flex flex-wrap justify-end gap-2">
        <Button
          type="submit"
          size="sm"
          disabled={!selectedRoom || !selectedBed || isSaving}
        >
          {isSaving
            ? 'Saving…'
            : tenant.bedId
              ? 'Move to this bed'
              : 'Assign bed'}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          onClick={onCancel}
          disabled={isSaving}
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}
