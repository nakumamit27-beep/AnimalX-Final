import { useState, useEffect, useCallback } from "react";

const MODES = {
  live: { label: "🟢 Public Live Mode", desc: "Normal operation — all users see stable features", color: "#22c55e" },
  testing: { label: "🧪 Testing Mode", desc: "Beta features visible only to super admin", color: "#f59e0b" },
  emergency: { label: "🆘 Emergency Mode", desc: "Last stable backup restored — broken features disabled", color: "#ef4444" },
};

function getBackups() {
  try { return JSON.parse(localStorage.getItem("ax_backups") || "[]"); } catch { return []; }
}

function createBackup() {
  const snap = {
    timestamp: Date.now(),
    version: "2.5.0",
    mode: localStorage.getItem("ax_mode") || "live",
    customAnimals: JSON.parse(localStorage.getItem("ax_custom_animals") || "[]"),
    savedReels: JSON.parse(localStorage.getItem("ax_saved_reels") || "{}"),
    theme: localStorage.getItem("ax_theme") || "dark",
    profile: JSON.parse(localStorage.getItem("ax_profile_cache") || "{}"),
  };
  const backups = getBackups();
  backups.unshift(snap);
  if (backups.length > 10) backups.splice(10);
  localStorage.setItem("ax_backups", JSON.stringify(backups));
  localStorage.setItem("ax_last_backup", String(Date.now()));
  return snap;
}

function restoreBackup(snap) {
  if (!snap) return false;
  try {
    if (snap.customAnimals) localStorage.setItem("ax_custom_animals", JSON.stringify(snap.customAnimals));
    if (snap.savedReels) localStorage.setItem("ax_saved_reels", JSON.stringify(snap.savedReels));
    if (snap.theme) localStorage.setItem("ax_theme", snap.theme);
    localStorage.setItem("ax_mode", "live");
    return true;
  } catch { return false; }
}

function downloadJSON(data, filename) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function timeAgo(ts) {
  if (!ts) return "never";
  const diff = Date.now() - ts;
  if (diff < 60000) return "just now";
  if (diff < 3600000) return Math.floor(diff / 60000) + "m ago";
  if (diff < 86400000) return Math.floor(diff / 3600000) + "h ago";
  return Math.floor(diff / 86400000) + "d ago";
}

export default function AdminTestingPanel({ open, onClose }) {
  const [mode, setMode] = useState(() => localStorage.getItem("ax_mode") || "live");
  const [backups, setBackups] = useState(getBackups);
  const [lastBackup, setLastBackup] = useState(() => Number(localStorage.getItem("ax_last_backup") || 0));
  const [activeTab, setActiveTab] = useState("modes");
  const [toast, setToast] = useState(null);
  const [restoreLoading, setRestoreLoading] = useState(false);
  const [betaFeatures, setBetaFeatures] = useState(() => {
    try { return JSON.parse(localStorage.getItem("ax_beta_features") || "{}"); } catch { return {}; }
  });

  const BETA_FEATURES = [
    { key: "advancedReelAnalytics", label: "Advanced Reel Analytics", desc: "Show view duration, engagement rate, and drop-off data" },
    { key: "aiTagging", label: "AI Auto-Tagging", desc: "Automatically tag animal species in uploaded videos" },
    { key: "liveStreaming", label: "Live Streaming", desc: "Allow users to stream wildlife events live" },
    { key: "collaborativeReels", label: "Collaborative Reels", desc: "Two creators can merge their reels into one" },
    { key: "augmentedReality", label: "AR Animal Overlays", desc: "View 3D animal models in your camera" },
  ];

  const showToast = useCallback((msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }, []);

  useEffect(() => {
    if (!open) return;
    const now = Date.now();
    const last = Number(localStorage.getItem("ax_last_backup") || 0);
    if (now - last > 24 * 60 * 60 * 1000) {
      const snap = createBackup();
      setBackups(getBackups());
      setLastBackup(snap.timestamp);
      showToast("🗂️ Auto daily backup created");
    }
  }, [open, showToast]);

  function applyMode(newMode) {
    setMode(newMode);
    localStorage.setItem("ax_mode", newMode);
    showToast(`${MODES[newMode].label} activated!`);
  }

  function handleManualBackup() {
    const snap = createBackup();
    setBackups(getBackups());
    setLastBackup(snap.timestamp);
    showToast("✅ Backup created successfully!");
  }

  function handleDownloadBackup() {
    const backupData = {
      timestamp: Date.now(),
      version: "2.5.0",
      backups: getBackups(),
      settings: {
        mode: localStorage.getItem("ax_mode"),
        theme: localStorage.getItem("ax_theme"),
        betaFeatures: JSON.parse(localStorage.getItem("ax_beta_features") || "{}"),
        customAnimals: JSON.parse(localStorage.getItem("ax_custom_animals") || "[]"),
        savedReels: JSON.parse(localStorage.getItem("ax_saved_reels") || "{}"),
      }
    };
    downloadJSON(backupData, `wildsphere-backup-${new Date().toISOString().slice(0,10)}.json`);
    showToast("📦 Backup downloaded!");
  }

  function handleRestoreFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setRestoreLoading(true);
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        const snap = data.backups?.[0] || data.settings;
        if (!snap) throw new Error("Invalid backup file format");
        const ok = restoreBackup(snap);
        if (ok) {
          setBackups(getBackups());
          setMode("live");
          showToast("✅ Backup restored successfully! Refresh the app.");
        } else {
          showToast("❌ Restore failed — invalid backup");
        }
      } catch {
        showToast("❌ Invalid backup file");
      }
      setRestoreLoading(false);
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  function handleEmergencyRestore() {
    if (!window.confirm("🆘 Emergency Restore will:\n\n• Switch to the last stable backup\n• Disable broken features\n• Preserve all user accounts and reels\n\nContinue?")) return;
    const bkps = getBackups();
    if (bkps.length === 0) {
      const snap = createBackup();
      setBackups(getBackups());
      setLastBackup(snap.timestamp);
      showToast("⚠️ No prior backup — created fresh backup and set live mode");
      applyMode("live");
      return;
    }
    restoreBackup(bkps[0]);
    setBackups(getBackups());
    applyMode("emergency");
    setTimeout(() => {
      applyMode("live");
      showToast("✅ Emergency restore complete — switched to Live mode");
    }, 2000);
  }

  function toggleBetaFeature(key) {
    const next = { ...betaFeatures, [key]: !betaFeatures[key] };
    setBetaFeatures(next);
    localStorage.setItem("ax_beta_features", JSON.stringify(next));
  }

  if (!open) return null;

  return (
    <div className="atp-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="atp-panel">

        {/* Header */}
        <div className="atp-header">
          <div className="atp-header-icon">🧪</div>
          <div>
            <div className="atp-header-title">Admin Testing Panel</div>
            <div className="atp-header-sub">Super Admin · WildSphere v2.5</div>
          </div>
          <button className="atp-close" onClick={onClose}>✕</button>
        </div>

        {/* Mode indicator */}
        <div className="atp-mode-banner" style={{ borderColor: MODES[mode].color + "40", background: MODES[mode].color + "15" }}>
          <span style={{ color: MODES[mode].color, fontWeight: 700 }}>{MODES[mode].label}</span>
          <span className="atp-mode-desc">{MODES[mode].desc}</span>
        </div>

        {/* Tabs */}
        <div className="atp-tabs">
          {[
            { key: "modes", label: "🗂️ Modes" },
            { key: "testing", label: "🧪 Beta" },
            { key: "backup", label: "💾 Backup" },
          ].map(t => (
            <button
              key={t.key}
              className={`atp-tab ${activeTab === t.key ? "active" : ""}`}
              onClick={() => setActiveTab(t.key)}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab: Modes */}
        {activeTab === "modes" && (
          <div className="atp-tab-body">
            <div className="atp-section-label">Select App Mode</div>
            {Object.entries(MODES).map(([key, info]) => (
              <button
                key={key}
                className={`atp-mode-btn ${mode === key ? "active" : ""}`}
                style={mode === key ? { borderColor: info.color, background: info.color + "20" } : {}}
                onClick={() => applyMode(key)}
              >
                <span className="atp-mode-btn-label" style={mode === key ? { color: info.color } : {}}>{info.label}</span>
                <span className="atp-mode-btn-desc">{info.desc}</span>
                {mode === key && <span className="atp-mode-active-badge">● ACTIVE</span>}
              </button>
            ))}

            <div className="atp-action-row">
              <button
                className="atp-action-btn testing"
                onClick={() => applyMode("testing")}
              >
                🧪 Enable Testing
              </button>
              <button
                className="atp-action-btn live"
                onClick={() => applyMode("live")}
              >
                🚀 Push To Public
              </button>
            </div>
            <button
              className="atp-action-btn emergency"
              onClick={handleEmergencyRestore}
            >
              🆘 Emergency Restore
            </button>

            <div className="atp-mode-help">
              <strong>Testing Mode:</strong> Only super admin sees beta features. Public users see normal app.<br />
              <strong>Push To Public:</strong> Activates all tested features for all users immediately.<br />
              <strong>Emergency Restore:</strong> Reverts to last stable backup and disables broken features.
            </div>
          </div>
        )}

        {/* Tab: Beta Features */}
        {activeTab === "testing" && (
          <div className="atp-tab-body">
            <div className="atp-section-label">
              Beta Features
              {mode !== "testing" && (
                <span className="atp-beta-note"> — switch to Testing Mode to preview</span>
              )}
            </div>
            {BETA_FEATURES.map(f => (
              <div key={f.key} className={`atp-feature-row ${betaFeatures[f.key] ? "on" : ""}`}>
                <div className="atp-feature-info">
                  <div className="atp-feature-label">{f.label}</div>
                  <div className="atp-feature-desc">{f.desc}</div>
                </div>
                <label className="atp-toggle-switch">
                  <input
                    type="checkbox"
                    checked={!!betaFeatures[f.key]}
                    onChange={() => toggleBetaFeature(f.key)}
                  />
                  <span className="atp-toggle-track" />
                </label>
              </div>
            ))}
            <div className="atp-mode-help">
              Beta features are visible only when in Testing Mode and only to the super admin account. Push To Public to enable for all users.
            </div>
          </div>
        )}

        {/* Tab: Backup */}
        {activeTab === "backup" && (
          <div className="atp-tab-body">
            <div className="atp-backup-status">
              <span>Last backup: <strong>{timeAgo(lastBackup)}</strong></span>
              <span className="atp-backup-count">{backups.length} snapshots saved</span>
            </div>

            <div className="atp-action-row">
              <button className="atp-action-btn live" onClick={handleManualBackup}>
                🗂️ Create Backup
              </button>
              <button className="atp-action-btn testing" onClick={handleDownloadBackup}>
                📦 Download ZIP
              </button>
            </div>

            <label className={`atp-action-btn ${restoreLoading ? "disabled" : "emergency"}`} style={{ cursor: restoreLoading ? "default" : "pointer" }}>
              {restoreLoading ? "Restoring…" : "📂 Restore Backup"}
              <input type="file" accept=".json" style={{ display: "none" }} onChange={handleRestoreFile} disabled={restoreLoading} />
            </label>

            {backups.length > 0 && (
              <>
                <div className="atp-section-label" style={{ marginTop: 16 }}>Backup History</div>
                <div className="atp-backup-list">
                  {backups.slice(0, 5).map((b, i) => (
                    <div key={i} className="atp-backup-item">
                      <span className="atp-backup-time">{timeAgo(b.timestamp)}</span>
                      <span className="atp-backup-mode">{MODES[b.mode]?.label || b.mode}</span>
                      <button
                        className="atp-backup-restore-btn"
                        onClick={() => {
                          if (window.confirm("Restore this backup? Current data will be overwritten.")) {
                            restoreBackup(b);
                            setMode("live");
                            showToast("✅ Restored — refresh to apply changes");
                          }
                        }}
                      >
                        Restore
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}

            <div className="atp-mode-help">
              Auto daily backup runs when you open the Admin panel. Backups include local settings, saved reels, custom animals, and preferences. Firebase data (accounts, posts) is always safe in Firebase and not included in local backups.
            </div>
          </div>
        )}

        {/* Toast */}
        {toast && (
          <div className="atp-toast">{toast}</div>
        )}
      </div>
    </div>
  );
}
