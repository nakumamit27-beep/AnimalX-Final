import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "../context/AuthContext";

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
  const { user } = useAuth();
  const [searchValue, setSearchValue] = useState("");

  function submitSearch(e) {
    e.preventDefault();
    const q = searchValue.trim();
    if (!q) return;
    navigate(`/animals?q=${encodeURIComponent(q)}`);
    setSearchValue("");
  }

  return (
    <>
      <header className="topbar">
        <Link href="/" className="brand-link">
          <span className="brand-icon">🦁</span>
          <span className="brand-name">Animal X</span>
        </Link>

        <form className="topbar-search" onSubmit={submitSearch} role="search">
          <span className="topbar-search-icon">🔍</span>
          <input
            type="search"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Search animals…"
            aria-label="Search animals"
          />
        </form>

        <div className="topbar-actions">
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
