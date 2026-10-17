// One selectable conversation in the sidebar.
export default function ConversationListItem({ conversation, isActive, onSelect }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(conversation)}
      className={`w-full rounded-md px-3 py-2 text-left ${
        isActive
          ? 'bg-indigo-600 text-white'
          : 'text-slate-700 hover:bg-slate-100'
      }`}
    >
      <span className="block font-medium">{conversation.title}</span>
      <span
        className={`block text-xs ${isActive ? 'text-indigo-100' : 'text-slate-500'}`}
      >
        {conversation.subtitle}
      </span>
    </button>
  )
}
