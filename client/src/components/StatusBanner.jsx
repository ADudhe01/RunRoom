import React from "react";

export default function StatusBanner({
  tone = "info",
  message,
  onDismiss,
  compact = false,
}) {
  if (!message) return null;

  return (
    <div className={`status-banner status-banner--${tone} ${compact ? "is-compact" : ""}`.trim()}>
      <span>{message}</span>
      {onDismiss && (
        <button type="button" className="status-banner__close" onClick={onDismiss}>
          &times;
        </button>
      )}
    </div>
  );
}

