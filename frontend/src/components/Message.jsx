export default function Message({ type = "info", text }) {
  if (!text) return null;
  return <div className={`message message-${type}`}>{text}</div>;
}
