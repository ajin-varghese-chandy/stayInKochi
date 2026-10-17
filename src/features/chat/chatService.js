import { onValue, push, ref } from 'firebase/database'
import { database } from '../../services/firebase'

// Chat lives in the Firebase realtime database so messages appear instantly.
// There is one room per hostel (group chat) and one private room per tenant,
// which is always the direct line between the single owner and that tenant.
function conversationPath(conversation) {
  return conversation.type === 'hostel'
    ? `chats/hostel/${conversation.id}`
    : `chats/direct/${conversation.id}`
}

// Watch a conversation and call `onUpdate` with its messages (oldest first)
// whenever anything changes. Returns an unsubscribe function for useEffect.
export function subscribeToConversation(conversation, onUpdate, onError) {
  return onValue(
    ref(database, conversationPath(conversation)),
    (snapshot) => {
      const value = snapshot.val() ?? {}
      const messages = Object.entries(value).map(([id, message]) => ({
        id,
        ...message,
      }))
      // createdAt is an ISO string, so a plain sort orders oldest first.
      // String() guards against a message missing the field.
      messages.sort((a, b) =>
        String(a.createdAt ?? '').localeCompare(String(b.createdAt ?? '')),
      )
      onUpdate(messages)
    },
    onError,
  )
}

// Add one message. The live subscription above delivers it back to everyone
// in the room, so the caller does not need the stored record.
export function sendMessage(conversation, message) {
  return push(ref(database, conversationPath(conversation)), message)
}
