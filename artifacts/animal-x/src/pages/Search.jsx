import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useLocation, useSearch } from "wouter";
import {
  collection, query, orderBy, limit, where,
  getDocs, startAt, endAt, doc, getDoc
} from "firebase/firestore";
import { db } from "../utils/firebase";
import { useAuth } from "../context/AuthContext";
import { useSocial } from "../context/SocialContext";
import BlueTick from "../components/BlueTick";

function fmt(n) {
  if (!n) return "0";
  if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
  if (n >= 1000) return (n / 1000).toFixed(1) + "K";
  return String(n);
}

function resolveUrl(path) {
  if (!path) return null;
  if (path.startsWith("data:") || path.startsWith("http")) return path;
  return null;
}

const CATS = ["All","Mammals","Birds","Aquatic","Reptiles","Small Creatures","Mountains","Sea","Desert"];

export default function Search() {
  const [q, setQ] = useState("");
  const [tab, setTab] = useState("users"); // users | reels | hashtags
  const [catFilter, setCatFilter] = useState("All");
  const [users, setUsers] = useState([]);
  const [reels, setReels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [, navigate] = useLocation();
  const searchStr = useSearch();
  const { user } = useAuth();
  const { following, followUser, unfollowUser } = useSocial();
  const inputRef = useRef(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
    const params = new URLSearchParams(searchStr);
    const qParam = params.get("q");
    if (qParam) {
      setQ(qParam);
      runSearch(qParam);
    }
  }, []);

  const runSearch = useCallback(async (searchQ) => {
    const trimmed = (searchQ || q).trim().replace(/^@/, "").toLowerCase();
    if (!trimmed) return;
    setLoading(true);
    setSearched(true);

    try {
      // Search users by email prefix, name, or username
      const [byName, byEmail] = await Promise.all([
        getDocs(query(
          collection(db, "users"),
          orderBy("name"),
          startAt(trimmed),
          endAt(trimmed + "\uf8ff"),
          limit(20)
        )).catch(() => ({ docs: [] })),
        getDocs(query(
          collection(db, "users"),
          orderBy("email"),
          startAt(trimmed),
          endAt(trimmed + "\uf8ff"),
          limit(20)
        )).catch(() => ({ docs: [] })),
      ]);

      const seen = new Set();
      const userResults = [];
      [...byName.docs, ...byEmail.docs].forEach(d => {
        if (!seen.has(d.id)) {
          seen.add(d.id);
          userResults.push({ uid: d.id, ...d.data() });
        }
      });

      // Also search all users and filter client-side for username/bio matches
      const allUsersSnap = await getDocs(query(collection(db, "users"), limit(200)));
      allUsersSnap.docs.forEach(d => {
        if (!seen.has(d.id)) {
          const data = d.data();
          const match = [data.name, data.username, data.email, data.bio, data.country]
            .filter(Boolean).join(" ").toLowerCase();
          if (match.includes(trimmed)) {
            seen.add(d.id);
            userResults.push({ uid: d.id, ...data });
          }
        }
      });

      const enrichedUsers = await Promise.all(
  userResults.map(async (u) => {
    try {
      const followDoc = await getDoc(doc(db, "userFollowers", u.uid));
      if (followDoc.exists()) {
        const followersMap = followDoc.data().followers || {};
        const count = Object.keys(followersMap).length;
        return { ...u, followersCount: count };
      }
    } catch (e) {
      console.error(e);
    }
    return { ...u, followersCount: 0 };
  })
);

setUsers(enrichedUsers);

      // Search reels by title, hashtags, or category
      const reelsSnap = await getDocs(query(
        collection(db, "reels"),
        orderBy("createdAt", "desc"),
        limit(200)
      ));
      const reelResults = reelsSnap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .filter(r => {
          const text = [r.title, r.desc, r.hashtags, r.category, r.location]
            .filter(Boolean).join(" ").toLowerCase();
          const catMatch = catFilter === "All" || r.category === catFilter;
          return text.includes(trimmed) && catMatch;
        });
      setReels(reelResults);
    } catch {}

    setLoading(false);
  }, [q, catFilter]);

  function handleInput(val) {
    setQ(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (val.trim().length >= 2) {
      debounceRef.current = setTimeout(() => runSearch(val), 400);
    } else {
      setUsers([]); setReels([]); setSearched(false);
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (debounceRef.current) clearTimeout(debounceRef.current);
    runSearch(q);
  }

  // Filter reels by category
  const filteredReels = catFilter === "All" ? reels : reels.filter(r => r.category === catFilter);

  // Extract hashtags from reels
  const hashtagMap = {};
  reels.forEach(r => {
    if (!r.hashtags) return;
    String(r.hashtags).split(/[\s,]+/).filter(h => h.startsWith("#")).forEach(h => {
      hashtagMap[h] = (hashtagMap[h] || 0) + 1;
    });
  });
  const hashtags = Object.entries(hashtagMap).sort((a, b) => b[1] - a[1]).slice(0, 20);

  return (
    <div className="search-page">
      {/* Search bar */}
      <form className="search-bar-wrap" onSubmit={handleSubmit}>
        <div className="search-bar">
          <span className="search-bar-icon">🔍</span>
          <input
            ref={inputRef}
            className="search-bar-input"
            type="search"
            value={q}
            onChange={e => handleInput(e.target.value)}
            placeholder="Search users, reels, #hashtags…"
            autoComplete="off"
          />
          {q && (
            <button type="button" className="search-clear-btn" onClick={() => { setQ(""); setUsers([]); setReels([]); setSearched(false); }}>✕</button>
          )}
        </div>
        <button type="submit" className="search-submit-btn">Search</button>
      </form>

      {/* Tabs */}
      {searched && (
        <div className="search-tabs">
          <button className={`search-tab ${tab === "users" ? "active" : ""}`} onClick={() => setTab("users")}>
            👥 Users {users.length > 0 && `(${users.length})`}
          </button>
          <button className={`search-tab ${tab === "reels" ? "active" : ""}`} onClick={() => setTab("reels")}>
            🎬 Reels {filteredReels.length > 0 && `(${filteredReels.length})`}
          </button>
          <button className={`search-tab ${tab === "hashtags" ? "active" : ""}`} onClick={() => setTab("hashtags")}>
            # Hashtags {hashtags.length > 0 && `(${hashtags.length})`}
          </button>
        </div>
      )}

      {/* Category filter (for reels tab) */}
      {searched && tab === "reels" && (
        <div className="search-cat-row">
          {CATS.map(c => (
            <button
              key={c}
              className={`search-cat-pill ${catFilter === c ? "active" : ""}`}
              onClick={() => setCatFilter(c)}
            >
              {c}
            </button>
          ))}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="search-loading">
          <div style={{ fontSize: "2.5rem" }}>🔍</div>
          <p>Searching…</p>
        </div>
      )}

      {/* Empty state (not searched yet) */}
      {!loading && !searched && (
        <div className="search-discovery">
          <div className="search-discovery-title">🌍 Discover Wildlife</div>
          <div className="search-discovery-tip">Search for creators, reels, and wildlife hashtags</div>
          <div className="search-discovery-grid">
            {["🦁 Lion", "🐘 Elephant", "🦅 Eagle", "🐬 Dolphin", "🦁 Wildlife", "🌿 Conservation"].map(s => (
              <button
                key={s}
                className="search-quick-pill"
                onClick={() => { const q2 = s.split(" ").slice(1).join(" "); setQ(q2); runSearch(q2); }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* No results */}
      {!loading && searched && users.length === 0 && reels.length === 0 && (
        <div className="search-no-results">
          <div style={{ fontSize: "3rem" }}>🔍</div>
          <h3>No results for "{q}"</h3>
          <p>Try a different keyword, username, or hashtag</p>
        </div>
      )}

      {/* Users tab */}
      {!loading && searched && tab === "users" && (
        <div className="search-results">
          {users.length === 0 ? (
            <div className="search-no-results">
              <div style={{ fontSize: "2rem" }}>👤</div>
              <p>No users found for "{q}"</p>
            </div>
          ) : (
            users.map(u => {
              const isFollowingU = !!following[u.uid];
              const isOwn = user?.uid === u.uid;
              const photoUrl = resolveUrl(u.photo || u.avatar || null);
              const isVerified = u.manualVerified || u.verified || false;
              return (
                <div key={u.uid} className="search-user-card">
                  <Link href={`/user/${u.uid}`} className="search-user-left">
                    {photoUrl
                      ? <img src={photoUrl} alt={u.name} className="search-user-avatar-img" />
                      : <div className="search-user-avatar">{(u.name || u.email || "U")[0].toUpperCase()}</div>
                    }
                    <div className="search-user-info">
                      <div className="search-user-name">
                        {u.name || u.email?.split("@")[0]}
                        {isVerified && <BlueTick size={14} />}
                      </div>
                      <div className="search-user-handle">
                        @{u.username || u.email?.split("@")[0]}
                      </div>
                      {u.country && <div className="search-user-country">📍 {u.country}</div>}
                      <div className="search-user-meta">
  <span>👥 {fmt(u.followersCount ?? 0)}</span>
  {(u.reels || 0) > 0 && <span>🎬 {fmt(u.reels)} reels</span>}
</div>
                    </div>
                  </Link>
                  {!isOwn && user && (
                    <button
                      className={`search-follow-btn ${isFollowingU ? "following" : ""}`}
                      onClick={() => isFollowingU ? unfollowUser(u.uid) : followUser(u.uid, u.username || u.name)}
                    >
                      {isFollowingU ? "✓" : "+ Follow"}
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Reels tab */}
      {!loading && searched && tab === "reels" && (
        <div className="search-reels-grid">
          {filteredReels.length === 0 ? (
            <div className="search-no-results">
              <div style={{ fontSize: "2rem" }}>🎬</div>
              <p>No reels found for "{q}"</p>
            </div>
          ) : (
            filteredReels.map(r => {
              const videoUrl = resolveUrl(r.videoUrl);
              const thumbUrl = resolveUrl(r.thumbnailUrl);
              return (
                <Link key={r.id} href={`/reels`} className="search-reel-thumb">
                  {thumbUrl
                    ? <img src={thumbUrl} alt={r.title} className="search-reel-img" />
                    : videoUrl
                      ? <video src={videoUrl} muted playsInline preload="metadata" className="search-reel-img" />
                      : <div className="search-reel-placeholder">🦁</div>
                  }
                  <div className="search-reel-overlay">
                    <div className="search-reel-title">{r.title}</div>
                    <div className="search-reel-meta">
                      ❤️ {fmt(r.likes || 0)} · 👁️ {fmt(r.views || 0)}
                    </div>
                  </div>
                </Link>
              );
            })
          )}
        </div>
      )}

      {/* Hashtags tab */}
      {!loading && searched && tab === "hashtags" && (
        <div className="search-hashtags">
          {hashtags.length === 0 ? (
            <div className="search-no-results">
              <div style={{ fontSize: "2rem" }}>🏷️</div>
              <p>No hashtags found for "{q}"</p>
            </div>
          ) : (
            hashtags.map(([tag, count]) => (
              <button
                key={tag}
                className="search-hashtag-row"
                onClick={() => { setQ(tag); setTab("reels"); runSearch(tag); }}
              >
                <span className="search-hashtag-tag">{tag}</span>
                <span className="search-hashtag-count">{count} reel{count !== 1 ? "s" : ""}</span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
