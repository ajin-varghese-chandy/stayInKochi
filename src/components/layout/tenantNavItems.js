import {
  ArrowLeftRight,
  IndianRupee,
  LayoutDashboard,
  MessageSquare,
  User,
  UtensilsCrossed,
  Wrench,
} from 'lucide-react'

// Tenant portal navigation, ordered by frequency: overview first, account
// bits last. Shared by the desktop tab strip and the mobile bottom bar.
export const TENANT_NAV_ITEMS = [
  { to: '/tenant', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/tenant/payments', label: 'Rent', icon: IndianRupee },
  { to: '/tenant/food', label: 'Food', icon: UtensilsCrossed },
  { to: '/tenant/maintenance', label: 'Upkeep', icon: Wrench },
  { to: '/tenant/chat', label: 'Messages', icon: MessageSquare },
  { to: '/tenant/switch', label: 'Switch', icon: ArrowLeftRight },
  { to: '/tenant/profile', label: 'Profile', icon: User },
]
