import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { Bell } from 'lucide-react'
import {
  fetchMyNotifications,
  selectUnreadCount,
} from '../../features/notifications/notificationSlice'
import { OWNER_INBOX } from '../../features/notifications/notificationService'

// Live unread-notification bell shared by the public navbar and both portals.
// `user` comes from the caller; `to` decides where the bell leads.
export default function NotificationBell({
  user,
  to,
  tone = 'dark',
  className = '',
}) {
  const dispatch = useDispatch()
  const unreadCount = useSelector(selectUnreadCount)

  useEffect(() => {
    if (!user) return
    const recipientId = user.role === 'owner' ? OWNER_INBOX : user.uid
    dispatch(fetchMyNotifications(recipientId))
  }, [dispatch, user])

  if (!user) return null

  const label =
    unreadCount > 0
      ? `Notifications, ${unreadCount} unread`
      : 'Notifications'

  return (
    <Link
      to={to}
      title="Notifications"
      aria-label={label}
      className={`relative flex h-9 w-9 items-center justify-center rounded-card transition-colors ${
        tone === 'light'
          ? 'text-ivory/75 hover:bg-white/10 hover:text-ivory'
          : 'text-charcoal/60 hover:bg-charcoal/5 hover:text-charcoal'
      } ${className}`}
    >
      <Bell size={18} strokeWidth={1.75} aria-hidden="true" />
      {unreadCount > 0 && (
        <span className="absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-terracotta px-[3px] text-[10px] leading-none font-bold text-white">
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </Link>
  )
}
