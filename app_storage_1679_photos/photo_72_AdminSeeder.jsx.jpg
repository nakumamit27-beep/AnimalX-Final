/**
 * AdminSeeder — Batch seed Firestore `animalDetails/{id}` for all 1,213 animals.
 *
 * Strategy:
 *   Phase 1: Apply static WILDLIFE_SEED data (instant, no API calls)
 *   Phase 2: For unseeded animals, call Gemini via /api/wildlife/generate-batch
 *
 * Only super admins with adminMode ON can access this page.
 */

import { useState, useCallback } from "react";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "../utils/firebase";
import { useAuth } from "../context/AuthContext";
import { Link } from "wouter";
import animals from "../data/animals";
import WILDLIFE_SEED from "../data/wildlifeSeed";

const BASE_URL = import.meta.env.BASE_URL?.replace(/\/$/, "") || "";

async function callGenerateBatch(batch) {
  const res = await fetch(`${BASE_URL}/api/wildlife/generate-batch`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      animals: batch.map((a) => ({
        id: a.id,
        animalName: a.name,
        category: a.category,
        habitat: a.habitat,
        diet: a.diet,
        lifespan: a.lifespan,
        region: a.country || a.region,
      })),
    }),
  });
  if (!res.ok) throw new Error(`Batch API error: ${res.status}`);
  const json = await res.json();
  return json.results || [];
}

export default function AdminSeeder() {
  const { isSuperAdmin, adminMode } = useAuth();

  const [status, setStatus]         = useState("idle"); // idle | checking | seeding | done | error
  const [progress, setProgress]     = useState(0);
  const [total, setTotal]           = useState(0);
  const [log, setLog]               = useState([]);
  const [seededCount, setSeededCount] = useState(0);
  const [skippedCount, setSkippedCount] = useState(0);
  const [useGemini, setUseGemini]   = useState(true);

  function addLog(msg, type = "info") {
    setLog((prev) => [...prev.slice(-199), { msg, type, ts: Date.now() }]);
  }

  // ── Check which animals already have data ────────────────────────────────
  const checkExisting = useCallback(async () => {
    setStatus("checking");
    setLog([]);
    addLog(`Checking ${animals.length} animals for existing Firestore data…`);
    let hasData = 0;
    for (let i = 0; i < animals.length; i += 50) {
      const batch = animals.slice(i, i + 50);
      await Promise.all(
        batch.map(async (a) => {
          const snap = await getDoc(doc(db, "animalDetails", String(a.id)));
          if (snap.exists() && snap.data()?.scientificName) hasData++;
        })
      );
      setProgress(Math.min(i + 50, animals.length));
      setTotal(animals.length);
    }
    addLog(`Found ${hasData} / ${animals.length} animals with data.`, "success");
    setStatus("idle");
  }, []);

  // ── Phase 1: Seed from static WILDLIFE_SEED map ──────────────────────────
  const seedStatic = useCallback(async () => {
    setStatus("seeding");
    setProgress(0);
    setSeededCount(0);
    setSkippedCount(0);
    addLog("Starting Phase 1: Static seed from built-in data…");

    let seeded = 0;
    let skipped = 0;
    const seedEntries = Object.keys(WILDLIFE_SEED);
    addLog(`Static data available for ${seedEntries.length} species names.`);

    for (let i = 0; i < animals.length; i++) {
      const a = animals[i];
      // Match by baseName or name
      const seedData = WILDLIFE_SEED[a.baseName] || WILDLIFE_SEED[a.name];
      if (seedData) {
        try {
          await setDoc(doc(db, "animalDetails", String(a.id)), seedData, { merge: true });
          seeded++;
          setSeededCount((c) => c + 1);
          if (seeded % 10 === 0) addLog(`Seeded ${seeded} animals…`, "success");
        } catch (e) {
          addLog(`Failed to seed ${a.name}: ${e.message}`, "error");
        }
      } else {
        skipped++;
        setSkippedCount((c) => c + 1);
      }
      setProgress(i + 1);
      setTotal(animals.length);
      // Small delay to avoid Firestore rate limits
      if (i % 20 === 19) await new Promise((r) => setTimeout(r, 100));
    }

    addLog(`Phase 1 complete. Seeded: ${seeded}, No data: ${skipped}`, "success");
    setStatus("done");
  }, []);

  // ── Phase 2: Use Gemini for unseeded animals ─────────────────────────────
  const seedWithGemini = useCallback(async () => {
    setStatus("seeding");
    setProgress(0);
    addLog("Starting Phase 2: AI generation for remaining animals…");
    addLog("Note: Requires /api endpoint (run in Replit, not Firebase Hosting).");

    // Collect unseeded animals
    addLog("Scanning for unseeded animals…");
    const unseeded = [];
    for (let i = 0; i < animals.length; i += 50) {
      const batch = animals.slice(i, i + 50);
      await Promise.all(
        batch.map(async (a) => {
          const snap = await getDoc(doc(db, "animalDetails", String(a.id)));
          if (!snap.exists() || !snap.data()?.scientificName) {
            unseeded.push(a);
          }
        })
      );
    }
    addLog(`${unseeded.length} animals need AI generation.`);
    setTotal(unseeded.length);

    let done = 0;
    const BATCH_SIZE = 10;
    for (let i = 0; i < unseeded.length; i += BATCH_SIZE) {
      const batch = unseeded.slice(i, i + BATCH_SIZE);
      try {
        addLog(`Generating batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(unseeded.length / BATCH_SIZE)}: ${batch.map((a) => a.name).join(", ")}`);
        const results = await callGenerateBatch(batch);
        for (const result of results) {
          const { id, ...data } = result;
          if (id && data.scientificName) {
            await setDoc(doc(db, "animalDetails", String(id)), data, { merge: true });
            done++;
            setSeededCount((c) => c + 1);
          }
        }
      } catch (e) {
        addLog(`Batch error: ${e.message}`, "error");
      }
      setProgress(Math.min(i + BATCH_SIZE, unseeded.length));
      // Rate limit: 1 batch per 2 seconds
      await new Promise((r) => setTimeout(r, 2000));
    }

    addLog(`Phase 2 complete. AI-generated: ${done}`, "success");
    setStatus("done");
  }, []);

  // ── Clear all animalDetails ──────────────────────────────────────────────
  const clearAll = useCallback(async () => {
    if (!window.confirm(`Delete animalDetails for all ${animals.length} animals? This cannot be undone.`)) return;
    setStatus("seeding");
    setProgress(0);
    addLog("Clearing all animalDetails…", "error");
    for (let i = 0; i < animals.length; i++) {
      try {
        await setDoc(doc(db, "animalDetails", String(animals[i].id)), {}, { merge: false });
      } catch {}
      setProgress(i + 1);
      setTotal(animals.length);
      if (i % 50 === 49) await new Promise((r) => setTimeout(r, 100));
    }
    addLog("All animalDetails cleared.", "error");
    setStatus("idle");
  }, []);

  if (!isSuperAdmin || !adminMode) {
    return (
      <div style={{ padding: 40, textAlign: "center", color: "var(--text2)" }}>
        <h2>🔒 Admin Access Required</h2>
        <p>Enable Admin Mode to access the Wildlife Data Seeder.</p>
        <Link href="/" style={{ color: "var(--primary)" }}>← Back to Home</Link>
      </div>
    );
  }

  const pct = total > 0 ? Math.round((progress / total) * 100) : 0;

  return (
    <div style={{ maxWidth: 860, margin: "0 auto", padding: "24px 16px" }}>
      <Link href="/" style={{ color: "var(--primary)", fontSize: ".9rem" }}>← Back</Link>
      <h1 style={{ marginTop: 12, marginBottom: 4, color: "var(--primary)" }}>🌍 Wildlife Data Seeder</h1>
      <p style={{ color: "var(--text2)", marginBottom: 24 }}>
        Pre-populate <code>animalDetails/&#123;id&#125;</code> in Firestore for all {animals.length} animals.
        Use <strong>Phase 1</strong> for instant seeding with built-in data, then <strong>Phase 2</strong> for AI-generated data via Gemini.
      </p>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 24 }}>
        <StatCard label="Total Animals" value={animals.length} color="var(--primary)" />
        <StatCard label="Seeded" value={seededCount} color="#22c55e" />
        <StatCard label="No Static Data" value={skippedCount} color="var(--text2)" />
      </div>

      {/* Actions */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 24 }}>
        <ActionBtn onClick={checkExisting} disabled={status === "seeding" || status === "checking"} variant="outline">
          🔍 Check Existing Data
        </ActionBtn>
        <ActionBtn onClick={seedStatic} disabled={status === "seeding" || status === "checking"} variant="primary">
          ⚡ Phase 1: Seed Static Data
        </ActionBtn>
        <ActionBtn onClick={seedWithGemini} disabled={status === "seeding" || status === "checking"} variant="primary">
          🤖 Phase 2: AI Fill Remaining
        </ActionBtn>
        <ActionBtn onClick={clearAll} disabled={status === "seeding"} variant="danger">
          🗑️ Clear All Data
        </ActionBtn>
      </div>

      <div style={{ marginBottom: 12, fontSize: ".85rem", color: "var(--text2)" }}>
        ℹ️ Phase 1 seeds ~{Object.keys(WILDLIFE_SEED).length} named species from built-in data.
        Phase 2 uses the Gemini API for the rest — requires the Replit API server (/api endpoint).
      </div>

      {/* Progress bar */}
      {(status === "seeding" || status === "checking") && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: ".85rem", color: "var(--text2)", marginBottom: 4 }}>
            <span>{status === "checking" ? "Checking…" : "Seeding…"}</span>
            <span>{progress}/{total} ({pct}%)</span>
          </div>
          <div style={{ background: "rgba(255,255,255,0.08)", borderRadius: 4, height: 8, overflow: "hidden" }}>
            <div style={{ width: `${pct}%`, height: "100%", background: "var(--primary)", transition: "width .2s" }} />
          </div>
        </div>
      )}

      {status === "done" && (
        <div style={{ background: "rgba(34,197,94,.15)", border: "1px solid rgba(34,197,94,.3)", borderRadius: 8, padding: "12px 16px", marginBottom: 20, color: "#22c55e" }}>
          ✅ Seeding complete! Visit any Animal Detail page to see the data.
        </div>
      )}

      {/* Log */}
      {log.length > 0 && (
        <div style={{ background: "rgba(0,0,0,.3)", borderRadius: 8, padding: 16, maxHeight: 400, overflowY: "auto", fontFamily: "monospace", fontSize: ".8rem", lineHeight: 1.6 }}>
          {log.map((entry, i) => (
            <div key={i} style={{ color: entry.type === "error" ? "#f87171" : entry.type === "success" ? "#22c55e" : "rgba(255,255,255,.75)" }}>
              {new Date(entry.ts).toLocaleTimeString()} — {entry.msg}
            </div>
          ))}
        </div>
      )}

      {/* Species coverage */}
      <div style={{ marginTop: 32 }}>
        <h3 style={{ marginBottom: 12 }}>Built-in Coverage ({Object.keys(WILDLIFE_SEED).length} species)</h3>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {Object.keys(WILDLIFE_SEED).map((name) => (
            <span key={name} style={{ background: "rgba(34,197,94,.15)", border: "1px solid rgba(34,197,94,.25)", borderRadius: 4, padding: "2px 8px", fontSize: ".78rem", color: "var(--text1)" }}>{name}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, color }) {
  return (
    <div style={{ background: "var(--card)", borderRadius: 8, padding: "12px 16px", textAlign: "center" }}>
      <div style={{ fontSize: "1.6rem", fontWeight: 700, color }}>{value}</div>
      <div style={{ fontSize: ".78rem", color: "var(--text2)", marginTop: 2 }}>{label}</div>
    </div>
  );
}

function ActionBtn({ children, onClick, disabled, variant }) {
  const bg = variant === "primary" ? "var(--primary)" : variant === "danger" ? "#ef4444" : "transparent";
  const border = variant === "outline" ? "1px solid var(--border)" : "none";
  const color = variant === "primary" || variant === "danger" ? "#000" : "var(--text1)";
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{ background: bg, border, color, borderRadius: 6, padding: "8px 16px", fontWeight: 600, cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.5 : 1, fontSize: ".88rem" }}
    >
      {children}
    </button>
  );
}
