import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useSocial } from "../context/SocialContext";
import { Link } from "wouter";

const PLANS = [
  { id: "starter", name: "Starter", price: 149, views: "2,000 Views", color: "#22c55e" },
  { id: "basic", name: "Basic", price: 299, views: "5,000 Views", color: "#3b82f6" },
  { id: "growth", name: "Growth", price: 599, views: "15,000 Views", color: "#a855f7", popular: true },
  { id: "business", name: "Business", price: 1499, views: "50,000 Views", color: "#f59e0b" },
  { id: "premium", name: "Premium", price: 4999, views: "250,000 Views", color: "#ef4444" },
];

const CATEGORIES = [
  "Lions","Tigers","Wolves","Dogs","Cats","Birds","Reptiles","Ocean Animals",
  "Forest Animals","Safari","Nature","Mountains","Desert","Wildlife Travel","Zoo Lovers",
];

const UPI_ID = "nakumamit27-1@okicici";

export default function Ads() {
  const { user } = useAuth();
  const { submitAd } = useSocial();

  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    title: "", description: "", websiteUrl: "", targetCategories: [],
  });
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [paymentDone, setPaymentDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!user) {
    return (
      <div className="ads-page">
        <div className="ads-login-prompt">
          <div style={{ fontSize: 64 }}>📢</div>
          <h2>Advertise on Animal X</h2>
          <p>Reach millions of wildlife lovers. Login to create your first ad.</p>
          <Link href="/auth" className="auth-btn" style={{ textDecoration: "none", display: "inline-block", marginTop: 16 }}>
            🔑 Login to Continue
          </Link>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="ads-page">
        <div className="ads-success">
          <div style={{ fontSize: 72 }}>🎉</div>
          <h2>Ad Submitted!</h2>
          <p>Your advertisement has been submitted for admin review. You'll be notified once it's approved and goes live.</p>
          <div className="ads-success-details">
            <div><b>Plan:</b> {selectedPlan?.name} — ₹{selectedPlan?.price}</div>
            <div><b>Reach:</b> {selectedPlan?.views}</div>
            <div><b>Status:</b> Pending Review ⏳</div>
          </div>
          <button className="auth-btn" style={{ marginTop: 20 }} onClick={() => { setStep(1); setSubmitted(false); setPaymentDone(false); setSelectedPlan(null); setForm({ title:"",description:"",websiteUrl:"",targetCategories:[] }); }}>
            Create Another Ad
          </button>
        </div>
      </div>
    );
  }

  async function handleSubmit() {
    if (!paymentDone) { alert("Please confirm payment before submitting."); return; }
    setSubmitting(true);
    const ok = await submitAd({
      ...form,
      plan: selectedPlan.id,
      price: selectedPlan.price,
      viewsLimit: parseInt(selectedPlan.views.replace(/\D/g,"")),
    });
    setSubmitting(false);
    if (ok) setSubmitted(true);
    else alert("Submission failed. Please try again.");
  }

  function toggleCategory(cat) {
    setForm(f => ({
      ...f,
      targetCategories: f.targetCategories.includes(cat)
        ? f.targetCategories.filter(c => c !== cat)
        : [...f.targetCategories, cat],
    }));
  }

  function copyUPI() {
    navigator.clipboard?.writeText(UPI_ID).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="ads-page">
      <div className="ads-header">
        <h1 className="ads-title">📢 Run Advertisement</h1>
        <p className="ads-subtitle">Reach targeted wildlife enthusiasts across Animal X</p>
        <div className="ads-steps">
          {["Ad Details","Target","Plan","Payment"].map((s, i) => (
            <div key={i} className={`ads-step ${step > i + 1 ? "done" : step === i + 1 ? "active" : ""}`}>
              <div className="ads-step-num">{step > i + 1 ? "✓" : i + 1}</div>
              <div className="ads-step-label">{s}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="ads-body">
        {step === 1 && (
          <div className="ads-section">
            <h2>📝 Ad Details</h2>
            <div className="form-group">
              <label>Ad Title *</label>
              <input className="auth-input" type="text" placeholder="e.g. Safari Booking — 30% Off" value={form.title} onChange={e => setForm(f => ({...f, title: e.target.value}))} required />
            </div>
            <div className="form-group">
              <label>Description *</label>
              <textarea className="auth-input" rows={3} placeholder="Describe your product or service..." value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))} style={{ resize: "vertical" }} />
            </div>
            <div className="form-group">
              <label>Website / Contact Link</label>
              <input className="auth-input" type="url" placeholder="https://yourwebsite.com" value={form.websiteUrl} onChange={e => setForm(f => ({...f, websiteUrl: e.target.value}))} />
            </div>
            <button className="auth-btn" disabled={!form.title || !form.description} onClick={() => setStep(2)}>
              Next: Choose Target →
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="ads-section">
            <h2>🎯 Target Audience Categories</h2>
            <p style={{ color: "var(--text2)", marginBottom: 16, fontSize: "0.875rem" }}>Select which category viewers will see your ad. Choose multiple.</p>
            <div className="ads-categories">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  className={`ads-cat-btn ${form.targetCategories.includes(cat) ? "selected" : ""}`}
                  onClick={() => toggleCategory(cat)}
                >
                  {form.targetCategories.includes(cat) ? "✓ " : ""}{cat}
                </button>
              ))}
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 20 }}>
              <button className="auth-btn" style={{ background: "var(--surface2)" }} onClick={() => setStep(1)}>← Back</button>
              <button className="auth-btn" onClick={() => setStep(3)}>Next: Choose Plan →</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="ads-section">
            <h2>💰 Advertisement Plans</h2>
            <div className="ads-plans">
              {PLANS.map(plan => (
                <div
                  key={plan.id}
                  className={`ads-plan-card ${selectedPlan?.id === plan.id ? "selected" : ""} ${plan.popular ? "popular" : ""}`}
                  onClick={() => setSelectedPlan(plan)}
                  style={{ borderColor: selectedPlan?.id === plan.id ? plan.color : undefined }}
                >
                  {plan.popular && <div className="ads-popular-badge">🔥 Most Popular</div>}
                  <div className="ads-plan-name" style={{ color: plan.color }}>{plan.name}</div>
                  <div className="ads-plan-price">₹{plan.price}</div>
                  <div className="ads-plan-views">{plan.views}</div>
                  <div className="ads-plan-features">
                    <div>✅ Targeted delivery</div>
                    <div>✅ Appears between reels</div>
                    <div>✅ Branded label</div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 20 }}>
              <button className="auth-btn" style={{ background: "var(--surface2)" }} onClick={() => setStep(2)}>← Back</button>
              <button className="auth-btn" disabled={!selectedPlan} onClick={() => setStep(4)}>Next: Payment →</button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="ads-section">
            <h2>💳 Payment</h2>
            <div className="ads-payment-card">
              <div className="ads-order-summary">
                <h3>Order Summary</h3>
                <div className="ads-order-row"><span>{selectedPlan?.name} Plan</span><span>₹{selectedPlan?.price}</span></div>
                <div className="ads-order-row"><span>Reach</span><span>{selectedPlan?.views}</span></div>
                <div className="ads-order-row total"><span>Total</span><span>₹{selectedPlan?.price}</span></div>
              </div>

              <div className="ads-upi-section">
                <div className="ads-upi-label">Pay via UPI</div>
                <div className="ads-upi-id">{UPI_ID}</div>
                <button className="ads-copy-btn" onClick={copyUPI}>
                  {copied ? "✅ Copied!" : "📋 Copy UPI ID"}
                </button>
                <div className="ads-upi-hint">
                  Open any UPI app (PhonePe, GPay, Paytm, etc.) → Pay to UPI ID above → Amount: ₹{selectedPlan?.price}
                </div>
                <div className="ads-qr-placeholder">
                  <div style={{ fontSize: 48 }}>📱</div>
                  <div style={{ fontSize: "0.8rem", marginTop: 8 }}>Open your UPI app and pay ₹{selectedPlan?.price} to</div>
                  <div style={{ fontWeight: "bold", fontSize: "0.95rem" }}>{UPI_ID}</div>
                </div>
              </div>

              <label className="ads-confirm-row">
                <input type="checkbox" checked={paymentDone} onChange={e => setPaymentDone(e.target.checked)} />
                <span>I have completed the payment of <b>₹{selectedPlan?.price}</b> to UPI ID <b>{UPI_ID}</b></span>
              </label>
            </div>

            <div style={{ display: "flex", gap: 8, marginTop: 20 }}>
              <button className="auth-btn" style={{ background: "var(--surface2)" }} onClick={() => setStep(3)}>← Back</button>
              <button className="auth-btn" disabled={!paymentDone || submitting} onClick={handleSubmit}>
                {submitting ? <span className="auth-spinner" /> : "🚀 Submit Ad for Review"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
