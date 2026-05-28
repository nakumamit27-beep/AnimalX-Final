import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { runFullHealthCheck, getLogs, log } from "../utils/FirebaseHealthChecker";
import PerformanceBenchmark from "./PerformanceBenchmark";
import AdminModerationPanel from "./AdminModerationPanel";

const STATUS_ICON = { true: "✅", false: "❌", null: "⏳" };
const LEVEL_COLOR = { info: "#10b981", warn: "#f59e0b", error: "#ef4444" };

export default function AdminDebugPanel({ open, onClose }) {
  const { isSuperAdmin, adminMode, user } = useAuth();
  const [health, setHealth] = useState(null);
  const [checking, setChecking] = useState(false);
  const [logs, setLogs] = useState([]);
  const [activeTab, setActiveTab] = useState("status");
  const [latencyHistory, setLatencyHistory] = useState([]);
  const [benchOpen, setBenchOpen] = useState(false);

  const runCheck = useCallback(async () => {
    setChecking(true);
    log("info", "AdminPanel", "Manual health check triggered");
    const result = await runFullHealthCheck();
    setHealth(result);
    setLogs(getLogs());
    setLatencyHistory(prev => [
      ...prev.slice(-9),
      {
        ts: Date.now(),
        fs: result.firestore?.latency ?? null,
        rtdb: result.rtdb?.latency ?? null,
      },
    ]);
    setChecking(false);
  }, []);

  useEffect(() => {
    if (open && isSuperAdmin && adminMode) {
      runCheck();
      const interval = setInterval(() => {
        setLogs(getLogs());
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [open, isSuperAdmin, adminMode, runCheck]);

  if (!open || !isSuperAdmin || !adminMode) return null;

  const services = health
    ? [
        { name: "Firestore", key: "firestore", icon: "🔥", data: health.firestore },
        { name: "Realtime DB", key: "rtdb", icon: "⚡", data: health.rtdb },
        { name: "Auth", key: "auth", icon: "🔐", data: health.auth },
        { name: "Storage", key: "storage", icon: "📦", data: health.storage },
        { name: "Notifications", key: "notifications", icon: "🔔", data: health.notifications },
      ]
    : [];

  return (
    <div className="debug-backdrop" onClick={onClose}>
      <div className="debug-panel" onClick={e => e.stopPropagation()}>
        <div className="debug-header">
          <span>🛠️ Firebase Admin Debug Panel</span>
          <button className="debug-close" onClick={onClose}>✕</button>
        </div>

        <div className="debug-tabs">
          {["status", "logs", "rules"].map(t => (
            <button
              key={t}
              className={`debug-tab ${activeTab === t ? "active" : ""}`}
              onClick={() => setActiveTab(t)}
            >
              {t === "status" ? "📊 Status" : t === "logs" ? "📋 Logs" : "🔑 Rules"}
            </button>
          ))}
          <button className="debug-tab" onClick={() => setBenchOpen(true)}>⚡ Benchmark</button>
          <button className={`debug-tab ${activeTab === "moderation" ? "active" : ""}`} onClick={() => setActiveTab("moderation")}>🕵️ Moderation</button>
          <button
            className="debug-refresh"
            onClick={runCheck}
            disabled={checking}
          >
            {checking ? "⏳" : "🔄"} {checking ? "Checking…" : "Refresh"}
          </button>
        </div>
        {benchOpen && <PerformanceBenchmark onClose={() => setBenchOpen(false)} />}

        {activeTab === "moderation" && (
          <div className="debug-body">
            <AdminModerationPanel />
          </div>
        )}

        {activeTab === "status" && (
          <div className="debug-body">
            <div className="debug-user-card">
              <span>👤</span>
              <div>
                <div style={{ fontWeight: 700 }}>{user?.name || user?.email || "No user"}</div>
                <div style={{ fontSize: "0.75rem", color: "#10b981" }}>Super Admin • Debug Mode</div>
              </div>
              <div style={{ marginLeft: "auto", fontSize: "0.75rem", color: "#6b7280" }}>
                Project: <b style={{ color: "#a855f7" }}>happy-fd1bc</b>
              </div>
            </div>

            {!health && checking && (
              <div className="debug-checking">⏳ Running health checks on all Firebase services…</div>
            )}

            {services.length > 0 && (
              <div className="debug-services">
                {services.map(s => (
                  <div key={s.key} className={`debug-service-card ${s.data?.ok ? "ok" : "fail"}`}>
                    <div className="dsvc-left">
                      <span className="dsvc-icon">{s.icon}</span>
                      <div>
                        <div className="dsvc-name">{s.name}</div>
                        {s.data?.error && <div className="dsvc-error">{s.data.error}</div>}
                        {s.data?.latency != null && (
                          <div className="dsvc-latency">{s.data.latency}ms</div>
                        )}
                        {s.key === "auth" && s.data?.user && (
                          <div className="dsvc-latency">uid: {s.data.user.uid.slice(0, 8)}…</div>
                        )}
                        {s.key === "notifications" && s.data?.permission && (
                          <div className="dsvc-latency">Permission: {s.data.permission}</div>
                        )}
                      </div>
                    </div>
                    <div className={`dsvc-badge ${s.data?.ok ? "ok" : "fail"}`}>
                      {s.data?.ok ? "✅ OK" : "❌ Error"}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {latencyHistory.length > 1 && (
              <div className="debug-latency-section">
                <div className="debug-latency-title">📈 Latency History (last {latencyHistory.length} checks)</div>
                <div className="debug-latency-bars">
                  {latencyHistory.map((h, i) => (
                    <div key={i} className="dlb-col">
                      {h.fs != null && (
                        <div
                          className="dlb-bar fs"
                          style={{ height: `${Math.min((h.fs / 2000) * 60, 60)}px` }}
                          title={`Firestore: ${h.fs}ms`}
                        />
                      )}
                      {h.rtdb != null && (
                        <div
                          className="dlb-bar rtdb"
                          style={{ height: `${Math.min((h.rtdb / 2000) * 60, 60)}px` }}
                          title={`RTDB: ${h.rtdb}ms`}
                        />
                      )}
                    </div>
                  ))}
                </div>
                <div className="debug-latency-legend">
                  <span><span className="dlb-dot fs" /> Firestore</span>
                  <span><span className="dlb-dot rtdb" /> RTDB</span>
                </div>
              </div>
            )}

            <div className="debug-info-grid">
              <div className="debug-info-item">
                <span className="dii-label">Project ID</span>
                <span className="dii-val">happy-fd1bc</span>
              </div>
              <div className="debug-info-item">
                <span className="dii-label">Auth Domain</span>
                <span className="dii-val">happy-fd1bc.firebaseapp.com</span>
              </div>
              <div className="debug-info-item">
                <span className="dii-label">RTDB URL</span>
                <span className="dii-val">happy-fd1bc-default-rtdb</span>
              </div>
              <div className="debug-info-item">
                <span className="dii-label">Storage</span>
                <span className="dii-val">Replit Object Storage</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === "logs" && (
          <div className="debug-body">
            <div className="debug-log-toolbar">
              <span style={{ color: "#6b7280", fontSize: "0.78rem" }}>{logs.length} entries</span>
              <button className="debug-clear-logs" onClick={() => setLogs([])}>Clear</button>
            </div>
            <div className="debug-log-list">
              {logs.length === 0 && (
                <div style={{ color: "#6b7280", textAlign: "center", padding: "24px" }}>No logs yet</div>
              )}
              {logs.map((entry, i) => (
                <div key={i} className="debug-log-entry">
                  <span className="dle-time">{new Date(entry.ts).toLocaleTimeString()}</span>
                  <span className="dle-service" style={{ color: LEVEL_COLOR[entry.level] }}>
                    [{entry.service}]
                  </span>
                  <span className="dle-msg">{entry.message}</span>
                  {entry.data && <span className="dle-data">{String(entry.data)}</span>}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "rules" && (
          <div className="debug-body">
            <div style={{ marginBottom: 12, color: "#a855f7", fontWeight: 700, fontSize: "0.9rem" }}>
              📋 Required Firebase Security Rules
            </div>
            <div style={{ marginBottom: 12, color: "#6b7280", fontSize: "0.82rem" }}>
              Go to <b>Firebase Console → Firestore → Rules</b> and paste:
            </div>
            <pre className="debug-rules-box">{FIRESTORE_RULES}</pre>

            <div style={{ marginTop: 16, marginBottom: 8, color: "#f59e0b", fontWeight: 700, fontSize: "0.9rem" }}>
              ⚡ Realtime Database Rules
            </div>
            <pre className="debug-rules-box">{RTDB_RULES}</pre>

            <div style={{ marginTop: 16, marginBottom: 8, color: "#10b981", fontWeight: 700, fontSize: "0.9rem" }}>
              📦 Storage Rules
            </div>
            <pre className="debug-rules-box">{STORAGE_RULES}</pre>
          </div>
        )}
      </div>
    </div>
  );
}

const FIRESTORE_RULES = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /_health/{doc} {
      allow read, write: if true;
    }
    match /users/{uid} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == uid;
    }
    match /userLikes/{uid} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }
    match /userFollowing/{uid} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }
    match /userFollowers/{uid} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
    match /reelMeta/{reelId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    match /notifications/{docId} {
      allow read, write: if request.auth != null;
      allow create: if request.auth != null;
    }
    match /adminBroadcasts/{docId} {
      allow read: if true;
      allow write: if request.auth != null
        && request.auth.token.email == "malinotaling8@gmail.com";
    }
    match /advertisements/{docId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
    }
    match /animals/{animalId} {
      allow read: if true;
      allow write: if request.auth != null
        && request.auth.token.email == "malinotaling8@gmail.com";
    }
    match /userModeration/{uid} {
      allow read: if request.auth != null
        && (request.auth.uid == uid
          || request.auth.token.email == "malinotaling8@gmail.com");
      allow write: if request.auth != null;
    }
  }
}`;

const RTDB_RULES = `{
  "rules": {
    "_health": { ".read": true, ".write": true },
    "online-users": { ".read": true, ".write": "auth != null" },
    "live-views": { ".read": true, ".write": "auth != null" },
    "live-likes": { ".read": true, ".write": "auth != null" },
    "trending": { ".read": true, ".write": "auth != null" },
    "admin-broadcast": {
      ".read": true,
      ".write": "auth != null && auth.token.email == 'malinotaling8@gmail.com'"
    },
    "global-chat": { ".read": "auth != null", ".write": "auth != null" }
  }
}`;

const STORAGE_RULES = `rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /reels/{file} {
      allow read: if true;
      allow write: if request.auth != null && request.resource.size < 100 * 1024 * 1024;
    }
    match /profiles/{file} {
      allow read: if true;
      allow write: if request.auth != null && request.resource.size < 5 * 1024 * 1024;
    }
    match /animals/{file} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    match /stories/{file} {
      allow read: if true;
      allow write: if request.auth != null && request.resource.size < 50 * 1024 * 1024;
    }
    match /admin/{file} {
      allow read, write: if request.auth != null
        && request.auth.token.email == "malinotaling8@gmail.com";
    }
  }
}`;
