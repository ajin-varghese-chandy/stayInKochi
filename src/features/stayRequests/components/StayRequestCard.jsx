import { FileText, Mail, Phone } from 'lucide-react'
import Button from '../../../components/ui/Button'
import StatusBadge from '../../../components/ui/StatusBadge'
import { documentUrl } from '../documentService'

// One stay request. The owner dashboard passes approve/reject handlers; the
// tenant dashboard omits them and only shows the status.
export default function StayRequestCard({ request, isDeciding, onApprove, onReject }) {
  const showActions =
    Boolean(onApprove) && Boolean(onReject) && request.status === 'pending'

  return (
    <div className="card p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-charcoal">
            {request.tenantName}
          </h3>
          <p className="mt-0.5 text-xs text-charcoal/55">
            {request.hostelName} · Requested on {request.requestedOn}
            {request.decidedOn ? ` · Decided on ${request.decidedOn}` : ''}
          </p>
        </div>

        <StatusBadge status={request.status} />
      </div>

      {(request.tenantEmail || request.phone) && (
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-charcoal/70">
          {request.tenantEmail && (
            <span className="inline-flex items-center gap-1.5">
              <Mail size={16} strokeWidth={1.75} aria-hidden="true" />
              {request.tenantEmail}
            </span>
          )}
          {request.phone && (
            <span className="inline-flex items-center gap-1.5">
              <Phone size={16} strokeWidth={1.75} aria-hidden="true" />
              {request.phone}
            </span>
          )}
        </div>
      )}

      {request.message && (
        <blockquote className="mt-3 border-l-2 border-line pl-3 text-sm leading-relaxed text-charcoal/70">
          {request.message}
        </blockquote>
      )}

      {request.documents?.length > 0 && (
        <div className="mt-3">
          <p className="text-xs font-medium text-charcoal/45">
            Documents for verification
          </p>
          <ul className="mt-1.5 flex flex-wrap gap-2">
            {request.documents.map((document) => (
              <li key={document.path ?? document.name}>
                <a
                  href={documentUrl(document.path)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex max-w-full items-center gap-1.5 border border-line bg-ivory px-2 py-1 text-xs font-medium text-charcoal transition-colors hover:border-line-strong hover:text-forest"
                >
                  <FileText size={13} strokeWidth={1.75} aria-hidden="true" />
                  <span className="truncate">{document.name}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {showActions && (
        <div className="mt-4 flex flex-wrap justify-end gap-2 border-t border-line pt-3">
          <Button
            size="sm"
            onClick={onApprove}
            disabled={isDeciding}
          >
            {isDeciding ? 'Working…' : 'Approve'}
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={onReject}
            disabled={isDeciding}
          >
            {isDeciding ? 'Working…' : 'Reject'}
          </Button>
        </div>
      )}
    </div>
  )
}
