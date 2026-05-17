import { useEffect } from "react";

export default function Notification({ visible, message, tone = "info", onClose }) {
  useEffect(() => {
    if (!visible) return;
    const id = setTimeout(() => onClose?.(), 3000);
    return () => clearTimeout(id);
  }, [visible, onClose]);

  if (!visible) return null;

  const bg = {
    info: "#0b84ff",
    success: "#16a34a",
    danger: "#dc2626",
    warn: "#f59e0b",
  }[tone] || "#0b84ff";

  return (
    <div style={{
      position: "fixed",
      right: 20,
      bottom: 20,
      zIndex: 9999,
      minWidth: 240,
      maxWidth: 360,
      boxShadow: "0 8px 24px rgba(3,7,18,0.4)",
      borderRadius: 10,
      overflow: "hidden",
      color: "white",
      background: bg,
      padding: "12px 16px",
      fontSize: 14,
    }} role="status" aria-live="polite">
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <strong style={{ flex: 1 }}>{message}</strong>
        <button onClick={() => onClose?.()} aria-label="Close notification" style={{
          background: "transparent",
          border: 0,
          color: "rgba(255,255,255,0.9)",
          cursor: "pointer",
          fontSize: 16,
        }}>×</button>
      </div>
    </div>
  );
}
