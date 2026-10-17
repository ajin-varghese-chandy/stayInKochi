import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import FormField from '../../../components/common/FormField'
import { selectCurrentUser } from '../../auth/authSlice'
import {
  clearSaveFeedback,
  selectIsSaving,
  selectSaveError,
  selectSaveSuccess,
  submitStayRequest,
} from '../stayRequestSlice'

// Form a signed-in tenant uses to request a stay at one hostel.
export default function StayRequestForm({ hostel }) {
  const [phone, setPhone] = useState('')
  const [message, setMessage] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const dispatch = useDispatch()
  const user = useSelector(selectCurrentUser)
  const isSaving = useSelector(selectIsSaving)
  const saveError = useSelector(selectSaveError)
  const saveSuccess = useSelector(selectSaveSuccess)

  // Clear any leftover error/success from an earlier attempt.
  useEffect(() => {
    dispatch(clearSaveFeedback())
  }, [dispatch])

  function handleSubmit(event) {
    event.preventDefault()

    dispatch(
      submitStayRequest({
        hostelId: hostel.id,
        hostelName: hostel.name,
        tenantUid: user.uid,
        tenantName: user.displayName,
        tenantEmail: user.email,
        phone,
        message,
      }),
    ).then((result) => {
      if (result.meta.requestStatus === 'fulfilled') {
        setSubmitted(true)
      }
    })
  }

  if (submitted) {
    return (
      <div className="rounded-md border border-green-200 bg-green-50 p-4 text-green-800">
        {saveSuccess ?? 'Your stay request has been sent to the owner.'}
      </div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-lg border border-slate-200 bg-white p-4"
    >
      <h2 className="text-lg font-semibold text-slate-900">Request a stay</h2>
      <p className="text-sm text-slate-500">
        The owner will review and approve your request.
      </p>

      <div className="mt-4 space-y-4">
        <FormField
          label="Phone number"
          type="tel"
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
          autoComplete="tel"
        />

        <label className="block">
          <span className="block text-sm font-medium text-slate-700">
            Message (optional)
          </span>
          <textarea
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            rows={3}
            placeholder="Anything the owner should know"
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-800 focus:border-indigo-500 focus:outline-none"
          />
        </label>
      </div>

      {saveError && <p className="mt-3 text-sm text-red-600">{saveError}</p>}

      <button
        type="submit"
        disabled={isSaving}
        className="mt-4 w-full rounded-md bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
      >
        {isSaving ? 'Sending request...' : 'Send stay request'}
      </button>
    </form>
  )
}
