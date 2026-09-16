import { useEffect, useState } from "react";
import { EventAPI, getErrorMessage } from "../services/api";
import { useCurrentUser } from "../context/CurrentUserContext";
import Message from "../components/Message";
import RoleGuard from "../components/RoleGuard";

const emptyForm = {
  eventName: "",
  eventDate: "",
  startTime: "",
  endTime: "",
  maximumCapacity: "",
  organizerId: "",
};

function CreateEventForm() {
  const { organizers, currentUser } = useCurrentUser();
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setForm((f) => ({ ...f, organizerId: String(currentUser.id) }));
    }
  }, [currentUser]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (
      !form.eventName ||
      !form.eventDate ||
      !form.startTime ||
      !form.endTime ||
      !form.maximumCapacity ||
      !form.organizerId
    ) {
      setError("Please fill in every field.");
      return;
    }

    if (form.startTime >= form.endTime) {
      setError("Start time must be before end time.");
      return;
    }

    setSubmitting(true);
    try {
      await EventAPI.create({
        eventName: form.eventName,
        eventDate: form.eventDate,
        startTime: form.startTime,
        endTime: form.endTime,
        maximumCapacity: Number(form.maximumCapacity),
        organizerId: Number(form.organizerId),
      });
      setSuccess(`Event "${form.eventName}" created successfully.`);
      setForm((f) => ({ ...emptyForm, organizerId: f.organizerId }));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Message type="error" text={error} />
      <Message type="success" text={success} />

      <form className="form card" onSubmit={handleSubmit}>
        <label>
          Event Name
          <input
            type="text"
            name="eventName"
            value={form.eventName}
            onChange={handleChange}
            placeholder="e.g. AI Workshop"
          />
        </label>

        <label>
          Event Date
          <input type="date" name="eventDate" value={form.eventDate} onChange={handleChange} />
        </label>

        <label>
          Start Time
          <input type="time" name="startTime" value={form.startTime} onChange={handleChange} />
        </label>

        <label>
          End Time
          <input type="time" name="endTime" value={form.endTime} onChange={handleChange} />
        </label>

        <label>
          Maximum Capacity
          <input
            type="number"
            name="maximumCapacity"
            min="1"
            value={form.maximumCapacity}
            onChange={handleChange}
            placeholder="e.g. 50"
          />
        </label>

        <label>
          Organizer
          <select name="organizerId" value={form.organizerId} onChange={handleChange}>
            <option value="">Select an organizer</option>
            {organizers.map((o) => (
              <option key={o.id} value={o.id}>
                #{o.id} {o.name}
              </option>
            ))}
          </select>
        </label>

        <button className="btn btn-primary" type="submit" disabled={submitting}>
          {submitting ? "Creating..." : "Create Event"}
        </button>
      </form>
    </>
  );
}

export default function CreateEvent() {
  return (
    <div className="page">
      <h1>Create Event</h1>
      <RoleGuard role="ORGANIZER">
        <CreateEventForm />
      </RoleGuard>
    </div>
  );
}
