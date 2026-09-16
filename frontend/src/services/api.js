import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8081/api",
  headers: { "Content-Type": "application/json" },
});

export function getErrorMessage(err) {
  if (err.response && err.response.data && err.response.data.message) {
    return err.response.data.message;
  }
  if (err.message) return err.message;
  return "Something went wrong. Please try again.";
}

export const UserAPI = {
  getAll: () => api.get("/users"),
  getById: (id) => api.get(`/users/${id}`),
  create: (data) => api.post("/users", data),
};

export const EventAPI = {
  getAll: () => api.get("/events"),
  getById: (id) => api.get(`/events/${id}`),
  // Organizer-only: viewing the summary requires proving you are an ORGANIZER.
  getSummary: (id, organizerId) =>
    api.get(`/events/${id}/summary`, { params: { organizerId } }),
  create: (data) => api.post("/events", data),
  registrationSummary: (organizerId) =>
    api.get("/events/registration-summary", { params: { organizerId } }),
};

export const BookingAPI = {
  // Student-only actions
  register: (eventId, studentId) =>
    api.post(`/events/${eventId}/register/${studentId}`),
  cancel: (eventId, studentId) =>
    api.delete(`/events/${eventId}/register/${studentId}`),
  checkIn: (eventId, studentId) =>
    api.post(`/events/${eventId}/check-in/${studentId}`),
  getByStudent: (studentId) => api.get(`/students/${studentId}/bookings`),
};

export const AttendanceAPI = {
  // Organizer-only: view registered students for an event and mark attendance.
  getRegistrations: (eventId, organizerId) =>
    api.get(`/events/${eventId}/registrations`, { params: { organizerId } }),
  markAttendance: (eventId, studentId, organizerId, present) =>
    api.post(`/events/${eventId}/attendance/${studentId}`, null, {
      params: { organizerId, present },
    }),
};

export default api;
