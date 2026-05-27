import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useLocation } from "wouter";

export default function Auth() {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotStatus, setForgotStatus] = useState(null);
  const [forgotError, setForgotError] = useState("");

  const { user, login, signup, logout, forgotPassword } = useAuth();
  const [, navigate] = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const ok = mode === "login"
      ? await login(form.email, form.password)
      : await signup(form.name, form.email, form.password);
    setLoading(false);
    if (ok) navigate("/");
  };

  const openForgot = () => {
    setForgotOpen(true);
    setForgotStatus(null);
    setForgotError("");
    setForgotEmail("");
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    if (!forgotEmail.trim() || forgotStatus === "sending") return;
    setForgotStatus("sending");
    setForgotError("");
    try {
      await forgotPassword(forgotEmail.trim());
      setForgotStatus("sent");
    } catch (err) {
      setForgotStatus("error");
      setForgotError(
        err.code === "auth/user-not-found" ? "No account found with this email." :
        err.code === "auth/invalid-email" ? "Please enter a valid email address." :
        err.code === "auth/network-request-failed" ? "Network error. Please check your connection." :
        err.message || "Something went wrong. Please try again."
      );
    }
  };

  if (user) {
    return (
      <div className="auth-page">
        <div className="auth-card auth-fade-in">
          <div className="auth-avatar-circle">👤</div>
          <h2 className="auth-title">Welcome back!</h2>
          <p className="auth-subtitle">{user.name || user.email}</p>
          <div className="user-info">
            <div className="user-info-row"><span>📧</span><span>{user.email}</span></div>
            <div className="user-info-row"><span>🐾</span><span>Wildlife Community Member</span></div>
          </div>
          <button className="auth-btn danger" onClick={logout}>🚪 Sign Out</button>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-card auth-fade-in">
        <div className="auth-avatar-circle">🦁</div>
        <h2 className="auth-title">{mode === "login" ? "Sign In" : "Create Account"}</h2>
        <p className="auth-subtitle">
          {mode === "login" ? "Welcome back to Animal X" : "Join the wildlife community"}
        </p>

        <div className="auth-tabs">
          <button className={`auth-tab ${mode === "login" ? "active" : ""}`} onClick={() => { setMode("login"); setShowPw(false); }}>Sign In</button>
          <button className={`auth-tab ${mode === "signup" ? "active" : ""}`} onClick={() => { setMode("signup"); setShowPw(false); }}>Sign Up</button>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {mode === "signup" && (
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="Your name"
                className="auth-input"
              />
            </div>
          )}
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              placeholder="your@email.com"
              className="auth-input"
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <div className="pw-wrap">
              <input
                type={showPw ? "text" : "password"}
                required
                minLength={6}
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                placeholder="At least 6 characters"
                className="auth-input"
              />
              <button type="button" className="pw-toggle" onClick={() => setShowPw(v => !v)} tabIndex={-1} aria-label="Toggle password">
                {showPw ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          {mode === "login" && (
            <button type="button" className="forgot-link" onClick={openForgot}>
              Forgot Password?
            </button>
          )}

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading
              ? <span className="auth-spinner" />
              : mode === "login" ? "🔓 Sign In" : "🌿 Create Account"}
          </button>
        </form>

        <p className="auth-switch">
          {mode === "login" ? "Don't have an account? " : "Already have an account? "}
          <button className="auth-link" onClick={() => { setMode(mode === "login" ? "signup" : "login"); setShowPw(false); }}>
            {mode === "login" ? "Sign Up" : "Sign In"}
          </button>
        </p>
      </div>

      {forgotOpen && (
        <div className="modal-backdrop" onClick={() => setForgotOpen(false)}>
          <div className="auth-card" style={{ maxWidth: 380, margin: "auto", position: "relative", zIndex: 1001 }} onClick={e => e.stopPropagation()}>
            <button className="modal-x-btn" onClick={() => setForgotOpen(false)}>✕</button>
            <div className="auth-avatar-circle" style={{ fontSize: 36 }}>🔑</div>
            <h2 className="auth-title" style={{ marginTop: 8 }}>Reset Password</h2>

            {forgotStatus === "sent" ? (
              <div style={{ textAlign: "center", padding: "12px 0" }}>
                <div style={{ fontSize: 52, marginBottom: 12 }}>📬</div>
                <h3 style={{ color: "var(--accent)", marginBottom: 8 }}>Email Sent!</h3>
                <p style={{ color: "var(--text2)", fontSize: "0.9rem", marginBottom: 20 }}>
                  Password reset email sent successfully. Check your inbox and follow the link to reset your password.
                </p>
                <button className="auth-btn" onClick={() => setForgotOpen(false)}>Done ✓</button>
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit} style={{ width: "100%" }}>
                <p style={{ color: "var(--text2)", marginBottom: 16, fontSize: "0.875rem" }}>
                  Enter your email and we'll send you a reset link.
                </p>
                <div className="form-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={e => setForgotEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="auth-input"
                    disabled={forgotStatus === "sending"}
                    autoFocus
                  />
                </div>
                {forgotError && <div className="forgot-error">{forgotError}</div>}
                <button type="submit" className="auth-btn" disabled={forgotStatus === "sending"} style={{ marginTop: 8 }}>
                  {forgotStatus === "sending" ? <span className="auth-spinner" /> : "📧 Send Reset Email"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
