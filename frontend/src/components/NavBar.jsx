import { NavLink } from "react-router-dom";
import { useCurrentUser } from "../context/CurrentUserContext";

export default function NavBar() {
  const { users, currentUser, currentUserId, setCurrentUserId } = useCurrentUser();
  const isOrganizer = currentUser?.role === "ORGANIZER";
  const isStudent = currentUser?.role === "STUDENT";

  return (
    <header className="navbar">
      <div className="navbar-brand">
        <span className="brand-badge">PASS</span>
        <div>
          <div className="brand-title">Event Pass Office</div>
          <div className="brand-subtitle">Campus Registration Desk</div>
        </div>
      </div>

      <nav className="navbar-links">
        <NavLink to="/events" className={({ isActive }) => (isActive ? "active" : "")}>
          Events
        </NavLink>
        {isOrganizer && (
          <>
            <NavLink to="/" end className={({ isActive }) => (isActive ? "active" : "")}>
              Dashboard
            </NavLink>
            <NavLink to="/create-event" className={({ isActive }) => (isActive ? "active" : "")}>
              Create Event
            </NavLink>
            <NavLink to="/attendance" className={({ isActive }) => (isActive ? "active" : "")}>
              Attendance
            </NavLink>
          </>
        )}
        {isStudent && (
          <NavLink to="/my-registrations" className={({ isActive }) => (isActive ? "active" : "")}>
            My Registrations
          </NavLink>
        )}
      </nav>

      <div className="navbar-user">
        <label htmlFor="user-select">Acting as</label>
        <select
          id="user-select"
          value={currentUserId || ""}
          onChange={(e) => setCurrentUserId(Number(e.target.value))}
        >
          {users.length === 0 && <option value="">No users yet</option>}
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              #{u.id} {u.name} ({u.role})
            </option>
          ))}
        </select>
      </div>
    </header>
  );
}
