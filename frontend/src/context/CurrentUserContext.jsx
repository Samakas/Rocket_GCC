import { createContext, useContext, useEffect, useState } from "react";
import { UserAPI } from "../services/api";

const CurrentUserContext = createContext(null);

export function CurrentUserProvider({ children }) {
  const [users, setUsers] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(() => {
    const saved = localStorage.getItem("currentUserId");
    return saved ? Number(saved) : null;
  });

  const refreshUsers = () => {
    UserAPI.getAll()
      .then((res) => setUsers(res.data))
      .catch(() => setUsers([]));
  };

  useEffect(() => {
    refreshUsers();
  }, []);

  useEffect(() => {
    if (currentUserId) {
      localStorage.setItem("currentUserId", String(currentUserId));
    }
  }, [currentUserId]);

  useEffect(() => {
    if (!currentUserId && users.length > 0) {
      const firstStudent = users.find((u) => u.role === "STUDENT");
      setCurrentUserId((firstStudent || users[0]).id);
    }
  }, [users, currentUserId]);

  const currentUser = users.find((u) => u.id === currentUserId) || null;
  const students = users.filter((u) => u.role === "STUDENT");
  const organizers = users.filter((u) => u.role === "ORGANIZER");

  return (
    <CurrentUserContext.Provider
      value={{
        users,
        students,
        organizers,
        currentUser,
        currentUserId,
        setCurrentUserId,
        refreshUsers,
      }}
    >
      {children}
    </CurrentUserContext.Provider>
  );
}

export function useCurrentUser() {
  return useContext(CurrentUserContext);
}
