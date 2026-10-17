import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
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
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-lg border border-slate-200 bg-white p-4"
    >
      <h2 className="text-lg font-semibold text-slate-900">
        {meal ? 'Edit meal' : 'Add meal'}
      </h2>

      <label className="block">
        <span className="block text-sm font-medium text-slate-700">Hostel</span>
        <select
          value={hostelId}
          onChange={(event) => setHostelId(event.target.value)}
          required
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-800 focus:border-indigo-500 focus:outline-none"
        >
          <option value="">Select a hostel...</option>
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

      {saveError && <p className="text-sm text-red-600">{saveError}</p>}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isSaving}
          className="rounded-md bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
        >
          {isSaving ? 'Saving...' : meal ? 'Save changes' : 'Add meal'}
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
