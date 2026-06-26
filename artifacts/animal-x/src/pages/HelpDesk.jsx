import { useState } from "react";
import { Link } from "wouter";

const TABS = ["Help Center", "Privacy Policy", "Terms", "Community"];

export default function HelpDesk() {
  const [activeTab, setActiveTab] = useState("Help Center");
  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  const contacts = [
    { icon: "📧", label: "Email", value: "wildlifeanimalfight@gmail.com", href: "mailto:wildlifeanimalfight@gmail.com", color: "#ea4335" },
    { icon: "📸", label: "Instagram", value: "@wildlifeanimalfight", href: "https://instagram.com/wildlifeanimalfight", color: "#e1306c" },
    { icon: "👥", label: "Facebook", value: "wild_life_animal_fight", href: "https://facebook.com/wild_life_animal_fight", color: "#1877f2" },
    { icon: "▶️", label: "YouTube", value: "wildlifeanimalfight", href: "https://youtube.com/@wildlifeanimalfight", color: "#ff0000" },
  ];

  const faqs = [
    { q: "How do I upload a reel?", a: "Go to the Reels tab → tap ➕ Upload. Only wildlife, animal, and nature content is allowed. Uploading off-topic content may result in a strike." },
    { q: "How do I advertise my product?", a: "Go to your Profile page → tap '📢 Run Advertisement'. Choose a plan, pay via PayPal or UPI, and submit. Admin reviews and activates your ad." },
    { q: "How do I reset my password?", a: "On the Sign In page, tap 'Forgot Password?' below the password field. Enter your email to receive a reset link." },
    { q: "Why do my likes not increase?", a: "Animal X uses a real unique-like system — one like per reel per account. If you've already liked a reel, tapping again will unlike it." },
    { q: "How do I follow other users?", a: "In the Reels feed, tap '+ Follow' next to any creator's username. You can also follow from their profile page." },
    { q: "How do sponsored ads work?", a: "Sponsored ads appear between reels and are clearly labelled as 'Sponsored'. They can be skipped." },
    { q: "What is the blue tick?", a: "Accounts with 100,000+ followers automatically receive a blue verification tick. Admin can also manually grant or remove it." },
    { q: "What happens if I upload off-topic content?", a: "1st violation = warning, 2nd = final warning, 3rd = 30-day upload ban. Only wildlife, nature, and animal content is allowed." },
    { q: "What animals are in the app?", a: "Animal X has 1,213+ animals across 9 categories: Mammals, Reptiles, Birds, Aquatic, Small Creatures, Trees, Mountains, Sea, and Desert." },
    { q: "Is Animal X free to use?", a: "Yes! Animal X is completely free — no premium, no locks. All features including animals, zoo map, reels, travel, and chatbot are free." },
  ];

  return (
    <div className="help-page">
      <div className="help-header">
        <h1 className="page-title">Help & Support</h1>
        <p className="page-subtitle">We're here to help you explore wildlife safely</p>
        <Link href="/ads" className="help-ads-btn">📢 Run Advertisement</Link>
      </div>

      <div className="help-tabs">
        {TABS.map(tab => (
          <button key={tab} className={`help-tab ${activeTab === tab ? "active" : ""}`} onClick={() => setActiveTab(tab)}>
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "Help Center" && (
        <div className="help-grid">
          <div className="contact-section">
            <h2 className="section-title">📬 Contact Us</h2>
            <div className="contact-cards">
              {contacts.map(c => (
                <a key={c.label} href={c.href} target="_blank" rel="noopener noreferrer" className="contact-card" style={{ borderLeft: `4px solid ${c.color}` }}>
                  <span className="contact-icon">{c.icon}</span>
                  <div>
                    <div className="contact-label">{c.label}</div>
                    <div className="contact-value">{c.value}</div>
                  </div>
                </a>
              ))}
            </div>
          </div>

          <div className="faq-section">
            <h2 className="section-title">❓ Frequently Asked Questions</h2>
            {faqs.map((f, i) => (
              <details key={i} className="faq-item">
                <summary className="faq-q">{f.q}</summary>
                <p className="faq-a">{f.a}</p>
              </details>
            ))}
          </div>

          <div className="contact-form-section">
            <h2 className="section-title">✉️ Send Us a Message</h2>
            {submitted ? (
              <div className="form-success">
                <div style={{ fontSize: "3rem" }}>✅</div>
                <h3>Message Sent!</h3>
                <p>We'll get back to you within 24 hours at wildlifeanimalfight@gmail.com</p>
                <button className="auth-btn" style={{ marginTop: 16 }} onClick={() => setSubmitted(false)}>Send Another</button>
              </div>
            ) : (
              <form className="help-form" onSubmit={e => { e.preventDefault(); setSubmitted(true); }}>
                <div className="help-form-row">
                  <input className="help-input" placeholder="Your Name" value={formData.name} onChange={e => setFormData(f => ({ ...f, name: e.target.value }))} required />
                  <input className="help-input" type="email" placeholder="Your Email" value={formData.email} onChange={e => setFormData(f => ({ ...f, email: e.target.value }))} required />
                </div>
                <input className="help-input" placeholder="Subject" value={formData.subject} onChange={e => setFormData(f => ({ ...f, subject: e.target.value }))} required />
                <textarea className="help-textarea" placeholder="Your message…" rows={5} value={formData.message} onChange={e => setFormData(f => ({ ...f, message: e.target.value }))} required />
                <button className="auth-btn" type="submit">📨 Send Message</button>
              </form>
            )}
          </div>
        </div>
      )}

      {activeTab === "Privacy Policy" && (
        <div className="help-content">
          <h2 className="section-title">🔐 Privacy Policy</h2>
          <p className="help-text">Last updated: June 2026</p>
          <div className="policy-section"><h3>1. Data We Collect</h3><p>We collect your email address, display name, uploaded content (reels, photos), and usage analytics (views, likes, follows). We do not sell your personal data to third parties.</p></div>
          <div className="policy-section"><h3>2. Firebase & Storage</h3><p>Animal X uses Firebase Authentication for secure login and Google Cloud Storage for media files. Your data is encrypted in transit and at rest.</p></div>
          <div className="policy-section"><h3>3. Content Moderation</h3><p>All uploaded reels are scanned by our AI moderation system. Only wildlife, nature, and animal content is permitted. Violating content is removed and the account may receive a strike.</p></div>
          <div className="policy-section"><h3>4. Advertising Data</h3><p>If you run an advertisement, we collect your ad details, payment reference, and targeting preferences. This information is used solely to deliver your ad campaign.</p></div>
          <div className="policy-section"><h3>5. Cookies & Local Storage</h3><p>We use browser local storage for offline functionality (liked reels cache, scroll position). No tracking cookies are used.</p></div>
          <div className="policy-section"><h3>6. Contact</h3><p>For privacy concerns, email: wildlifeanimalfight@gmail.com</p></div>
        </div>
      )}

      {activeTab === "Terms" && (
        <div className="help-content">
          <h2 className="section-title">📋 Terms & Conditions</h2>
          <p className="help-text">By using Animal X, you agree to these terms.</p>
          <div className="policy-section"><h3>1. Permitted Content</h3><p>Animal X is exclusively a wildlife and nature platform. You may only upload videos, photos, and descriptions related to animals, wildlife, nature, forests, oceans, birds, reptiles, or conservation.</p></div>
          <div className="policy-section"><h3>2. Strike System</h3><p>1st violation: warning. 2nd violation: final warning. 3rd violation: 30-day upload ban. Severe violations (hate speech, illegal content) result in permanent ban.</p></div>
          <div className="policy-section"><h3>3. Account Rules</h3><p>One account per person. No fake engagement, spam, or impersonation. Verified badges are granted to accounts with 100K+ genuine followers or by admin approval.</p></div>
          <div className="policy-section"><h3>4. Advertising</h3><p>All ads must relate to wildlife, nature, conservation, travel, or animal-friendly products. Admin reserves the right to reject any ad campaign.</p></div>
          <div className="policy-section"><h3>5. Intellectual Property</h3><p>You retain ownership of your content. By uploading, you grant Animal X a non-exclusive license to display your content on the platform.</p></div>
          <div className="policy-section"><h3>6. Liability</h3><p>Animal X is not responsible for the accuracy of user-uploaded content. We are a platform, not a publisher.</p></div>
        </div>
      )}

      {activeTab === "Community" && (
        <div className="help-content">
          <h2 className="section-title">🌿 Community Guidelines</h2>
          <div className="community-rules">
            {[
              { icon: "✅", title: "Wildlife Only", desc: "Only post animals, wildlife, nature, and conservation content. This is what Animal X is for." },
              { icon: "🤝", title: "Respect Creators", desc: "Be respectful in comments and interactions. No harassment, bullying, or personal attacks." },
              { icon: "🔬", title: "Be Accurate", desc: "Share accurate wildlife information. Don't spread misinformation about species, conservation, or scientific facts." },
              { icon: "🛡️", title: "No Harmful Content", desc: "No content depicting animal cruelty, illegal poaching, or wildlife exploitation. Report such content immediately." },
              { icon: "📷", title: "Own Your Content", desc: "Only upload content you filmed or photographed yourself, or that you have permission to share." },
              { icon: "🌍", title: "Support Conservation", desc: "Use the platform to raise awareness about endangered species and conservation efforts." },
              { icon: "🚫", title: "No Off-Topic Content", desc: "No humans-only videos, sports, music, or non-wildlife content. Such uploads will be removed." },
              { icon: "📢", title: "Honest Advertising", desc: "Business accounts must clearly disclose partnerships and sponsored content." },
            ].map(r => (
              <div key={r.title} className="community-rule">
                <div className="community-rule-icon">{r.icon}</div>
                <div>
                  <div className="community-rule-title">{r.title}</div>
                  <div className="community-rule-desc">{r.desc}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="report-section">
            <h3>🚨 Report Content</h3>
            <p>To report a reel, tap the ⋯ menu on the reel and select "Report". For urgent concerns, email <a href="mailto:wildlifeanimalfight@gmail.com">wildlifeanimalfight@gmail.com</a></p>
          </div>
        </div>
      )}
    </div>
  );
}
