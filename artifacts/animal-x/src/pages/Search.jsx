import { useState, useMemo, useEffect, useRef } from "react";
import { Link, useLocation, useSearch } from "wouter";
import { ALL_USERS } from "../data/demoUsers";
import { useAuth } from "../context/AuthContext";
import { useSocial } from "../context/SocialContext";
import BlueTick from "../components/BlueTick";

function fmtNum(n) {
  if (!n) return "0";
  if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
  if (n >= 1000) return (n / 1000).toFixed(1) + "K";
  return String(n);
}

function score(user, q) {
  const lq = q.toLowerCase().trim().replace(/^@/, "");
  const un = (user.username || "").toLowerCase();
  const nm = (user.name || "").toLowerCase();
  const ct = (user.country || "").toLowerCase();
  const bi = (user.bio || "").toLowerCase();
  let s = 0;
  if (un === lq || nm === lq) s += 100;
  if (un.startsWith(lq) || nm.startsWith(lq)) s += 80;
  if (un.includes(lq)) s += 60;
  if (nm.includes(lq)) s += 50;
  if (ct.includes(lq)) s += 40;
  if (bi.includes(lq)) s += 20;
  return s;
}

const CATS = [
  { label: "All", icon: "🌍" },
  { label: "Mammals", icon: "🦁" },
  { label: "Birds", icon: "🦅" },
  { label: "Aquatic", icon: "🐬" },
  { label: "Reptiles", icon: "🐍" },
  { label: "Desert", icon: "🏜️" },
  { label: "Mountains", icon: "🏔️" },
];

export default function Search() {
  const [query, setQuery] = useState("");
  const [catFilter, setCatFilter] = useState("All");
  const [sortBy, setSortBy] = useState("followers");
  const [, navigate] = useLocation();
  const searchStr = useSearch();
  const { user } = useAuth();
  const { following, followUser, unfollowUser } = useSocial();
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
    const params = new URLSearchParams(searchStr);
    const q = params.get("q");
    if (q) setQuery(q);
  }, []);

  const results = useMemo(() => {
    let list = [...ALL_USERS];
    if (catFilter !== "All") {
      list = list.filter(u =>
        u.bio?.toLowerCase().includes(catFilter.toLowerCase()) ||
        u.username?.toLowerCase().includes(catFilter.toLowerCase())
      );
    }
    if (query.trim()) {
      const q = query.trim();
      list = list
        .map(u => ({ ...u, _score: score(u, q) }))
        .filter(u => u._score > 0)
        .sort((a, b) => b._score - a._score);
    } else {
      list = list.sort((a, b) =>
        sortBy === "followers" ? (b.followers || 0) - (a.followers || 0) :
        sortBy === "reels" ? (b.reelCount || 0) - (a.reelCount || 0) :
        0
      );
    }
    return list.slice(0, 80);
  }, [query, catFilter, sortBy]);

  return (
    <div className="search-page">
      <div className="search-header">
        <button className="search-back-btn" onClick={() => navigate(-1)}>←</button>
        <div className="search-input-wrap">
          <span className="search-icon-inner">🔍</span>
          <input
            ref={inputRef}
            className="search-main-input"
            type="text"
            placeholder="Search @username, name, country…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            autoComplete="off"
            spellCheck={false}
          />
          {query && (
            <button className="search-clear-btn" onClick={() => setQuery("")}>✕</button>
          )}
        </div>
      </div>

      <div className="search-filter-row">
        <div className="search-cats">
          {CATS.map(c => (
            <button
              key={c.label}
              className={`search-cat-pill ${catFilter === c.label ? "active" : ""}`}
              onClick={() => setCatFilter(c.label)}
            >{c.icon} {c.label}</button>
          ))}
        </div>
        <div className="search-sort-row">
          <span className="search-sort-label">Sort:</span>
          <select className="search-sort-sel" value={sortBy} onChange={e => setSortBy(e.target.value)}>
            <option value="followers">Followers</option>
            <option value="reels">Reels</option>
          </select>
        </div>
      </div>

      <div className="search-results-count">
        {query ? `${results.length} results for "${query}"` : `${results.length} creators`}
      </div>

      <div className="search-results">
        {results.length === 0 ? (
          <div className="search-empty">
            <div style={{ fontSize: "3rem" }}>🔍</div>
            <p>No creators found for "{query}"</p>
          </div>
        ) : (
          results.map(u => {
            const isFollowing = !!following[u.id];
            const isMe = user?.uid === u.id;
            return (
              <div key={u.id} className="search-user-card">
                <Link href={`/user/${u.id}`} className="search-user-main">
                  <div className="search-user-avatar">{u.avatar || u.name?.[0] || "🐾"}</div>
                  <div className="search-user-info">
                    <div className="search-user-name">
                      {u.name}
                      {u.verified && <BlueTick size={14} />}
                    </div>
                    <div className="search-user-handle">@{u.username}</div>
                    {u.country && <div className="search-user-country">📍 {u.country}</div>}
                    {u.bio && <div className="search-user-bio">{u.bio.length > 60 ? u.bio.slice(0, 60) + "…" : u.bio}</div>}
                  </div>
                </Link>
                <div className="search-user-right">
                  <div className="search-user-stats">
                    <span>{fmtNum(u.followers)}</span>
                    <span className="search-stat-label">followers</span>
                  </div>
                  {!isMe && (
                    <button
                      className={`search-follow-btn ${isFollowing ? "following" : ""}`}
                      onClick={() => {
                        if (!user) { navigate("/auth"); return; }
                        isFollowing ? unfollowUser(u.id) : followUser(u.id);
                      }}
                    >
                      {isFollowing ? "Following" : "+ Follow"}
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
