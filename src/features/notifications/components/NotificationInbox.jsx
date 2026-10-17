import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
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
    <div>
      <div className="flex items-baseline justify-between">
        <h2 className="text-xl font-semibold text-slate-900">Notifications</h2>
        {unreadCount > 0 && (
          <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700">
            {unreadCount} new
          </span>
        )}
      </div>

      <div className="mt-3">
        <NotificationList
          notifications={notifications}
          isLoading={isLoading}
          error={error}
          isSaving={isSaving}
          onMarkRead={(item) => dispatch(markNotificationRead(item))}
        />
      </div>
    </div>
  )
}
