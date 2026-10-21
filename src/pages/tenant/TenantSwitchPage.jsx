import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { ArrowLeftRight } from 'lucide-react'
import Alert from '../../components/ui/Alert'
import Button from '../../components/ui/Button'
import EmptyState from '../../components/ui/EmptyState'
import PageHeader from '../../components/ui/PageHeader'
import StatusBadge from '../../components/ui/StatusBadge'
import Spinner from '../../components/common/Spinner'
import { selectCurrentUser } from '../../features/auth/authSlice'
import { fetchHostels, selectHostels } from '../../features/hostels/hostelSlice'
import SwitchOptionCard from '../../features/switches/components/SwitchOptionCard'
import {
  fetchMySwitches,
  requestHostelSwitch,
  selectSwitchesSaveError,
  selectSwitchesSaving,
  selectSwitchRequests,
  SWITCH_FEE_RUPEES,
} from '../../features/switches/switchSlice'
import { getTenantsByUser } from '../../features/tenants/tenantService'
import formatRupees from '../../utils/formatRupees'

const STEPS = [
  'Pick another branch below and pay the one-time switch fee.',
  'The owner reviews your request — you will see the status here.',
  'Once approved, your bed and rent move to the new branch.',
]

// Tenant screen for paying the switching fee and moving to another hostel.
export default function TenantSwitchPage() {
  const dispatch = useDispatch()
  const user = useSelector(selectCurrentUser)
  const hostels = useSelector(selectHostels)
  const switchRequests = useSelector(selectSwitchRequests)
  const isSaving = useSelector(selectSwitchesSaving)
  const saveError = useSelector(selectSwitchesSaveError)

  // The active tenancy tells us which hostel they are leaving.
  const [tenancy, setTenancy] = useState(null)
  const [tenancyLoading, setTenancyLoading] = useState(true)

  useEffect(() => {
    if (!user?.uid) return

    let cancelled = false
    dispatch(fetchHostels())
    dispatch(fetchMySwitches(user.uid))

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

  function handleSwitch(toHostel) {
    dispatch(
      requestHostelSwitch({
        tenant: tenancy,
        toHostel,
        amount: SWITCH_FEE_RUPEES,
      }),
    )
  }

  if (tenancyLoading) {
    return (
      <section>
        <PageHeader
          eyebrow="Tenant portal"
          title="Switch branch"
          description="Move to another branch for a one-time fee."
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
          title="Switch branch"
          description="Move to another branch for a one-time fee."
        />
        <div className="mt-6">
          <EmptyState
            icon={ArrowLeftRight}
            title="Only active tenants can switch"
            hint="Once you have moved in, you can switch to any other branch from here."
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

  // One switch at a time: block new payments while a request is undecided.
  const hasPendingRequest = switchRequests.some(
    (request) => request.status === 'pending',
  )

  const otherHostels = hostels.filter(
    (hostel) => hostel.id !== tenancy.hostelId,
  )

  return (
    <section>
      <PageHeader
        eyebrow="Tenant portal"
        title="Switch branch"
        description={`Currently at ${tenancy.hostelName}.`}
      />

      <div className="mt-6 space-y-8">
        {hasPendingRequest && (
          <Alert tone="warning">
            You already have a switch request awaiting the owner's approval.
          </Alert>
        )}

        {/* How switching works */}
        <section className="card p-5" aria-labelledby="switch-fee-heading">
          <p id="switch-fee-heading" className="eyebrow">
            Switch fee
          </p>
          <p className="mt-2 text-base font-semibold tabular-nums text-forest">
            {formatRupees(SWITCH_FEE_RUPEES)}
            <span className="ml-1.5 text-xs font-normal text-charcoal/70">
              one-time
            </span>
          </p>

          <ol className="mt-4 space-y-3">
            {STEPS.map((step, index) => (
              <li key={step} className="flex gap-3">
                <span className="eyebrow mt-0.5 shrink-0">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <p className="text-sm leading-relaxed text-charcoal/70">
                  {step}
                </p>
              </li>
            ))}
          </ol>
        </section>

        {/* Other branches */}
        <section aria-labelledby="other-branches-heading">
          <h2
            id="other-branches-heading"
            className="text-base font-semibold text-charcoal"
          >
            Other branches
          </h2>

          <div className="mt-3">
            {otherHostels.length === 0 ? (
              <EmptyState
                icon={ArrowLeftRight}
                title="No other branches yet"
                hint="There is nowhere to switch to just now — check back soon."
              />
            ) : (
              <div className="grid gap-5 sm:grid-cols-2">
                {otherHostels.map((hostel) => (
                  <SwitchOptionCard
                    key={hostel.id}
                    hostel={hostel}
                    feeRupees={SWITCH_FEE_RUPEES}
                    disabled={hasPendingRequest}
                    isSaving={isSaving}
                    onSwitch={handleSwitch}
                  />
                ))}
              </div>
            )}
          </div>
        </section>

        {saveError && <Alert tone="error">{saveError}</Alert>}

        {/* My requests */}
        <section aria-labelledby="switch-requests-heading">
          <h2
            id="switch-requests-heading"
            className="text-base font-semibold text-charcoal"
          >
            My requests
          </h2>

          <div className="mt-3">
            {switchRequests.length === 0 ? (
              <EmptyState
                icon={ArrowLeftRight}
                title="No switch requests yet"
                hint="When you request a switch it will appear here with its status."
              />
            ) : (
              <div className="space-y-3">
                {switchRequests.map((request) => {
                  const feePaid = ['pending', 'approved', 'rejected'].includes(
                    request.status,
                  )

                  return (
                    <div key={request.id} className="card p-4">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-charcoal">
                            {request.fromHostelName} → {request.toHostelName}
                          </p>
                          <p className="mt-0.5 text-xs text-charcoal/70">
                            Requested {request.createdAt} ·{' '}
                            <span className="font-semibold tabular-nums text-forest">
                              {formatRupees(request.amount)}
                            </span>{' '}
                            {feePaid ? 'paid' : 'not paid'}
                          </p>
                          {feePaid && request.paymentId && (
                            <p className="mt-0.5 text-xs text-charcoal/45">
                              {request.paymentId}
                            </p>
                          )}
                        </div>

                        <StatusBadge status={request.status} />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </section>
      </div>
    </section>
  )
}
