import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import FormField from '../../../components/common/FormField'
import {
  clearHostelSaveFeedback,
  createHostel,
  selectHostelsSaveError,
  selectHostelsSaving,
  updateHostel,
} from '../hostelSlice'

const BRAND_PREFIX = 'StayInKochi '

// Strip the brand prefix to get just the branch label (e.g. "Kakkanad").
function stripPrefix(fullName = '') {
  return fullName.startsWith(BRAND_PREFIX)
    ? fullName.slice(BRAND_PREFIX.length)
    : fullName
}

// Add or edit a StayInKochi branch. The owner enters just the location label
// (e.g. "Kakkanad") and the brand prefix is added automatically.
export default function HostelForm({ hostel, onDone }) {
  const [branchLabel, setBranchLabel] = useState(stripPrefix(hostel?.name ?? ''))
  const [location, setLocation] = useState(hostel?.location ?? '')
  const [description, setDescription] = useState(hostel?.description ?? '')
  const [image, setImage] = useState(hostel?.image ?? '')
  const [rentPerMonth, setRentPerMonth] = useState(hostel?.rentPerMonth ?? '')
  const [amenities, setAmenities] = useState(
    (hostel?.amenities ?? []).join(', '),
  )

  const dispatch = useDispatch()
  const isSaving = useSelector(selectHostelsSaving)
  const saveError = useSelector(selectHostelsSaveError)

  useEffect(() => {
    dispatch(clearHostelSaveFeedback())
  }, [dispatch])

  function handleSubmit(event) {
    event.preventDefault()

    const payload = {
      name: `${BRAND_PREFIX}${branchLabel.trim()}`,
      location,
      description,
      image,
      rentPerMonth: Number(rentPerMonth),
      amenities: amenities
        .split(',')
        .map((amenity) => amenity.trim())
        .filter(Boolean),
    }

    const action = hostel
      ? updateHostel({ hostelId: hostel.id, updates: payload })
      : createHostel(payload)

    dispatch(action).then((result) => {
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
        {hostel ? 'Edit branch' : 'Add branch'}
      </h2>

      {/* Branch name preview */}
      <div>
        <label className="block text-sm font-medium text-slate-700">
          Branch label
          <span className="ml-1 font-normal text-slate-400">
            (shown as "StayInKochi &lt;label&gt;")
          </span>
        </label>
        <div className="mt-1 flex items-center rounded-md border border-slate-300 focus-within:border-indigo-500">
          <span className="rounded-l-md border-r border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-500 select-none">
            StayInKochi
          </span>
          <input
            type="text"
            required
            value={branchLabel}
            onChange={(e) => setBranchLabel(e.target.value)}
            placeholder="Kakkanad"
            className="flex-1 rounded-r-md px-3 py-2 text-slate-800 focus:outline-none"
          />
        </div>
        {branchLabel.trim() && (
          <p className="mt-1 text-xs text-slate-400">
            Full name: <strong>StayInKochi {branchLabel.trim()}</strong>
          </p>
        )}
      </div>

      <FormField
        label="Location (address)"
        value={location}
        onChange={(event) => setLocation(event.target.value)}
        placeholder="Kakkanad, Kochi"
      />
      <FormField
        label="Image URL"
        type="url"
        value={image}
        onChange={(event) => setImage(event.target.value)}
      />
      <FormField
        label="Rent per month (₹)"
        type="number"
        value={rentPerMonth}
        onChange={(event) => setRentPerMonth(event.target.value)}
      />
      <FormField
        label="Amenities (comma separated)"
        value={amenities}
        onChange={(event) => setAmenities(event.target.value)}
        required={false}
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

      {saveError && <p className="text-sm text-red-600">{saveError}</p>}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isSaving}
          className="rounded-md bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
        >
          {isSaving ? 'Saving...' : hostel ? 'Save changes' : 'Add branch'}
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
