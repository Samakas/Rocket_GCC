import { useEffect, useState } from "react";
import { EventAPI, getErrorMessage } from "../services/api";
import { useCurrentUser } from "../context/CurrentUserContext";
import StatCard from "../components/StatCard";
import Message from "../components/Message";
import RoleGuard from "../components/RoleGuard";

function DashboardContent() {
  const { currentUser } = useCurrentUser();
  const [events, setEvents] = useState([]);
  const [summary, setSummary] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;
    setLoading(true);
    Promise.all([EventAPI.getAll(), EventAPI.registrationSummary(currentUser.id)])
      .then(([eventsRes, summaryRes]) => {
        setEvents(eventsRes.data);
        setSummary(summaryRes.data);
      })
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [currentUser]);

  const total = events.length;
  const open = events.filter((e) => e.status === "OPEN").length;
  const closed = events.filter((e) => e.status === "CLOSED").length;

  return (
    <>
      <Message type="error" text={error} />
      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <div className="stat-grid">
            <StatCard label="Total Events" value={total} />
            <StatCard label="Open Events" value={open} />
            <StatCard label="Closed Events" value={closed} />
          </div>

          <h2>Registration Summary</h2>
          <p className="section-hint">Sorted by number of registrations, highest first.</p>
          <table className="table">
            <thead>
              <tr>
                <th>Event Name</th>
                <th>Registration Count</th>
              </tr>
            </thead>
            <tbody>
              {summary.length === 0 && (
                <tr>
                  <td colSpan="2" className="empty-cell">
                    No events yet.
                  </td>
                </tr>
              )}
              {summary.map((row) => (
                <tr key={row.eventName}>
                  <td>{row.eventName}</td>
                  <td>{row.registrationCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </>
  );
}

export default function Dashboard() {
  return (
    <div className="page">
      <h1>Dashboard</h1>
      <RoleGuard role="ORGANIZER">
        <DashboardContent />
      </RoleGuard>
    </div>
  );
}
