import React, { useState, useEffect } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { ref, onValue } from "firebase/database";
import { db, rtdb } from "../utils/firebase"; // Make sure rtdb is exported from your firebase config
import { useAuth } from "../context/AuthContext";

function fmt(n) {
  if (!n) return "0";
  if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
  if (n >= 1000) return (n / 1000).toFixed(1) + "K";
  return String(n);
}

export default function CreatorDashboard() {
  const { user, profile } = useAuth();
  const [reels, setReels] = useState([]);
  const [stories, setStories] = useState([]);
  const [ads, setAds] = useState([]);
    const [realFollowersCount, setRealFollowersCount] = useState(0);
  const [liveViews, setLiveViews] = useState(0);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState(30);

  useEffect(() => {
    if (!user?.uid) return;
    setLoading(true);

    // 1. Realtime Database (RTDB) Live Views Listener
    let unsubRtdb = () => {};
    if (rtdb) {
      const liveViewsRef = ref(rtdb, `live-views/${user.uid}`);
      unsubRtdb = onValue(liveViewsRef, (snapshot) => {
        setLiveViews(snapshot.val() || 0);
      });
    }

    // 2. Firestore Reels Listener
    const qReels = query(collection(db, "reels"), where("userId", "==", user.uid));
    const unsubReels = onSnapshot(qReels, (snap) => {
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setReels(data);
    });

    // 3. Firestore Stories Listener
    const qStories = query(collection(db, "stories"), where("userId", "==", user.uid));
    const unsubStories = onSnapshot(qStories, (snap) => {
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setStories(data);
    });

    // 4. Firestore Advertisements Listener
    const qAds = query(collection(db, "advertisements"), where("userId", "==", user.uid));
    const unsubAds = onSnapshot(qAds, (snap) => {
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setAds(data);
      setLoading(false);
    });
        // 5. Realtime Followers Count
    const qFollowers = query(collection(db, "followers"), where("targetUserId", "==", user.uid));
    const unsubFollowers = onSnapshot(qFollowers, (snap) => {
      setRealFollowersCount(snap.size);
    });

    return () => {
      unsubRtdb();
      unsubReels();
      unsubStories();
      unsubAds();
      unsubFollowers();
    };
  }, [user?.uid]);

  // Date Filtering (Range Filter)
  const cutoffTime = Date.now() - range * 24 * 60 * 60 * 1000;
  const filteredReels = reels.filter((r) => {
    const time = r.createdAt?.toMillis ? r.createdAt.toMillis() : (r.createdAt?.seconds * 1000 || Date.now());
    return time >= cutoffTime;
  });

  // Aggregate Metrics
  const totalViews = filteredReels.reduce((s, r) => s + (Number(r.views) || 0), 0) + liveViews;
  const totalLikes = filteredReels.reduce((s, r) => s + (Number(r.likes) || 0), 0);
  const totalComments = filteredReels.reduce((s, r) => s + (Number(r.comments) || 0), 0);
  const totalShares = filteredReels.reduce((s, r) => s + (Number(r.shares) || 0), 0);

  const totalAdViews = ads.reduce((s, a) => s + (Number(a.viewsCount || a.views) || 0), 0);
  const totalAdBudget = ads.reduce((s, a) => s + (Number(a.price) || 0), 0);

  const likeRate = totalViews > 0 ? ((totalLikes / totalViews) * 100).toFixed(1) + "%" : "0%";

  // Dynamic Country / Location Breakdown from Reels Data
  const countryCounts = {};
  filteredReels.forEach((r) => {
    const country = r.country || profile?.country || "Global";
    countryCounts[country] = (countryCounts[country] || 0) + 1;
  });

  const countryList = Object.entries(countryCounts)
    .map(([name, count]) => ({
      name,
      percent: Math.round((count / (filteredReels.length || 1)) * 100),
    }))
    .slice(0, 4);

  if (loading) {
    return (
      <div style={{ padding: "30px", textAlign: "center", color: "#9ca3af" }}>
        ⚡ Syncing Live Firebase Analytics...
      </div>
    );
  }

  return (
    <div className="creator-dashboard" style={{ color: "#fff", padding: "12px" }}>
      {/* Header & Date Range Buttons */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
        <h3 style={{ margin: 0 }}>📊 Live Creator Analytics</h3>
        <div>
          {[1, 7, 30].map((d) => (
            <button
              key={d}
              onClick={() => setRange(d)}
              style={{
                background: range === d ? "#10b981" : "#1f2937",
                color: "#fff",
                border: "none",
                padding: "6px 12px",
                borderRadius: "16px",
                marginLeft: "6px",
                fontSize: "12px",
                cursor: "pointer",
                fontWeight: range === d ? "bold" : "normal",
              }}
            >
              {d === 1 ? "Today" : `${d} Days`}
            </button>
          ))}
        </div>
      </div>

      {/* Main Realtime Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px", marginBottom: "20px" }}>
        <div style={{ background: "#1f2937", padding: "12px", borderRadius: "10px", textAlign: "center" }}>
          <span style={{ fontSize: "20px" }}>👁️</span>
          <div style={{ fontSize: "18px", fontWeight: "bold", marginTop: "4px" }}>{fmt(totalViews)}</div>
          <div style={{ fontSize: "11px", color: "#9ca3af" }}>Total Views</div>
        </div>

        <div style={{ background: "#1f2937", padding: "12px", borderRadius: "10px", textAlign: "center" }}>
          <span style={{ fontSize: "20px" }}>❤️</span>
          <div style={{ fontSize: "18px", fontWeight: "bold", marginTop: "4px" }}>{fmt(totalLikes)}</div>
          <div style={{ fontSize: "11px", color: "#9ca3af" }}>Total Likes</div>
        </div>

        <div style={{ background: "#1f2937", padding: "12px", borderRadius: "10px", textAlign: "center" }}>
          <span style={{ fontSize: "20px" }}>🎬</span>
          <div style={{ fontSize: "18px", fontWeight: "bold", marginTop: "4px" }}>{filteredReels.length}</div>
          <div style={{ fontSize: "11px", color: "#9ca3af" }}>Reels Count</div>
        </div>

                  <div style={{ background: "#1f2937", padding: "12px", borderRadius: "10px", textAlign: "center" }}>
            <span style={{ fontSize: "20px" }}>👥</span>
            <div style={{ fontSize: "18px", fontWeight: "bold", marginTop: "4px" }}>
              {fmt(realFollowersCount || 0)}
            </div>
            <div style={{ fontSize: "11px", color: "#9ca3af" }}>Followers</div>
          </div>

        <div style={{ background: "#1f2937", padding: "12px", borderRadius: "10px", textAlign: "center" }}>
          <span style={{ fontSize: "20px" }}>💬</span>
          <div style={{ fontSize: "18px", fontWeight: "bold", marginTop: "4px" }}>{fmt(totalComments)}</div>
          <div style={{ fontSize: "11px", color: "#9ca3af" }}>Comments</div>
        </div>

        <div style={{ background: "#1f2937", padding: "12px", borderRadius: "10px", textAlign: "center" }}>
          <span style={{ fontSize: "20px" }}>🚀</span>
          <div style={{ fontSize: "18px", fontWeight: "bold", marginTop: "4px" }}>{fmt(totalShares)}</div>
          <div style={{ fontSize: "11px", color: "#9ca3af" }}>Shares</div>
        </div>

        <div style={{ background: "#1f2937", padding: "12px", borderRadius: "10px", textAlign: "center" }}>
          <span style={{ fontSize: "20px" }}>📸</span>
          <div style={{ fontSize: "18px", fontWeight: "bold", marginTop: "4px" }}>{stories.length}</div>
          <div style={{ fontSize: "11px", color: "#9ca3af" }}>Stories</div>
        </div>

        <div style={{ background: "#1f2937", padding: "12px", borderRadius: "10px", textAlign: "center" }}>
          <span style={{ fontSize: "20px" }}>📈</span>
          <div style={{ fontSize: "18px", fontWeight: "bold", marginTop: "4px" }}>{likeRate}</div>
          <div style={{ fontSize: "11px", color: "#9ca3af" }}>Like Rate</div>
        </div>
      </div>

      {/* 📢 Live Advertisement Analytics */}
      {ads.length > 0 && (
        <div style={{ background: "#1f2937", padding: "16px", borderRadius: "12px", marginBottom: "20px" }}>
          <h4 style={{ margin: "0 0 12px 0", color: "#f59e0b" }}>📢 Live Ads Campaigns</h4>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
            <span>Active Ads: <b>{ads.length}</b></span>
            <span>Ad Views: <b>{fmt(totalAdViews)}</b></span>
            <span>Total Budget: <b>₹{totalAdBudget}</b></span>
          </div>
        </div>
      )}

      {/* 🌐 Global Audience & Location Breakdown */}
      <div style={{ background: "#1f2937", padding: "16px", borderRadius: "12px" }}>
        <h4 style={{ margin: "0 0 12px 0" }}>🌍 Global Audience Insights</h4>

        {/* Dynamic Country List */}
        <div style={{ fontSize: "12px" }}>
          <p style={{ color: "#9ca3af", marginBottom: "8px" }}>Top Viewer Countries</p>
          {countryList.length > 0 ? (
            countryList.map((c) => (
              <div key={c.name} style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                <span>🌐 {c.name}</span>
                <span style={{ fontWeight: "bold" }}>{c.percent}%</span>
              </div>
            ))
          ) : (
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>🌐 Worldwide (Global)</span>
              <span style={{ fontWeight: "bold" }}>100%</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
