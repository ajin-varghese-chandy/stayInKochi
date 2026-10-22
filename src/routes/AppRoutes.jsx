import { Route, Routes } from 'react-router-dom'
import AppLayout from '../components/layout/AppLayout'
import OwnerLayout from '../components/layout/OwnerLayout'
import TenantLayout from '../components/layout/TenantLayout'
import DockPreviewPage from '../pages/DockPreviewPage'
import HostelDetailsPage from '../pages/HostelDetailsPage'
import HostelListPage from '../pages/HostelListPage'
import LandingPage from '../pages/LandingPage'
import LoginPage from '../pages/LoginPage'
import NotFoundPage from '../pages/NotFoundPage'
import RegisterPage from '../pages/RegisterPage'
import OwnerChatPage from '../pages/owner/OwnerChatPage'
import OwnerDashboardPage from '../pages/owner/OwnerDashboardPage'
import OwnerFoodPage from '../pages/owner/OwnerFoodPage'
import OwnerHostelsPage from '../pages/owner/OwnerHostelsPage'
import OwnerMaintenancePage from '../pages/owner/OwnerMaintenancePage'
import OwnerPaymentsPage from '../pages/owner/OwnerPaymentsPage'
import OwnerRoomsPage from '../pages/owner/OwnerRoomsPage'
import OwnerSwitchesPage from '../pages/owner/OwnerSwitchesPage'
import OwnerTenantsPage from '../pages/owner/OwnerTenantsPage'
import TenantChatPage from '../pages/tenant/TenantChatPage'
import TenantDashboardPage from '../pages/tenant/TenantDashboardPage'
import TenantFoodPage from '../pages/tenant/TenantFoodPage'
import TenantMaintenancePage from '../pages/tenant/TenantMaintenancePage'
import TenantPaymentsPage from '../pages/tenant/TenantPaymentsPage'
import TenantProfilePage from '../pages/tenant/TenantProfilePage'
import TenantSwitchPage from '../pages/tenant/TenantSwitchPage'
import TenantVacatePage from '../pages/tenant/TenantVacatePage'
import ProtectedRoute from './ProtectedRoute'

// All app routes, split by shell:
//   public  -> AppLayout (floating navbar + footer)
//   owner   -> ProtectedRoute -> OwnerLayout (floating bar + dock console)
//   tenant  -> ProtectedRoute -> TenantLayout (floating bar + dock portal)
export default function AppRoutes() {
  return (
    <Routes>
      <Route path="dock-preview" element={<DockPreviewPage />} />

      <Route element={<AppLayout />}>
        <Route index element={<LandingPage />} />
        <Route path="hostels" element={<HostelListPage />} />
        <Route path="hostels/:hostelId" element={<HostelDetailsPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>

      <Route element={<ProtectedRoute requiredRole="owner" />}>
        <Route element={<OwnerLayout />}>
          <Route path="owner" element={<OwnerDashboardPage />} />
          <Route path="owner/hostels" element={<OwnerHostelsPage />} />
          <Route path="owner/hostels/:hostelId" element={<OwnerRoomsPage />} />
          <Route path="owner/food" element={<OwnerFoodPage />} />
          <Route path="owner/chat" element={<OwnerChatPage />} />
          <Route path="owner/maintenance" element={<OwnerMaintenancePage />} />
          <Route path="owner/payments" element={<OwnerPaymentsPage />} />
          <Route path="owner/tenants" element={<OwnerTenantsPage />} />
          <Route path="owner/switches" element={<OwnerSwitchesPage />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute requiredRole="tenant" />}>
        <Route element={<TenantLayout />}>
          <Route path="tenant" element={<TenantDashboardPage />} />
          <Route path="tenant/food" element={<TenantFoodPage />} />
          <Route path="tenant/chat" element={<TenantChatPage />} />
          <Route path="tenant/maintenance" element={<TenantMaintenancePage />} />
          <Route path="tenant/payments" element={<TenantPaymentsPage />} />
          <Route path="tenant/switch" element={<TenantSwitchPage />} />
          <Route path="tenant/vacate" element={<TenantVacatePage />} />
          <Route path="tenant/profile" element={<TenantProfilePage />} />
        </Route>
      </Route>
    </Routes>
  )
}
