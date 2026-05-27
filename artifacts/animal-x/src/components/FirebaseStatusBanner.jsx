import { useState, useEffect } from "react";
import { runFullHealthCheck, log } from "../utils/FirebaseHealthChecker";

let hasChecked = false;

export default function FirebaseStatusBanner() {
  const [errors, setErrors] = useState([]);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (hasChecked) return;
    hasChecked = true;

    const timeout = setTimeout(async () => {
      try {
        const result = await runFullHealthCheck();
        const errs = [];
        if (!result.firestore.ok) errs.push({ service: "Firestore", msg: result.firestore.error });
        if (!result.rtdb.ok) errs.push({ service: "Realtime DB", msg: result.rtdb.error });
        if (errs.length > 0) {
          setErrors(errs);
          log("warn", "StatusBanner", `${errs.length} service(s) have issues`);
        }
      } catch (err) {
        log("error", "StatusBanner", "Health check failed", err.message);
      }
    }, 3000);

    return () => clearTimeout(timeout);
  }, []);

  if (dismissed || errors.length === 0) return null;

  return (
    <div className="fb-status-banner">
      <div className="fb-status-inner">
        <span className="fb-status-icon">⚠️</span>
        <div className="fb-status-msgs">
          {errors.map((e, i) => (
            <div key={i} className="fb-status-line">
              <b>{e.service}:</b> {e.msg}
            </div>
          ))}
          <div className="fb-status-hint">
            Paste the Security Rules from the Admin Debug Panel (tap 🦁 × 7 as admin) into Firebase Console.
          </div>
        </div>
        <button className="fb-status-dismiss" onClick={() => setDismissed(true)}>✕</button>
      </div>
    </div>
  );
}
