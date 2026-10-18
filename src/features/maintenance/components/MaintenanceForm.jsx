import { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import Alert from '../../../components/ui/Alert'
import Button from '../../../components/ui/Button'
import FormField from '../../../components/common/FormField'
import { selectCurrentUser } from '../../auth/authSlice'
import {
  clearMaintenanceSaveFeedback,
  selectMaintenanceSaveError,
  selectMaintenanceSaving,
  submitMaintenanceRequest,
} from '../maintenanceSlice'

// Form a tenant uses to raise a maintenance request (photo is optional and is
// uploaded to Cloudinary).
export default function MaintenanceForm({ tenancy }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [photoFile, setPhotoFile] = useState(null)

  const photoInputRef = useRef(null)
  const dispatch = useDispatch()
  const user = useSelector(selectCurrentUser)
  const isSaving = useSelector(selectMaintenanceSaving)
  const saveError = useSelector(selectMaintenanceSaveError)

  useEffect(() => {
    dispatch(clearMaintenanceSaveFeedback())
  }, [dispatch])

  function handleSubmit(event) {
    event.preventDefault()

    dispatch(
      submitMaintenanceRequest({
        request: {
          hostelId: tenancy.hostelId,
          hostelName: tenancy.hostelName,
          tenantUid: user.uid,
          tenantName: user.displayName,
          title,
          description,
        },
        imageFile: photoFile,
      }),
    ).then((result) => {
      if (result.meta.requestStatus !== 'fulfilled') return

      setTitle('')
      setDescription('')
      setPhotoFile(null)
      if (photoInputRef.current) {
        photoInputRef.current.value = ''
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-base font-semibold text-charcoal">
        Raise a maintenance request
      </h2>

      <FormField
        label="Title"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
      />

      <label className="block">
        <span className="field-label">Description</span>
        <textarea
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          rows={3}
          className="field"
        />
      </label>

      <label className="block">
        <span className="field-label">Photo (optional)</span>
        <input
          ref={photoInputRef}
          type="file"
          accept="image/*"
          onChange={(event) => setPhotoFile(event.target.files?.[0] ?? null)}
          className="mt-1 block w-full text-sm text-charcoal/70 file:mr-3 file:cursor-pointer file:rounded-card file:border file:border-line-strong file:bg-white file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-charcoal"
        />
      </label>

      {saveError && <Alert tone="error">{saveError}</Alert>}

      <div className="mt-5 flex justify-end gap-2">
        <Button type="submit" disabled={isSaving}>
          {isSaving ? 'Submitting...' : 'Submit request'}
        </Button>
      </div>
    </form>
  )
}
