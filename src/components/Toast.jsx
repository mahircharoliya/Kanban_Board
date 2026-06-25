// Toast.jsx
import React, { useEffect } from "react";

export default function Toast({ toast, onDismiss }) {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => onDismiss(toast.id), 3500);
    return () => clearTimeout(timer);
  }, [toast, onDismiss]);

  if (!toast) return null;

  return (
    <div className={`kb-toast kb-toast-${toast.kind}`} role="status">
      {toast.message}
      <button className="kb-toast-close" onClick={() => onDismiss(toast.id)}>
        ×
      </button>
    </div>
  );
}
