import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { FileText, Users } from 'lucide-react'
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
import { documentUrl } from '../../features/stayRequests/documentService'
import TenantBedPicker from '../../features/tenants/components/TenantBedPicker'
import VacateRequestCard from '../../features/vacates/components/VacateRequestCard'
import {
  approveVacate,
  completeVacate,
  fetchAllVacates,
  rejectVacate,
  selectVacateRequests,
  selectVacatesError,
  selectVacatesSaveError,
  selectVacatesSaving,
} from '../../features/vacates/vacateSlice'

// Owner screen listing every active tenant and where they are assigned.
export default function OwnerTenantsPage() {
  const dispatch = useDispatch()
  const tenants = useSelector(selectTenants)
  const isLoading = useSelector(selectTenantsLoading)
  const error = useSelector(selectTenantsError)
  const isSaving = useSelector(selectTenantsSaving)
  const saveError = useSelector(selectTenantsSaveError)

  const vacateRequests = useSelector(selectVacateRequests)
  const vacatesError = useSelector(selectVacatesError)
  const vacatesSaving = useSelector(selectVacatesSaving)
  const vacatesSaveError = useSelector(selectVacatesSaveError)

  const [search, setSearch] = useState('')
  const [resetingId, setResetingId] = useState(null)
  // Tenant whose inline room/bed picker is open (null = closed).
  const [assigningId, setAssigningId] = useState(null)

  useEffect(() => {
    dispatch(fetchTenants())
    dispatch(fetchAllVacates())
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

  function handleRejectVacate(request) {
    const confirmed = window.confirm(
      `Decline ${request.tenantName}'s request to vacate on ${request.vacateOn}?`,
    )
    if (confirmed) dispatch(rejectVacate(request))
  }

  function handleCompleteVacate(request) {
    const confirmed = window.confirm(
      `Mark ${request.tenantName} as vacated? This frees their bed and ends their tenancy.`,
    )
    if (!confirmed) return

    dispatch(completeVacate(request)).then((result) => {
      if (result.meta.requestStatus === 'fulfilled') {
        dispatch(fetchTenants())
      }
    })
  }

  // Only requests that still need the owner's attention sit at the top.
  const activeVacates = vacateRequests
    .filter((request) => ['pending', 'approved'].includes(request.status))
    .sort((a, b) =>
      a.status === 'pending' ? -1 : b.status === 'pending' ? 1 : 0,
    )

  const pendingVacates = activeVacates.filter(
    (request) => request.status === 'pending',
  ).length

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

      {/* Vacate notices that still need a decision or a hand-over */}
      {(activeVacates.length > 0 || vacatesError) && (
        <section className="mt-6" aria-labelledby="vacate-requests-heading">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2
              id="vacate-requests-heading"
              className="text-base font-semibold text-charcoal"
            >
              Vacate requests
            </h2>
            <span className="text-sm text-charcoal/55">
              {pendingVacates} pending
            </span>
          </div>

          <div className="mt-3 space-y-4">
            {vacatesError && (
              <Alert tone="error">
                Could not load vacate requests: {vacatesError}
              </Alert>
            )}
            {vacatesSaveError && <Alert tone="error">{vacatesSaveError}</Alert>}

            {activeVacates.map((request) => (
              <VacateRequestCard
                key={request.id}
                request={request}
                isSaving={vacatesSaving}
                onApprove={(item) => dispatch(approveVacate(item))}
                onReject={handleRejectVacate}
                onComplete={handleCompleteVacate}
              />
            ))}
          </div>
        </section>
      )}

      <div className="mt-4 space-y-4">
        {isLoading && <Spinner compact label="Loading tenants…" />}

        {error && (
          <Alert tone="error">Could not load tenants: {error}</Alert>
        )}
        {saveError && !assigningId && <Alert tone="error">{saveError}</Alert>}

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

        {filtered.map((tenant) => {
          const vacate = activeVacates.find(
            (request) => String(request.tenantId) === String(tenant.id),
          )

          return (
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

                {tenant.documents?.length > 0 && (
                  <p className="mt-1.5 flex flex-wrap items-center gap-1.5 text-xs">
                    <span className="text-charcoal/45">ID docs:</span>
                    {tenant.documents.map((document) => (
                      <a
                        key={document.path ?? document.name}
                        href={documentUrl(document.path)}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex max-w-40 items-center gap-1 border border-line bg-ivory px-1.5 py-0.5 font-medium text-charcoal transition-colors hover:border-line-strong hover:text-forest"
                      >
                        <FileText size={12} strokeWidth={1.75} aria-hidden="true" />
                        <span className="truncate">{document.name}</span>
                      </a>
                    ))}
                  </p>
                )}

                {vacate && (
                  <p className="mt-0.5 text-xs font-medium text-forest">
                    {vacate.status === 'approved'
                      ? `Vacating ${vacate.vacateOn} (approved)`
                      : `Vacate requested for ${vacate.vacateOn}`}
                  </p>
                )}
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
                size="sm"
                variant={tenant.bedId ? 'secondary' : 'primary'}
                onClick={() => {
                  dispatch(clearTenantSaveFeedback())
                  setAssigningId(assigningId === tenant.id ? null : tenant.id)
                }}
              >
                {assigningId === tenant.id
                  ? 'Close picker'
                  : tenant.bedId
                    ? 'Change room & bed'
                    : 'Assign room & bed'}
              </Button>
              <Button
                to={`/owner/hostels/${tenant.hostelId}`}
                variant="ghost"
                size="sm"
              >
                Manage rooms
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

            {assigningId === tenant.id && (
              <TenantBedPicker
                tenant={tenant}
                onDone={() => setAssigningId(null)}
                onCancel={() => setAssigningId(null)}
              />
            )}
          </div>
          )
        })}
      </div>
    </section>
  )
}
