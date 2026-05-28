import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { ref, get, set as rtdbSet } from "firebase/database";
import { db, rtdb, auth } from "./firebase";

const LOGS = [];
const MAX_LOGS = 200;

export function log(level, service, message, data) {
  const entry = { ts: Date.now(), level, service, message, data: data || null };
  LOGS.unshift(entry);
  if (LOGS.length > MAX_LOGS) LOGS.length = MAX_LOGS;
  if (level === "error") console.error(`[Firebase:${service}]`, message, data || "");
  return entry;
}

export function getLogs() { return [...LOGS]; }

export async function checkFirestore() {
  const start = Date.now();
  try {
    const testRef = doc(db, "_health", "ping");
    await setDoc(testRef, { ts: serverTimestamp(), ok: true }, { merge: true });
    const snap = await getDoc(testRef);
    const latency = Date.now() - start;
    if (snap.exists()) {
      log("info", "Firestore", `✅ Connected — ${latency}ms`);
      return { ok: true, latency };
    }
    log("warn", "Firestore", "⚠️ Ping doc missing after write");
    return { ok: false, latency, error: "Ping doc missing" };
  } catch (err) {
    const latency = Date.now() - start;
    const msg = friendlyError(err);
    log("error", "Firestore", `❌ ${msg}`, err.code);
    return { ok: false, latency, error: msg };
  }
}

export async function checkRTDB() {
  const start = Date.now();
  try {
    const pingRef = ref(rtdb, "_health/ping");
    await rtdbSet(pingRef, { ts: Date.now() });
    const snap = await get(pingRef);
    const latency = Date.now() - start;
    if (snap.exists()) {
      log("info", "RTDB", `✅ Connected — ${latency}ms`);
      return { ok: true, latency };
    }
    log("warn", "RTDB", "⚠️ Ping missing after write");
    return { ok: false, latency, error: "Ping missing" };
  } catch (err) {
    const latency = Date.now() - start;
    const msg = friendlyError(err);
    log("error", "RTDB", `❌ ${msg}`, err.code);
    return { ok: false, latency, error: msg };
  }
}

export async function checkAuth() {
  try {
    const user = auth.currentUser;
    log("info", "Auth", user ? `✅ Signed in as ${user.email}` : "ℹ️ Not signed in");
    return { ok: true, user: user ? { uid: user.uid, email: user.email } : null };
  } catch (err) {
    log("error", "Auth", `❌ ${err.message}`);
    return { ok: false, error: err.message };
  }
}

/** Check Replit Object Storage by pinging the request-url endpoint */
export async function checkStorage() {
  const start = Date.now();
  try {
    const res = await fetch("/api/storage/uploads/request-url", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "health-check.txt", size: 1, contentType: "text/plain" }),
    });
    const latency = Date.now() - start;
    if (res.ok) {
      log("info", "Storage", `✅ Object Storage ready — ${latency}ms`);
      return { ok: true, latency };
    }
    log("warn", "Storage", `⚠️ Object Storage returned ${res.status}`, res.status);
    return { ok: false, latency, error: `HTTP ${res.status}` };
  } catch (err) {
    const latency = Date.now() - start;
    log("error", "Storage", `❌ ${err.message}`);
    return { ok: false, latency, error: err.message };
  }
}

export async function checkNotifications() {
  try {
    if (!("Notification" in window)) {
      log("warn", "Notifications", "⚠️ Not supported in this browser");
      return { ok: false, error: "Not supported" };
    }
    const perm = Notification.permission;
    if (perm === "granted") { log("info", "Notifications", "✅ Permission granted"); return { ok: true, permission: perm }; }
    if (perm === "denied") { log("warn", "Notifications", "❌ Permission denied by user"); return { ok: false, permission: perm, error: "Permission denied" }; }
    log("info", "Notifications", "ℹ️ Permission not yet requested");
    return { ok: true, permission: perm };
  } catch (err) {
    log("error", "Notifications", `❌ ${err.message}`);
    return { ok: false, error: err.message };
  }
}

export async function runFullHealthCheck() {
  log("info", "HealthCheck", "🔍 Starting full health check…");
  const [firestoreResult, rtdbResult, authResult, storageResult, notifResult] = await Promise.all([
    checkFirestore(), checkRTDB(), checkAuth(), checkStorage(), checkNotifications(),
  ]);
  const results = {
    firestore: firestoreResult, rtdb: rtdbResult, auth: authResult,
    storage: storageResult, notifications: notifResult, timestamp: Date.now(),
  };
  const allOk = firestoreResult.ok && rtdbResult.ok && authResult.ok;
  log(allOk ? "info" : "warn", "HealthCheck", allOk ? "✅ All services healthy" : "⚠️ Some services need attention");
  return results;
}

function friendlyError(err) {
  const code = err?.code || "";
  if (code === "permission-denied") return "Firestore permission denied — check Security Rules";
  if (code === "unavailable") return "Service unavailable — check internet connection";
  if (code.includes("network")) return "Network error — device may be offline";
  if (code === "app/no-app") return "Firebase app not initialized";
  return err?.message || "Unknown error";
}
