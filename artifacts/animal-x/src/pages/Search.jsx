import { useState, useMemo, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
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

function fuzzyScore(username, query) {
  const u = username.toLowerCase();
  const q = query.toLowerCase().replace(/\s+/g, "");
  if (u === q) return 100;
  if (u.startsWith(q)) return 90;
  if (u.includes(q)) return 70;
  // character-level fuzzy
  let qi = 0;
  let score = 0;
  for (let ui = 0; ui < u.length && qi < q.length; ui++) {
    if (u[ui] === q[qi]) { score += 10; qi++; }
  }
  return qi === q.length ? score : 0;
}

export default function Search() {
  const [query, setQuery] = useState("");
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const { following, followUser, unfollowUser } = useSocial();
  const inputRef = useRef(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const results = useMemo(() => {
    const q = query.trim();
    if (!q) return ALL_USERS.slice(0, 30);
    return ALL_USERS
      .map(u => ({ ...u, score: fuzzyScore(u.username, q) + fuzzyScore(u.name, q) * 0.5 }))
      .filter(u => u.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 50);
  }, [query]);

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
            placeholder="Search wildlife creators…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            autoFocus
          />
          {query && <button className="search-clear" onClick={() => setQuery("")}>✕</button>}
        </div>
      </div>

      <div className="search-section-label">
        {query ? `${results.length} results for "${query}"` : "Popular Creators"}
      </div>

      <div className="search-results">
        {results.map(u => {
          const isFollowing = !!following[u.id];
          const isOwn = user?.uid === u.id;
          return (
            <div key={u.id} className="search-user-card">
              <Link href={`/user/${u.id}`} className="search-user-left">
                <div className="search-avatar">{u.avatar || u.username[0].toUpperCase()}</div>
                <div className="search-user-info">
                  <div className="search-username">
                    @{u.username}
                    {u.verified && <BlueTick size={14} />}
                  </div>
                  <div className="search-name">{u.name}</div>
                  <div className="search-meta">
                    <span>{fmtNum(u.followers)} followers</span>
                    <span className="search-dot">·</span>
                    <span>📍 {u.country}</span>
                  </div>
                </div>
              </Link>
              {!isOwn && user && (
                <button
                  className={`search-follow-btn ${isFollowing ? "following" : ""}`}
                  onClick={() => isFollowing ? unfollowUser(u.id) : followUser(u.id, u.username)}
                >
                  {isFollowing ? "✓" : "+ Follow"}
                </button>
              )}
            </div>
          );
        })}
        {results.length === 0 && (
          <div className="search-empty">
            <div style={{ fontSize: "2.5rem" }}>🔍</div>
            <div>No creators found for "{query}"</div>
          </div>
        )}
      </div>
    </div>
  );
}
