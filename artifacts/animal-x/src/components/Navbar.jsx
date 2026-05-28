import { useState, useRef } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "../context/AuthContext";
import { useSocial } from "../context/SocialContext";
import NotificationBell from "./NotificationBell";
import AdminDebugPanel from "./AdminDebugPanel";

const bottomItems = [
  { href: "/", label: "Home", icon: "🏠" },
  { href: "/animals", label: "Animals", icon: "🐾" },
  { href: "/reels", label: "Reels", icon: "🎬" },
  { href: "/map", label: "Map", icon: "🗺️" },
  { href: "/travel", label: "Travel", icon: "✈️" },
  { href: "/profile", label: "Profile", icon: "👤" },
];

export default function Navbar() {
  const [location, navigate] = useLocation();
  const { user, isSuperAdmin, adminMode, unlockAdminMode, lockAdminMode } = useAuth();
  const { broadcast, dismissBroadcast, sendBroadcast } = useSocial();
  const [searchValue, setSearchValue] = useState("");
  const [tapCount, setTapCount] = useState(0);
  const [broadcastOpen, setBroadcastOpen] = useState(false);
  const [broadcastMsg, setBroadcastMsg] = useState("");
  const [debugOpen, setDebugOpen] = useState(false);
  const tapTimer = useRef(null);
  const searchInputRef = useRef(null);

  function submitSearch(e) {
    e.preventDefault();
    const q = searchValue.trim();
    if (!q) return;
    // If query looks like a username (@...) or search intent, go to user search
    navigate(`/search?q=${encodeURIComponent(q)}`);
    setSearchValue("");
    searchInputRef.current?.blur();
  }

  function handleLogoTap() {
    const next = tapCount + 1;
    setTapCount(next);
    if (tapTimer.current) clearTimeout(tapTimer.current);
    tapTimer.current = setTimeout(() => setTapCount(0), 1500);
    if (next >= 7) {
      setTapCount(0);
      if (!user) { alert("Please login first."); return; }
      if (!isSuperAdmin) { alert("Admin access restricted."); return; }
      if (!adminMode) unlockAdminMode();
      setBroadcastOpen(v => !v);
    }
  }

  async function handleSendBroadcast() {
    if (!broadcastMsg.trim()) return;
    await sendBroadcast(broadcastMsg.trim());
    setBroadcastMsg("");
    setBroadcastOpen(false);
    alert("✅ Broadcast sent to all users!");
  }

  return (
    <>
      {broadcast && (
        <div className="broadcast-banner">
          <span className="broadcast-icon">📢</span>
          <span className="broadcast-msg">{broadcast.message}</span>
          <button className="broadcast-dismiss" onClick={() => dismissBroadcast(broadcast.id)}>✕</button>
        </div>
      )}

      <header className="topbar">
        <button className="brand-link" onClick={handleLogoTap} style={{ background:"none", border:"none", cursor:"pointer" }}>
          <span className="brand-icon">🦁</span>
          <span className="brand-name">Animal X</span>
        </button>

        <form className="topbar-search" onSubmit={submitSearch} role="search">
          <span className="topbar-search-icon">🔍</span>
          <input
            ref={searchInputRef}
            type="search"
            value={searchValue}
            onChange={e => setSearchValue(e.target.value)}
            placeholder="Search animals or @users…"
            aria-label="Search"
          />
        </form>

        <div className="topbar-actions">
          <Link href="/search" className="topbar-search-btn" title="Search creators">👥</Link>
          <NotificationBell />
          {adminMode && isSuperAdmin && (
            <button className="debug-panel-btn" onClick={() => setDebugOpen(true)} title="Firebase Debug Panel">🛠️</button>
          )}
          {!user && (
            <Link href="/auth" className="top-pill top-pill-primary" title="Login">Login</Link>
          )}
        </div>
      </header>

      {broadcastOpen && isSuperAdmin && adminMode && (
        <div className="broadcast-panel">
          <div className="broadcast-panel-head">
            <span>📢 Admin Broadcast</span>
            <div style={{ display:"flex", gap:8 }}>
              <button onClick={() => setDebugOpen(true)}
                style={{ background:"rgba(168,85,247,.2)", border:"1px solid #a855f7", color:"#a855f7", padding:"4px 10px", borderRadius:8, cursor:"pointer", fontSize:"0.78rem" }}>
                🛠️ Debug
              </button>
              <button onClick={() => setBroadcastOpen(false)}>✕</button>
            </div>
          </div>
          <div className="broadcast-panel-body">
            <textarea className="broadcast-input" rows={3}
              placeholder="Type a message for ALL users..."
              value={broadcastMsg} onChange={e => setBroadcastMsg(e.target.value)} />
            <div className="broadcast-panel-actions">
              <button className="auth-btn" style={{ background:"var(--surface2)", flex:1 }}
                onClick={() => { lockAdminMode(); setBroadcastOpen(false); }}>
                🔒 Lock Admin
              </button>
              <button className="auth-btn" style={{ flex:1 }} onClick={handleSendBroadcast}
                disabled={!broadcastMsg.trim()}>
                📢 Send to All
              </button>
            </div>
          </div>
        </div>
      )}

      <AdminDebugPanel open={debugOpen} onClose={() => setDebugOpen(false)} />

      <nav className="bottom-nav">
        {bottomItems.map((item) => {
          const active = item.href === "/" ? location === "/" : location === item.href || location.startsWith(item.href + "/");
          return (
            <Link key={item.href} href={item.href} className={`bn-item ${active ? "active" : ""}`}>
              <span className="bn-icon">{item.icon}</span>
              <span className="bn-label">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
