import { Route, Routes } from 'react-router-dom'
import AppLayout from '../components/layout/AppLayout'
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
import ProtectedRoute from './ProtectedRoute'

// All app routes. Public pages live under the shared layout; owner/tenant pages
// are wrapped in a ProtectedRoute that enforces the required role.
export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<LandingPage />} />
        <Route path="hostels" element={<HostelListPage />} />
        <Route path="hostels/:hostelId" element={<HostelDetailsPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />

        <Route element={<ProtectedRoute requiredRole="owner" />}>
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

        <Route element={<ProtectedRoute requiredRole="tenant" />}>
          <Route path="tenant" element={<TenantDashboardPage />} />
          <Route path="tenant/food" element={<TenantFoodPage />} />
          <Route path="tenant/chat" element={<TenantChatPage />} />
          <Route path="tenant/maintenance" element={<TenantMaintenancePage />} />
          <Route path="tenant/payments" element={<TenantPaymentsPage />} />
          <Route path="tenant/switch" element={<TenantSwitchPage />} />
          <Route path="tenant/profile" element={<TenantProfilePage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
