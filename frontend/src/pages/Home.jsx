import { Navigate } from "react-router-dom";
import { useCurrentUser } from "../context/CurrentUserContext";
import Dashboard from "./Dashboard";

export default function Home() {
  const { currentUser } = useCurrentUser();

  if (currentUser && currentUser.role === "STUDENT") {
    return <Navigate to="/events" replace />;
  }

  return <Dashboard />;
}
