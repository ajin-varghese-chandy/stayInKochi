import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import FormField from '../../../components/common/FormField'
import Alert from '../../../components/ui/Alert'
import Button from '../../../components/ui/Button'
import { selectCurrentUser } from '../../auth/authSlice'
import {
  clearSaveFeedback,
  selectIsSaving,
  selectSaveError,
  selectSaveSuccess,
  submitStayRequest,
} from '../stayRequestSlice'

// Form a signed-in tenant uses to request a stay at one hostel.
// Rendered inside a card on the branch detail page, so it carries no border.
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
      <Alert tone="success">
        {saveSuccess ?? 'Your stay request has been sent to the owner.'}
      </Alert>
    )
  }

  return (
    <form onSubmit={handleSubmit}>
      <p className="text-sm text-charcoal/65">
        The owner reviews every request before a bed is assigned.
      </p>

      <div className="mt-4 space-y-4">
        <FormField
          label="Phone number"
          type="tel"
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
          autoComplete="tel"
          placeholder="How the owner can reach you"
        />

        <label className="block">
          <span className="field-label">Message (optional)</span>
          <textarea
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            rows={3}
            placeholder="Anything the owner should know"
            className="field"
          />
        </label>
      </div>

      {saveError && (
        <Alert tone="error" className="mt-4">
          {saveError}
        </Alert>
      )}

      <Button type="submit" block disabled={isSaving} className="mt-5">
        {isSaving ? 'Sending request…' : 'Send stay request'}
      </Button>
    </form>
  )
}
