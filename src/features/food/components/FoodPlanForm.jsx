import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import FormField from '../../../components/common/FormField'
import { selectHostels } from '../../hostels/hostelSlice'
import {
  clearFoodSaveFeedback,
  saveFoodPlan,
  selectFoodSaveError,
  selectFoodSaving,
} from '../foodPlanSlice'

// Add or edit a food plan. Pass `foodPlan` to edit, leave it out to create.
export default function FoodPlanForm({ foodPlan, onDone }) {
  const [hostelId, setHostelId] = useState(foodPlan?.hostelId ?? '')
  const [name, setName] = useState(foodPlan?.name ?? '')
  const [pricePerMonth, setPricePerMonth] = useState(
    foodPlan?.pricePerMonth ?? '',
  )
  const [includes, setIncludes] = useState(
    (foodPlan?.includes ?? []).join(', '),
  )

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
      saveFoodPlan({
        foodPlanId: foodPlan?.id,
        foodPlan: {
          hostelId,
          hostelName: hostel?.name ?? '',
          name,
          pricePerMonth: Number(pricePerMonth),
          includes: includes
            .split(',')
            .map((item) => item.trim())
            .filter(Boolean),
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
        {foodPlan ? 'Edit food plan' : 'Add food plan'}
      </h2>

      <label className="block">
        <span className="block text-sm font-medium text-slate-700">Branch</span>
        <select
          value={hostelId}
          onChange={(event) => setHostelId(event.target.value)}
          required
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-800 focus:border-indigo-500 focus:outline-none"
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
        label="Plan name"
        value={name}
        onChange={(event) => setName(event.target.value)}
      />
      <FormField
        label="Price per month (₹)"
        type="number"
        value={pricePerMonth}
        onChange={(event) => setPricePerMonth(event.target.value)}
      />
      <FormField
        label="Includes (comma separated)"
        value={includes}
        onChange={(event) => setIncludes(event.target.value)}
        required={false}
      />

      {saveError && <p className="text-sm text-red-600">{saveError}</p>}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isSaving}
          className="rounded-md bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
        >
          {isSaving
            ? 'Saving...'
            : foodPlan
              ? 'Save changes'
              : 'Add food plan'}
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
