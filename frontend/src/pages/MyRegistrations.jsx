import { useEffect, useState } from "react";
import { BookingAPI, getErrorMessage } from "../services/api";
import { useCurrentUser } from "../context/CurrentUserContext";
import StatusBadge from "../components/StatusBadge";
import Message from "../components/Message";
import RoleGuard from "../components/RoleGuard";

function formatDateTime(value) {
  if (!value) return "-";
  return new Date(value).toLocaleString();
}

function MyRegistrationsContent() {
  const { currentUser } = useCurrentUser();
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);

  const loadBookings = () => {
    if (!currentUser) return;
    setLoading(true);
    BookingAPI.getByStudent(currentUser.id)
      .then((res) => setBookings(res.data))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  };

  useEffect(loadBookings, [currentUser]);

  const handleCancel = async (booking) => {
    setError("");
    setSuccess("");
    setBusyId(booking.id);
    try {
      await BookingAPI.cancel(booking.event.id, currentUser.id);
      setSuccess("Registration cancelled.");
      loadBookings();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusyId(null);
    }
  };

  const handleCheckIn = async (booking) => {
    setError("");
    setSuccess("");
    setBusyId(booking.id);
    try {
      await BookingAPI.checkIn(booking.event.id, currentUser.id);
      setSuccess("Checked in successfully.");
      loadBookings();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <>
      <p className="section-hint">
        Viewing bookings for <strong>{currentUser.name}</strong>.
      </p>
      <Message type="error" text={error} />
      <Message type="success" text={success} />

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Event Name</th>
              <th>Event Date</th>
              <th>Status</th>
              <th>Registered At</th>
              <th>Checked In At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookings.length === 0 && (
              <tr>
                <td colSpan="6" className="empty-cell">
                  No bookings yet.
                </td>
              </tr>
            )}
            {bookings.map((b) => (
              <tr key={b.id}>
                <td>{b.event.eventName}</td>
                <td>{b.event.eventDate}</td>
                <td>
                  <StatusBadge status={b.status} />
                </td>
                <td>{formatDateTime(b.registeredAt)}</td>
                <td>{formatDateTime(b.checkedInAt)}</td>
                <td className="table-actions">
                  <button
                    className="btn btn-small"
                    disabled={b.status !== "REGISTERED" || busyId === b.id}
                    onClick={() => handleCheckIn(b)}
                  >
                    Check In
                  </button>
                  <button
                    className="btn btn-small btn-danger"
                    disabled={b.status !== "REGISTERED" || busyId === b.id}
                    onClick={() => handleCancel(b)}
                  >
                    Cancel
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      )}
    </>
  );
}

export default function MyRegistrations() {
  return (
    <div className="page">
      <h1>My Registrations</h1>
      <RoleGuard role="STUDENT">
        <MyRegistrationsContent />
      </RoleGuard>
    </div>
  );
}
