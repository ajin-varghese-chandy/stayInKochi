import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { FileText } from 'lucide-react'
import Alert from '../../components/ui/Alert'
import Button from '../../components/ui/Button'
import EmptyState from '../../components/ui/EmptyState'
import PageHeader from '../../components/ui/PageHeader'
import Spinner from '../../components/common/Spinner'
import { selectCurrentUser } from '../../features/auth/authSlice'
import FinancialSummary from '../../features/finance/components/FinancialSummary'
import NotificationInbox from '../../features/notifications/components/NotificationInbox'
import { OWNER_INBOX, broadcastAnnouncement } from '../../features/notifications/notificationService'
import StayRequestCard from '../../features/stayRequests/components/StayRequestCard'
import {
  approveStayRequest,
  fetchAllStayRequests,
  rejectStayRequest,
  selectDecidingRequestId,
  selectSaveError,
  selectStayRequests,
  selectStayRequestsError,
  selectStayRequestsLoading,
} from '../../features/stayRequests/stayRequestSlice'
import { getAllTenants } from '../../features/tenants/tenantService'

// Owner overview: review incoming stay requests, financials, and send announcements.
export default function OwnerDashboardPage() {
  const dispatch = useDispatch()
  const user = useSelector(selectCurrentUser)
  const requests = useSelector(selectStayRequests)
  const isLoading = useSelector(selectStayRequestsLoading)
  const error = useSelector(selectStayRequestsError)
  const saveError = useSelector(selectSaveError)
  const decidingRequestId = useSelector(selectDecidingRequestId)

  // Broadcast announcement state
  const [announcement, setAnnouncement] = useState('')
  const [broadcastTarget, setBroadcastTarget] = useState('all') // 'all' | hostelId
  const [broadcasting, setBroadcasting] = useState(false)
  const [broadcastResult, setBroadcastResult] = useState(null)
  const [hostels, setHostels] = useState([])

  useEffect(() => {
    dispatch(fetchAllStayRequests())
    // Fetch tenants once to populate hostel options for broadcast
    getAllTenants().then((tenants) => {
      const seen = new Set()
      const hs = []
      tenants.forEach((t) => {
        if (t.hostelId && !seen.has(t.hostelId)) {
          seen.add(t.hostelId)
          hs.push({ id: t.hostelId, name: t.hostelName })
        }
      })
      setHostels(hs)
    })
  }, [dispatch])

  async function handleBroadcast(e) {
    e.preventDefault()
    if (!announcement.trim()) return
    setBroadcasting(true)
    setBroadcastResult(null)
    try {
      const allTenants = await getAllTenants()
      const targets =
        broadcastTarget === 'all'
          ? allTenants
          : allTenants.filter((t) => String(t.hostelId) === broadcastTarget)
      const uids = targets.map((t) => t.uid).filter(Boolean)
      if (uids.length === 0) {
        setBroadcastResult({ type: 'warn', msg: 'No tenants found for that branch.' })
      } else {
        const { sent } = await broadcastAnnouncement(uids, announcement.trim())
        setBroadcastResult({ type: 'ok', msg: `Sent to ${sent} tenant(s).` })
        setAnnouncement('')
      }
    } catch (err) {
      setBroadcastResult({ type: 'err', msg: err.message })
    } finally {
      setBroadcasting(false)
    }
  }

  const pendingCount = requests.filter((r) => r.status === 'pending').length

  const sortedRequests = [...requests].sort((a, b) => {
    if (a.status === 'pending' && b.status !== 'pending') return -1
    if (a.status !== 'pending' && b.status === 'pending') return 1
    return 0
  })

  return (
    <section>
      <PageHeader
        eyebrow="Owner console"
        title="Dashboard"
        description={`Welcome back, ${user?.displayName ?? 'owner'}.`}
      />

      <div className="mt-6 space-y-6">
        {/* Financials */}
        <section aria-labelledby="financials-heading">
          <h2 id="financials-heading" className="text-base font-semibold text-charcoal">
            Financial summary
          </h2>
          <div className="mt-3">
            <FinancialSummary />
          </div>
        </section>

        <NotificationInbox recipientId={OWNER_INBOX} />

        {/* Broadcast announcement */}
        <section aria-labelledby="announcement-heading">
          <h2 id="announcement-heading" className="text-base font-semibold text-charcoal">
            Send announcement
          </h2>
          <p className="mt-1 text-sm text-charcoal/60">
            Push a notification to all tenants or a specific branch.
          </p>

          <form onSubmit={handleBroadcast} className="card mt-3 space-y-3 p-4">
            <select
              value={broadcastTarget}
              onChange={(e) => setBroadcastTarget(e.target.value)}
              aria-label="Choose who receives the announcement"
              className="field w-full sm:max-w-xs"
            >
              <option value="all">All tenants</option>
              {hostels.map((h) => (
                <option key={h.id} value={h.id}>{h.name}</option>
              ))}
            </select>

            <textarea
              value={announcement}
              onChange={(e) => setAnnouncement(e.target.value)}
              rows={2}
              placeholder="Type your announcement here…"
              className="field"
              required
            />

            {broadcastResult && (
              <Alert
                tone={
                  broadcastResult.type === 'ok'
                    ? 'success'
                    : broadcastResult.type === 'warn'
                      ? 'warning'
                      : 'error'
                }
              >
                {broadcastResult.msg}
              </Alert>
            )}

            <div className="flex justify-end">
              <Button
                type="submit"
                size="sm"
                disabled={broadcasting || !announcement.trim()}
              >
                {broadcasting ? 'Sending…' : 'Send announcement'}
              </Button>
            </div>
          </form>
        </section>

        {/* Stay requests */}
        <section aria-labelledby="stay-requests-heading">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2
              id="stay-requests-heading"
              className="text-base font-semibold text-charcoal"
            >
              Stay requests
            </h2>
            <span className="text-sm text-charcoal/55">{pendingCount} pending</span>
          </div>

          <div className="mt-3 space-y-4">
            {isLoading && <Spinner compact label="Loading stay requests…" />}

            {error && (
              <Alert tone="error">Could not load requests: {error}</Alert>
            )}
            {saveError && <Alert tone="error">{saveError}</Alert>}

            {!isLoading && !error && sortedRequests.length === 0 && (
              <EmptyState
                icon={FileText}
                title="No stay requests yet"
                hint="Requests from prospective tenants will appear here for approval."
              />
            )}

            {sortedRequests.map((request) => (
              <StayRequestCard
                key={request.id}
                request={request}
                isDeciding={decidingRequestId === request.id}
                onApprove={() => dispatch(approveStayRequest(request))}
                onReject={() => dispatch(rejectStayRequest(request))}
              />
            ))}
          </div>
        </section>
      </div>
    </section>
  )
}
