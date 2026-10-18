// One selectable conversation in the sidebar.
export default function ConversationListItem({
  conversation,
  isActive,
  onSelect,
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(conversation)}
      className={`flex w-full items-center gap-3 rounded-card border px-4 py-3 text-left transition-colors ${
        isActive
          ? "border-line bg-sage/60"
          : "border-line bg-white hover:bg-ivory"
      }`}
    >
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium text-charcoal">
          {conversation.title}
        </span>
        <span
          className={`mt-0.5 block truncate text-xs ${
            isActive ? "text-charcoal/70" : "text-charcoal/55"
          }`}
        >
          {conversation.subtitle}
        </span>
      </span>

      {conversation.unread && (
        <span
          className="ml-auto size-2 shrink-0 rounded-full bg-terracotta"
          aria-label="Unread messages"
          role="status"
        />
      )}
    </button>
  );
}
