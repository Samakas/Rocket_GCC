import { useCurrentUser } from "../context/CurrentUserContext";

export default function RoleGuard({ role, children }) {
  const { currentUser } = useCurrentUser();

  if (!currentUser) {
    return <p className="section-hint">Select a user from the top bar.</p>;
  }

  if (currentUser.role !== role) {
    return (
      <p className="section-hint">
        This page is only available to <strong>{role}</strong> users. Switch the "Acting as"
        user in the top bar to view it.
      </p>
    );
  }

  return children;
}
