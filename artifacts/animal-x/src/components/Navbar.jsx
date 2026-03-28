import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "../context/AuthContext";

const navItems = [
  { href: "/", label: "Home", icon: "🏠" },
  { href: "/animals", label: "Animals", icon: "🐾" },
  { href: "/map", label: "Map", icon: "🗺️" },
  { href: "/reels", label: "Reels", icon: "🎬" },
  { href: "/travel", label: "Travel", icon: "✈️" },
  { href: "/chat", label: "Chat", icon: "🤖" },
  { href: "/premium", label: "Premium", icon: "👑" },
  { href: "/help", label: "Help", icon: "💬" },
];

export default function Navbar() {
  const [location] = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, isPremium } = useAuth();

  return (
    <nav className="navbar">
      <div className="nav-brand">
        <Link href="/" className="brand-link">
          <span className="brand-icon">🦁</span>
          <span className="brand-name">Animal X</span>
        </Link>
      </div>

      <div className={`nav-links ${menuOpen ? "open" : ""}`}>
        {navItems.map(item => (
          <Link
            key={item.href}
            href={item.href}
            className={`nav-link ${location === item.href ? "active" : ""} ${item.href === "/premium" ? "premium-link" : ""}`}
            onClick={() => setMenuOpen(false)}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
            {item.href === "/premium" && isPremium && <span className="nav-premium-dot">✓</span>}
          </Link>
        ))}
        <Link
          href="/auth"
          className={`nav-link auth-nav-link ${location === "/auth" ? "active" : ""}`}
          onClick={() => setMenuOpen(false)}
        >
          <span className="nav-icon">👤</span>
          <span className="nav-label">{user ? user.name?.split(" ")[0] || "Account" : "Login"}</span>
        </Link>
      </div>

      <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
        {menuOpen ? "✕" : "☰"}
      </button>
    </nav>
  );
}
