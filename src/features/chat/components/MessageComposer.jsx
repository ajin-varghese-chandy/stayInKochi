import { useState } from 'react'
import { Send } from 'lucide-react'
import Button from '../../../components/ui/Button'

// Text box + send button for a chat room.
export default function MessageComposer({
  isSaving,
  onSend,
  placeholder = 'Type a message...',
}) {
  const [text, setText] = useState('')

  function handleSubmit(event) {
    event.preventDefault()
    const trimmed = text.trim()
    if (!trimmed || isSaving) return

    onSend(trimmed)
    // Cleared right away; the live subscription shows the message once stored.
    setText('')
  }

  // Enter still sends (exactly like the old single-line box); Shift+Enter
  // starts a new line inside the textarea.
  function handleKeyDown(event) {
    if (event.key !== 'Enter' || event.shiftKey) return
    event.preventDefault()
    handleSubmit(event)
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-end gap-2 border-t border-line bg-white p-3"
    >
      <textarea
        value={text}
        onChange={(event) => setText(event.target.value)}
        onKeyDown={handleKeyDown}
        rows={1}
        placeholder={placeholder}
        aria-label="Message"
        className="field max-h-32 min-h-11 min-w-0 flex-1 resize-none py-2.5"
      />
      <Button
        type="submit"
        size="sm"
        disabled={isSaving || !text.trim()}
        aria-label={isSaving ? 'Sending message' : 'Send message'}
      >
        <Send size={15} strokeWidth={1.8} aria-hidden="true" />
        <span className="hidden sm:inline">
          {isSaving ? 'Sending…' : 'Send'}
        </span>
      </Button>
    </form>
  )
}
