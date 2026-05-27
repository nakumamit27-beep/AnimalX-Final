import { useState, useRef, useEffect } from "react";
import { useSocial } from "../context/SocialContext";
import { useAuth } from "../context/AuthContext";

function timeAgo(ts) {
  if (!ts) return "";
  const seconds = Math.floor((Date.now() - (ts.seconds ? ts.seconds * 1000 : ts)) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function NotificationBell() {
  const { user } = useAuth();
  const { notifications, unreadCount, markAllRead } = useSocial();
  const [open, setOpen] = useState(false);
  const panelRef = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (panelRef.current && !panelRef.current.contains(e.target)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  if (!user) return null;

  function toggleOpen() {
    setOpen(v => !v);
    if (!open && unreadCount > 0) markAllRead();
  }

  return (
    <div className="notif-bell-wrap" ref={panelRef}>
      <button className="notif-bell-btn" onClick={toggleOpen} aria-label="Notifications">
        🔔
        {unreadCount > 0 && (
          <span className="notif-badge">{unreadCount > 9 ? "9+" : unreadCount}</span>
        )}
      </button>

      {open && (
        <div className="notif-panel">
          <div className="notif-panel-head">
            <span>🔔 Notifications</span>
            {notifications.length > 0 && (
              <button className="notif-clear" onClick={markAllRead}>Mark all read</button>
            )}
          </div>

          <div className="notif-list">
            {notifications.length === 0 ? (
              <div className="notif-empty">
                <div style={{ fontSize: 36 }}>🦁</div>
                <div>No notifications yet</div>
              </div>
            ) : (
              notifications.map(n => (
                <div key={n.id} className={`notif-item ${n.read ? "" : "unread"}`}>
                  <div className="notif-avatar">{(n.actorName || "U")[0].toUpperCase()}</div>
                  <div className="notif-body">
                    <div className="notif-msg">{n.message}</div>
                    <div className="notif-time">{timeAgo(n.createdAt)}</div>
                  </div>
                  {!n.read && <div className="notif-dot" />}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
