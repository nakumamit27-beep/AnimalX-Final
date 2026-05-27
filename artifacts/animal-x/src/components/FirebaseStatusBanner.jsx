import { useState, useEffect, useRef } from "react";

// Passive Firebase status banner — does NOT run health checks on startup.
// Only shows if Firebase throws actual permission/network errors during normal use.
// This prevents the 5 extra network requests that were slowing down every page load.

const KNOWN_ERRORS = [
  { code: "permission-denied", msg: "Firestore permission denied", hint: "Paste Security Rules from Admin Debug Panel into Firebase Console → Firestore → Rules" },
  { code: "unavailable", msg: "Firebase unavailable", hint: "Check your internet connection" },
  { code: "network-request-failed", msg: "Network request failed", hint: "Device may be offline or Firebase is unreachable" },
];

let _errorListeners = [];
export function reportFirebaseError(code, service) {
  _errorListeners.forEach(fn => fn(code, service));
}

export default function FirebaseStatusBanner() {
  const [error, setError] = useState(null);
  const [dismissed, setDismissed] = useState(false);
  const seenRef = useRef(new Set());

  useEffect(() => {
    const handler = (code, service) => {
      if (seenRef.current.has(code)) return;
      const known = KNOWN_ERRORS.find(e => code?.includes(e.code));
      if (known) {
        seenRef.current.add(code);
        setDismissed(false);
        setError({ service, ...known });
      }
    };
    _errorListeners.push(handler);
    return () => { _errorListeners = _errorListeners.filter(fn => fn !== handler); };
  }, []);

  if (!error || dismissed) return null;

  return (
    <div className="fb-status-banner">
      <div className="fb-status-inner">
        <span className="fb-status-icon">⚠️</span>
        <div className="fb-status-msgs">
          <div className="fb-status-line">
            <b>{error.service}:</b> {error.msg}
          </div>
          <div className="fb-status-hint">{error.hint}</div>
        </div>
        <button className="fb-status-dismiss" onClick={() => setDismissed(true)}>✕</button>
      </div>
    </div>
  );
}
