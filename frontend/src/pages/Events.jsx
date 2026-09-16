import { useEffect, useState } from "react";
import { EventAPI, BookingAPI, getErrorMessage } from "../services/api";
import { useCurrentUser } from "../context/CurrentUserContext";
import EventCard from "../components/EventCard";
import Message from "../components/Message";
import SummaryModal from "../components/SummaryModal";

export default function Events() {
  const { currentUser } = useCurrentUser();
  const isOrganizer = currentUser?.role === "ORGANIZER";
  const isStudent = currentUser?.role === "STUDENT";

  const [events, setEvents] = useState([]);
  const [countsByName, setCountsByName] = useState({});
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);
  const [registeringId, setRegisteringId] = useState(null);
  const [summary, setSummary] = useState(null);
  const [summaryEvent, setSummaryEvent] = useState(null);

  const loadEvents = () => {
    if (!currentUser) return;
    setLoading(true);
    const requests = [EventAPI.getAll()];
    // Registration counts come from the organizer-only summary endpoint.
    if (isOrganizer) {
      requests.push(EventAPI.registrationSummary(currentUser.id));
    }
    Promise.all(requests)
      .then(([eventsRes, summaryRes]) => {
        setEvents(eventsRes.data);
        if (summaryRes) {
          const map = {};
          summaryRes.data.forEach((row) => {
            map[row.eventName] = row.registrationCount;
          });
          setCountsByName(map);
        }
      })
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  };

  useEffect(loadEvents, [currentUser]);

  const handleRegister = async (eventId) => {
    setError("");
    setSuccess("");
    if (!isStudent) {
      setError("Only a STUDENT can register for an event.");
      return;
    }
    setRegisteringId(eventId);
    try {
      await BookingAPI.register(eventId, currentUser.id);
      setSuccess(`Registered for the event as ${currentUser.name}.`);
      loadEvents();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setRegisteringId(null);
    }
  };

  const handleViewSummary = async (eventId) => {
    setError("");
    try {
      const res = await EventAPI.getSummary(eventId, currentUser.id);
      setSummary(res.data);
      setSummaryEvent(events.find((e) => e.id === eventId));
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  if (!currentUser) {
    return (
      <div className="page">
        <h1>Events</h1>
        <p className="section-hint">Select a user from the top bar.</p>
      </div>
    );
  }

  return (
    <div className="page">
      <h1>Events</h1>
      {isOrganizer && (
        <p className="section-hint">
          Organizers can view event summaries here. Registration is for students only.
        </p>
      )}
      <Message type="error" text={error} />
      <Message type="success" text={success} />
      {loading ? (
        <p>Loading...</p>
      ) : events.length === 0 ? (
        <p className="section-hint">No events yet. Create one from the Create Event page.</p>
      ) : (
        <div className="card-grid">
          {events.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              registrationCount={countsByName[event.eventName]}
              onRegister={isStudent ? handleRegister : undefined}
              onViewSummary={isOrganizer ? handleViewSummary : undefined}
              registering={registeringId === event.id}
            />
          ))}
        </div>
      )}
      <SummaryModal summary={summary} event={summaryEvent} onClose={() => setSummary(null)} />
    </div>
  );
}
