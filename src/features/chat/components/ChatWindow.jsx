import { Fragment, useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Building2, ChevronLeft, MessagesSquare } from 'lucide-react'
import Spinner from '../../../components/common/Spinner'
import {
  conversationOpened,
  messagesLoadFailed,
  messagesReceived,
  selectChatError,
  selectChatLoading,
  selectChatMessages,
  selectChatSaveError,
  selectChatSaving,
  sendChatMessage,
} from '../chatSlice'
import { subscribeToConversation } from '../chatService'
import { dayKey, dayLabel } from '../chatTime'
import MessageBubble from './MessageBubble'
import MessageComposer from './MessageComposer'

// The open chat room: listens to Firebase for the current conversation and
// renders its messages plus the send box. `plain` drops the outer card so the
// window can sit inside another bordered layout (owner messages screen).
export default function ChatWindow({
  conversation,
  sender,
  onBack,
  plain = false,
}) {
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
    if (!conversation || !sender) return
    dispatch(sendChatMessage({ conversation, sender, text }))
  }

  if (!conversation) {
    return (
      <div
        className={`${
          plain ? 'h-full' : 'card h-96'
        } flex flex-col items-center justify-center gap-3 px-6 text-center`}
      >
        <span className="flex size-12 items-center justify-center rounded-full bg-sage text-forest">
          <MessagesSquare size={21} strokeWidth={1.6} aria-hidden="true" />
        </span>
        <p className="text-sm font-semibold text-charcoal">
          Pick a conversation
        </p>
        <p className="max-w-xs text-sm leading-relaxed text-charcoal/55">
          Choose a branch group or a tenant on the list to start chatting.
        </p>
      </div>
    )
  }

  const isGroup = conversation.type === 'hostel'
  const who = isGroup ? 'the branch' : conversation.title
  const title = conversation.title

  return (
    <div
      className={`${
        plain ? '' : 'card '
      }flex h-full min-h-0 flex-col overflow-hidden bg-white`}
    >
      {/* Room header */}
      <header className="flex items-center gap-3 border-b border-line px-3 py-2.5 sm:px-4 sm:py-3">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            aria-label="Back to conversations"
            className="-ml-1 flex size-9 shrink-0 items-center justify-center rounded-card text-charcoal/60 transition-colors hover:bg-ivory hover:text-charcoal md:hidden"
          >
            <ChevronLeft size={20} strokeWidth={1.9} aria-hidden="true" />
          </button>
        )}

        <span
          className="flex size-9 shrink-0 items-center justify-center rounded-full bg-sage text-xs font-semibold text-forest"
          aria-hidden="true"
        >
          {isGroup ? (
            <Building2 size={17} strokeWidth={1.75} />
          ) : (
            initials(title)
          )}
        </span>

        <div className="min-w-0 flex-1">
          <h2 className="truncate text-sm font-semibold text-charcoal">
            {title}
          </h2>
          <p className="mt-0.5 truncate text-xs text-charcoal/55">
            {conversation.subtitle ??
              (isGroup ? 'Everyone at this branch' : 'Private conversation')}
          </p>
        </div>

        <span className="hidden rounded-full border border-line px-2.5 py-0.5 text-[11px] font-medium text-charcoal/55 sm:inline">
          {isGroup ? 'Group' : 'Private'}
        </span>
      </header>

      {/* Messages */}
      <div
        className={`min-h-0 flex-1 overflow-y-auto bg-ivory/45 px-3 py-4 sm:px-4 ${
          plain ? '' : 'max-h-[60vh] lg:max-h-[65vh]'
        }`}
      >
        {isLoading && (
          <div className="flex h-full items-center justify-center">
            <Spinner compact label="Loading messages…" />
          </div>
        )}

        {error && (
          <p className="mx-auto max-w-sm rounded-card border border-danger/25 bg-danger-soft px-3 py-2 text-center text-sm text-danger">
            Could not load chat: {error}
          </p>
        )}

        {!isLoading && !error && messages.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center gap-2 px-4 text-center">
            <span className="flex size-11 items-center justify-center rounded-full bg-sage text-forest">
              <MessagesSquare size={19} strokeWidth={1.6} aria-hidden="true" />
            </span>
            <p className="text-sm font-semibold text-charcoal">
              No messages yet
            </p>
            <p className="max-w-xs text-sm leading-relaxed text-charcoal/55">
              Say hello to {who}. Messages appear here instantly.
            </p>
          </div>
        )}

        {!isLoading && !error && messages.length > 0 && (
          <div className="space-y-3">
            {messages.map((message, index) => {
              const day = dayKey(message.createdAt)
              const previousDay = dayKey(messages[index - 1]?.createdAt)

              return (
                <Fragment key={message.id}>
                  {day && day !== previousDay && <DayDivider day={day} />}
                  <MessageBubble
                    message={message}
                    isOwnMessage={message.senderUid === sender?.uid}
                  />
                </Fragment>
              )
            })}
          </div>
        )}

        {saveError && (
          <p className="mt-3 text-center text-sm text-danger">{saveError}</p>
        )}

        <div ref={scrollAnchorRef} />
      </div>

      <MessageComposer
        isSaving={isSaving}
        onSend={handleSend}
        placeholder={`Message ${isGroup ? 'the branch' : title}…`}
      />
    </div>
  )
}

function DayDivider({ day }) {
  return (
    <div className="flex items-center gap-3 py-1">
      <span className="h-px flex-1 bg-line" aria-hidden="true" />
      <span className="text-[11px] font-medium text-charcoal/45">
        {dayLabel(day)}
      </span>
      <span className="h-px flex-1 bg-line" aria-hidden="true" />
    </div>
  )
}

function initials(name) {
  return (
    String(name ?? '')
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part.charAt(0))
      .join('')
      .toUpperCase() || '?'
  )
}
