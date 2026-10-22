// Rent settlement for a mid-month branch switch.
//
// Rent is paid monthly in advance per branch. When a tenant moves on a given
// day, the unused days at the old branch are credited and the remaining days at
// the new branch are charged at its rent. The difference is settled when the
// switch fee is paid; a surplus becomes credit on the next rent.
//
// Both calculations use the same number of remaining days (the move day
// included), so a move never charges for the same day twice or skips a day.

function roundRupees(value) {
  return Math.round(value)
}

// Returns null when either rent is missing, so callers can refuse to take money
// for a settlement they cannot calculate.
export function computeSwitchSettlement({
  fromRent,
  toRent,
  moveDate = new Date(),
}) {
  const from = Number(fromRent)
  const to = Number(toRent)

  if (!Number.isFinite(from) || from <= 0) return null
  if (!Number.isFinite(to) || to <= 0) return null

  const isoDate = moveDate.toISOString().slice(0, 10)
  const [year, month, day] = isoDate.split('-').map(Number)
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate()
  const remainingDays = Math.max(0, daysInMonth - day + 1)

  const fromCredit = roundRupees((from * remainingDays) / daysInMonth)
  const toDue = roundRupees((to * remainingDays) / daysInMonth)
  const balance = toDue - fromCredit

  return {
    month: isoDate.slice(0, 7),
    moveDate: isoDate,
    daysInMonth,
    remainingDays,
    fromRent: from,
    toRent: to,
    fromCredit,
    toDue,
    balance,
    // Positive: tenant pays this at move time. Negative: credit to next rent.
    charge: Math.max(0, balance),
    credit: Math.max(0, -balance),
  }
}

// Apply any credit already on the account, then report what is left.
export function applyRentCredit(charge, availableCredit = 0) {
  const due = Math.max(0, Number(charge) || 0)
  const credit = Math.max(0, Number(availableCredit) || 0)
  const creditApplied = Math.min(due, credit)

  return {
    creditApplied,
    amountDue: due - creditApplied,
    creditLeft: credit - creditApplied,
  }
}

// Display helpers shared by the tenant screens.
export function formatDaysLeft(settlement) {
  if (!settlement) return ''
  const { remainingDays } = settlement
  return `${remainingDays} ${remainingDays === 1 ? 'day' : 'days'}`
}

export function monthRangeLabel(settlement) {
  if (!settlement) return ''
  const [year, month] = settlement.month.split('-').map(Number)
  return new Date(Date.UTC(year, month - 1, 1)).toLocaleDateString('en-IN', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  })
}
