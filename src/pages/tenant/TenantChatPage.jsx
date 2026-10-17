import { useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import Spinner from '../../components/common/Spinner'
import TenantNav from '../../components/layout/TenantNav'
import { selectCurrentUser } from '../../features/auth/authSlice'
import ChatWindow from '../../features/chat/components/ChatWindow'
import ConversationListItem from '../../features/chat/components/ConversationListItem'
import { getTenantsByUser } from '../../features/tenants/tenantService'

// Tenant screen: their hostel's group chat plus a private line to the owner.
export default function TenantChatPage() {
  const user = useSelector(selectCurrentUser)

  // The active tenancy tells us which hostel's group chat to join.
  const [tenancy, setTenancy] = useState(null)
  const [tenancyLoading, setTenancyLoading] = useState(true)
  const [conversation, setConversation] = useState(null)

  useEffect(() => {
    if (!user?.uid) return undefined

    let cancelled = false
    getTenantsByUser(user.uid)
      .then((tenants) => {
        if (cancelled) return
        setTenancy(tenants[0] ?? null)
        setTenancyLoading(false)
      })
      .catch(() => {
        if (cancelled) return
        setTenancy(null)
        setTenancyLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [user?.uid])

  // Two rooms: the hostel group chat (active tenancy only) and the owner.
  // Memoised so the selected conversation keeps a stable identity, otherwise
  // ChatWindow would resubscribe to Firebase on every render. Built before any
  // early return so hooks always run in the same order.
  const conversations = useMemo(() => {
    const rooms = []

    if (tenancy) {
      rooms.push({
        key: `hostel-${tenancy.hostelId}`,
        type: 'hostel',
        id: tenancy.hostelId,
        title: tenancy.hostelName,
        subtitle: 'Hostel group chat',
      })
    }

    if (user) {
      rooms.push({
        key: `direct-${user.uid}`,
        type: 'direct',
        id: user.uid,
        title: 'Owner',
        subtitle: 'Private chat with the owner',
      })
    }

    return rooms
  }, [tenancy, user])

  if (tenancyLoading) {
    return <Spinner label="Loading your chats..." />
  }

  const activeConversation =
    conversations.find((item) => item.key === conversation?.key) ?? null

  return (
    <section className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="text-3xl font-bold text-slate-900">Chat</h1>
      <p className="mt-1 text-slate-600">
        Your hostel's group chat and a private line to the owner.
      </p>

      <div className="mt-6">
        <TenantNav />
      </div>

      {!tenancy && (
        <p className="mt-6 rounded-md border border-slate-200 bg-slate-50 p-4 text-slate-600">
          Join a hostel to use the group chat. You can still message the owner.
        </p>
      )}

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <div className="space-y-1">
          {conversations.map((item) => (
            <ConversationListItem
              key={item.key}
              conversation={item}
              isActive={activeConversation?.key === item.key}
              onSelect={setConversation}
            />
          ))}
        </div>

        <div className="md:col-span-2">
          <ChatWindow conversation={activeConversation} sender={user} />
        </div>
      </div>
    </section>
  )
}
