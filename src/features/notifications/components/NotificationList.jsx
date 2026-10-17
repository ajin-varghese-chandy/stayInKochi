// The signed-in user's inbox: newest first, unread highlighted.
export default function NotificationList({
  notifications,
  isLoading,
  error,
  isSaving,
  onMarkRead,
}) {
  if (isLoading) {
    return <p className="text-slate-500">Loading notifications...</p>
  }

  if (error) {
    return <p className="text-red-600">Could not load notifications: {error}</p>
  }

  if (notifications.length === 0) {
    return <p className="text-slate-500">No notifications yet.</p>
  }

  return (
    <ul className="space-y-2">
      {notifications.map((notification) => (
        <li
          key={notification.id}
          className={`flex flex-wrap items-start justify-between gap-3 rounded-lg border p-3 ${
            notification.read
              ? 'border-slate-200 bg-white'
              : 'border-indigo-200 bg-indigo-50'
          }`}
        >
          <div>
            <p
              className={
                notification.read ? 'text-slate-600' : 'text-slate-900'
              }
            >
              {notification.message}
            </p>
            <p className="mt-1 text-xs text-slate-400">
              {notification.createdAt?.slice(0, 16).replace('T', ' ')}
            </p>
          </div>

          {!notification.read && (
            <button
              type="button"
              onClick={() => onMarkRead(notification)}
              disabled={isSaving}
              className="text-sm font-medium text-indigo-600 hover:text-indigo-700 disabled:opacity-60"
            >
              Mark as read
            </button>
          )}
        </li>
      ))}
    </ul>
  )
}
