import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import Alert from '../../../components/ui/Alert'
import Spinner from '../../../components/common/Spinner'
import {
  fetchFinancialSummary,
  selectFinanceError,
  selectFinanceLoading,
  selectFinancialSummary,
} from '../financeSlice'

const METRICS = [
  { key: 'collected', label: 'Rent collected' },
  { key: 'pending', label: 'Rent pending' },
  { key: 'food', label: 'Food income' },
  { key: 'switchFees', label: 'Switch fees' },
]

// Owner's money overview: rent, food and switching income in one metric strip.
export default function FinancialSummary() {
  const dispatch = useDispatch()
  const summary = useSelector(selectFinancialSummary)
  const isLoading = useSelector(selectFinanceLoading)
  const error = useSelector(selectFinanceError)

  useEffect(() => {
    dispatch(fetchFinancialSummary())
  }, [dispatch])

  if (isLoading) {
    return <Spinner compact label="Loading totals…" />
  }

  if (error) {
    return <Alert tone="error">Could not load totals: {error}</Alert>
  }

  if (!summary) return null

  return (
    <div className="card grid grid-cols-2 divide-x divide-y divide-line sm:grid-cols-4">
      {METRICS.map((metric) => (
        <div key={metric.key} className="p-4">
          <p className="eyebrow">{metric.label}</p>
          <p className="mt-1.5 text-lg font-semibold tabular-nums text-charcoal">
            ₹{(summary[metric.key] ?? 0).toLocaleString('en-IN')}
          </p>
        </div>
      ))}
    </div>
  )
}
