import { useState } from 'react'

// A bookable individual meal: pick a date and book it.
export default function MealBookingCard({ meal, isSaving, onBook }) {
  // Default the picker to today (YYYY-MM-DD).
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10))

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-slate-900">{meal.name}</h3>
          <p className="mt-1 font-semibold text-indigo-600">
            ₹{meal.price}
            <span className="font-normal text-slate-500"> per meal</span>
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <input
          type="date"
          value={date}
          onChange={(event) => setDate(event.target.value)}
          required
          className="rounded-md border border-slate-300 px-3 py-2 text-slate-800 focus:border-indigo-500 focus:outline-none"
        />
        <button
          type="button"
          onClick={() => onBook(meal, date)}
          disabled={isSaving || !date}
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
        >
          {isSaving ? 'Booking...' : 'Book meal'}
        </button>
      </div>
    </div>
  )
}
