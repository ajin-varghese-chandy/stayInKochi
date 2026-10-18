import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Bell } from 'lucide-react'
import Alert from '../../../components/ui/Alert'
import {
  fetchMyNotifications,
  markNotificationRead,
  selectNotifications,
  selectNotificationsError,
  selectNotificationsLoading,
  selectNotificationsSaving,
  selectUnreadCount,
} from '../notificationSlice'
import NotificationList from './NotificationList'

// Loads one recipient's inbox and shows it with an unread badge.
export default function NotificationInbox({ recipientId }) {
  const dispatch = useDispatch()
  const notifications = useSelector(selectNotifications)
  const isLoading = useSelector(selectNotificationsLoading)
  const error = useSelector(selectNotificationsError)
  const isSaving = useSelector(selectNotificationsSaving)
  const unreadCount = useSelector(selectUnreadCount)

  useEffect(() => {
    dispatch(fetchMyNotifications(recipientId))
  }, [dispatch, recipientId])

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between gap-3 px-3">
        <div className="flex items-center gap-2">
          <Bell size={16} strokeWidth={1.75} aria-hidden="true" className="text-forest" />
          <h3 className="text-sm font-semibold text-charcoal">Notifications</h3>
        </div>

        {unreadCount > 0 && (
          <span className="badge badge-accent">{unreadCount} new</span>
        )}
      </div>

      <div className="mt-2">
        {error ? (
          <Alert tone="error">Could not load notifications: {error}</Alert>
        ) : (
          <NotificationList
            notifications={notifications}
            isLoading={isLoading}
            error={error}
            isSaving={isSaving}
            onMarkRead={(item) => dispatch(markNotificationRead(item))}
          />
        )}
      </div>
    </div>
  )
}
