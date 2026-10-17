import { useState } from 'react'

// Text box + send button for a chat room.
export default function MessageComposer({ isSaving, onSend }) {
  const [text, setText] = useState('')

  function handleSubmit(event) {
    event.preventDefault()
    const trimmed = text.trim()
    if (!trimmed || isSaving) return

    onSend(trimmed)
    // Cleared right away; the live subscription shows the message once stored.
    setText('')
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex gap-2 border-t border-slate-200 p-3"
    >
      <input
        type="text"
        value={text}
        onChange={(event) => setText(event.target.value)}
        placeholder="Type a message..."
        className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-slate-800 focus:border-indigo-500 focus:outline-none"
      />
      <button
        type="submit"
        disabled={isSaving || !text.trim()}
        className="rounded-md bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
      >
        {isSaving ? 'Sending...' : 'Send'}
      </button>
    </form>
  )
}
