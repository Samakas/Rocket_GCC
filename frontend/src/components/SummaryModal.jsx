import StatusBadge from "./StatusBadge";

export default function SummaryModal({ summary, event, onClose }) {
  if (!summary) return null;
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Event Summary</h3>
          <button className="btn btn-ghost" onClick={onClose}>
            X
          </button>
        </div>
        <dl className="event-details">
          <dt>Event Name</dt>
          <dd>{summary.eventName}</dd>
          <dt>Status</dt>
          <dd>{event ? <StatusBadge status={event.status} /> : "-"}</dd>
          <dt>Maximum Capacity</dt>
          <dd>{summary.maximumCapacity}</dd>
          <dt>Registered Count</dt>
          <dd>{summary.registeredCount}</dd>
          <dt>Checked-In Count</dt>
          <dd>{summary.checkedInCount}</dd>
        </dl>
      </div>
    </div>
  );
}
