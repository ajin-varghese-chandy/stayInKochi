import { useEffect, useId, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Bell, ChevronDown } from 'lucide-react'
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
// Pass `collapsible` to let the user fold the list away; `defaultOpen`
// controls whether it starts expanded.
export default function NotificationInbox({
  recipientId,
  collapsible = false,
  defaultOpen = true,
}) {
  const dispatch = useDispatch()
  const panelId = useId()
  const [isOpen, setIsOpen] = useState(defaultOpen)
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
        {collapsible ? (
          <button
            type="button"
            onClick={() => setIsOpen((open) => !open)}
            aria-expanded={isOpen}
            aria-controls={panelId}
            className="flex flex-1 items-center gap-2 text-left"
          >
            <Bell size={16} strokeWidth={1.75} aria-hidden="true" className="text-forest" />
            <span className="text-sm font-semibold text-charcoal">Notifications</span>
            <ChevronDown
              size={16}
              strokeWidth={1.75}
              aria-hidden="true"
              className={`ml-auto text-charcoal/50 transition-transform duration-200 ${
                isOpen ? '' : '-rotate-90'
              }`}
            />
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <Bell size={16} strokeWidth={1.75} aria-hidden="true" className="text-forest" />
            <h3 className="text-sm font-semibold text-charcoal">Notifications</h3>
          </div>
        )}

        {unreadCount > 0 && (
          <span className="badge badge-accent">{unreadCount} new</span>
        )}
      </div>

      <div id={panelId} className="mt-2" hidden={!isOpen}>
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
