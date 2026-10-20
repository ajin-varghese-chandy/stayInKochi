// One chat message. Your own messages sit on the right, everyone else's on
// the left, with the timestamp just under the bubble.
export default function MessageBubble({ message, isOwnMessage }) {
  return (
    <div
      className={`flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'}`}
    >
      <div
        className={`max-w-[85%] rounded-card px-3.5 py-2 text-sm ${
          isOwnMessage
            ? 'bg-forest text-ivory'
            : 'border border-line bg-white text-charcoal'
        }`}
      >
        <p
          className={`text-[11px] font-semibold ${
            isOwnMessage ? 'text-ivory/75' : 'text-charcoal/55'
          }`}
        >
          {isOwnMessage ? 'You' : `${message.senderName} · ${message.senderRole}`}
        </p>
        <p className="mt-0.5 whitespace-pre-wrap break-words">{message.text}</p>
      </div>

      <p className="mt-1 text-[11px] text-charcoal/45">
        {message.createdAt?.slice(11, 16)}
      </p>
    </div>
  )
}
