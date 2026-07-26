import { useState, useEffect } from "react";
import {
  collection, query, where, getDocs, orderBy, limit
} from "firebase/firestore";
import { db } from "../utils/firebase";
import { useAuth } from "../context/AuthContext";

function fmt(n) {
  if (!n) return "0";
  if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
  if (n >= 1000) return (n / 1000).toFixed(1) + "K";
  return String(n);
}

function timeLabel(days) {
  if (days === 1) return "Today";
  if (days === 7) return "7 days";
  if (days === 30) return "30 days";
  return `${days} days`;
}

export default function CreatorDashboard() {
  const { user, profile } = useAuth();
  const [reels, setReels] = useState([]);
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState(30); // days

  useEffect(() => {
    if (!user?.uid) return;
    setLoading(true);

    Promise.all([
      getDocs(query(
        collection(db, "reels"),
        where("userId", "==", user.uid),
        orderBy("createdAt", "desc"),
        limit(100)
      )).catch(() => ({ docs: [] })),
      getDocs(query(
        collection(db, "stories"),
        where("userId", "==", user.uid),
        orderBy("createdAt", "desc"),
        limit(50)
      )).catch(() => ({ docs: [] })),
    ]).then(([reelSnap, storySnap]) => {
      setReels(reelSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      setStories(storySnap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
  }, [user?.uid]);

  // Compute aggregate stats
  const totalViews   = reels.reduce((s, r) => s + (r.views    || 0), 0);
  const totalLikes   = reels.reduce((s, r) => s + (r.likes    || 0), 0);
  const totalComments= reels.reduce((s, r) => s + (r.comments || 0), 0);
  const totalShares  = reels.reduce((s, r) => s + (r.shares   || 0), 0);

  // Reels within the selected range
  const cutoff = Date.now() - range * 86400000;
  const recentReels = reels.filter(r => {
    const ms = r.createdAt?.toMillis?.() || r.createdAt?.seconds * 1000 || 0;
    return ms >= cutoff;
  });
  const rangeViews = recentReels.reduce((s, r) => s + (r.views || 0), 0);
  const rangeLikes = recentReels.reduce((s, r) => s + (r.likes || 0), 0);

  // Top reels by views
  const topReels = [...reels]
    .sort((a, b) => (b.views || 0) - (a.views || 0))
    .slice(0, 5);

  // Category breakdown
  const catMap = {};
  reels.forEach(r => {
    const c = r.category || "Uncategorized";
    catMap[c] = (catMap[c] || 0) + 1;
  });
  const catBreakdown = Object.entries(catMap).sort((a, b) => b[1] - a[1]);

  // Uploads per week (last 12 weeks)
  const weekBuckets = Array.from({ length: 8 }, (_, i) => {
    const start = Date.now() - (i + 1) * 7 * 86400000;
    const end   = Date.now() - i * 7 * 86400000;
    const count = reels.filter(r => {
      const ms = r.createdAt?.toMillis?.() || (r.createdAt?.seconds || 0) * 1000;
      return ms >= start && ms < end;
    }).length;
    return { label: `W-${i + 1}`, count };
  }).reverse();

  const maxBucket = Math.max(1, ...weekBuckets.map(b => b.count));

  if (loading) {
    return (
      <div className="dash-loading">
        <div style={{ fontSize: "2.5rem" }}>📊</div>
        <p>Loading analytics…</p>
      </div>
    );
  }

  if (reels.length === 0) {
    return (
      <div className="dash-empty">
        <div style={{ fontSize: "3rem" }}>📈</div>
        <h3>No data yet</h3>
        <p>Upload your first reel to start seeing analytics</p>
      </div>
    );
  }

  return (
    <div className="creator-dashboard">

      {/* Range selector */}
      <div className="dash-range-row">
        <span className="dash-range-label">📊 Analytics</span>
        <div className="dash-range-pills">
          {[1, 7, 30].map(d => (
            <button
              key={d}
              className={`dash-range-pill ${range === d ? "active" : ""}`}
              onClick={() => setRange(d)}
            >
              {timeLabel(d)}
            </button>
          ))}
        </div>
      </div>

      {/* Stat cards */}
      <div className="dash-stat-grid">
        <div className="dash-stat-card views">
          <div className="dash-stat-icon">👁️</div>
          <div className="dash-stat-val">{fmt(totalViews)}</div>
          <div className="dash-stat-label">Total Views</div>
          <div className="dash-stat-range">+{fmt(rangeViews)} in {timeLabel(range)}</div>
        </div>
        <div className="dash-stat-card likes">
          <div className="dash-stat-icon">❤️</div>
          <div className="dash-stat-val">{fmt(totalLikes)}</div>
          <div className="dash-stat-label">Total Likes</div>
          <div className="dash-stat-range">+{fmt(rangeLikes)} in {timeLabel(range)}</div>
        </div>
        <div className="dash-stat-card reels">
          <div className="dash-stat-icon">🎬</div>
          <div className="dash-stat-val">{reels.length}</div>
          <div className="dash-stat-label">Total Reels</div>
          <div className="dash-stat-range">{recentReels.length} in {timeLabel(range)}</div>
        </div>
        <div className="dash-stat-card followers">
          <div className="dash-stat-icon">👥</div>
          <div className="dash-stat-val">{fmt(profile?.followers || 0)}</div>
          <div className="dash-stat-label">Followers</div>
          <div className="dash-stat-range">{fmt(profile?.following || 0)} following</div>
        </div>
        <div className="dash-stat-card comments">
          <div className="dash-stat-icon">💬</div>
          <div className="dash-stat-val">{fmt(totalComments)}</div>
          <div className="dash-stat-label">Comments</div>
        </div>
        <div className="dash-stat-card shares">
          <div className="dash-stat-icon">↗️</div>
          <div className="dash-stat-val">{fmt(totalShares)}</div>
          <div className="dash-stat-label">Shares</div>
        </div>
        <div className="dash-stat-card stories">
          <div className="dash-stat-icon">📸</div>
          <div className="dash-stat-val">{stories.length}</div>
          <div className="dash-stat-label">Stories</div>
        </div>
        <div className="dash-stat-card engagement">
          <div className="dash-stat-icon">📈</div>
          <div className="dash-stat-val">
            {totalViews > 0 ? ((totalLikes / totalViews) * 100).toFixed(1) + "%" : "—"}
          </div>
          <div className="dash-stat-label">Like Rate</div>
        </div>
      </div>

      {/* Weekly upload frequency */}
      <div className="dash-section">
        <div className="dash-section-title">📅 Weekly Uploads</div>
        <div className="dash-bar-chart">
          {weekBuckets.map((b, i) => (
            <div key={i} className="dash-bar-col">
              <div className="dash-bar-track">
                <div
                  className="dash-bar-fill"
                  style={{ height: `${(b.count / maxBucket) * 100}%` }}
                />
              </div>
              <div className="dash-bar-val">{b.count}</div>
              <div className="dash-bar-label">{b.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Top reels */}
      {topReels.length > 0 && (
        <div className="dash-section">
          <div className="dash-section-title">🏆 Top Performing Reels</div>
          <div className="dash-top-reels">
            {topReels.map((r, i) => (
              <div key={r.id} className="dash-top-reel-row">
                <div className="dash-top-reel-rank">{i + 1}</div>
                <div className="dash-top-reel-info">
                  <div className="dash-top-reel-title">{r.title || "Untitled"}</div>
                  <div className="dash-top-reel-cat">{r.category || "—"}</div>
                </div>
                <div className="dash-top-reel-stats">
                  <span>👁️ {fmt(r.views || 0)}</span>
                  <span>❤️ {fmt(r.likes || 0)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Category breakdown */}
      {catBreakdown.length > 0 && (
        <div className="dash-section">
          <div className="dash-section-title">📂 Content by Category</div>
          <div className="dash-cat-breakdown">
            {catBreakdown.map(([cat, count]) => (
              <div key={cat} className="dash-cat-row">
                <span className="dash-cat-name">{cat}</span>
                <div className="dash-cat-bar-wrap">
                  <div
                    className="dash-cat-bar-fill"
                    style={{ width: `${(count / reels.length) * 100}%` }}
                  />
                </div>
                <span className="dash-cat-count">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tips */}
      <div className="dash-tips-section">
        <div className="dash-section-title">💡 Growth Tips</div>
        <div className="dash-tips">
          {[
            { icon: "🕐", tip: "Post consistently — at least 3 reels per week for best reach" },
            { icon: "#️⃣", tip: "Use 3–5 relevant hashtags to improve discovery" },
            { icon: "📍", tip: "Add location to your reels for local audience reach" },
            { icon: "💬", tip: "Reply to comments to boost engagement rate" },
            { icon: "📸", tip: "Post Stories daily to stay visible to your followers" },
          ].map((t, i) => (
            <div key={i} className="dash-tip-row">
              <span className="dash-tip-icon">{t.icon}</span>
              <span className="dash-tip-text">{t.tip}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
