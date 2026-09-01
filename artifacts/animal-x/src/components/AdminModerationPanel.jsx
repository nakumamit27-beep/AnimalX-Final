import { useState, useEffect, useCallback } from "react";
import { doc, setDoc, collection, query, where, onSnapshot, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../utils/firebase";
import {
  adminLoadAllModerations, adminRemoveWarning, adminRemoveBan,
  adminPermanentBan, adminClearAll, getBanTimeLeft, isCurrentlyBanned,
} from "../utils/contentModeration";
import { ALL_USERS } from "../data/demoUsers";

export default function AdminModerationPanel() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);
    // --- Pending Ads Admin Setup ---
  const [pendingAds, setPendingAds] = useState([]);

  useEffect(() => {
    const q = query(
      collection(db, "advertisements"),
      where("status", "==", "pending")
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ads = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      setPendingAds(ads);
    });
    return () => unsubscribe();
  }, []);

    const handleApproveAd = async (adId) => {
    try {
      await updateDoc(doc(db, "advertisements", adId), {
        status: "approved",
        approved: true,
        approvedAt: serverTimestamp(),
      });
      alert("✅ Ad Approved! Ab yeh Reels Feed me Live dikhega.");
    } catch (e) {
      console.error("Approve error:", e);
      alert("Approval fail hua: " + (e.message || e));
    }
  };

  const handleRejectAd = async (adId) => {
      if (window.confirm("Reject this advertisement? Its payment and review history will be kept.")) {
      try {
        await updateDoc(doc(db, "advertisements", adId), {
          status: "rejected",
          approved: false,
          rejectedAt: serverTimestamp(),
          rejectionReason: "Rejected during admin review",
        });
        alert("Advertisement rejected.");
      } catch (e) {
        console.error(e);
      }
    }
  };

  /* Blue tick admin */
  const [tickSearch, setTickSearch] = useState("");
  const [tickResult, setTickResult] = useState(null);
  const [tickMsg, setTickMsg] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    const data = await adminLoadAllModerations();
    data.sort((a, b) => (b.warnings || 0) - (a.warnings || 0));
    setRecords(data);
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  async function doAction(fn, uid) {
    await fn(uid);
    await loadData();
    setSelected(null);
  }

  function searchTickUser() {
    const q = tickSearch.trim().toLowerCase();
    if (!q) return;
    const found = ALL_USERS.find(u =>
      u.id === q || u.username.toLowerCase() === q.replace("@","") ||
      u.username.toLowerCase().includes(q.replace("@",""))
    );
    setTickResult(found || { id: q, username: q, name: "Unknown / Firebase user", notFound: true });
  }

  async function giveTick(uid, give) {
    // For demo users — mutate in memory
    const demo = ALL_USERS.find(u => u.id === uid || u.username === uid);
    if (demo) { demo.verified = give; }
    // Also try Firestore for real users
    try {
      await setDoc(doc(db, "users", uid), { manualVerified: give }, { merge: true });
    } catch {}
    setTickMsg(give ? `✅ Blue tick given to @${tickResult?.username || uid}` : `❌ Tick removed from @${tickResult?.username || uid}`);
    setTimeout(() => setTickMsg(null), 4000);
  }

  const banned = records.filter(r => isCurrentlyBanned(r));
  const warned = records.filter(r => !isCurrentlyBanned(r) && r.warnings > 0);

  return (
    <div className="mod-panel">
      <div className="mod-header">
        <span className="mod-title">🕵️ Content Surveillance</span>
        <button className="mod-refresh" onClick={loadData} disabled={loading}>
          {loading ? "⏳" : "🔄"} Refresh
        </button>
      </div>
            {/* --- Pending Ads Approval Queue --- */}
      <div className="mod-tick-section" style={{ marginTop: "16px", marginBottom: "16px" }}>
        <div className="mod-tick-title">📢 Pending Advertisements ({pendingAds.length})</div>
        {pendingAds.length === 0 ? (
          <div style={{ fontSize: "0.85rem", color: "#6b7280", marginTop: "6px" }}>
            Koi pending ad review ke liye nahi hai.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "10px" }}>
            {pendingAds.map((ad) => (
              <div key={ad.id} className="mod-tick-card" style={{ flexDirection: "column", alignItems: "flex-start", gap: "8px" }}>
                <div><strong>User:</strong> {ad.username || ad.userId}</div>
                <div><strong>Title:</strong> {ad.title || "No Title"}</div>
                <div><strong>Plan:</strong> {ad.plan} ({ad.views} Views - ₹{ad.price})</div>
                <div><strong>Txn ID:</strong> <span style={{ color: "#f59e0b" }}>{ad.txnId}</span></div>
                <div><strong>Target Link:</strong> <span style={{ color: "#3b82f6" }}>{ad.websiteUrl || ad.targetUrl || ad.link || ad.website || "No Link Attached"}</span></div>

                {ad.screenshotPath && (
                  <div style={{ marginTop: "4px" }}>
                    <div style={{ fontSize: "0.75rem", color: "#9ca3af" }}>Payment Proof Screenshot:</div>
                    <a href={ad.screenshotPath} target="_blank" rel="noreferrer">
                      <img src={ad.screenshotPath} alt="Proof" style={{ width: "100px", height: "100px", objectFit: "cover", borderRadius: "6px", border: "1px solid #374151" }} />
                    </a>
                  </div>
                )}

                {ad.adVideoUrl && (
                  <div style={{ marginTop: "4px" }}>
                    <div style={{ fontSize: "0.75rem", color: "#9ca3af" }}>Ad Video Preview:</div>
                    <video src={ad.adVideoUrl} controls style={{ width: "180px", height: "100px", borderRadius: "6px", background: "#000" }} />
                  </div>
                )}

                <div style={{ display: "flex", gap: "8px", marginTop: "6px" }}>
                  <button onClick={() => handleApproveAd(ad.id)} className="mod-btn green">
                    ✅ Approve Ad
                  </button>
                  <button onClick={() => handleRejectAd(ad.id)} className="mod-btn red">
                    ❌ Reject & Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Blue Tick Admin ── */}
      <div className="mod-tick-section">
        <div className="mod-tick-title">🔵 Manual Blue Tick</div>
        <div className="mod-tick-search">
          <input
            className="mod-tick-input"
            placeholder="@username or user ID…"
            value={tickSearch}
            onChange={e => setTickSearch(e.target.value)}
            onKeyDown={e => e.key === "Enter" && searchTickUser()}
          />
          <button className="mod-tick-search-btn" onClick={searchTickUser}>Search</button>
        </div>
        {tickMsg && <div className="mod-tick-msg">{tickMsg}</div>}
        {tickResult && (
          <div className="mod-tick-card">
            <div className="mod-tick-user">
              <span>{tickResult.avatar || "👤"}</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: "0.88rem" }}>@{tickResult.username}</div>
                <div style={{ fontSize: "0.75rem", color: "#6b7280" }}>{tickResult.name}</div>
                {tickResult.notFound && <div style={{ fontSize: "0.72rem", color: "#f59e0b" }}>Will update Firestore only</div>}
              </div>
              <div style={{ marginLeft: "auto" }}>
                {tickResult.verified ? "🔵 Verified" : "⚪ Not Verified"}
              </div>
            </div>
            <div className="mod-tick-actions">
              <button className="mod-btn green" onClick={() => giveTick(tickResult.id, true)}>
                ✓ Give Blue Tick
              </button>
              <button className="mod-btn red" onClick={() => giveTick(tickResult.id, false)}>
                ✕ Remove Tick
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Violation stats ── */}
      <div className="mod-stats-row">
        <div className="mod-stat"><div className="mod-stat-num red">{banned.length}</div><div className="mod-stat-label">Banned</div></div>
        <div className="mod-stat"><div className="mod-stat-num yellow">{warned.length}</div><div className="mod-stat-label">Warned</div></div>
        <div className="mod-stat"><div className="mod-stat-num green">{records.filter(r=>!r.warnings&&!isCurrentlyBanned(r)).length}</div><div className="mod-stat-label">Clean</div></div>
        <div className="mod-stat"><div className="mod-stat-num">{records.reduce((s,r)=>(r.violations?.length||0)+s,0)}</div><div className="mod-stat-label">Violations</div></div>
      </div>

      {records.length === 0 && !loading && (
        <div className="mod-empty">✅ No violations recorded yet.</div>
      )}

      {[...banned, ...warned].map(rec => (
        <div key={rec.uid}
          className={`mod-user-row ${isCurrentlyBanned(rec) ? "mod-banned" : "mod-warned"}`}
          onClick={() => setSelected(selected?.uid === rec.uid ? null : rec)}
        >
          <div className="mod-user-left">
            <span className="mod-user-badge">{isCurrentlyBanned(rec) ? "🚫" : "⚠️"}</span>
            <div>
              <div className="mod-uid">{rec.uid.slice(0, 20)}…</div>
              <div className="mod-meta">
                {rec.warnings || 0} warning{rec.warnings !== 1 ? "s" : ""}
                {isCurrentlyBanned(rec) && ` · Banned: ${rec.permanentBan ? "Permanent" : getBanTimeLeft(rec) + " left"}`}
              </div>
            </div>
          </div>
          <span className="mod-chevron">{selected?.uid === rec.uid ? "▲" : "▼"}</span>
        </div>
      ))}

      {selected && (
        <div className="mod-detail">
          <div className="mod-detail-title">Actions for {selected.uid.slice(0, 20)}…</div>
          <div className="mod-violations">
            <div className="mod-viol-title">📋 Violations ({selected.violations?.length || 0})</div>
            {(selected.violations || []).map((v, i) => (
              <div key={i} className="mod-viol-row">
                <span className="mod-viol-reason">{v.reason}</span>
                <span className="mod-viol-date">{new Date(v.date).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
          <div className="mod-action-row">
            <button className="mod-btn yellow" onClick={() => doAction(adminRemoveWarning, selected.uid)}>Remove 1 Warning</button>
            <button className="mod-btn green" onClick={() => doAction(adminRemoveBan, selected.uid)}>Remove Ban</button>
            <button className="mod-btn blue" onClick={() => doAction(adminClearAll, selected.uid)}>Clear All</button>
            <button className="mod-btn red" onClick={() => {
              if (window.confirm(`Permanently ban ${selected.uid.slice(0,20)}?`)) doAction(adminPermanentBan, selected.uid);
            }}>Perm Ban</button>
          </div>
        </div>
      )}
    </div>
  );
}
