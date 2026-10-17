import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import TenantNav from '../../components/layout/TenantNav'
import FormField from '../../components/common/FormField'
import Spinner from '../../components/common/Spinner'
import { selectCurrentUser } from '../../features/auth/authSlice'
import { getTenantsByUser, updateTenant } from '../../features/tenants/tenantService'

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

  if (tenancyLoading) return <Spinner label="Loading profile..." />

  return (
    <section className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-3xl font-bold text-slate-900">My profile</h1>
      <p className="mt-2 text-slate-600">
        {user?.email}
      </p>

      <div className="mt-6">
        <TenantNav />
      </div>

      {/* Tenancy info card */}
      {tenancy && (
        <div className="mt-8 rounded-lg border border-indigo-100 bg-indigo-50 p-4">
          <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">
            Active tenancy
          </p>
          <p className="mt-1 font-medium text-slate-900">{tenancy.hostelName}</p>
          <div className="mt-2 grid grid-cols-2 gap-2 text-sm text-slate-600 sm:grid-cols-4">
            <span>Room: <strong>{tenancy.roomNumber ?? '—'}</strong></span>
            <span>Bed: <strong>{tenancy.bedNumber ?? '—'}</strong></span>
            <span>Joined: <strong>{tenancy.joinedOn ?? '—'}</strong></span>
            <span>
              Rent:{' '}
              <strong className={tenancy.rentStatus === 'paid' ? 'text-green-700' : 'text-amber-700'}>
                {tenancy.rentStatus ?? 'unpaid'}
              </strong>
            </span>
          </div>
        </div>
      )}

      {!tenancy && (
        <div className="mt-8 rounded-lg border border-slate-200 bg-slate-50 p-4 text-slate-600">
          You are not an active tenant yet. Your profile will show tenancy details once you move in.
        </div>
      )}

      {/* Edit form — only for active tenants who have a record to update */}
      {tenancy && (
        <form onSubmit={handleSubmit} className="mt-8 space-y-4 rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="text-lg font-semibold text-slate-900">Edit details</h2>

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

          {saveMsg && (
            <p className={`text-sm ${saveMsg.type === 'ok' ? 'text-green-700' : 'text-red-600'}`}>
              {saveMsg.text}
            </p>
          )}

          <button
            type="submit"
            disabled={saving}
            className="rounded-md bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
          >
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </form>
      )}
    </section>
  )
}
