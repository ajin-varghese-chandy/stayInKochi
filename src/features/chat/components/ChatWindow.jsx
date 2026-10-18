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
      <div className="card flex h-96 items-center justify-center px-6 text-center text-sm text-charcoal/55">
        Choose a conversation to start chatting.
      </div>
    )
  }

  return (
    <div className="card flex h-full min-h-0 flex-col overflow-hidden">
      <div className="border-b border-line px-4 py-3">
        <h2 className="text-sm font-semibold text-charcoal">
          {conversation.title}
        </h2>
        <p className="mt-0.5 text-xs text-charcoal/55">
          {conversation.subtitle}
        </p>
      </div>

      <div className="max-h-[60vh] flex-1 space-y-3 overflow-y-auto p-4 lg:max-h-[65vh]">
        {isLoading && (
          <p className="text-sm text-charcoal/55">Loading messages...</p>
        )}

        {error && (
          <p className="text-sm text-danger">Could not load chat: {error}</p>
        )}

        {!isLoading && !error && messages.length === 0 && (
          <p className="py-8 text-center text-sm text-charcoal/55">
            No messages yet. Say hello!
          </p>
        )}

        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            isOwnMessage={message.senderUid === sender.uid}
          />
        ))}

        {saveError && <p className="text-sm text-danger">{saveError}</p>}

        <div ref={scrollAnchorRef} />
      </div>

      <MessageComposer isSaving={isSaving} onSend={handleSend} />
    </div>
  )
}
