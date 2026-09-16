import { Routes, Route } from "react-router-dom";
import NavBar from "./components/NavBar";
import Home from "./pages/Home";
import Events from "./pages/Events";
import CreateEvent from "./pages/CreateEvent";
import MyRegistrations from "./pages/MyRegistrations";
import Attendance from "./pages/Attendance";
import { CurrentUserProvider } from "./context/CurrentUserContext";

export default function App() {
  return (
    <CurrentUserProvider>
      <NavBar />
      <main className="app-main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/events" element={<Events />} />
          <Route path="/create-event" element={<CreateEvent />} />
          <Route path="/my-registrations" element={<MyRegistrations />} />
          <Route path="/attendance" element={<Attendance />} />
        </Routes>
      </main>
    </CurrentUserProvider>
  );
}
