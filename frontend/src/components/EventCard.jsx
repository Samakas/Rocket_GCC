import StatusBadge from "./StatusBadge";

function formatTime(value) {
  return value ? value.slice(0, 5) : "-";
}

export default function EventCard({ event, registrationCount, onRegister, onViewSummary, registering }) {
  return (
    <div className="card event-card">
      <div className="event-card-header">
        <h3>{event.eventName}</h3>
        <StatusBadge status={event.status} />
      </div>
      <dl className="event-details">
        <dt>Date</dt>
        <dd>{event.eventDate}</dd>
        <dt>Time</dt>
        <dd>
          {formatTime(event.startTime)} - {formatTime(event.endTime)}
        </dd>
        <dt>Capacity</dt>
        <dd>{event.maximumCapacity}</dd>
        {registrationCount !== undefined && (
          <>
            <dt>Registered</dt>
            <dd>{registrationCount}</dd>
          </>
        )}
        <dt>Organizer</dt>
        <dd>{event.organizer ? event.organizer.name : "-"}</dd>
      </dl>
      <div className="event-card-actions">
        {onRegister && (
          <button
            className="btn btn-primary"
            disabled={event.status !== "OPEN" || registering}
            onClick={() => onRegister(event.id)}
          >
            {event.status === "OPEN" ? (registering ? "Registering..." : "Register") : "Closed"}
          </button>
        )}
        {onViewSummary && (
          <button className="btn btn-ghost" onClick={() => onViewSummary(event.id)}>
            View Summary
          </button>
        )}
      </div>
    </div>
  );
}
