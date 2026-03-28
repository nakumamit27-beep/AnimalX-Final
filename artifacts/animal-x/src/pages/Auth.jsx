import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useLocation } from "wouter";

export default function Auth() {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const { user, login, signup, logout } = useAuth();
  const [, navigate] = useLocation();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (mode === "login") {
      const ok = login(form.email, form.password);
      if (ok) navigate("/");
    } else {
      const ok = signup(form.name, form.email, form.password);
      if (ok) navigate("/");
    }
  };

  if (user) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-avatar">👤</div>
          <h2 className="auth-title">Welcome back!</h2>
          <p className="auth-subtitle">{user.name || user.email}</p>
          <div className="user-info">
            <div className="user-info-row"><span>📧</span><span>{user.email}</span></div>
            <div className="user-info-row"><span>📅</span><span>Member</span></div>
          </div>
          <button className="auth-btn danger" onClick={logout}>🚪 Sign Out</button>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-avatar">🦁</div>
        <h2 className="auth-title">{mode === "login" ? "Sign In" : "Create Account"}</h2>
        <p className="auth-subtitle">
          {mode === "login" ? "Welcome back to Animal X" : "Join the wildlife community"}
        </p>

        <div className="auth-tabs">
          <button className={`auth-tab ${mode === "login" ? "active" : ""}`} onClick={() => setMode("login")}>Login</button>
          <button className={`auth-tab ${mode === "signup" ? "active" : ""}`} onClick={() => setMode("signup")}>Sign Up</button>
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
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              required
              minLength={6}
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              placeholder="At least 6 characters"
            />
          </div>
          <button type="submit" className="auth-btn">
            {mode === "login" ? "🔓 Sign In" : "🌿 Create Account"}
          </button>
        </form>

        <p className="auth-switch">
          {mode === "login" ? "Don't have an account? " : "Already have an account? "}
          <button className="auth-link" onClick={() => setMode(mode === "login" ? "signup" : "login")}>
            {mode === "login" ? "Sign Up" : "Sign In"}
          </button>
        </p>
      </div>
    </div>
  );
}
