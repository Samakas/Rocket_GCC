# Event Pass Management System

A full-stack application for a college to publish events, let students register for a
pass, and let organizers (professors) track who actually showed up. Built as a small,
interview-friendly reference implementation — no authentication, no external services,
everything runs locally with an in-memory database.

## What it does

- **Organizers** create events (name, date, start/end time, capacity) and can later view
  registration/attendance summaries and mark students present or absent.
- **Students** browse open events, register for a pass, cancel a registration, and check
  themselves in on the day of the event.
- The backend enforces every business rule (capacity, duplicate registration, role
  checks, schedule conflicts, attendance windows) — the frontend is a thin client that
  calls the API and renders the result.

There is no login system. Instead, the frontend has an "Acting as" switcher in the top
bar that lets you pick which existing user you're operating as. All role enforcement
still happens on the backend, so the switcher is just a convenience for testing without
building real authentication.

## Architecture

```
Rocket_GCC/
  Rocket/        Spring Boot backend (Java, Spring Data JPA, H2 in-memory DB)
  frontend/      React + Vite frontend (Axios, React Router)
```

**Backend** follows a standard layered architecture:

```
controller/   REST endpoints, request/response mapping
service/      Business rules and validation
repository/   Spring Data JPA repositories
entity/       JPA entities (User, Event, Booking) + enums
dto/          Request/response DTOs
exception/    Domain exceptions + a global handler mapping them to HTTP status codes
config/       CORS config, manual H2 console servlet registration
```

**Frontend** is a plain component/page structure with a single Axios client:

```
src/
  components/   Reusable UI pieces (NavBar, EventCard, StatusBadge, RoleGuard, ...)
  pages/        One component per screen (Dashboard, Events, CreateEvent, ...)
  context/      CurrentUserContext — the "Acting as" user switcher
  services/     api.js — every backend call lives here
```

## Data model

- **User** — `id`, `name`, `email`, `role` (`ORGANIZER` or `STUDENT`).
- **Event** — `id`, `eventName`, `eventDate`, `startTime`, `endTime`, `maximumCapacity`,
  `status` (`OPEN`/`CLOSED`), `organizer` (many-to-one `User`).
- **Booking** — `id`, `student` (many-to-one `User`), `event` (many-to-one `Event`),
  `status` (`REGISTERED`/`CANCELLED`/`CHECKED_IN`/`ABSENT`), `registeredAt`,
  `checkedInAt`. This is the join entity representing a student's pass for an event.

## Business rules

- **Create event** — only a user with role `ORGANIZER` can create an event. Requires a
  valid capacity (`> 0`) and `startTime < endTime`. New events start `OPEN`.
- **Register** — only a `STUDENT` can register, only while the event is `OPEN`, and only
  once per event (a cancelled booking can be re-registered). When the active
  registration count reaches capacity, the event automatically flips to `CLOSED`.
- **Schedule conflict check** — a student cannot hold two active bookings (`REGISTERED`
  or `CHECKED_IN`) for events that overlap in time on the same date. Two events overlap
  when `startA < endB && startB < endA`; back-to-back events (one ending exactly when
  the next starts) are allowed. Attempting to register for a conflicting event returns
  `409 Conflict`.
- **Cancel** — a student can cancel their own `REGISTERED` booking (never deleted, just
  marked `CANCELLED`). If the event was `CLOSED` and capacity frees up, it automatically
  reopens.
- **Self check-in** — a student can check themselves in only for their own `REGISTERED`
  booking, and only on the event's date.
- **Organizer attendance marking** — an organizer can list every student registered for
  one of their events and mark each as present (`CHECKED_IN`) or absent (`ABSENT`),
  also restricted to the event's date. Cancelled bookings can't be marked.
- **Event summary** — organizer-only: registered count (`REGISTERED` + `CHECKED_IN`,
  excluding `CANCELLED`) and checked-in count for one event.
- **Registration report** — organizer-only: every event with its total registration
  count, sorted highest first.

### Role-gated APIs

Every organizer-only endpoint requires an `organizerId` query parameter; the backend
looks that user up and verifies `role == ORGANIZER` (403 otherwise). Student actions
(`register`, `cancel`, `check-in`) verify `role == STUDENT` the same way.

| Area | Endpoint | Who |
|---|---|---|
| Users | `POST /api/users`, `GET /api/users`, `GET /api/users/{id}` | anyone |
| Events | `POST /api/events` | ORGANIZER |
| Events | `GET /api/events`, `GET /api/events/{id}` | anyone |
| Events | `GET /api/events/{id}/summary?organizerId=` | ORGANIZER |
| Events | `GET /api/events/registration-summary?organizerId=` | ORGANIZER |
| Booking | `POST /api/events/{eventId}/register/{studentId}` | STUDENT |
| Booking | `DELETE /api/events/{eventId}/register/{studentId}` | STUDENT |
| Booking | `POST /api/events/{eventId}/check-in/{studentId}` | STUDENT |
| Booking | `GET /api/students/{studentId}/bookings` | anyone |
| Attendance | `GET /api/events/{eventId}/registrations?organizerId=` | ORGANIZER |
| Attendance | `POST /api/events/{eventId}/attendance/{studentId}?organizerId=&present=` | ORGANIZER |

## How to run

### Backend (port 8081)

```bash
cd Rocket_GCC/Rocket
mvn spring-boot:run
```

- H2 console: `http://localhost:8081/h2-console` — JDBC URL `jdbc:h2:mem:eventdb`, user
  `sa`, no password.
- Data is **in-memory** and resets every time the app restarts (`ddl-auto=create-drop`).
  There's no seed data on startup — create users via `POST /api/users` first (at least
  one `ORGANIZER` and one `STUDENT`), then create events.

### Frontend (port 5173)

```bash
cd Rocket_GCC/frontend
npm install
npm run dev
```

Open `http://localhost:5173`. Pick a user from the "Acting as" dropdown in the top bar
to act as that organizer or student — the app has no login screen.

## Pages

- **Dashboard** (organizer) — total/open/closed event counts and the registration
  report.
- **Events** (both roles) — every event with its date, time, capacity, and status.
  Students see a Register button; organizers see a View Summary button instead.
- **Create Event** (organizer) — form for name, date, start/end time, capacity.
- **My Registrations** (student) — their bookings with cancel / self check-in actions.
- **Attendance** (organizer) — pick one of their events, see everyone registered, mark
  each present or absent.
