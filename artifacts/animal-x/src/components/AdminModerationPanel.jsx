import { useState, useEffect, useCallback } from "react";
import {
  adminLoadAllModerations,
  adminRemoveWarning,
  adminRemoveBan,
  adminPermanentBan,
  adminClearAll,
  getBanTimeLeft,
  isCurrentlyBanned,
} from "../utils/contentModeration";

export default function AdminModerationPanel() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);

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

  const banned = records.filter(r => isCurrentlyBanned(r));
  const warned = records.filter(r => !isCurrentlyBanned(r) && r.warnings > 0);
  const clean = records.filter(r => !r.warnings && !isCurrentlyBanned(r));

  return (
    <div className="mod-panel">
      <div className="mod-header">
        <span className="mod-title">🕵️ Content Surveillance</span>
        <button className="mod-refresh" onClick={loadData} disabled={loading}>
          {loading ? "⏳" : "🔄"} Refresh
        </button>
      </div>

      <div className="mod-stats-row">
        <div className="mod-stat"><div className="mod-stat-num red">{banned.length}</div><div className="mod-stat-label">Banned</div></div>
        <div className="mod-stat"><div className="mod-stat-num yellow">{warned.length}</div><div className="mod-stat-label">Warned</div></div>
        <div className="mod-stat"><div className="mod-stat-num green">{clean.length}</div><div className="mod-stat-label">Clean</div></div>
        <div className="mod-stat"><div className="mod-stat-num">{records.reduce((s,r)=>(r.violations?.length||0)+s,0)}</div><div className="mod-stat-label">Violations</div></div>
      </div>

      {records.length === 0 && !loading && (
        <div className="mod-empty">✅ No violations recorded yet.</div>
      )}

      {[...banned, ...warned].map(rec => (
        <div
          key={rec.uid}
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
            <button className="mod-btn yellow" onClick={() => doAction(adminRemoveWarning, selected.uid)}>
              Remove 1 Warning
            </button>
            <button className="mod-btn green" onClick={() => doAction(adminRemoveBan, selected.uid)}>
              Remove Ban
            </button>
            <button className="mod-btn blue" onClick={() => doAction(adminClearAll, selected.uid)}>
              Clear All
            </button>
            <button className="mod-btn red" onClick={() => {
              if (window.confirm(`Permanently ban ${selected.uid.slice(0,20)}?`)) {
                doAction(adminPermanentBan, selected.uid);
              }
            }}>
              Perm Ban
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
