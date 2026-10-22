import { useState } from 'react'
import { useSelector } from 'react-redux'
import { selectTenants } from '../../tenants/tenantSlice'
import Button from '../../../components/ui/Button'
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

  // Available beds offer assignment; reserved beds are held for a switch;
  // occupied beds can be freed.
  let actions
  if (bed.status === 'available') {
    actions =
      assignableTenants.length > 0 ? (
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedTenantId}
            onChange={(event) => setSelectedTenantId(event.target.value)}
            className="field w-auto min-h-10 text-sm"
          >
            <option value="">Assign tenant...</option>
            {assignableTenants.map((tenant) => (
              <option key={tenant.id} value={tenant.id}>
                {tenant.name}
              </option>
            ))}
          </select>
          <Button
            size="sm"
            onClick={handleAssign}
            disabled={!selectedTenantId || isSaving}
          >
            Assign
          </Button>
        </div>
      ) : (
        <span className="text-sm text-charcoal/55">No tenants to assign</span>
      )
  } else if (bed.status === 'reserved') {
    actions = (
      <span className="text-sm text-charcoal/55">
        Held for{' '}
        {occupant ? `${occupant.name}'s switch` : 'a switch request'}
      </span>
    )
  } else {
    actions = (
      <Button size="sm" variant="secondary" onClick={() => onFree(bed)} disabled={isSaving}>
        Free bed
      </Button>
    )
  }

  return (
    <div className="flex flex-wrap items-center gap-3 border-b border-line py-3 last:border-0">
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm font-medium text-charcoal">
          Bed {bed.bedNumber}
        </span>
        <BedStatusBadge status={bed.status} />
        {occupant && (
          <span className="text-sm text-charcoal/70">{occupant.name}</span>
        )}
      </div>

      <div className="ml-auto flex flex-wrap items-center gap-2">{actions}</div>
    </div>
  )
}
