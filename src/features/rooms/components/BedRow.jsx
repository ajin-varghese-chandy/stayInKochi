import { useState } from 'react'
import { useSelector } from 'react-redux'
import { selectTenants } from '../../tenants/tenantSlice'
import BedStatusBadge from './BedStatusBadge'

// One bed inside a room: shows status/occupant and lets the owner assign or
// free the bed.
export default function BedRow({ bed, assignableTenants, isSaving, onAssign, onFree }) {
  const tenants = useSelector(selectTenants)
  const [selectedTenantId, setSelectedTenantId] = useState('')

  const occupant = bed.tenantId
    ? tenants.find((tenant) => tenant.id === bed.tenantId)
    : null

  function handleAssign() {
    const tenant = assignableTenants.find(
      (candidate) => candidate.id === selectedTenantId,
    )
    if (tenant) {
      onAssign(bed, tenant)
      setSelectedTenantId('')
    }
  }

  // Available beds offer assignment; occupied beds can be freed.
  let actions
  if (bed.status === 'available') {
    actions =
      assignableTenants.length > 0 ? (
        <div className="flex items-center gap-2">
          <select
            value={selectedTenantId}
            onChange={(event) => setSelectedTenantId(event.target.value)}
            className="rounded-md border border-slate-300 px-2 py-1 text-sm text-slate-800 focus:border-indigo-500 focus:outline-none"
          >
            <option value="">Assign tenant...</option>
            {assignableTenants.map((tenant) => (
              <option key={tenant.id} value={tenant.id}>
                {tenant.name}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={handleAssign}
            disabled={!selectedTenantId || isSaving}
            className="rounded-md bg-indigo-600 px-3 py-1 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
          >
            Assign
          </button>
        </div>
      ) : (
        <span className="text-sm text-slate-400">No tenants to assign</span>
      )
  } else {
    actions = (
      <button
        type="button"
        onClick={() => onFree(bed)}
        disabled={isSaving}
        className="rounded-md border border-slate-300 px-3 py-1 text-sm text-slate-700 hover:bg-slate-100 disabled:opacity-60"
      >
        Free bed
      </button>
    )
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 py-2">
      <div className="flex items-center gap-3">
        <span className="font-medium text-slate-700">Bed {bed.bedNumber}</span>
        <BedStatusBadge status={bed.status} />
        {occupant && <span className="text-sm text-slate-500">{occupant.name}</span>}
      </div>

      {actions}
    </div>
  )
}
