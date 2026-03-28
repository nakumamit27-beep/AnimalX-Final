import { useAuth } from "../context/AuthContext";

export default function Premium() {
  const { isPremium, unlockPremium, tasks, completeTask } = useAuth();

  const allTasksDone = tasks.puzzle && tasks.visit && tasks.share;

  return (
    <div className="premium-page">
      <div className="premium-header">
        <div className="premium-crown">👑</div>
        <h1 className="page-title">Animal X Premium</h1>
        <p className="page-subtitle">Unlock unlimited access to all 1,350+ animals, exclusive content, and more</p>
      </div>

      {isPremium ? (
        <div className="premium-active">
          <div className="premium-active-icon">✅</div>
          <h2>You're a Premium Member!</h2>
          <p>Enjoy unlimited access to all wildlife content.</p>
          <div className="premium-perks">
            {["Unlimited Animals", "All Zoo Details", "Exclusive Reels", "Priority Support", "Wildlife Reports"].map(p => (
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
                <li>✅ All 1,350+ animals unlocked</li>
                <li>✅ 200+ zoos with details</li>
                <li>✅ Upload & share reels</li>
                <li>✅ Wildlife chatbot advanced</li>
                <li>✅ Trip planner access</li>
                <li>✅ No ads</li>
              </ul>
              <button className="premium-btn" onClick={() => {
                if (window.confirm("Unlock Premium for ₹99? (Demo mode — click OK to activate)")) {
                  unlockPremium();
                }
              }}>
                💳 Pay ₹99 & Unlock
              </button>
            </div>

            <div className="premium-card free">
              <div className="premium-badge free-badge">Free Option</div>
              <div className="premium-price">₹0</div>
              <div className="premium-period">Complete 3 tasks</div>
              <ul className="premium-features">
                <li>🧩 Complete a wildlife puzzle</li>
                <li>⏱️ Visit for 5+ minutes</li>
                <li>🔁 Share Animal X</li>
              </ul>

              <div className="tasks-list">
                <button
                  className={`task-btn ${tasks.puzzle ? "done" : ""}`}
                  onClick={() => !tasks.puzzle && completeTask("puzzle")}
                >
                  {tasks.puzzle ? "✅" : "🧩"} Wildlife Puzzle — {tasks.puzzle ? "Done!" : "Tap to Complete"}
                </button>
                <button
                  className={`task-btn ${tasks.visit ? "done" : ""}`}
                  onClick={() => !tasks.visit && completeTask("visit")}
                >
                  {tasks.visit ? "✅" : "⏱️"} 5-Min Visit — {tasks.visit ? "Done!" : "Tap to Mark Done"}
                </button>
                <button
                  className={`task-btn ${tasks.share ? "done" : ""}`}
                  onClick={() => {
                    if (!tasks.share) {
                      completeTask("share");
                      if (navigator.share) {
                        navigator.share({ title: "Animal X — Wildlife Explorer", url: window.location.origin }).catch(() => {});
                      } else {
                        navigator.clipboard?.writeText(window.location.origin).catch(() => {});
                        alert("Link copied! Share it to unlock premium.");
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
                <tr><td>Animals visible</td><td>First 20</td><td>All 1,350+</td></tr>
                <tr><td>Zoo map</td><td>View only</td><td>Full details</td></tr>
                <tr><td>Reels</td><td>View only</td><td>Upload + share</td></tr>
                <tr><td>Chatbot</td><td>Basic</td><td>Advanced</td></tr>
                <tr><td>Travel planner</td><td>Limited</td><td>Full access</td></tr>
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
