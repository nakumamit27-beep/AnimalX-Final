import { useState, useEffect } from "react";
import { APP_START_TIME } from "../utils/perf";

function fmt(ms) {
  if (ms == null || isNaN(ms)) return "—";
  return `${Math.round(ms)}ms`;
}

function getRating(ms, good, ok) {
  if (ms <= good) return { label: "Excellent", color: "#10b981" };
  if (ms <= ok)   return { label: "Good", color: "#22d3ee" };
  if (ms <= ok * 2) return { label: "Fair", color: "#f59e0b" };
  return { label: "Slow", color: "#ef4444" };
}

export default function PerformanceBenchmark({ onClose }) {
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    // Give the page time to settle before measuring
    const timer = setTimeout(() => {
      const now = performance.now();
      const nav = performance.getEntriesByType("navigation")[0];
      const paint = performance.getEntriesByType("paint");

      const fcp = paint.find(p => p.name === "first-contentful-paint")?.startTime;
      const lcp = (() => {
        try {
          return new Promise(res => {
            new PerformanceObserver(list => {
              const entries = list.getEntries();
              res(entries[entries.length - 1]?.startTime);
            }).observe({ entryTypes: ["largest-contentful-paint"] });
            setTimeout(() => res(null), 2000);
          });
        } catch { return Promise.resolve(null); }
      })();

      lcp.then(lcpVal => {
        setMetrics({
          startupTime: Math.round(now - APP_START_TIME),
          fcp: fcp ? Math.round(fcp) : null,
          lcp: lcpVal ? Math.round(lcpVal) : null,
          domComplete: nav ? Math.round(nav.domComplete) : null,
          transferSize: nav ? Math.round(nav.transferSize / 1024) : null,
          heapUsed: performance.memory ? Math.round(performance.memory.usedJSHeapSize / 1024 / 1024 * 10) / 10 : null,
          heapTotal: performance.memory ? Math.round(performance.memory.totalJSHeapSize / 1024 / 1024 * 10) / 10 : null,
          timestamp: new Date().toLocaleTimeString(),
        });
      });
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const rows = metrics ? [
    { label: "⚡ App Startup", value: fmt(metrics.startupTime), raw: metrics.startupTime, good: 600, ok: 1200, note: "Time from JS parse → UI visible" },
    { label: "🎨 First Paint (FCP)", value: fmt(metrics.fcp), raw: metrics.fcp, good: 800, ok: 1800, note: "First content on screen" },
    { label: "🖼️ Largest Paint (LCP)", value: fmt(metrics.lcp), raw: metrics.lcp, good: 1500, ok: 2500, note: "Main content fully rendered" },
    { label: "📄 DOM Complete", value: fmt(metrics.domComplete), raw: metrics.domComplete, good: 1000, ok: 2000, note: "Document fully parsed" },
    { label: "📦 Transfer Size", value: metrics.transferSize ? `${metrics.transferSize} KB` : "—", raw: null, good: null, ok: null, note: "Initial network download" },
    { label: "🧠 JS Heap Used", value: metrics.heapUsed ? `${metrics.heapUsed} MB` : "N/A", raw: null, good: null, ok: null, note: "JavaScript memory usage" },
    { label: "🧠 JS Heap Total", value: metrics.heapTotal ? `${metrics.heapTotal} MB` : "N/A", raw: null, good: null, ok: null, note: "Total allocated JS memory" },
  ] : [];

  return (
    <div className="debug-backdrop" onClick={onClose}>
      <div className="debug-panel" onClick={e => e.stopPropagation()}>
        <div className="debug-header">
          <span>📊 Performance Benchmark</span>
          <button className="debug-close" onClick={onClose}>✕</button>
        </div>

        <div className="debug-body">
          {!metrics && (
            <div className="debug-checking">⏳ Measuring performance metrics…</div>
          )}

          {metrics && (
            <>
              <div className="debug-user-card" style={{ background: "rgba(16,185,129,.08)", borderColor: "rgba(16,185,129,.2)" }}>
                <span>🕐</span>
                <div>
                  <div style={{ fontWeight: 700 }}>Benchmark taken at {metrics.timestamp}</div>
                  <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>Live metrics from browser Performance API</div>
                </div>
              </div>

              <div className="perf-rows">
                {rows.map((row, i) => {
                  const rating = row.raw != null ? getRating(row.raw, row.good, row.ok) : null;
                  return (
                    <div key={i} className="perf-row">
                      <div className="perf-row-left">
                        <div className="perf-label">{row.label}</div>
                        <div className="perf-note">{row.note}</div>
                      </div>
                      <div className="perf-row-right">
                        <div className="perf-value">{row.value}</div>
                        {rating && (
                          <div className="perf-badge" style={{ color: rating.color, borderColor: rating.color + "44", background: rating.color + "15" }}>
                            {rating.label}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="perf-optimizations">
                <div className="perf-opt-title">✅ Active Optimizations</div>
                {[
                  ["Lazy-loaded routes", "Each page loads only when visited (Leaflet, Firebase etc split out)"],
                  ["Offline persistence", "Firestore data cached locally — instant on repeat visits"],
                  ["Non-blocking fonts", "Google Fonts no longer blocks first paint"],
                  ["Vite chunk splitting", "Firebase, Leaflet, React split into separate cached chunks"],
                  ["Passive Firebase status", "No health check requests on startup"],
                  ["React.startTransition", "Splash → app transition is non-blocking"],
                  ["Splash: 400ms", "Reduced from 1500ms — saves 1.1 seconds every open"],
                  ["IntersectionObserver", "Animal cards load only when scrolled into view"],
                  ["Image emoji fallback", "Failed images show emoji instantly — no broken image flicker"],
                  ["QueryClient staleTime", "API results cached for 5 minutes — no redundant fetches"],
                ].map(([name, desc], i) => (
                  <div key={i} className="perf-opt-row">
                    <span className="perf-opt-check">✅</span>
                    <div>
                      <div className="perf-opt-name">{name}</div>
                      <div className="perf-opt-desc">{desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
