import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import OwnerNav from '../../components/layout/OwnerNav'
import Spinner from '../../components/common/Spinner'
import {
  checkOutTenant,
  clearTenantSaveFeedback,
  fetchTenants,
  selectTenants,
  selectTenantsError,
  selectTenantsLoading,
  selectTenantsSaveError,
  selectTenantsSaving,
} from '../../features/tenants/tenantSlice'
import { updateTenant } from '../../features/tenants/tenantService'

// Owner screen listing every active tenant and where they are assigned.
export default function OwnerTenantsPage() {
  const dispatch = useDispatch()
  const tenants = useSelector(selectTenants)
  const isLoading = useSelector(selectTenantsLoading)
  const error = useSelector(selectTenantsError)
  const isSaving = useSelector(selectTenantsSaving)
  const saveError = useSelector(selectTenantsSaveError)

  const [search, setSearch] = useState('')
  const [resetingId, setResetingId] = useState(null)

  useEffect(() => {
    dispatch(fetchTenants())
    return () => { dispatch(clearTenantSaveFeedback()) }
  }, [dispatch])

  function handleCheckOut(tenant) {
    const confirmed = window.confirm(
      `Check out "${tenant.name}"? This ends their tenancy and frees their bed.`,
    )
    if (confirmed) dispatch(checkOutTenant(tenant))
  }

  async function handleResetRent(tenant) {
    if (!window.confirm(`Mark rent as unpaid for "${tenant.name}"?`)) return
    setResetingId(tenant.id)
    try {
      await updateTenant(tenant.id, { rentStatus: 'unpaid' })
      dispatch(fetchTenants())
    } finally {
      setResetingId(null)
    }
  }

  const filtered = tenants.filter((t) => {
    const q = search.toLowerCase()
    return (
      t.name?.toLowerCase().includes(q) ||
      t.email?.toLowerCase().includes(q) ||
      t.hostelName?.toLowerCase().includes(q)
    )
  })

  return (
    <section className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-3xl font-bold text-slate-900">Tenants</h1>

      <div className="mt-6">
        <OwnerNav />
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <p className="text-slate-600">{tenants.length} active tenants</p>
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, email or branch…"
          className="w-full max-w-xs rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-indigo-500 focus:outline-none"
        />
      </div>

      {isLoading && <Spinner label="Loading tenants..." />}
      {error && <p className="mt-6 text-red-600">Could not load tenants: {error}</p>}
      {saveError && <p className="mt-6 text-red-600">{saveError}</p>}

      {!isLoading && !error && filtered.length === 0 && (
        <p className="mt-6 text-slate-600">
          {search ? 'No tenants match your search.' : 'No active tenants yet. Approve a stay request to add one.'}
        </p>
      )}

      <div className="mt-4 space-y-4">
        {filtered.map((tenant) => (
          <div
            key={tenant.id}
            className="rounded-lg border border-slate-200 bg-white p-4"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="font-semibold text-slate-900">{tenant.name}</h3>
                <p className="text-sm text-slate-500">
                  {tenant.email}
                  {tenant.phone ? ` · ${tenant.phone}` : ''}
                </p>
                <p className="text-sm text-slate-500">
                  {tenant.hostelName ?? 'Branch assigned'}
                  {tenant.joinedOn ? ` · joined ${tenant.joinedOn}` : ''}
                </p>
              </div>

              <div className="text-right text-sm">
                <p className={tenant.bedId ? 'font-medium text-green-700' : 'text-slate-500'}>
                  {tenant.bedId
                    ? `Room ${tenant.roomNumber} · Bed ${tenant.bedNumber}`
                    : 'Not assigned to a bed'}
                </p>
                <p className={tenant.rentStatus === 'paid' ? 'font-medium text-green-700' : 'font-medium text-amber-700'}>
                  Rent: {tenant.rentStatus ?? 'unpaid'}
                </p>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-3 text-sm">
              <Link
                to={`/owner/hostels/${tenant.hostelId}`}
                className="rounded-md border border-slate-300 px-3 py-1.5 text-slate-700 hover:bg-slate-100"
              >
                {tenant.bedId ? 'Manage rooms' : 'Assign a bed'}
              </Link>
              {tenant.rentStatus === 'paid' && (
                <button
                  type="button"
                  onClick={() => handleResetRent(tenant)}
                  disabled={resetingId === tenant.id}
                  className="rounded-md border border-amber-300 px-3 py-1.5 text-amber-700 hover:bg-amber-50 disabled:opacity-60"
                >
                  {resetingId === tenant.id ? 'Resetting…' : 'Reset rent to unpaid'}
                </button>
              )}
              <button
                type="button"
                onClick={() => handleCheckOut(tenant)}
                disabled={isSaving}
                className="rounded-md border border-red-300 px-3 py-1.5 text-red-600 hover:bg-red-50 disabled:opacity-60"
              >
                Check out
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
