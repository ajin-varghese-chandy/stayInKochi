import { useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import { MessageCircle, Users } from 'lucide-react'
import Alert from '../../components/ui/Alert'
import Button from '../../components/ui/Button'
import PageHeader from '../../components/ui/PageHeader'
import Spinner from '../../components/common/Spinner'
import { selectCurrentUser } from '../../features/auth/authSlice'
import ChatWindow from '../../features/chat/components/ChatWindow'
import ConversationListItem from '../../features/chat/components/ConversationListItem'
import { getTenantsByUser } from '../../features/tenants/tenantService'

const ROOM_COPY = {
  hostel: 'Talk with the other tenants at your branch.',
  direct: 'Message the owner directly about your stay or rent.',
}

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
    return (
      <section>
        <PageHeader
          eyebrow="Tenant portal"
          title="Messages"
          description="Your branch's group chat and a private line to the owner."
        />
        <div className="mt-6">
          <Spinner compact label="Loading your chats…" />
        </div>
      </section>
    )
  }

  const activeConversation =
    conversations.find((item) => item.key === conversation?.key) ?? null

  return (
    <section>
      <PageHeader
        eyebrow="Tenant portal"
        title="Messages"
        description="Your branch's group chat and a private line to the owner."
      />

      <div className="mt-6 space-y-5">
        {!tenancy && (
          <Alert tone="info">
            Join a branch to use the group chat. You can still message the
            owner.
          </Alert>
        )}

        <div className="grid gap-5 lg:grid-cols-2">
          {conversations.map((item) => {
            const isActive = activeConversation?.key === item.key
            const Icon = item.type === 'hostel' ? Users : MessageCircle

            return (
              <section key={item.key} className="card flex flex-col">
                <header className="flex items-center gap-3 border-b border-line p-4">
                  <span
                    className="flex size-9 shrink-0 items-center justify-center rounded-card bg-sage text-forest"
                    aria-hidden="true"
                  >
                    <Icon size={18} strokeWidth={1.75} aria-hidden="true" />
                  </span>

                  <div className="min-w-0 flex-1">
                    <ConversationListItem
                      conversation={item}
                      isActive={isActive}
                      onSelect={setConversation}
                    />
                  </div>
                </header>

                <div className="flex-1">
                  {isActive ? (
                    <ChatWindow conversation={item} sender={user} />
                  ) : (
                    <div className="flex flex-col items-start gap-3 p-4">
                      <p className="text-sm leading-relaxed text-charcoal/70">
                        {ROOM_COPY[item.type]}
                      </p>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => setConversation(item)}
                      >
                        Open chat
                      </Button>
                    </div>
                  )}
                </div>
              </section>
            )
          })}
        </div>
      </div>
    </section>
  )
}
