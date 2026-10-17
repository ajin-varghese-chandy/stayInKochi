import { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
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
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-lg border border-slate-200 bg-white p-4"
    >
      <h2 className="text-lg font-semibold text-slate-900">
        Raise a maintenance request
      </h2>

      <FormField
        label="Title"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
      />

      <label className="block">
        <span className="block text-sm font-medium text-slate-700">
          Description
        </span>
        <textarea
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          rows={3}
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-800 focus:border-indigo-500 focus:outline-none"
        />
      </label>

      <label className="block">
        <span className="block text-sm font-medium text-slate-700">
          Photo (optional)
        </span>
        <input
          ref={photoInputRef}
          type="file"
          accept="image/*"
          onChange={(event) => setPhotoFile(event.target.files?.[0] ?? null)}
          className="mt-1 w-full text-sm text-slate-600"
        />
      </label>

      {saveError && <p className="text-sm text-red-600">{saveError}</p>}

      <button
        type="submit"
        disabled={isSaving}
        className="rounded-md bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
      >
        {isSaving ? 'Submitting...' : 'Submit request'}
      </button>
    </form>
  )
}
