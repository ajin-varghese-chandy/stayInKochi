import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import OwnerNav from '../../components/layout/OwnerNav'
import { selectCurrentUser } from '../../features/auth/authSlice'
import ChatWindow from '../../features/chat/components/ChatWindow'
import ConversationListItem from '../../features/chat/components/ConversationListItem'
import { fetchHostels, selectHostels } from '../../features/hostels/hostelSlice'
import { fetchTenants, selectTenants } from '../../features/tenants/tenantSlice'

// Owner screen: one group chat per hostel plus a private line to each tenant.
export default function OwnerChatPage() {
  const dispatch = useDispatch()
  const user = useSelector(selectCurrentUser)
  const hostels = useSelector(selectHostels)
  const tenants = useSelector(selectTenants)

  const [conversation, setConversation] = useState(null)

  useEffect(() => {
    dispatch(fetchHostels())
    dispatch(fetchTenants())
  }, [dispatch])

  // Sidebar sections, built once per data change.
  const groupChats = useMemo(
    () =>
      hostels.map((hostel) => ({
        key: `hostel-${hostel.id}`,
        type: 'hostel',
        id: hostel.id,
        title: hostel.name,
        subtitle: 'Hostel group chat',
      })),
    [hostels],
  )

  const privateChats = useMemo(
    () =>
      tenants.map((tenant) => ({
        key: `direct-${tenant.uid}`,
        type: 'direct',
        id: tenant.uid,
        title: tenant.name,
        subtitle: 'Private chat',
      })),
    [tenants],
  )

  // Fall back to the stored selection if its record still exists.
  const activeConversation =
    [...groupChats, ...privateChats].find(
      (item) => item.key === conversation?.key,
    ) ?? null

  return (
    <section className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="text-3xl font-bold text-slate-900">Chat</h1>
      <p className="mt-1 text-slate-600">
        Group chats with each hostel, and private chats with tenants.
      </p>

      <div className="mt-6">
        <OwnerNav />
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <div className="space-y-6">
          <ChatSection
            title="Hostel groups"
            conversations={groupChats}
            activeKey={activeConversation?.key}
            onSelect={setConversation}
          />
          <ChatSection
            title="Private chats"
            conversations={privateChats}
            activeKey={activeConversation?.key}
            onSelect={setConversation}
          />

          {groupChats.length === 0 && privateChats.length === 0 && (
            <p className="text-sm text-slate-500">Nothing to chat about yet.</p>
          )}
        </div>

        <div className="md:col-span-2">
          <ChatWindow conversation={activeConversation} sender={user} />
        </div>
      </div>
    </section>
  )
}

// One labelled group of conversations in the sidebar.
function ChatSection({ title, conversations, activeKey, onSelect }) {
  if (conversations.length === 0) return null

  return (
    <div>
      <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
        {title}
      </h2>
      <div className="space-y-1">
        {conversations.map((item) => (
          <ConversationListItem
            key={item.key}
            conversation={item}
            isActive={activeKey === item.key}
            onSelect={onSelect}
          />
        ))}
      </div>
    </div>
  )
}
