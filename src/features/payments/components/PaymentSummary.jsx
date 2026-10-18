import { useState } from "react";
import Button from "../../../components/ui/Button";
import StatusBadge from "../../../components/ui/StatusBadge";
import formatRupees from "../../../utils/formatRupees";

// The current month as YYYY-MM.
function currentMonth() {
  return new Date().toISOString().slice(0, 7);
}

// Rent due + the Razorpay pay button for one tenant.
export default function PaymentSummary({
  tenant,
  paidThisMonth,
  isSaving,
  onPay,
}) {
  const [month, setMonth] = useState(currentMonth);

  // No rent set yet means no bed has been assigned (a fresh approval or a
  // just-approved switch), so there is nothing to charge for.
  const hasRent = Number(tenant.rentPerMonth) > 0;
  const amount = tenant.rentPerMonth ?? 0;

  return (
    <div className="card p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="eyebrow">{hasRent ? "Rent due" : "Rent"}</p>

          {hasRent ? (
            <>
              <p className="mt-1.5 text-2xl font-semibold tabular-nums text-charcoal">
                {formatRupees(amount)}
                <span className="ml-1.5 text-sm font-normal text-charcoal/55">
                  /month
                </span>
              </p>
              <p className="mt-1 text-sm text-charcoal/60">
                Room {tenant.roomNumber ?? "-"} · Bed {tenant.bedNumber ?? "-"}{" "}
                · {month}
              </p>
              <p className="mt-0.5 text-sm text-charcoal/60">
                {paidThisMonth
                  ? "Paid so far this month"
                  : "Nothing paid yet this month"}
              </p>
            </>
          ) : (
            <p className="mt-1.5 text-sm text-charcoal/60">
              Room {tenant.roomNumber ?? "-"} · Bed {tenant.bedNumber ?? "-"}
            </p>
          )}
        </div>

        {hasRent && <StatusBadge status={paidThisMonth ? "paid" : "unpaid"} />}
      </div>

      {hasRent ? (
        <>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <label htmlFor="rent-month" className="field-label mb-0">
              Month
            </label>
            <input
              id="rent-month"
              type="month"
              value={month}
              onChange={(event) => setMonth(event.target.value)}
              className="field w-auto"
            />
          </div>

          <div className="mt-4">
            <Button
              block
              size="lg"
              onClick={() => onPay(month)}
              disabled={isSaving || !month}
            >
              {isSaving
                ? "Processing payment..."
                : `Pay ${formatRupees(amount)}`}
            </Button>
          </div>
        </>
      ) : (
        <p className="mt-4 rounded-card border border-line bg-ivory px-3 py-3 text-sm leading-relaxed text-charcoal/70">
          No rent has been set for you yet, so there is nothing to pay. The
          owner assigns a bed (and its rent) from the rooms screen — ask them if
          you are waiting on that.
        </p>
      )}
    </div>
  );
}
