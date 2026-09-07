import React, { useState, useEffect } from "react";
import { collection, query, where, onSnapshot, doc } from "firebase/firestore";
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

    // 1. Live Views Listener (RTDB Fallback)
    let unsubRtdb = () => {};
    if (rtdb) {
      const liveViewsRef = ref(rtdb, `live-views/${user.uid}`);
      unsubRtdb = onValue(liveViewsRef, (snapshot) => {
        setLiveViews(snapshot.val() || 0);
      });
    }

    // 2. Firestore Reels Listener
    const qReels = query(
      collection(db, "reels"),
      where("userId", "==", user.uid)
    );
    const unsubReels = onSnapshot(qReels, (snap) => {
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setReels(data);
    });

    // 3. Firestore Stories Listener
    const qStories = query(
      collection(db, "stories"),
      where("userId", "==", user.uid)
    );
    const unsubStories = onSnapshot(qStories, (snap) => {
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setStories(data);
    });

    // 4. Firestore Advertisements Listener
    const qAds = query(
      collection(db, "advertisements"),
      where("userId", "==", user.uid)
    );
    const unsubAds = onSnapshot(qAds, (snap) => {
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setAds(data);
      setLoading(false);
    });

        // 5. Followers Listener (Realtime from followers collection)
    const qFollowers = query(
      collection(db, "followers"),
      where("targetUserId", "==", user.uid)
    );
    const unsubFollowers = onSnapshot(qFollowers, (snap) => {
      setRealFollowersCount(snap.size);
    }, (err) => console.error("CreatorDashboard followers error:", err));

    return () => {
      unsubRtdb();
      unsubReels();
      unsubStories();
      unsubAds();
      unsubFollowers();
    };
  }, [user?.uid]);

  // Aggregate Metrics Direct from Firestore numeric fields
  const cutoffTime = Date.now() - (range * 24 * 60 * 60 * 1000);
  const filteredReels = reels.filter((r) => {
    if (range === 30) return true;
    if (!r.createdAt) return true;
    const time = r.createdAt?.toMillis 
      ? r.createdAt.toMillis() 
      : (r.createdAt?.seconds ? r.createdAt.seconds * 1000 : new Date(r.createdAt).getTime() || Date.now());
    return time >= cutoffTime;
  });

    const totalViews = filteredReels.reduce((sum, r) => sum + (Number(r.views ?? r.viewsCount ?? 0)), 0) + Number(liveViews || 0);
  const totalLikes = filteredReels.reduce((sum, r) => sum + (Number(r.likes ?? r.likesCount ?? 0)), 0);
  const totalComments = filteredReels.reduce((sum, r) => sum + (Number(r.commentsCount ?? r.comments ?? 0)), 0);
  const totalShares = filteredReels.reduce((sum, r) => sum + (Number(r.shares ?? r.sharesCount ?? 0)), 0);

  const totalAdViews = ads.reduce((s, a) => s + (Number(a.viewsCount || a.views) || 0), 0);
  const totalAdBudget = ads.reduce((s, a) => s + (Number(a.price) || 0), 0);

  const likeRate = totalViews > 0 
    ? ((totalLikes / totalViews) * 100).toFixed(1) + "%" 
    : (totalLikes > 0 ? "100%" : "0%");

  
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
              {ads.length > 0 && (() => {
          const totalAdClicks = ads.reduce((sum, a) => sum + (Number(a.clicks) || 0), 0);
          const ctr = totalAdViews > 0 ? ((totalAdClicks / totalAdViews) * 100).toFixed(1) : "0.0";

          // Country breakdown for ads
          const adCountryMap = {};
          ads.forEach((a) => {
            if (a.countryViews && typeof a.countryViews === "object") {
              Object.entries(a.countryViews).forEach(([cName, count]) => {
                adCountryMap[cName] = (adCountryMap[cName] || 0) + Number(count || 0);
              });
            }
          });

          return (
            <div style={{ background: "#1f2937", padding: "16px", borderRadius: "12px", marginBottom: "20px" }}>
              <h4 style={{ margin: "0 0 12px 0", color: "#f59e0b", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>📢 Live Ads Campaigns</span>
                <span style={{ fontSize: "11px", color: "#9ca3af", fontWeight: "normal" }}>Realtime Tracking</span>
              </h4>

              {/* Top Stats Grid */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px", background: "#111827", padding: "10px", borderRadius: "8px", marginBottom: "14px", textAlign: "center" }}>
                <div>
                  <div style={{ fontSize: "11px", color: "#9ca3af" }}>Active Ads</div>
                  <b style={{ fontSize: "15px", color: "#fff" }}>{ads.length}</b>
                </div>
                <div>
                  <div style={{ fontSize: "11px", color: "#9ca3af" }}>Ad Views</div>
                  <b style={{ fontSize: "15px", color: "#38bdf8" }}>{fmt(totalAdViews)}</b>
                </div>
                <div>
                  <div style={{ fontSize: "11px", color: "#9ca3af" }}>Website Clicks</div>
                  <b style={{ fontSize: "15px", color: "#34d399" }}>{fmt(totalAdClicks)}</b>
                </div>
                <div>
                  <div style={{ fontSize: "11px", color: "#9ca3af" }}>CTR</div>
                  <b style={{ fontSize: "15px", color: "#f59e0b" }}>{ctr}%</b>
                </div>
              </div>

              {/* Country Audience for Ads */}
              <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "10px" }}>
                <div style={{ fontSize: "12px", color: "#9ca3af", marginBottom: "6px" }}>🌍 Top Click & View Locations:</div>
                {Object.keys(adCountryMap).length > 0 ? (
                  Object.entries(adCountryMap).slice(0, 4).map(([country, count]) => (
                    <div key={country} style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", padding: "2px 0" }}>
                      <span style={{ color: "#e5e7eb" }}>📍 {country}</span>
                      <b style={{ color: "#34d399" }}>{count} interactions</b>
                    </div>
                  ))
                ) : (
                  <div style={{ fontSize: "11px", color: "#6b7280" }}>Audience location data syncing (default: India)...</div>
                )}
              </div>
            </div>
          );
        })()}

              {/* 🌍 Global Audience & Location Breakdown (Exact & Real Progress Bar) */}
        <div style={{ background: "#1f2937", padding: "16px", borderRadius: "12px", marginTop: "16px" }}>
          <h4 style={{ margin: "0 0 8px 0", color: "#fff", display: "flex", alignItems: "center", gap: "6px" }}>
            <span>🌍</span> Global Audience Insights
          </h4>
          <p style={{ fontSize: "11px", color: "#9ca3af", margin: "0 0 14px 0" }}>Top Viewer Locations</p>

          {(() => {
            // Asli Firestore reels data se total country views nikalna
            const countryMap = {};
            let totalRealViews = 0;

            (reels || []).forEach((r) => {
              if (r.countryViews && typeof r.countryViews === "object") {
                Object.entries(r.countryViews).forEach(([cName, count]) => {
                  countryMap[cName] = (countryMap[cName] || 0) + Number(count || 0);
                  totalRealViews += Number(count || 0);
                });
              }
            });

            // Agar abhi tak koi view track nahi hua hai toh fallback list
            const displayList = totalRealViews > 0
              ? Object.entries(countryMap)
                  .map(([name, count]) => ({
                    name,
                    percent: ((count / totalRealViews) * 100).toFixed(1),
                  }))
                  .sort((a, b) => b.percent - a.percent)
                  .slice(0, 5)
              : [{ name: "India", percent: "100.0" }];

            return (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {displayList.map((item, idx) => (
                  <div key={idx} style={{ width: "100%" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#e5e7eb", marginBottom: "4px" }}>
                      <span>{item.name}</span>
                      <span style={{ fontWeight: "bold" }}>{item.percent}%</span>
                    </div>
                    {/* Pink/Magenta Instagram style progress bar */}
                    <div style={{ width: "100%", height: "6px", background: "#374151", borderRadius: "999px", overflow: "hidden" }}>
                      <div
                        style={{
                          width: `${item.percent}%`,
                          height: "100%",
                          background: "#ec4899",
                          borderRadius: "999px",
                          transition: "width 0.4s ease"
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
                    );
      })()}
    </div>
  </div>
);
}