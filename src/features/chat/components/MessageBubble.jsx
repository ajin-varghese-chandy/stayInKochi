import { formatTime } from '../chatTime'

// One chat message. Your own messages sit on the right, everyone else's on
// the left, with the time just under the bubble.
export default function MessageBubble({ message, isOwnMessage }) {
  const senderLabel =
    [message.senderName, message.senderRole].filter(Boolean).join(' · ') ||
    'Member'

  return (
    <div
      className={`flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'}`}
    >
      <div
        className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-sm shadow-sm ${
          isOwnMessage
            ? 'rounded-br-md bg-forest text-ivory'
            : 'rounded-bl-md border border-line bg-white text-charcoal'
        }`}
      >
        <p
          className={`text-[11px] font-semibold ${
            isOwnMessage ? 'text-ivory/75' : 'text-charcoal/55'
          }`}
        >
          {isOwnMessage ? 'You' : senderLabel}
        </p>
        <p className="mt-0.5 whitespace-pre-wrap break-words leading-relaxed">
          {message.text}
        </p>
      </div>

      <p className="mt-1 px-1 text-[11px] text-charcoal/45">
        {formatTime(message.createdAt)}
      </p>
    </div>
  )
}
