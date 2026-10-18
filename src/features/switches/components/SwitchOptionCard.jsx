import Button from "../../../components/ui/Button";

// One hostel the tenant could switch into, with the pay button.
export default function SwitchOptionCard({
  hostel,
  feeRupees,
  disabled,
  isSaving,
  onSwitch,
}) {
  return (
    <div className="card flex flex-wrap items-center justify-between gap-3 p-5">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-charcoal">{hostel.name}</p>
        <p className="mt-0.5 text-xs text-charcoal/55">
          {hostel.location ?? "Kochi"} · ₹
          {hostel.rentPerMonth?.toLocaleString("en-IN") ?? 0}/month
        </p>
        <p className="mt-1.5 text-base font-semibold tabular-nums text-forest">
          ₹{feeRupees}
          <span className="ml-1.5 text-xs font-normal text-charcoal/55">
            switch fee
          </span>
        </p>
      </div>

      <Button
        size="sm"
        onClick={() => onSwitch(hostel)}
        disabled={disabled || isSaving}
      >
        {isSaving ? "Processing..." : `Switch · ₹${feeRupees}`}
      </Button>
    </div>
  );
}
