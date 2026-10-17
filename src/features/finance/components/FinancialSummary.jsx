import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  fetchFinancialSummary,
  selectFinanceError,
  selectFinanceLoading,
  selectFinancialSummary,
} from '../financeSlice'

const TILES = [
  { key: 'collected', label: 'Rent collected', tone: 'text-green-700' },
  { key: 'pending', label: 'Rent pending', tone: 'text-amber-700' },
  { key: 'food', label: 'Food income', tone: 'text-indigo-700' },
  { key: 'switchFees', label: 'Switch fees', tone: 'text-slate-700' },
]

// Owner's money overview: rent, food and switching income in four tiles.
export default function FinancialSummary() {
  const dispatch = useDispatch()
  const summary = useSelector(selectFinancialSummary)
  const isLoading = useSelector(selectFinanceLoading)
  const error = useSelector(selectFinanceError)

  useEffect(() => {
    dispatch(fetchFinancialSummary())
  }, [dispatch])

  if (isLoading) {
    return <p className="text-slate-500">Loading totals...</p>
  }

  if (error) {
    return <p className="text-red-600">Could not load totals: {error}</p>
  }

  if (!summary) return null

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {TILES.map((tile) => (
        <div
          key={tile.key}
          className="rounded-lg border border-slate-200 bg-white p-4"
        >
          <p className="text-sm text-slate-500">{tile.label}</p>
          <p className={`mt-1 text-2xl font-bold ${tile.tone}`}>
            ₹{(summary[tile.key] ?? 0).toLocaleString('en-IN')}
          </p>
        </div>
      ))}
    </div>
  )
}
