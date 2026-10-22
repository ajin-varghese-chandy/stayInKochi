import hostelImageUrl from './hostelImageUrl'

// Normalise one stored gallery entry to a URL. New records store plain paths
// or URLs; object entries are tolerated for older uploads.
function toPath(entry) {
  if (typeof entry === 'string') return entry
  return entry?.path ?? ''
}

// Photos for a hostel detail gallery.
//
// Branches saved from the owner console store every uploaded photo in `images`
// (the first one is also the cover `image`). Older records only have a single
// `image`, kept as a fallback. When that fallback is a picsum placeholder we
// derive two extra placeholder frames from its seed so the gallery is real,
// clickable markup that can be swapped for real image URLs later. Any other
// (real) image URL is returned as-is, so a branch with one real photo never
// shows invented extra photos.
export default function hostelPhotos(hostel) {
  const gallery = Array.isArray(hostel?.images)
    ? hostel.images.map(toPath).filter(Boolean)
    : []

  if (gallery.length > 0) {
    return gallery.map(hostelImageUrl)
  }

  const main = hostel?.image
  if (!main) return []

  const match = main.match(
    /^https:\/\/picsum\.photos\/seed\/([^/]+)\/\d+\/\d+$/,
  )
  if (!match) return [hostelImageUrl(main)]

  const seed = match[1]
  return [
    main,
    `https://picsum.photos/seed/${seed}-2/1600/1000`,
    `https://picsum.photos/seed/${seed}-3/1600/1000`,
  ]
}

// The single photo used on branch cards and other compact tiles.
export function hostelCoverPhoto(hostel) {
  return hostelPhotos(hostel)[0] ?? ''
}
