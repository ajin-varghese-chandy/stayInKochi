// One chat message. Your own messages sit on the right in indigo.
export default function MessageBubble({ message, isOwnMessage }) {
  return (
    <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[75%] rounded-lg px-3 py-2 ${
          isOwnMessage ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-800'
        }`}
      >
        <p className={`text-xs font-semibold ${isOwnMessage ? 'text-indigo-100' : 'text-slate-500'}`}>
          {isOwnMessage ? 'You' : `${message.senderName} · ${message.senderRole}`}
        </p>
        <p className="whitespace-pre-wrap break-words">{message.text}</p>
        <p
          className={`mt-1 text-right text-[10px] ${isOwnMessage ? 'text-indigo-200' : 'text-slate-400'}`}
        >
          {message.createdAt?.slice(11, 16)}
        </p>
      </div>
    </div>
  )
}
