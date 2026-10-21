import FloatingDock from '../components/layout/FloatingDock'
import OwnerNav from '../components/layout/OwnerNav'
import TenantNav from '../components/layout/TenantNav'

export default function DockPreviewPage() {
  return (
    <div className="min-h-screen bg-ivory px-6 py-12">
      <p className="text-sm text-charcoal/60">Owner dock</p>
      <div className="mt-4">
        <OwnerNav />
      </div>

      <p className="mt-12 text-sm text-charcoal/60">Tenant dock</p>
      <div className="mt-4">
        <TenantNav />
      </div>

      <p className="mt-12 text-sm text-charcoal/60">Fixed floating owner dock</p>
      <FloatingDock>
        <OwnerNav />
      </FloatingDock>
    </div>
  )
}
