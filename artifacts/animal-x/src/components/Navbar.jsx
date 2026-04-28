import { Link, useLocation } from "wouter";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

const bottomItems = [
  { href: "/", label: "Home", icon: "🏠" },
  { href: "/animals", label: "Animals", icon: "🐾" },
  { href: "/map", label: "Map", icon: "🗺️" },
  { href: "/chat", label: "Chat", icon: "🤖" },
  { href: "/profile", label: "Profile", icon: "👤" },
];

export default function Navbar() {
  const [location] = useLocation();
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <>
      <header className="topbar">
        <Link href="/" className="brand-link">
          <span className="brand-icon">🦁</span>
          <span className="brand-name">Animal X</span>
        </Link>
        <div className="topbar-actions">
          <Link href="/reels" className={`top-pill ${location === "/reels" ? "active" : ""}`} title="Reels">🎬</Link>
          <Link href="/travel" className={`top-pill ${location === "/travel" ? "active" : ""}`} title="Travel">✈️</Link>
          <button
            className="top-pill"
            onClick={toggleTheme}
            title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {theme === "dark" ? "☀️" : "🌙"}
          </button>
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
