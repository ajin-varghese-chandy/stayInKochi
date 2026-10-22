import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import Alert from '../../../components/ui/Alert'
import Button from '../../../components/ui/Button'
import FormField from '../../../components/common/FormField'
import HostelImageUploader from './HostelImageUploader'
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
  // Extra gallery photos. The cover also lives in `images` on saved records,
  // so drop it here to avoid showing it twice in the uploader.
  const [images, setImages] = useState(() =>
    (Array.isArray(hostel?.images) ? hostel.images : []).filter(
      (photo) => photo && photo !== hostel?.image,
    ),
  )
  const [isUploading, setIsUploading] = useState(false)
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

    // Combine the cover URL with uploaded photos into one de-duplicated
    // gallery. The first entry is the cover, so an upload can stand in when no
    // URL was entered.
    const gallery = [image.trim(), ...images].reduce((list, photo) => {
      if (photo && !list.includes(photo)) list.push(photo)
      return list
    }, [])

    const payload = {
      name: `${BRAND_PREFIX}${branchLabel.trim()}`,
      location,
      description,
      image: gallery[0] ?? '',
      images: gallery,
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
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-base font-semibold text-charcoal">
        {hostel ? 'Edit branch' : 'Add branch'}
      </h2>

      {/* Branch name preview */}
      <label className="block">
        <span className="field-label">
          Branch label{' '}
          <span className="font-normal text-charcoal/55">
            (shown as "StayInKochi &lt;label&gt;")
          </span>
        </span>
        <span className="flex items-stretch overflow-hidden rounded-card border border-line-strong bg-white focus-within:border-forest focus-within:shadow-[0_0_0_3px_rgba(36,76,58,0.14)]">
          <span className="flex shrink-0 select-none items-center border-r border-line bg-ivory px-3 text-sm text-charcoal/55">
            StayInKochi
          </span>
          <input
            type="text"
            required
            value={branchLabel}
            onChange={(e) => setBranchLabel(e.target.value)}
            placeholder="Kakkanad"
            className="min-w-0 flex-1 border-0 bg-transparent px-3 py-2 text-sm text-charcoal focus:outline-none"
          />
        </span>
        {branchLabel.trim() ? (
          <span className="field-hint block">
            Full name: <strong>StayInKochi {branchLabel.trim()}</strong>
          </span>
        ) : null}
      </label>

      <FormField
        label="Location (address)"
        value={location}
        onChange={(event) => setLocation(event.target.value)}
        placeholder="Kakkanad, Kochi"
      />
      <FormField
        label="Cover image URL"
        type="url"
        value={image}
        onChange={(event) => setImage(event.target.value)}
        required={false}
        hint="Optional if you upload photos below."
        placeholder="https://…"
      />
      <HostelImageUploader
        images={images}
        onChange={setImages}
        onUploadingChange={setIsUploading}
        disabled={isSaving}
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
        <span className="field-label">Description</span>
        <textarea
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          rows={3}
          className="field"
        />
      </label>

      {saveError && <Alert tone="error">{saveError}</Alert>}

      <div className="mt-5 flex justify-end gap-2">
        <Button type="submit" disabled={isSaving || isUploading}>
          {isSaving
            ? 'Saving...'
            : isUploading
              ? 'Uploading photos…'
              : hostel
                ? 'Save changes'
                : 'Add branch'}
        </Button>
        <Button type="button" variant="secondary" onClick={onDone}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
