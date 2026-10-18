import Alert from '../../../components/ui/Alert'
import Button from '../../../components/ui/Button'
import Spinner from '../../../components/common/Spinner'

// The signed-in user's inbox: newest first, unread highlighted.
export default function NotificationList({
  notifications,
  isLoading,
  error,
  isSaving,
  onMarkRead,
}) {
  if (isLoading) {
    return <Spinner compact label="Loading notifications…" />
  }

  if (error) {
    return <Alert tone="error">Could not load notifications: {error}</Alert>
  }

  if (notifications.length === 0) {
    return <p className="px-3 py-4 text-sm text-charcoal/55">No notifications yet.</p>
  }

  return (
    <ul className="divide-y divide-line">
      {notifications.map((notification) => (
        <li
          key={notification.id}
          className={`flex flex-wrap items-start justify-between gap-3 px-3 py-3 ${
            notification.read ? '' : 'bg-sage/40'
          }`}
        >
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <div className="flex items-start gap-2">
              {!notification.read && (
                <span
                  className="mt-1.5 size-1.5 shrink-0 rounded-full bg-forest"
                  aria-hidden="true"
                />
              )}
              <p
                className={`text-sm leading-relaxed ${
                  notification.read ? 'text-charcoal/70' : 'font-medium text-charcoal'
                }`}
              >
                {notification.message}
              </p>
            </div>
            <p className="text-xs text-charcoal/55">
              {notification.createdAt?.slice(0, 16).replace('T', ' ')}
            </p>
          </div>

          {!notification.read && (
            <Button
              size="sm"
              variant="ghost"
              className="ml-auto shrink-0"
              onClick={() => onMarkRead(notification)}
              disabled={isSaving}
            >
              Mark read
            </Button>
          )}
        </li>
      ))}
    </ul>
  )
}
