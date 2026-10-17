import { apiRequest } from '../../services/api'

// There is exactly one owner and they never register through the app, so all
// owner-facing notifications are stored under this fixed recipient id.
export const OWNER_INBOX = 'owner'

// Notifications addressed to one recipient (a tenant uid or OWNER_INBOX).
export function getNotificationsByUser(recipientId) {
  return apiRequest(`/notifications?uid=${recipientId}`).then((items) =>
    // Newest first; json-server has no portable sort across versions.
    [...items].sort((a, b) =>
      String(b.createdAt ?? '').localeCompare(String(a.createdAt ?? '')),
    ),
  )
}

export function createNotification(notification) {
  return apiRequest('/notifications', {
    method: 'POST',
    body: JSON.stringify(notification),
  })
}

// Used by the "mark as read" button.
export function updateNotification(notificationId, updates) {
  return apiRequest(`/notifications/${notificationId}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  })
}

// Best-effort notification: approvals, payments and requests must not fail
// just because a notification could not be saved.
export async function notify(recipientId, message) {
  try {
    await createNotification({
      uid: recipientId,
      message,
      read: false,
      createdAt: new Date().toISOString(),
    })
  } catch {
    // A missing notification is never worth breaking the main action for.
  }
}

// Owner: broadcast an announcement to every tenant in the provided list.
// Returns { sent, failed } counts.
export async function broadcastAnnouncement(tenantUids, message) {
  const results = await Promise.allSettled(
    tenantUids.map((uid) =>
      createNotification({
        uid,
        message,
        read: false,
        createdAt: new Date().toISOString(),
      }),
    ),
  )
  const sent = results.filter((r) => r.status === 'fulfilled').length
  const failed = results.filter((r) => r.status === 'rejected').length
  return { sent, failed }
}
