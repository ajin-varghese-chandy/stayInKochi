import { useState } from "react";
import Button from "../../../components/ui/Button";

// A bookable individual meal: pick a date and book it.
export default function MealBookingCard({ meal, isSaving, onBook }) {
  // Default the picker to today (YYYY-MM-DD).
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));

  return (
    <div className="card p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-charcoal">{meal.name}</h3>
        </div>
      </div>

      <p className="mt-3 text-base font-semibold tabular-nums text-forest">
        ₹{meal.price}
        <span className="ml-1 text-xs font-normal text-charcoal/55">
          per meal
        </span>
      </p>

      <div className="mt-4 flex flex-wrap items-end justify-between gap-3 border-t border-line pt-3">
        <label className="block min-w-0 flex-1 sm:flex-none">
          <span className="field-label">Date</span>
          <input
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            required
            className="field"
          />
        </label>
        <Button
          size="sm"
          onClick={() => onBook(meal, date)}
          disabled={isSaving || !date}
        >
          {isSaving ? "Booking..." : "Book meal"}
        </Button>
      </div>
    </div>
  );
}
