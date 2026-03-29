import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

export default function Premium() {
  const { isPremium, unlockPremium, tasks, completeTask } = useAuth();
  const [watchTime, setWatchTime] = useState(0);
  const [verifyStep, setVerifyStep] = useState(false);

  const allTasksDone = tasks.puzzle && tasks.visit && tasks.share;

  useEffect(() => {
    if (tasks.visit) return;
    const timer = setInterval(() => {
      setWatchTime(prev => {
        const next = prev + 1;
        if (next >= 5) {
          completeTask("visit");
          clearInterval(timer);
        }
        return next;
      });
    }, 60000);
    return () => clearInterval(timer);
  }, [tasks.visit]);

  function handlePuzzle() {
    if (tasks.puzzle) return;
    const answer = window.prompt("🧩 Wildlife Puzzle\n\nWhich animal is the king of the jungle?");
    if (answer && answer.trim().toLowerCase() === "lion") {
      completeTask("puzzle");
      alert("✅ Correct! Puzzle task completed.");
    } else if (answer !== null) {
      alert("❌ Wrong answer. Hint: It roars loudly 🦁");
    }
  }

  function handleUPIPayment() {
    const upiUrl = "upi://pay?pa=nakumamit27-1@okaxis&pn=AnimalX&am=99&cu=INR";
    window.location.href = upiUrl;
    setTimeout(() => {
      setVerifyStep(true);
    }, 1500);
  }

  function handleVerifyPayment() {
    if (window.confirm("✅ Have you completed the ₹99 payment?")) {
      unlockPremium();
      alert("🎉 Premium Unlocked! Welcome to Animal X Premium.");
      setVerifyStep(false);
    }
  }

  return (
    <div className="premium-page">
      <div className="premium-header">
        <div className="premium-crown">👑</div>
        <h1 className="page-title">Animal X Premium</h1>
        <p className="page-subtitle">Unlock unlimited access to all 1,500+ animals, exclusive content, and more</p>
      </div>

      {isPremium ? (
        <div className="premium-active">
          <div className="premium-active-icon">✅</div>
          <h2>You're a Premium Member!</h2>
          <p>Enjoy unlimited access to all wildlife content.</p>
          <div className="premium-perks">
            {["1,500+ Animals", "All Zoo Details", "Exclusive Reels", "Priority Support", "Wildlife Reports", "Trees Category"].map(p => (
              <div key={p} className="perk-item">✓ {p}</div>
            ))}
          </div>
        </div>
      ) : (
        <>
          <div className="premium-options">
            <div className="premium-card featured">
              <div className="premium-badge">Most Popular</div>
              <div className="premium-price">₹99</div>
              <div className="premium-period">One-time unlock</div>
              <ul className="premium-features">
                <li>✅ All 1,500+ animals unlocked</li>
                <li>✅ 200+ zoos with details</li>
                <li>✅ Upload &amp; share reels</li>
                <li>✅ Wildlife chatbot advanced</li>
                <li>✅ Trip planner access</li>
                <li>✅ No ads</li>
              </ul>

              {!verifyStep ? (
                <button className="premium-btn" onClick={handleUPIPayment}>
                  💰 Pay ₹99 via UPI
                </button>
              ) : (
                <div className="verify-section">
                  <p className="verify-hint">Complete payment in your UPI app, then tap verify.</p>
                  <button className="premium-btn verify-btn" onClick={handleVerifyPayment}>
                    ✅ Verify Payment
                  </button>
                  <button className="premium-btn-outline" onClick={() => setVerifyStep(false)}>
                    ← Try Again
                  </button>
                </div>
              )}
            </div>

            <div className="premium-card free">
              <div className="premium-badge free-badge">Free Option</div>
              <div className="premium-price">₹0</div>
              <div className="premium-period">Complete 3 tasks</div>
              <ul className="premium-features">
                <li>🧩 Solve a wildlife puzzle</li>
                <li>⏱️ Visit app for 5 minutes</li>
                <li>🔁 Share Animal X</li>
              </ul>

              <div className="tasks-list">
                <button
                  className={`task-btn ${tasks.puzzle ? "done" : ""}`}
                  onClick={handlePuzzle}
                >
                  {tasks.puzzle ? "✅" : "🧩"} Wildlife Puzzle — {tasks.puzzle ? "Done!" : "Tap to Solve"}
                </button>

                <div className={`task-btn ${tasks.visit ? "done" : ""}`} style={{ cursor: "default" }}>
                  {tasks.visit ? "✅" : "⏱️"} 5-Minute Visit —{" "}
                  {tasks.visit ? "Done!" : `${watchTime}/5 min`}
                  {!tasks.visit && (
                    <div className="visit-progress">
                      <div className="visit-bar" style={{ width: `${Math.min((watchTime / 5) * 100, 100)}%` }} />
                    </div>
                  )}
                </div>

                <button
                  className={`task-btn ${tasks.share ? "done" : ""}`}
                  onClick={() => {
                    if (!tasks.share) {
                      completeTask("share");
                      if (navigator.share) {
                        navigator.share({ title: "Animal X — Wildlife Explorer", url: window.location.origin }).catch(() => {});
                      } else {
                        navigator.clipboard?.writeText(window.location.origin).catch(() => {});
                        alert("Link copied! Share it with friends.");
                      }
                    }
                  }}
                >
                  {tasks.share ? "✅" : "🔁"} Share Animal X — {tasks.share ? "Done!" : "Tap to Share"}
                </button>
              </div>

              {allTasksDone && (
                <div className="tasks-complete">
                  🎉 All tasks complete! Premium unlocked automatically.
                </div>
              )}
            </div>
          </div>

          <div className="premium-comparison">
            <h3>Free vs Premium</h3>
            <table className="compare-table">
              <thead>
                <tr><th>Feature</th><th>Free</th><th>Premium</th></tr>
              </thead>
              <tbody>
                <tr><td>Animals visible</td><td>First 20</td><td>All 1,500+</td></tr>
                <tr><td>Zoo map</td><td>View only</td><td>Full details</td></tr>
                <tr><td>Reels</td><td>View only</td><td>Upload + share</td></tr>
                <tr><td>Chatbot</td><td>Basic</td><td>Advanced</td></tr>
                <tr><td>Trees category</td><td>❌</td><td>✅</td></tr>
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
