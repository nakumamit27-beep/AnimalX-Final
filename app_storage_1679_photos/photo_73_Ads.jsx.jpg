import { useState, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { useSocial } from "../context/SocialContext";
import { Link } from "wouter";

const PLANS = [
  { id: "starter",  name: "Starter",  price: 149,  usd: 2,   views: "2,000 Views",   color: "#22c55e", desc: "Great for local wildlife pages" },
  { id: "basic",    name: "Basic",    price: 299,  usd: 4,   views: "5,000 Views",   color: "#3b82f6", desc: "Small creators & communities" },
  { id: "growth",   name: "Growth",   price: 599,  usd: 7,   views: "15,000 Views",  color: "#a855f7", desc: "Most popular for mid-tier creators", popular: true },
  { id: "business", name: "Business", price: 1499, usd: 18,  views: "50,000 Views",  color: "#f59e0b", desc: "Wildlife brands & NGOs" },
  { id: "premium",  name: "Premium",  price: 4999, usd: 60,  views: "250,000 Views", color: "#ef4444", desc: "Maximum reach globally" },
];

const CATEGORIES = [
  "Lions","Tigers","Wolves","Dogs","Cats","Birds","Reptiles","Ocean Animals",
  "Forest Animals","Safari","Nature","Mountains","Desert","Wildlife Travel","Zoo Lovers",
];

const PAYPAL_LINK = "https://www.paypal.com/ncp/payment/K5VACCZPCJJKG";
const UPI_ID = "nakumamit27-1@okicici";

export default function Ads() {
  const { user, profile } = useAuth();
  const { submitAd } = useSocial();
  const screenshotRef = useRef(null);

  const [step, setStep] = useState(1);
  const [accountType, setAccountType] = useState("personal"); // personal | business
  const [form, setForm] = useState({
    title: "", description: "", websiteUrl: "",
    businessName: "", businessLogo: "", contactEmail: "",
    targetCategories: [],
  });
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [payMethod, setPayMethod] = useState("paypal"); // paypal | upi
  const [txnId, setTxnId] = useState("");
  const [screenshot, setScreenshot] = useState(null);
  const [screenshotPreview, setScreenshotPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [copied, setCopied] = useState(false);
    const [adVideo, setAdVideo] = useState(null);
  const [adVideoPreview, setAdVideoPreview] = useState("");


  if (!user) {
    return (
      <div className="ads-page">
        <div className="ads-login-prompt">
          <div style={{ fontSize: 64 }}>📢</div>
          <h2>Advertise on WildSphere</h2>
          <p>Reach millions of wildlife lovers. Login to create your first ad.</p>
          <Link href="/auth" className="auth-btn" style={{ textDecoration:"none", display:"inline-block", marginTop:16 }}>
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
          <p>Your ad is under review. We'll activate it within 24 hours.</p>
          <p style={{ fontSize:"0.85rem", color:"var(--text2)", marginTop:8 }}>
            Check status via email: wildlifeanimalfight@gmail.com
          </p>
          <div className="ads-success-plan">
            <strong>{selectedPlan?.name} Plan</strong> · {selectedPlan?.views}
            <br />Payment: {payMethod === "paypal" ? "PayPal" : "UPI"} · Ref: {txnId}
          </div>
          <button className="auth-btn" style={{ marginTop:24 }} onClick={() => {
            setSubmitted(false); setStep(1); setForm({ title:"", description:"", websiteUrl:"", businessName:"", businessLogo:"", contactEmail:"", targetCategories:[] });
            setSelectedPlan(null); setTxnId(""); setScreenshot(null); setScreenshotPreview(null);
          }}>Create Another Ad</button>
        </div>
      </div>
    );
  }

  const stepLabels = ["Details", "Target", "Plan", "Payment"];

  async function handleSubmit() {
    if (!txnId.trim()) { alert("Please enter your transaction/payment reference."); return; }
    setSubmitting(true);
    let screenshotPath = null;
    if (screenshot) {
      try {
        const res = await fetch("/api/storage/uploads/request-url", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: screenshot.name, size: screenshot.size, contentType: screenshot.type }),
        });
        const { uploadURL, objectPath } = await res.json();
        await fetch(uploadURL, { method: "PUT", headers: { "Content-Type": screenshot.type }, body: screenshot });
        screenshotPath = objectPath;
      } catch {}
    }
    const ok = await submitAd({
      ...form, plan: selectedPlan?.id, price: selectedPlan?.price,
      priceUsd: selectedPlan?.usd, payMethod, txnId: txnId.trim(),
      screenshotPath, accountType,
      views: selectedPlan?.views, username: profile?.username || user.name,
      userId: user.uid,
    });
    setSubmitting(false);
    if (ok) setSubmitted(true);
    else alert("Submission failed. Please try again or email wildlifeanimalfight@gmail.com");
  }

  return (
    <div className="ads-page">
      <div className="ads-header">
        <h1 className="page-title">📢 Advertise on WildSphere</h1>
        <p className="page-subtitle">Reach {(2000000).toLocaleString()}+ wildlife enthusiasts worldwide</p>
      </div>

      <div className="ads-steps">
        {stepLabels.map((l, i) => (
          <div key={l} className={`ads-step ${step === i+1 ? "active" : step > i+1 ? "done" : ""}`}>
            <div className="ads-step-num">{step > i+1 ? "✓" : i+1}</div>
            <div className="ads-step-label">{l}</div>
          </div>
        ))}
      </div>

      {step === 1 && (
        <div className="ads-section">
          <h2 className="ads-section-title">Account Type</h2>
          <div className="ads-account-type-row">
            <button
              className={`ads-account-btn ${accountType === "personal" ? "active" : ""}`}
              onClick={() => setAccountType("personal")}
            >
              <span style={{ fontSize: "2rem" }}>👤</span>
              <strong>Personal</strong>
              <span>Creator / influencer</span>
            </button>
            <button
              className={`ads-account-btn ${accountType === "business" ? "active" : ""}`}
              onClick={() => setAccountType("business")}
            >
              <span style={{ fontSize: "2rem" }}>🏢</span>
              <strong>Business</strong>
              <span>Brand / NGO / Company</span>
            </button>
          </div>

          <h2 className="ads-section-title" style={{ marginTop: 24 }}>Ad Details</h2>
          <div className="ads-form">
            <label className="ads-label">Ad Title *</label>
            <input className="ads-input" value={form.title} onChange={e => setForm(f => ({...f, title: e.target.value}))}
              placeholder="e.g. Wildlife Photography Course" maxLength={80} />
            <label className="ads-label">Description *</label>
            <textarea className="ads-input" rows={3} value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))}
              placeholder="Describe your product or service…" maxLength={300} />
            <label className="ads-label">Website / Link (optional)</label>
            <input className="ads-input" type="url" value={form.websiteUrl} onChange={e => setForm(f => ({...f, websiteUrl: e.target.value}))}
              placeholder="https://yourwebsite.com" />
            {accountType === "business" && (
              <>
                <label className="ads-label">Business Name *</label>
                <input className="ads-input" value={form.businessName} onChange={e => setForm(f => ({...f, businessName: e.target.value}))}
                  placeholder="e.g. Wildlife Safari Co." />
                <label className="ads-label">Contact Email</label>
                <input className="ads-input" type="email" value={form.contactEmail} onChange={e => setForm(f => ({...f, contactEmail: e.target.value}))}
                  placeholder="contact@yourbusiness.com" />
              </>
            )}
          </div>

            <div className="ad-field" style={{ marginTop: '12px', marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: '#9ca3af', marginBottom: '6px' }}>Ad Video *</label>
              <input 
                type="file" 
                accept="video/*" 
                style={{ width: '100%', padding: '8px', background: '#1f2937', color: '#fff', borderRadius: '8px', border: '1px solid #374151' }}
                onChange={e => {
                  const file = e.target.files[0];
                  if (file) {
                    setAdVideo(file);
                    setAdVideoPreview(URL.createObjectURL(file));
                  }
                }} 
              />
              {adVideoPreview && (
                <div style={{ marginTop: '10px' }}>
                  <video src={adVideoPreview} controls style={{ width: '100%', maxHeight: '180px', borderRadius: '8px', background: '#000' }} />
                </div>
              )}
            </div>
    
          <button className="auth-btn" style={{ marginTop: 16 }}
            disabled={!form.title.trim() || !form.description.trim()}
            onClick={() => setStep(2)}>
            Next: Target Audience →
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="ads-section">
          <h2 className="ads-section-title">🎯 Target Audience</h2>
          <p className="ads-helper">Select wildlife categories to reach the right audience</p>
          <div className="ads-categories">
            {CATEGORIES.map(c => (
              <button
                key={c}
                className={`ads-cat-btn ${form.targetCategories.includes(c) ? "selected" : ""}`}
                onClick={() => setForm(f => ({
                  ...f,
                  targetCategories: f.targetCategories.includes(c)
                    ? f.targetCategories.filter(x => x !== c)
                    : [...f.targetCategories, c]
                }))}
              >{c}</button>
            ))}
          </div>
          <div style={{ display:"flex", gap:12, marginTop:24 }}>
            <button className="ads-back-btn" onClick={() => setStep(1)}>← Back</button>
            <button className="auth-btn" onClick={() => setStep(3)}>Next: Choose Plan →</button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="ads-section">
          <h2 className="ads-section-title">💼 Choose Your Plan</h2>
          <div className="ads-plans">
            {PLANS.map(p => (
              <div
                key={p.id}
                className={`ads-plan-card ${selectedPlan?.id === p.id ? "selected" : ""}`}
                onClick={() => setSelectedPlan(p)}
                style={{ borderColor: selectedPlan?.id === p.id ? p.color : undefined }}
              >
                {p.popular && <div className="ads-plan-popular">⭐ Most Popular</div>}
                <div className="ads-plan-name" style={{ color: p.color }}>{p.name}</div>
                <div className="ads-plan-price">₹{p.price} <span style={{ fontSize:"0.8rem", color:"var(--text2)" }}>(~${p.usd} USD)</span></div>
                <div className="ads-plan-views">{p.views}</div>
                <div className="ads-plan-desc">{p.desc}</div>
              </div>
            ))}
          </div>
          <div style={{ display:"flex", gap:12, marginTop:24 }}>
            <button className="ads-back-btn" onClick={() => setStep(2)}>← Back</button>
            <button className="auth-btn" disabled={!selectedPlan} onClick={() => setStep(4)}>Next: Payment →</button>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="ads-section">
          <h2 className="ads-section-title">💳 Payment</h2>
          <div className="ads-plan-summary">
            <strong>{selectedPlan?.name} Plan</strong> · {selectedPlan?.views} · ₹{selectedPlan?.price}
          </div>

          <div className="ads-pay-method-row">
            <button className={`ads-pay-btn ${payMethod === "paypal" ? "active" : ""}`} onClick={() => setPayMethod("paypal")}>
              🌐 PayPal
            </button>
            <button className={`ads-pay-btn ${payMethod === "upi" ? "active" : ""}`} onClick={() => setPayMethod("upi")}>
              📱 UPI
            </button>
          </div>

          {payMethod === "paypal" && (
            <div className="ads-payment-box">
              <p className="ads-payment-instructions">
                1. Click the button below to pay ${selectedPlan?.usd} via PayPal<br />
                2. Copy your PayPal Transaction ID<br />
                3. Paste it in the field below and submit
              </p>
              <a
                href={PAYPAL_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="ads-paypal-btn"
              >
                💳 Pay ${selectedPlan?.usd} via PayPal
              </a>
              <label className="ads-label" style={{ marginTop: 16 }}>PayPal Transaction ID *</label>
              <input className="ads-input" value={txnId} onChange={e => setTxnId(e.target.value)}
                placeholder="e.g. 4WU123456789ABCDE" />
            </div>
          )}

          {payMethod === "upi" && (
            <div className="ads-payment-box">
              <p className="ads-payment-instructions">
                1. Open any UPI app (PhonePe, GPay, Paytm)<br />
                2. Send ₹{selectedPlan?.price} to: <strong>{UPI_ID}</strong><br />
                3. Enter your UPI Transaction ID below
              </p>
              <div className="ads-upi-id-row">
                <span className="ads-upi-id">{UPI_ID}</span>
                <button className="ads-copy-btn" onClick={() => {
                  navigator.clipboard.writeText(UPI_ID);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}>{copied ? "✅ Copied" : "📋 Copy"}</button>
              </div>
              <label className="ads-label" style={{ marginTop: 16 }}>UPI Transaction ID *</label>
              <input className="ads-input" value={txnId} onChange={e => setTxnId(e.target.value)}
                placeholder="e.g. 406123456789" />
            </div>
          )}

          <div className="ads-screenshot-row">
            <label className="ads-label">Payment Screenshot (optional but recommended)</label>
            <button className="ads-screenshot-btn" onClick={() => screenshotRef.current?.click()}>
              {screenshotPreview ? "✅ Screenshot attached" : "📷 Attach Screenshot"}
            </button>
            <input
              ref={screenshotRef}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={e => {
                const f = e.target.files?.[0];
                if (f) { setScreenshot(f); setScreenshotPreview(URL.createObjectURL(f)); }
              }}
            />
            {screenshotPreview && (
              <img src={screenshotPreview} alt="Payment proof" style={{ width:"100%", maxWidth:300, marginTop:8, borderRadius:8, border:"1px solid var(--border)" }} />
            )}
          </div>

          <div style={{ display:"flex", gap:12, marginTop:24 }}>
            <button className="ads-back-btn" onClick={() => setStep(3)}>← Back</button>
            <button className="auth-btn" onClick={handleSubmit} disabled={submitting || !txnId.trim()}>
              {submitting ? "Submitting…" : "🚀 Submit Ad"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
