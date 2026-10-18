import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import Alert from '../../../components/ui/Alert'
import Button from '../../../components/ui/Button'
import FormField from '../../../components/common/FormField'
import { selectHostels } from '../../hostels/hostelSlice'
import {
  clearFoodSaveFeedback,
  saveMeal,
  selectFoodSaveError,
  selectFoodSaving,
} from '../foodPlanSlice'

// Add or edit an individual (bookable) meal. Pass `meal` to edit.
export default function MealForm({ meal, onDone }) {
  const [hostelId, setHostelId] = useState(meal?.hostelId ?? '')
  const [name, setName] = useState(meal?.name ?? '')
  const [price, setPrice] = useState(meal?.price ?? '')

  const dispatch = useDispatch()
  const hostels = useSelector(selectHostels)
  const isSaving = useSelector(selectFoodSaving)
  const saveError = useSelector(selectFoodSaveError)

  useEffect(() => {
    dispatch(clearFoodSaveFeedback())
  }, [dispatch])

  function handleSubmit(event) {
    event.preventDefault()

    const hostel = hostels.find((candidate) => candidate.id === hostelId)

    dispatch(
      saveMeal({
        mealId: meal?.id,
        meal: {
          hostelId,
          hostelName: hostel?.name ?? '',
          name,
          price: Number(price),
        },
      }),
    ).then((result) => {
      if (result.meta.requestStatus === 'fulfilled') {
        onDone()
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-4 p-5">
      <h2 className="text-base font-semibold text-charcoal">
        {meal ? 'Edit meal' : 'Add meal'}
      </h2>

      <label className="block">
        <span className="field-label">Branch</span>
        <select
          value={hostelId}
          onChange={(event) => setHostelId(event.target.value)}
          required
          className="field"
        >
          <option value="">Select a branch...</option>
          {hostels.map((hostel) => (
            <option key={hostel.id} value={hostel.id}>
              {hostel.name}
            </option>
          ))}
        </select>
      </label>

      <FormField
        label="Meal name"
        value={name}
        onChange={(event) => setName(event.target.value)}
      />
      <FormField
        label="Price (₹)"
        type="number"
        value={price}
        onChange={(event) => setPrice(event.target.value)}
      />

      {saveError && <Alert tone="error">{saveError}</Alert>}

      <div className="mt-5 flex justify-end gap-2">
        <Button variant="secondary" onClick={onDone}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSaving}>
          {isSaving ? 'Saving...' : meal ? 'Save changes' : 'Add meal'}
        </Button>
      </div>
    </form>
  )
}
