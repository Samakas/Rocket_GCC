import { useEffect, useState } from "react";
import { EventAPI, AttendanceAPI, getErrorMessage } from "../services/api";
import { useCurrentUser } from "../context/CurrentUserContext";
import StatusBadge from "../components/StatusBadge";
import Message from "../components/Message";
import RoleGuard from "../components/RoleGuard";

function AttendanceContent() {
  const { currentUser } = useCurrentUser();
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState("");
  const [registrations, setRegistrations] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    EventAPI.getAll()
      .then((res) => setEvents(res.data))
      .catch((err) => setError(getErrorMessage(err)));
  }, []);

  const loadRegistrations = (eventId) => {
    if (!eventId) {
      setRegistrations([]);
      return;
    }
    setLoading(true);
    AttendanceAPI.getRegistrations(eventId, currentUser.id)
      .then((res) => setRegistrations(res.data))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  };

  const handleSelectEvent = (e) => {
    const eventId = e.target.value;
    setSelectedEventId(eventId);
    setError("");
    setSuccess("");
    loadRegistrations(eventId);
  };

  const handleMark = async (booking, present) => {
    setError("");
    setSuccess("");
    setBusyId(booking.id);
    try {
      await AttendanceAPI.markAttendance(selectedEventId, booking.student.id, currentUser.id, present);
      setSuccess(`Marked ${booking.student.name} as ${present ? "present" : "absent"}.`);
      loadRegistrations(selectedEventId);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusyId(null);
    }
  };

  const activeRegistrations = registrations.filter((b) => b.status !== "CANCELLED");

  return (
    <>
      <p className="section-hint">
        Select an event to view registered students and mark them present or absent.
      </p>
      <Message type="error" text={error} />
      <Message type="success" text={success} />

      <div className="form" style={{ maxWidth: 360 }}>
        <label>
          Event
          <select value={selectedEventId} onChange={handleSelectEvent}>
            <option value="">Select an event</option>
            {events.map((ev) => (
              <option key={ev.id} value={ev.id}>
                {ev.eventName} ({ev.eventDate}, {ev.startTime?.slice(0, 5)}-{ev.endTime?.slice(0, 5)})
              </option>
            ))}
          </select>
        </label>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : selectedEventId ? (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Email</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {activeRegistrations.length === 0 && (
                <tr>
                  <td colSpan="4" className="empty-cell">
                    No registered students for this event.
                  </td>
                </tr>
              )}
              {activeRegistrations.map((b) => (
                <tr key={b.id}>
                  <td>{b.student.name}</td>
                  <td>{b.student.email}</td>
                  <td>
                    <StatusBadge status={b.status} />
                  </td>
                  <td className="table-actions">
                    <button
                      className="btn btn-small"
                      disabled={busyId === b.id}
                      onClick={() => handleMark(b, true)}
                    >
                      Present
                    </button>
                    <button
                      className="btn btn-small btn-danger"
                      disabled={busyId === b.id}
                      onClick={() => handleMark(b, false)}
                    >
                      Absent
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="section-hint">No event selected yet.</p>
      )}
    </>
  );
}

export default function Attendance() {
  return (
    <div className="page">
      <h1>Attendance</h1>
      <RoleGuard role="ORGANIZER">
        <AttendanceContent />
      </RoleGuard>
    </div>
  );
}
