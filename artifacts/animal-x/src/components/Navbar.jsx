import { useState } from "react";
import { Link, useLocation } from "wouter";

const navItems = [
  { href: "/", label: "Home", icon: "🏠" },
  { href: "/animals", label: "Animals", icon: "🐾" },
  { href: "/map", label: "Map", icon: "🗺️" },
  { href: "/reels", label: "Reels", icon: "🎬" },
  { href: "/travel", label: "Travel", icon: "✈️" },
  { href: "/chat", label: "Chat", icon: "🤖" },
  { href: "/help", label: "Help", icon: "💬" },
];

export default function Navbar() {
  const [location] = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

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
            className={`nav-link ${location === item.href ? "active" : ""}`}
            onClick={() => setMenuOpen(false)}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </Link>
        ))}
      </div>

      <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
        {menuOpen ? "✕" : "☰"}
      </button>
    </nav>
  );
}
