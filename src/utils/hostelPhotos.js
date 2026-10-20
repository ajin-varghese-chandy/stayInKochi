// Photos for a hostel detail gallery.
//
// Branches currently store a single placeholder image in db.json. When that
// image is a picsum placeholder we derive two extra placeholder frames from
// its seed so the gallery is real, clickable markup that can be swapped for
// real image URLs later. Any other (real) image URL is returned as-is, so a
// branch with one real photo never shows invented extra photos.
export default function hostelPhotos(hostel) {
  const main = hostel?.image
  if (!main) return []

  const match = main.match(
    /^https:\/\/picsum\.photos\/seed\/([^/]+)\/\d+\/\d+$/,
  )
  if (!match) return [main]

  const seed = match[1]
  return [
    main,
    `https://picsum.photos/seed/${seed}-2/1600/1000`,
    `https://picsum.photos/seed/${seed}-3/1600/1000`,
  ]
}
