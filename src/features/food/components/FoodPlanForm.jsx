import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Alert from "../../../components/ui/Alert";
import Button from "../../../components/ui/Button";
import FormField from "../../../components/common/FormField";
import { selectHostels } from "../../hostels/hostelSlice";
import {
  clearFoodSaveFeedback,
  saveFoodPlan,
  selectFoodSaveError,
  selectFoodSaving,
} from "../foodPlanSlice";

// Add or edit a food plan. Pass `foodPlan` to edit, leave it out to create.
export default function FoodPlanForm({ foodPlan, onDone }) {
  const [hostelId, setHostelId] = useState(foodPlan?.hostelId ?? "");
  const [name, setName] = useState(foodPlan?.name ?? "");
  const [pricePerMonth, setPricePerMonth] = useState(
    foodPlan?.pricePerMonth ?? "",
  );
  const [includes, setIncludes] = useState(
    (foodPlan?.includes ?? []).join(", "),
  );

  const dispatch = useDispatch();
  const hostels = useSelector(selectHostels);
  const isSaving = useSelector(selectFoodSaving);
  const saveError = useSelector(selectFoodSaveError);

  useEffect(() => {
    dispatch(clearFoodSaveFeedback());
  }, [dispatch]);

  function handleSubmit(event) {
    event.preventDefault();

    const hostel = hostels.find((candidate) => candidate.id === hostelId);

    dispatch(
      saveFoodPlan({
        foodPlanId: foodPlan?.id,
        foodPlan: {
          hostelId,
          hostelName: hostel?.name ?? "",
          name,
          pricePerMonth: Number(pricePerMonth),
          includes: includes
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean),
        },
      }),
    ).then((result) => {
      if (result.meta.requestStatus === "fulfilled") {
        onDone();
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-4 p-5">
      <h2 className="text-base font-semibold text-charcoal">
        {foodPlan ? "Edit food plan" : "Add food plan"}
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
        hint="Separate each meal with a comma, e.g. Breakfast, Lunch, Dinner"
        value={includes}
        onChange={(event) => setIncludes(event.target.value)}
        required={false}
      />

      {saveError && <Alert tone="error">{saveError}</Alert>}

      <div className="mt-5 flex justify-end gap-2">
        <Button variant="secondary" onClick={onDone}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSaving}>
          {isSaving ? "Saving..." : foodPlan ? "Save changes" : "Add food plan"}
        </Button>
      </div>
    </form>
  );
}
