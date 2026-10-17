import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import OwnerNav from '../../components/layout/OwnerNav'
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
    <section className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-3xl font-bold text-slate-900">Owner dashboard</h1>
      <p className="mt-2 text-slate-600">
        Welcome back, {user?.displayName ?? 'owner'}.
      </p>

      <div className="mt-6">
        <OwnerNav />
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold text-slate-900">Financial summary</h2>
        <div className="mt-3">
          <FinancialSummary />
        </div>
      </div>

      <div className="mt-8">
        <NotificationInbox recipientId={OWNER_INBOX} />
      </div>

      {/* Broadcast announcement */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold text-slate-900">Send announcement</h2>
        <p className="mt-1 text-sm text-slate-500">
          Push a notification to all tenants or a specific branch.
        </p>
        <form onSubmit={handleBroadcast} className="mt-3 space-y-3 rounded-lg border border-slate-200 bg-white p-4">
          <div className="flex flex-wrap gap-3">
            <select
              value={broadcastTarget}
              onChange={(e) => setBroadcastTarget(e.target.value)}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-700 focus:border-indigo-500 focus:outline-none"
            >
              <option value="all">All tenants</option>
              {hostels.map((h) => (
                <option key={h.id} value={h.id}>{h.name}</option>
              ))}
            </select>
          </div>
          <textarea
            value={announcement}
            onChange={(e) => setAnnouncement(e.target.value)}
            rows={2}
            placeholder="Type your announcement here…"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-800 focus:border-indigo-500 focus:outline-none"
            required
          />
          {broadcastResult && (
            <p className={`text-sm ${broadcastResult.type === 'ok' ? 'text-green-700' : broadcastResult.type === 'warn' ? 'text-amber-700' : 'text-red-600'}`}>
              {broadcastResult.msg}
            </p>
          )}
          <button
            type="submit"
            disabled={broadcasting || !announcement.trim()}
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
          >
            {broadcasting ? 'Sending…' : 'Send announcement'}
          </button>
        </form>
      </div>

      <div className="mt-8">
        <div className="flex items-baseline justify-between">
          <h2 className="text-xl font-semibold text-slate-900">Stay requests</h2>
          <span className="text-sm text-slate-500">{pendingCount} pending</span>
        </div>

        {isLoading && <Spinner label="Loading stay requests..." />}
        {error && <p className="mt-4 text-red-600">Could not load requests: {error}</p>}
        {saveError && <p className="mt-4 text-red-600">{saveError}</p>}

        {!isLoading && !error && sortedRequests.length === 0 && (
          <p className="mt-4 text-slate-600">No stay requests yet.</p>
        )}

        <div className="mt-4 space-y-4">
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
      </div>
    </section>
  )
}
