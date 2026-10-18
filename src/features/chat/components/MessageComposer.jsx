import { useState } from 'react'
import { Send } from 'lucide-react'
import Button from '../../../components/ui/Button'

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
      className="flex items-end gap-2 border-t border-line p-3"
    >
      <textarea
        value={text}
        onChange={(event) => setText(event.target.value)}
        onKeyDown={handleKeyDown}
        rows={2}
        placeholder="Type a message..."
        className="field min-w-0 flex-1 resize-none"
      />
      <Button type="submit" size="sm" disabled={isSaving || !text.trim()}>
        <Send size={16} strokeWidth={1.75} aria-hidden="true" />
        {isSaving ? 'Sending...' : 'Send'}
      </Button>
    </form>
  )
}
