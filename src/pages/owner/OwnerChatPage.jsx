import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  Building2,
  ChevronRight,
  MessagesSquare,
  SearchX,
} from 'lucide-react'
import Alert from '../../components/ui/Alert'
import PageHeader from '../../components/ui/PageHeader'
import SearchInput from '../../components/ui/SearchInput'
import Spinner from '../../components/common/Spinner'
import { selectCurrentUser } from '../../features/auth/authSlice'
import ChatWindow from '../../features/chat/components/ChatWindow'
import {
  fetchHostels,
  selectHostels,
  selectHostelsError,
  selectHostelsLoading,
} from '../../features/hostels/hostelSlice'
import {
  fetchTenants,
  selectTenants,
  selectTenantsError,
  selectTenantsLoading,
} from '../../features/tenants/tenantSlice'

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'hostel', label: 'Branches' },
  { key: 'direct', label: 'Tenants' },
]

// Owner messages: one searchable list of branch groups and tenant chats on the
// left, the open conversation on the right. On phones the list becomes a full
// screen and the chat replaces it once a conversation is picked.
export default function OwnerChatPage() {
  const dispatch = useDispatch()
  const user = useSelector(selectCurrentUser)

  const hostels = useSelector(selectHostels)
  const tenants = useSelector(selectTenants)
  const hostelsLoading = useSelector(selectHostelsLoading)
  const tenantsLoading = useSelector(selectTenantsLoading)
  const hostelsError = useSelector(selectHostelsError)
  const tenantsError = useSelector(selectTenantsError)

  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('all')
  const [conversation, setConversation] = useState(null)

  const isLoading = hostelsLoading || tenantsLoading
  const loadError = hostelsError || tenantsError

  useEffect(() => {
    dispatch(fetchHostels())
    dispatch(fetchTenants())
  }, [dispatch])

  const branchChats = useMemo(
    () =>
      hostels
        .map((hostel) => ({
          key: `hostel-${hostel.id}`,
          type: 'hostel',
          id: hostel.id,
          title: hostel.name,
          subtitle: hostel.location
            ? `Group chat · ${hostel.location}`
            : 'Group chat',
        }))
        .sort((a, b) => a.title.localeCompare(b.title)),
    [hostels],
  )

  // One private room per user, even if they have more than one record.
  const tenantChats = useMemo(() => {
    const byUser = new Map()

    tenants.forEach((tenant) => {
      if (!tenant.uid || byUser.has(tenant.uid)) return
      byUser.set(tenant.uid, {
        key: `direct-${tenant.uid}`,
        type: 'direct',
        id: tenant.uid,
        title: tenant.name || 'Tenant',
        subtitle: tenant.hostelName
          ? `Private chat · ${tenant.hostelName}`
          : 'Private chat',
      })
    })

    return [...byUser.values()].sort((a, b) => a.title.localeCompare(b.title))
  }, [tenants])

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    const matches = (item) =>
      (filter === 'all' || item.type === filter) &&
      (!q || `${item.title} ${item.subtitle}`.toLowerCase().includes(q))

    return {
      branches: branchChats.filter(matches),
      tenants: tenantChats.filter(matches),
    }
  }, [branchChats, tenantChats, filter, query])

  const total = branchChats.length + tenantChats.length
  const shown = visible.branches.length + visible.tenants.length
  const hasResults = shown > 0
  const isFiltering = query.trim() !== '' || filter !== 'all'

  const activeConversation =
    [...branchChats, ...tenantChats].find(
      (item) => item.key === conversation?.key,
    ) ?? null

  return (
    <section>
      <PageHeader
        eyebrow="Owner console"
        title="Messages"
        description="Branch group chats and private tenant chats, all in one place."
      />

      <div className="mt-5 grid h-[calc(100dvh-15rem)] min-h-[460px] overflow-hidden rounded-2xl border border-line bg-white shadow-sm md:h-[calc(100vh-15rem)] md:min-h-[540px] md:grid-cols-[320px_minmax(0,1fr)] lg:grid-cols-[360px_minmax(0,1fr)]">
        {/* Conversation list */}
        <aside
          className={`${
            activeConversation ? 'hidden md:flex' : 'flex'
          } min-h-0 flex-col border-line md:border-r`}
        >
          <div className="space-y-2.5 border-b border-line p-3">
            <SearchInput
              value={query}
              onChange={setQuery}
              placeholder="Search branches or tenants…"
            />

            <div
              role="group"
              aria-label="Filter conversations"
              className="grid grid-cols-3 gap-1 rounded-card bg-ivory p-1"
            >
              {FILTERS.map((option) => (
                <button
                  key={option.key}
                  type="button"
                  aria-pressed={filter === option.key}
                  onClick={() => setFilter(option.key)}
                  className={`rounded-[3px] px-2 py-1.5 text-xs font-medium transition-colors ${
                    filter === option.key
                      ? 'bg-white text-forest shadow-sm'
                      : 'text-charcoal/60 hover:text-charcoal'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto p-2">
            {loadError && (
              <Alert tone="error" className="m-1">
                Could not load chats: {loadError}
              </Alert>
            )}

            {isLoading && !hasResults && (
              <div className="p-4">
                <Spinner compact label="Loading conversations…" />
              </div>
            )}

            {!isLoading && !loadError && !hasResults && (
              <div className="flex flex-col items-center px-4 py-12 text-center">
                <span className="flex size-10 items-center justify-center rounded-full bg-ivory text-charcoal/40">
                  {isFiltering ? (
                    <SearchX size={18} strokeWidth={1.75} aria-hidden="true" />
                  ) : (
                    <MessagesSquare
                      size={18}
                      strokeWidth={1.75}
                      aria-hidden="true"
                    />
                  )}
                </span>
                <p className="mt-3 text-sm font-medium text-charcoal">
                  {isFiltering ? 'No conversations found' : 'No conversations yet'}
                </p>
                <p className="mt-1 text-xs leading-relaxed text-charcoal/55">
                  {isFiltering
                    ? 'Try a different name or clear the filter.'
                    : 'Branch groups and tenant chats appear here automatically.'}
                </p>
                {isFiltering && (
                  <button
                    type="button"
                    onClick={() => {
                      setQuery('')
                      setFilter('all')
                    }}
                    className="mt-3 text-xs font-medium text-forest hover:underline"
                  >
                    Clear search
                  </button>
                )}
              </div>
            )}

            {visible.branches.length > 0 && (
              <ChatGroup
                title="Branches"
                items={visible.branches}
                activeKey={activeConversation?.key}
                onSelect={setConversation}
              />
            )}

            {visible.tenants.length > 0 && (
              <ChatGroup
                title="Tenants"
                items={visible.tenants}
                activeKey={activeConversation?.key}
                onSelect={setConversation}
              />
            )}
          </div>

          <p className="border-t border-line px-3 py-2 text-xs text-charcoal/50">
            {isFiltering
              ? `${shown} of ${total} conversations`
              : `${total} conversation${total === 1 ? '' : 's'}`}
          </p>
        </aside>

        {/* Open conversation */}
        <div
          className={`${
            activeConversation ? 'flex' : 'hidden md:flex'
          } min-h-0 flex-col`}
        >
          <ChatWindow
            conversation={activeConversation}
            sender={user}
            plain
            onBack={() => setConversation(null)}
          />
        </div>
      </div>
    </section>
  )
}

// A labelled block of conversations in the sidebar.
function ChatGroup({ title, items, activeKey, onSelect }) {
  return (
    <div className="mb-3 last:mb-0">
      <p className="px-2 pt-1 pb-1.5 text-[11px] font-semibold tracking-wider text-charcoal/45 uppercase">
        {title}
      </p>
      <div className="space-y-0.5">
        {items.map((item) => (
          <ChatRow
            key={item.key}
            item={item}
            isActive={activeKey === item.key}
            onSelect={onSelect}
          />
        ))}
      </div>
    </div>
  )
}

function ChatRow({ item, isActive, onSelect }) {
  const isBranch = item.type === 'hostel'

  return (
    <button
      type="button"
      onClick={() => onSelect(item)}
      aria-current={isActive ? 'true' : undefined}
      className={`group flex w-full items-center gap-3 rounded-card px-2.5 py-2 text-left transition-colors ${
        isActive
          ? 'bg-forest text-ivory'
          : 'text-charcoal hover:bg-ivory'
      }`}
    >
      <span
        className={`flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
          isActive ? 'bg-white/15 text-ivory' : 'bg-sage text-forest'
        }`}
        aria-hidden="true"
      >
        {isBranch ? (
          <Building2 size={17} strokeWidth={1.75} />
        ) : (
          initials(item.title)
        )}
      </span>

      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium">{item.title}</span>
        <span
          className={`mt-0.5 block truncate text-xs ${
            isActive ? 'text-ivory/70' : 'text-charcoal/55'
          }`}
        >
          {item.subtitle}
        </span>
      </span>

      <ChevronRight
        size={15}
        strokeWidth={1.75}
        aria-hidden="true"
        className={`shrink-0 transition-opacity ${
          isActive
            ? 'text-ivory/60 opacity-100'
            : 'text-charcoal/30 opacity-0 group-hover:opacity-100'
        }`}
      />
    </button>
  )
}

// "Ajin Varghese" -> "AV", "Ajin" -> "A".
function initials(name) {
  return (
    String(name)
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part.charAt(0))
      .join('')
      .toUpperCase() || '?'
  )
}
