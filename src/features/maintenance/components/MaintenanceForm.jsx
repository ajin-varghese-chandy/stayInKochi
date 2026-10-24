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
import MaintenancePhotoUploader from './MaintenancePhotoUploader'

// Form a tenant uses to raise a maintenance request. The photo is optional and
// is uploaded to Cloudinary when picked.
export default function MaintenanceForm({ tenancy }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [photo, setPhoto] = useState(null)
  const [isUploading, setIsUploading] = useState(false)

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
        imageUrl: photo?.path ?? '',
      }),
    ).then((result) => {
      if (result.meta.requestStatus !== 'fulfilled') return

      setTitle('')
      setDescription('')
      setPhoto(null)
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

      <MaintenancePhotoUploader
        photo={photo}
        onChange={setPhoto}
        onUploadingChange={setIsUploading}
        disabled={isSaving}
      />

      {saveError && <Alert tone="error">{saveError}</Alert>}

      <div className="mt-5 flex justify-end gap-2">
        <Button type="submit" disabled={isSaving || isUploading}>
          {isSaving ? 'Submitting...' : 'Submit request'}
        </Button>
      </div>
    </form>
  )
}
