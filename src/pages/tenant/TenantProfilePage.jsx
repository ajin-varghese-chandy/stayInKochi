import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { BedDouble, LogOut, Pencil } from 'lucide-react'
import Alert from '../../components/ui/Alert'
import Button from '../../components/ui/Button'
import EmptyState from '../../components/ui/EmptyState'
import PageHeader from '../../components/ui/PageHeader'
import StatusBadge from '../../components/ui/StatusBadge'
import FormField from '../../components/common/FormField'
import Spinner from '../../components/common/Spinner'
import { logout, selectCurrentUser } from '../../features/auth/authSlice'
import { getTenantsByUser, updateTenant } from '../../features/tenants/tenantService'
import { VACATE_NOTICE_DAYS } from '../../features/vacates/vacateSlice'
import formatRupees from '../../utils/formatRupees'

// Tenant screen to view and edit their profile details.
export default function TenantProfilePage() {
  const user = useSelector(selectCurrentUser)
  const dispatch = useDispatch()

  const [tenancy, setTenancy] = useState(null)
  const [tenancyLoading, setTenancyLoading] = useState(true)

  // Editable fields
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState(null)
  const [editing, setEditing] = useState(false)

  useEffect(() => {
    if (!user?.uid) return
    let cancelled = false
    getTenantsByUser(user.uid)
      .then((tenants) => {
        if (cancelled) return
        const t = tenants[0] ?? null
        setTenancy(t)
        setName(t?.name ?? user.displayName ?? '')
        setPhone(t?.phone ?? '')
        setTenancyLoading(false)
      })
      .catch(() => {
        if (cancelled) return
        setTenancyLoading(false)
      })
    return () => { cancelled = true }
  }, [user?.uid, user?.displayName])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!tenancy) return
    setSaving(true)
    setSaveMsg(null)
    try {
      await updateTenant(tenancy.id, { name: name.trim(), phone: phone.trim() })
      setTenancy((prev) => ({ ...prev, name: name.trim(), phone: phone.trim() }))
      setSaveMsg({ type: 'ok', text: 'Profile updated.' })
    } catch (err) {
      setSaveMsg({ type: 'err', text: err.message })
    } finally {
      setSaving(false)
    }
  }

  if (tenancyLoading) {
    return (
      <section>
        <PageHeader
          eyebrow="Tenant portal"
          title="Profile"
          description="Your account and current tenancy."
        />
        <div className="mt-6">
          <Spinner compact label="Loading profile…" />
        </div>
      </section>
    )
  }

  return (
    <section>
      <PageHeader
        eyebrow="Tenant portal"
        title="Profile"
        description={user?.email}
      />

      <div className="mt-6 space-y-6">
        {/* Identity + edit form */}
        <section className="card p-5" aria-labelledby="account-heading">
          <div className="flex items-center justify-between gap-3">
            <p id="account-heading" className="eyebrow">
              Account
            </p>

            {tenancy && !editing && (
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setEditing(true)}
              >
                <Pencil size={16} strokeWidth={1.75} aria-hidden="true" />
                Edit
              </Button>
            )}
          </div>

          <dl className="mt-3">
            <div className="flex justify-between border-b border-line py-2 text-sm last:border-0">
              <dt className="text-charcoal/70">Name</dt>
              <dd className="font-medium text-charcoal">
                {tenancy?.name ?? user?.displayName ?? '—'}
              </dd>
            </div>
            <div className="flex justify-between border-b border-line py-2 text-sm last:border-0">
              <dt className="text-charcoal/70">Email</dt>
              <dd className="font-medium text-charcoal">
                {user?.email ?? '—'}
              </dd>
            </div>
            <div className="flex justify-between border-b border-line py-2 text-sm last:border-0">
              <dt className="text-charcoal/70">Phone</dt>
              <dd className="font-medium text-charcoal">
                {tenancy?.phone || '—'}
              </dd>
            </div>
          </dl>

          {tenancy && editing && (
            <form
              onSubmit={handleSubmit}
              className="mt-5 space-y-4 border-t border-line pt-5"
            >
              <FormField
                label="Full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
              />
              <FormField
                label="Phone number"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                autoComplete="tel"
              />

              {saveMsg &&
                (saveMsg.type === 'ok' ? (
                  <Alert tone="success">{saveMsg.text}</Alert>
                ) : (
                  <Alert tone="error">{saveMsg.text}</Alert>
                ))}

              <div className="flex flex-wrap gap-2">
                <Button type="submit" disabled={saving}>
                  {saving ? 'Saving…' : 'Save changes'}
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setEditing(false)}
                  disabled={saving}
                >
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </section>

        {/* Current tenancy */}
        {tenancy ? (
          <section
            className="rounded-card bg-forest p-5 text-ivory"
            aria-labelledby="tenancy-heading"
          >
            <p className="eyebrow eyebrow-light" id="tenancy-heading">
              Current tenancy
            </p>
            <p className="mt-2 text-base font-semibold text-ivory">
              {tenancy.hostelName}
            </p>

            <dl className="mt-3">
              <div className="flex justify-between border-b border-ivory/20 py-2 text-sm last:border-0">
                <dt className="text-ivory/75">Room</dt>
                <dd className="font-medium text-ivory">
                  {tenancy.roomNumber ?? '—'}
                </dd>
              </div>
              <div className="flex justify-between border-b border-ivory/20 py-2 text-sm last:border-0">
                <dt className="text-ivory/75">Bed</dt>
                <dd className="font-medium text-ivory">
                  {tenancy.bedNumber ?? '—'}
                </dd>
              </div>
              <div className="flex justify-between border-b border-ivory/20 py-2 text-sm last:border-0">
                <dt className="text-ivory/75">Joined on</dt>
                <dd className="font-medium text-ivory">
                  {tenancy.joinedOn ?? '—'}
                </dd>
              </div>
              <div className="flex justify-between border-b border-ivory/20 py-2 text-sm last:border-0">
                <dt className="text-ivory/75">Rent</dt>
                <dd className="flex items-center gap-2">
                  <span className="font-semibold tabular-nums text-ivory">
                    {formatRupees(tenancy.rentPerMonth)}
                  </span>
                  <StatusBadge status={tenancy.rentStatus ?? 'unpaid'} />
                </dd>
              </div>
            </dl>
          </section>
        ) : (
          <EmptyState
            icon={BedDouble}
            title="Not an active tenant yet"
            hint="Your profile will show room, bed, and rent details once you move in."
            action={
              <Button to="/hostels" variant="secondary">
                Browse branches
              </Button>
            }
          />
        )}

        {/* Vacate */}
        {tenancy && (
          <section className="card p-5" aria-labelledby="vacate-heading">
            <p id="vacate-heading" className="eyebrow">
              Vacate room
            </p>
            <p className="mt-2 text-sm leading-relaxed text-charcoal/70">
              Planning to leave? Give at least {VACATE_NOTICE_DAYS} days&apos;
              notice and the owner will confirm your move-out.
            </p>
            <div className="mt-3">
              <Button to="/tenant/vacate" size="sm" variant="secondary">
                Request to vacate
              </Button>
            </div>
          </section>
        )}

        {/* Sign out */}
        <div className="border-t border-line pt-5">
          <Button
            variant="secondary"
            block
            onClick={() => dispatch(logout())}
          >
            <LogOut size={16} strokeWidth={1.75} aria-hidden="true" />
            Sign out
          </Button>
        </div>
      </div>
    </section>
  )
}
