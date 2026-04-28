import { Link, useLocation } from "wouter";
import { useAuth } from "../context/AuthContext";

const bottomItems = [
  { href: "/", label: "Home", icon: "🏠" },
  { href: "/animals", label: "Animals", icon: "🐾" },
  { href: "/reels", label: "Reels", icon: "🎬" },
  { href: "/travel", label: "Travel", icon: "✈️" },
  { href: "/profile", label: "Profile", icon: "👤" },
];

export default function Navbar() {
  const [location] = useLocation();
  const { user } = useAuth();

  return (
    <>
      <header className="topbar">
        <Link href="/" className="brand-link">
          <span className="brand-icon">🦁</span>
          <span className="brand-name">Animal X</span>
        </Link>
        <div className="topbar-actions">
          <Link href="/map" className={`top-pill ${location === "/map" ? "active" : ""}`} title="Zoo Map">🗺️</Link>
          <Link href="/live-tracking" className={`top-pill ${location === "/live-tracking" ? "active" : ""}`} title="Live Tracking">📍</Link>
          <Link href="/chat" className={`top-pill ${location === "/chat" ? "active" : ""}`} title="Wildlife Chat">🤖</Link>
          {!user && (
            <Link href="/auth" className="top-pill top-pill-primary" title="Login">Login</Link>
          )}
        </div>
      </header>

      <nav className="bottom-nav">
        {bottomItems.map((item) => {
          const active =
            item.href === "/"
              ? location === "/"
              : location === item.href || location.startsWith(item.href + "/");
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
