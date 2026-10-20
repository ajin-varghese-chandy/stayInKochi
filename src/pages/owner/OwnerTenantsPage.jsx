import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Users } from 'lucide-react'
import Alert from '../../components/ui/Alert'
import Button from '../../components/ui/Button'
import EmptyState from '../../components/ui/EmptyState'
import PageHeader from '../../components/ui/PageHeader'
import SearchInput from '../../components/ui/SearchInput'
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
    <section>
      <PageHeader
        eyebrow="Owner console"
        title="Tenants"
        description="Everyone currently staying across your branches."
      />

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-charcoal/55">
          {tenants.length} active tenants
        </p>
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search by name, email or branch…"
          className="w-full sm:max-w-xs"
        />
      </div>

      <div className="mt-4 space-y-4">
        {isLoading && <Spinner compact label="Loading tenants…" />}

        {error && (
          <Alert tone="error">Could not load tenants: {error}</Alert>
        )}
        {saveError && <Alert tone="error">{saveError}</Alert>}

        {!isLoading && !error && filtered.length === 0 && (
          <EmptyState
            icon={Users}
            title={search ? 'No tenants match your search' : 'No active tenants yet'}
            hint={
              search
                ? 'Try another name, email, or branch.'
                : 'Approve a stay request and the tenant will appear here.'
            }
          />
        )}

        {filtered.map((tenant) => (
          <div key={tenant.id} className="card p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="text-sm font-semibold text-charcoal">
                  {tenant.name}
                </h3>
                <p className="mt-0.5 text-xs text-charcoal/55">
                  {tenant.email}
                  {tenant.phone ? ` · ${tenant.phone}` : ''}
                </p>
                <p className="mt-0.5 text-xs text-charcoal/55">
                  {tenant.hostelName ?? 'Branch assigned'}
                  {tenant.joinedOn ? ` · joined ${tenant.joinedOn}` : ''}
                </p>
              </div>

              <div className="text-right text-sm">
                <p className={tenant.bedId ? 'font-medium text-charcoal' : 'text-charcoal/55'}>
                  {tenant.bedId
                    ? `Room ${tenant.roomNumber} · Bed ${tenant.bedNumber}`
                    : 'Not assigned to a bed'}
                </p>
                <p
                  className={
                    tenant.rentStatus === 'paid'
                      ? 'font-medium text-success'
                      : 'font-medium text-warning'
                  }
                >
                  Rent: {tenant.rentStatus ?? 'unpaid'}
                </p>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2 border-t border-line pt-3">
              <Button
                to={`/owner/hostels/${tenant.hostelId}`}
                variant="secondary"
                size="sm"
              >
                {tenant.bedId ? 'Manage rooms' : 'Assign a bed'}
              </Button>
              {tenant.rentStatus === 'paid' && (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => handleResetRent(tenant)}
                  disabled={resetingId === tenant.id}
                >
                  {resetingId === tenant.id ? 'Resetting…' : 'Reset rent to unpaid'}
                </Button>
              )}
              <Button
                size="sm"
                variant="danger"
                onClick={() => handleCheckOut(tenant)}
                disabled={isSaving}
              >
                Check out
              </Button>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
