import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { DoorOpen } from 'lucide-react'
import Alert from '../../components/ui/Alert'
import Button from '../../components/ui/Button'
import EmptyState from '../../components/ui/EmptyState'
import PageHeader from '../../components/ui/PageHeader'
import StatusBadge from '../../components/ui/StatusBadge'
import Spinner from '../../components/common/Spinner'
import { selectCurrentUser } from '../../features/auth/authSlice'
import { getTenantsByUser } from '../../features/tenants/tenantService'
import {
  cancelVacate,
  earliestVacateDate,
  fetchMyVacates,
  requestVacate,
  selectVacateRequests,
  selectVacatesError,
  selectVacatesLoading,
  selectVacatesSaveError,
  selectVacatesSaving,
  VACATE_NOTICE_DAYS,
} from '../../features/vacates/vacateSlice'

const ACTIVE_STATUSES = ['pending', 'approved']

// Tenant screen for giving notice and requesting to vacate their room.
export default function TenantVacatePage() {
  const dispatch = useDispatch()
  const user = useSelector(selectCurrentUser)
  const requests = useSelector(selectVacateRequests)
  const isLoading = useSelector(selectVacatesLoading)
  const error = useSelector(selectVacatesError)
  const isSaving = useSelector(selectVacatesSaving)
  const saveError = useSelector(selectVacatesSaveError)

  // The active tenancy tells us which room and bed is being vacated.
  const [tenancy, setTenancy] = useState(null)
  const [tenancyLoading, setTenancyLoading] = useState(true)

  // Earliest date that satisfies the notice period.
  const earliest = earliestVacateDate()
  const [vacateOn, setVacateOn] = useState(earliest)
  const [reason, setReason] = useState('')

  useEffect(() => {
    if (!user?.uid) return

    let cancelled = false
    dispatch(fetchMyVacates(user.uid))

    getTenantsByUser(user.uid)
      .then((tenants) => {
        if (cancelled) return
        setTenancy(tenants[0] ?? null)
        setTenancyLoading(false)
      })
      .catch(() => {
        if (cancelled) return
        setTenancy(null)
        setTenancyLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [dispatch, user?.uid])

  function handleSubmit(event) {
    event.preventDefault()

    dispatch(requestVacate({ tenancy, vacateOn, reason })).then((result) => {
      if (result.meta.requestStatus !== 'fulfilled') return

      setReason('')
      setVacateOn(earliest)
    })
  }

  function handleCancel(request) {
    const confirmed = window.confirm(
      `Withdraw your request to vacate on ${request.vacateOn}?`,
    )
    if (confirmed) dispatch(cancelVacate(request))
  }

  if (tenancyLoading) {
    return (
      <section>
        <PageHeader
          eyebrow="Tenant portal"
          title="Vacate room"
          description="Give notice when you are ready to leave."
        />
        <div className="mt-6">
          <Spinner compact label="Checking your tenancy…" />
        </div>
      </section>
    )
  }

  if (!tenancy) {
    return (
      <section>
        <PageHeader
          eyebrow="Tenant portal"
          title="Vacate room"
          description="Give notice when you are ready to leave."
        />
        <div className="mt-6">
          <EmptyState
            icon={DoorOpen}
            title="Only active tenants can request a vacate"
            hint="Once you have moved in, you can give notice from here."
            action={
              <Button to="/hostels" variant="secondary">
                Browse branches
              </Button>
            }
          />
        </div>
      </section>
    )
  }

  const activeRequest = requests.find((request) =>
    ACTIVE_STATUSES.includes(request.status),
  )

  // The active request already has its own card above, so only keep the
  // finished/rejected ones in the history list.
  const history = requests
    .filter((request) => request.id !== activeRequest?.id)
    .sort((a, b) =>
      String(b.requestedOn ?? '').localeCompare(String(a.requestedOn ?? '')),
    )

  return (
    <section>
      <PageHeader
        eyebrow="Tenant portal"
        title="Vacate room"
        description={`${tenancy.hostelName} · Room ${tenancy.roomNumber ?? '—'} · Bed ${tenancy.bedNumber ?? '—'}`}
      />

      <div className="mt-6 space-y-6">
        {/* Notice policy */}
        <section className="card p-5" aria-labelledby="notice-heading">
          <p id="notice-heading" className="eyebrow">
            Notice period
          </p>
          <p className="mt-2 text-base font-semibold text-charcoal">
            {VACATE_NOTICE_DAYS} days
          </p>
          <p className="mt-1 text-sm leading-relaxed text-charcoal/70">
            Choose a vacate date at least {VACATE_NOTICE_DAYS} days from today.
            The earliest you can leave is{' '}
            <span className="font-medium tabular-nums text-charcoal">
              {earliest}
            </span>
            .
          </p>
        </section>

        {saveError && <Alert tone="error">{saveError}</Alert>}

        {error && (
          <Alert tone="error">Could not load your requests: {error}</Alert>
        )}

        {activeRequest ? (
          <section aria-labelledby="active-request-heading">
            <h2
              id="active-request-heading"
              className="text-base font-semibold text-charcoal"
            >
              Your vacate request
            </h2>

            <div className="card mt-3 p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-charcoal">
                    Vacating on {activeRequest.vacateOn}
                  </p>
                  <p className="mt-0.5 text-xs text-charcoal/55">
                    Requested {activeRequest.requestedOn} ·{' '}
                    {activeRequest.noticeDays ?? VACATE_NOTICE_DAYS}-day notice
                  </p>
                  {activeRequest.reason && (
                    <p className="mt-2 text-sm text-charcoal/70">
                      “{activeRequest.reason}”
                    </p>
                  )}
                </div>

                <StatusBadge status={activeRequest.status} />
              </div>

              <p className="mt-3 text-sm text-charcoal/70">
                {activeRequest.status === 'approved'
                  ? 'The owner accepted your notice. Hand over your room and bed on the date above — they will mark you checked out.'
                  : 'The owner is reviewing your notice. You can withdraw it while it is still pending.'}
              </p>

              {activeRequest.status === 'pending' && (
                <div className="mt-4 flex justify-end border-t border-line pt-3">
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => handleCancel(activeRequest)}
                    disabled={isSaving}
                  >
                    Withdraw request
                  </Button>
                </div>
              )}
            </div>
          </section>
        ) : (
          <section className="card p-5" aria-label="Request to vacate">
            <h2 className="text-base font-semibold text-charcoal">
              Request to vacate
            </h2>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <label className="block">
                <span className="field-label">Vacate date</span>
                <input
                  type="date"
                  value={vacateOn}
                  min={earliest}
                  onChange={(event) => setVacateOn(event.target.value)}
                  className="field"
                  required
                />
                <span className="field-hint">
                  At least {VACATE_NOTICE_DAYS} days from today.
                </span>
              </label>

              <label className="block">
                <span className="field-label">Reason (optional)</span>
                <textarea
                  value={reason}
                  onChange={(event) => setReason(event.target.value)}
                  rows={3}
                  className="field"
                  placeholder="Tell the owner why you are leaving…"
                />
              </label>

              <div className="flex justify-end">
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? 'Sending…' : 'Send vacate request'}
                </Button>
              </div>
            </form>
          </section>
        )}

        {/* History */}
        {history.length > 0 && (
          <section aria-labelledby="vacate-history-heading">
            <h2
              id="vacate-history-heading"
              className="text-base font-semibold text-charcoal"
            >
              Past requests
            </h2>

            <div className="mt-3 space-y-3">
              {history.map((request) => (
                <div key={request.id} className="card p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-charcoal">
                        Vacating {request.vacateOn}
                      </p>
                      <p className="mt-0.5 text-xs text-charcoal/55">
                        Requested {request.requestedOn} ·{' '}
                        {request.noticeDays ?? VACATE_NOTICE_DAYS}-day notice
                      </p>
                      {request.reason && (
                        <p className="mt-1 text-xs text-charcoal/70">
                          “{request.reason}”
                        </p>
                      )}
                    </div>

                    <StatusBadge status={request.status} />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {isLoading && <Spinner compact label="Loading your requests…" />}
      </div>
    </section>
  )
}
