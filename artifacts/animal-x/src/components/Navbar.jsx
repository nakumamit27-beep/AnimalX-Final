import { useState, useRef } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "../context/AuthContext";
import { useSocial } from "../context/SocialContext";
import NotificationBell from "./NotificationBell";
import AdminDebugPanel from "./AdminDebugPanel";
import AdminTestingPanel from "./AdminTestingPanel";

const bottomItems = [
  { href: "/", label: "Home", icon: "🏠" },
  { href: "/animals", label: "Animals", icon: "🐾" },
  { href: "/reels", label: "Reels", icon: "🎬" },
  { href: "/games", label: "Games", icon: "🎮" },
  { href: "/map", label: "Map", icon: "🗺️" },
  { href: "/profile", label: "Profile", icon: "👤" },
];

export default function Navbar() {
  const [location, navigate] = useLocation();
  const { user, isSuperAdmin, adminMode, unlockAdminMode, lockAdminMode } = useAuth();
  const { broadcast, dismissBroadcast, sendBroadcast } = useSocial();
  const [searchValue, setSearchValue] = useState("");
  const [tapCount, setTapCount] = useState(0);
  const [adminPanelOpen, setAdminPanelOpen] = useState(false);
  const [panelTab, setPanelTab] = useState("broadcast"); // "broadcast" | "testing"
  const [broadcastMsg, setBroadcastMsg] = useState("");
  const [debugOpen, setDebugOpen] = useState(false);
  const [testingPanelOpen, setTestingPanelOpen] = useState(false);
  const tapTimer = useRef(null);
  const searchInputRef = useRef(null);

  function submitSearch(e) {
    e.preventDefault();
    const q = searchValue.trim();
    if (!q) return;
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
      if (!isSuperAdmin) { alert("Admin access restricted to super admin."); return; }
      if (!adminMode) unlockAdminMode();
      setAdminPanelOpen(v => !v);
    }
  }

  async function handleSendBroadcast() {
    if (!broadcastMsg.trim()) return;
    await sendBroadcast(broadcastMsg.trim());
    setBroadcastMsg("");
    setAdminPanelOpen(false);
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
        <button
          className="brand-link"
          onClick={handleLogoTap}
          style={{ background: "none", border: "none", cursor: "pointer" }}
          title="Animal X (tap 7x for admin)"
        >
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
            <>
              <button
                className="debug-panel-btn"
                onClick={() => { setTestingPanelOpen(true); }}
                title="Admin Testing Panel"
              >
                🧪
              </button>
              <button
                className="debug-panel-btn"
                onClick={() => setDebugOpen(true)}
                title="Firebase Debug Panel"
              >
                🛠️
              </button>
            </>
          )}
          {!user && (
            <Link href="/auth" className="top-pill top-pill-primary" title="Login">Login</Link>
          )}
        </div>
      </header>

      {/* Admin Panel (Broadcast + Testing tabs) */}
      {adminPanelOpen && isSuperAdmin && adminMode && (
        <div className="admin-panel-overlay">
          <div className="admin-panel-sheet">
            <div className="admin-panel-header">
              <div className="admin-panel-tabs">
                <button
                  className={`admin-panel-tab ${panelTab === "broadcast" ? "active" : ""}`}
                  onClick={() => setPanelTab("broadcast")}
                >
                  📢 Broadcast
                </button>
                <button
                  className={`admin-panel-tab ${panelTab === "testing" ? "active" : ""}`}
                  onClick={() => setPanelTab("testing")}
                >
                  🧪 Testing
                </button>
              </div>
              <button className="admin-panel-close" onClick={() => setAdminPanelOpen(false)}>✕</button>
            </div>

            {panelTab === "broadcast" && (
              <div className="admin-panel-body">
                <p className="admin-panel-hint">Send a message to all Animal X users instantly.</p>
                <textarea
                  className="broadcast-input"
                  rows={3}
                  placeholder="Type a message for ALL users…"
                  value={broadcastMsg}
                  onChange={e => setBroadcastMsg(e.target.value)}
                />
                <div className="admin-panel-actions">
                  <button
                    className="auth-btn"
                    style={{ background: "var(--surface2)", flex: 1 }}
                    onClick={() => { lockAdminMode(); setAdminPanelOpen(false); }}
                  >
                    🔒 Lock Admin
                  </button>
                  <button
                    className="auth-btn"
                    style={{ flex: 1 }}
                    onClick={handleSendBroadcast}
                    disabled={!broadcastMsg.trim()}
                  >
                    📢 Send to All
                  </button>
                </div>
                <button
                  className="admin-panel-debug-btn"
                  onClick={() => { setDebugOpen(true); setAdminPanelOpen(false); }}
                >
                  🛠️ Open Firebase Debug Panel
                </button>
              </div>
            )}

            {panelTab === "testing" && (
              <div className="admin-panel-body" style={{ padding: "12px 0 0" }}>
                <p className="admin-panel-hint" style={{ padding: "0 16px" }}>
                  Control app modes, manage beta features, and backup/restore app data.
                </p>
                <button
                  className="auth-btn"
                  style={{ margin: "12px 16px 4px", width: "calc(100% - 32px)" }}
                  onClick={() => { setAdminPanelOpen(false); setTestingPanelOpen(true); }}
                >
                  🧪 Open Full Testing Panel
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <AdminDebugPanel open={debugOpen} onClose={() => setDebugOpen(false)} />
      <AdminTestingPanel open={testingPanelOpen} onClose={() => setTestingPanelOpen(false)} />

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
