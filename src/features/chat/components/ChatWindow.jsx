import { useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { conversationOpened, sendChatMessage, selectChatError, selectChatLoading, selectChatMessages, selectChatSaving, selectChatSaveError, messagesLoadFailed, messagesReceived } from '../chatSlice'
import { subscribeToConversation } from '../chatService'
import MessageBubble from './MessageBubble'
import MessageComposer from './MessageComposer'

// The open chat room: listens to Firebase for the current conversation and
// renders its messages plus the send box.
export default function ChatWindow({ conversation, sender }) {
  const dispatch = useDispatch()
  const messages = useSelector(selectChatMessages)
  const isLoading = useSelector(selectChatLoading)
  const error = useSelector(selectChatError)
  const isSaving = useSelector(selectChatSaving)
  const saveError = useSelector(selectChatSaveError)

  const scrollAnchorRef = useRef(null)

  // Re-join the room whenever a different conversation is opened, and detach
  // the old listener when the component unmounts.
  useEffect(() => {
    if (!conversation) return undefined

    dispatch(conversationOpened())
    const unsubscribe = subscribeToConversation(
      conversation,
      (incoming) => dispatch(messagesReceived(incoming)),
      (readError) => dispatch(messagesLoadFailed(readError.message)),
    )

    return unsubscribe
  }, [conversation, dispatch])

  // Keep the newest message in view as messages arrive.
  useEffect(() => {
    scrollAnchorRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  function handleSend(text) {
    dispatch(sendChatMessage({ conversation, sender, text }))
  }

  if (!conversation) {
    return (
      <div className="flex h-96 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500">
        Choose a conversation to start chatting.
      </div>
    )
  }

  return (
    <div className="flex h-[60vh] flex-col rounded-lg border border-slate-200 bg-white">
      <div className="border-b border-slate-200 px-4 py-3">
        <h2 className="font-semibold text-slate-900">{conversation.title}</h2>
        <p className="text-sm text-slate-500">{conversation.subtitle}</p>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {isLoading && <p className="text-slate-500">Loading messages...</p>}

        {error && <p className="text-red-600">Could not load chat: {error}</p>}

        {!isLoading && !error && messages.length === 0 && (
          <p className="text-slate-500">No messages yet. Say hello!</p>
        )}

        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            isOwnMessage={message.senderUid === sender.uid}
          />
        ))}

        {saveError && <p className="text-red-600">{saveError}</p>}

        <div ref={scrollAnchorRef} />
      </div>

      <MessageComposer isSaving={isSaving} onSend={handleSend} />
    </div>
  )
}
