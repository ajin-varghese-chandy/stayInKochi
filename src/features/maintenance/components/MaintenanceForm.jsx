import { useEffect, useState } from 'react'
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
// just a pasted image URL).
export default function MaintenanceForm({ tenancy }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [photoUrl, setPhotoUrl] = useState('')

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
        imageUrl: photoUrl,
      }),
    ).then((result) => {
      if (result.meta.requestStatus !== 'fulfilled') return

      setTitle('')
      setDescription('')
      setPhotoUrl('')
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

      <FormField
        label="Photo URL (optional)"
        type="url"
        value={photoUrl}
        onChange={(event) => setPhotoUrl(event.target.value)}
        required={false}
        placeholder="https://example.com/photo.jpg"
      />

      {saveError && <Alert tone="error">{saveError}</Alert>}

      <div className="mt-5 flex justify-end gap-2">
        <Button type="submit" disabled={isSaving}>
          {isSaving ? 'Submitting...' : 'Submit request'}
        </Button>
      </div>
    </form>
  )
}
