import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { MessagesSquare } from 'lucide-react'
import EmptyState from '../../components/ui/EmptyState'
import PageHeader from '../../components/ui/PageHeader'
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
    <section>
      <PageHeader
        eyebrow="Owner console"
        title="Messages"
        description="Group chats with each branch, and private chats with tenants."
      />

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <div className="space-y-6">
          <ChatSection
            title="Branch groups"
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
            <EmptyState
              icon={MessagesSquare}
              title="Nothing to chat about yet"
              hint="Branch groups and tenant chats appear here once people move in."
            />
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
      <h2 className="eyebrow">{title}</h2>
      <div className="mt-2 space-y-1">
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
