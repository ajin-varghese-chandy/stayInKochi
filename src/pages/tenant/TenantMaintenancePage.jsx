import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import Spinner from '../../components/common/Spinner'
import TenantNav from '../../components/layout/TenantNav'
import { selectCurrentUser } from '../../features/auth/authSlice'
import MaintenanceCard from '../../features/maintenance/components/MaintenanceCard'
import MaintenanceForm from '../../features/maintenance/components/MaintenanceForm'
import {
  fetchMyMaintenance,
  selectMaintenanceError,
  selectMaintenanceLoading,
  selectMaintenanceRequests,
} from '../../features/maintenance/maintenanceSlice'
import { getTenantsByUser } from '../../features/tenants/tenantService'

// Tenant screen for raising maintenance requests and tracking their status.
export default function TenantMaintenancePage() {
  const dispatch = useDispatch()
  const user = useSelector(selectCurrentUser)
  const requests = useSelector(selectMaintenanceRequests)
  const isLoading = useSelector(selectMaintenanceLoading)
  const error = useSelector(selectMaintenanceError)

  // The active tenancy tells us which hostel/room the request is for.
  const [tenancy, setTenancy] = useState(null)
  const [tenancyLoading, setTenancyLoading] = useState(true)

  useEffect(() => {
    if (!user?.uid) return

    let cancelled = false
    dispatch(fetchMyMaintenance(user.uid))

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

  if (tenancyLoading) {
    return <Spinner label="Checking your tenancy..." />
  }

  if (!tenancy) {
    return (
      <section className="mx-auto max-w-4xl px-4 py-12">
        <h1 className="text-3xl font-bold text-slate-900">Maintenance</h1>
        <div className="mt-6">
          <TenantNav />
        </div>
        <p className="mt-6 text-slate-600">
          Only active tenants can raise maintenance requests.
        </p>
      </section>
    )
  }

  return (
    <section className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-3xl font-bold text-slate-900">Maintenance</h1>
      <p className="mt-1 text-slate-600">{tenancy.hostelName}</p>

      <div className="mt-6">
        <TenantNav />
      </div>

      <div className="mt-6">
        <MaintenanceForm tenancy={tenancy} />
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold text-slate-900">My requests</h2>

        {isLoading && <Spinner label="Loading your requests..." />}

        {error && (
          <p className="mt-4 text-red-600">
            Could not load your requests: {error}
          </p>
        )}

        {!isLoading && !error && requests.length === 0 && (
          <p className="mt-4 text-slate-600">You have not raised any requests yet.</p>
        )}

        <div className="mt-4 space-y-4">
          {requests.map((request) => (
            <MaintenanceCard key={request.id} request={request} />
          ))}
        </div>
      </div>
    </section>
  )
}
