import { useState } from "react";
import { Link } from "wouter";

const TABS = ["Help Center", "Privacy Policy", "Terms", "Community"];

export default function HelpDesk() {
  const [activeTab, setActiveTab] = useState("Help Center");
  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  const contacts = [
    { icon: "📧", label: "Email", value: "animalx00003@gmail.com", href: "mailto:animalx00003@gmail.com", color: "#ea4335" },
    { icon: "📸", label: "Instagram", value: "@wild_life_aniaml_fight", href: "https://instagram.com/wild_life_aniaml_fight", color: "#e1306c" },
    { icon: "▶️", label: "YouTube", value: "wild_life_aniaml_fight", href: "https://youtube.com/@wild_life_aniaml_fight", color: "#ff0000" },
    { icon: "👥", label: "Facebook", value: "wild_life_aniaml_fight", href: "https://facebook.com/wild_life_aniaml_fight", color: "#1877f2" },
  ];

  const faqs = [
    { q: "How do I upload a reel?", a: "Go to the Reels tab → tap the 🎬 Reels tab → click '➕ Upload Reel'. You must be logged in. Only animal/wildlife/nature content is allowed." },
    { q: "How do I advertise my product?", a: "Go to your Profile page → tap '📢 Run Advertisement'. Choose a plan (₹149–₹4,999), pay via UPI to nakumamit27-1@okicici, and submit. Admin reviews and activates your ad." },
    { q: "How do I reset my password?", a: "On the Sign In page, tap 'Forgot Password?' below the password field. Enter your email to receive a reset link from Firebase." },
    { q: "Why do my likes not increase?", a: "Animal X uses a real unique-like system — one like per reel per account. If you've already liked a reel, tapping again will unlike it." },
    { q: "How do I follow other users?", a: "In the Reels feed, tap '+ Follow' next to any creator's username. You can also follow from their profile page." },
    { q: "How do sponsored ads work?", a: "Sponsored ads appear between reels after every 25–30 reels. They are clearly labelled as 'Sponsored' and can be skipped." },
    { q: "How do I contact support?", a: "Use the contact form on this page, or reach out via Instagram (@wild_life_aniaml_fight) or Email (animalx00003@gmail.com)." },
    { q: "What animals are in the app?", a: "Animal X has 1,213+ animals across 9 categories: Mammals, Reptiles, Birds, Aquatic, Small Creatures, Trees, Mountains, Sea, and Desert." },
    { q: "Is Animal X free to use?", a: "Yes! Animal X is completely free — no premium, no locks. All features including animals, zoo map, reels, travel, and chatbot are free." },
    { q: "How does the animal quiz work?", a: "Open any animal's detail page and scroll down to find the 🧠 Quiz section. Answer 2 questions about the animal and get instant feedback." },
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

          <div className="form-section">
            <h2 className="section-title">✉️ Send a Message</h2>
            {submitted ? (
              <div className="success-message">
                <div className="success-icon">✅</div>
                <h3>Message Sent!</h3>
                <p>We'll respond within 48 hours.</p>
                <button className="reset-btn" onClick={() => { setSubmitted(false); setFormData({ name:"",email:"",subject:"",message:"" }); }}>Send Another</button>
              </div>
            ) : (
              <form className="contact-form" onSubmit={e => { e.preventDefault(); setSubmitted(true); }}>
                <div className="form-group">
                  <label>Name *</label>
                  <input type="text" required value={formData.name} onChange={e => setFormData({...formData,name:e.target.value})} placeholder="Your name" />
                </div>
                <div className="form-group">
                  <label>Email *</label>
                  <input type="email" required value={formData.email} onChange={e => setFormData({...formData,email:e.target.value})} placeholder="your@email.com" />
                </div>
                <div className="form-group">
                  <label>Subject</label>
                  <input type="text" value={formData.subject} onChange={e => setFormData({...formData,subject:e.target.value})} placeholder="How can we help?" />
                </div>
                <div className="form-group">
                  <label>Message *</label>
                  <textarea required rows={5} value={formData.message} onChange={e => setFormData({...formData,message:e.target.value})} placeholder="Tell us what you need..." />
                </div>
                <button type="submit" className="submit-btn">Send Message 📬</button>
              </form>
            )}
          </div>
        </div>
      )}

      {activeTab === "Help Center" && (
        <div className="faq-section">
          <h2 className="section-title">❓ Frequently Asked Questions</h2>
          <div className="faq-list">
            {faqs.map((faq, i) => <FAQItem key={i} question={faq.q} answer={faq.a} />)}
          </div>
        </div>
      )}

      {activeTab === "Privacy Policy" && (
        <div className="legal-page">
          <h2>🔒 Privacy Policy</h2>
          <p className="legal-updated">Last updated: May 2026</p>
          <div className="legal-section">
            <h3>1. Information We Collect</h3>
            <p>We collect information you provide directly: name, email address when you create an account. We also collect usage data such as animals viewed, reels watched, and content uploaded.</p>
          </div>
          <div className="legal-section">
            <h3>2. How We Use Your Information</h3>
            <p>We use your information to: provide and improve Animal X services, personalize your wildlife feed, send notifications (likes, follows), process advertisement payments, and respond to support requests.</p>
          </div>
          <div className="legal-section">
            <h3>3. Firebase & Data Storage</h3>
            <p>Animal X uses Firebase (Google) for authentication, database, and file storage. Your data is stored securely on Firebase infrastructure. We do not sell your data to third parties.</p>
          </div>
          <div className="legal-section">
            <h3>4. Content You Upload</h3>
            <p>Wildlife reels, posts, and stories you upload are visible to other Animal X users. Only wildlife/nature content is permitted. Admin reserves the right to remove policy-violating content.</p>
          </div>
          <div className="legal-section">
            <h3>5. Advertisements</h3>
            <p>If you run advertisements, payment information (UPI transaction confirmation) is collected for verification. Ad targeting uses your content interaction history (category preferences).</p>
          </div>
          <div className="legal-section">
            <h3>6. Contact Us</h3>
            <p>For privacy concerns: <a href="mailto:animalx00003@gmail.com" style={{ color: "var(--accent)" }}>animalx00003@gmail.com</a></p>
          </div>
        </div>
      )}

      {activeTab === "Terms" && (
        <div className="legal-page">
          <h2>📋 Terms & Conditions</h2>
          <p className="legal-updated">Last updated: May 2026</p>
          <div className="legal-section">
            <h3>1. Acceptance</h3>
            <p>By using Animal X, you agree to these terms. If you do not agree, please do not use the app.</p>
          </div>
          <div className="legal-section">
            <h3>2. Content Rules</h3>
            <p>You may only upload content related to animals, wildlife, and nature. Prohibited: adult content, hate speech, spam, impersonation, copyright violations, or illegal content. Violations result in account suspension.</p>
          </div>
          <div className="legal-section">
            <h3>3. Advertisement Terms</h3>
            <p>Advertisements must relate to wildlife, travel, or nature products/services. Payments are non-refundable once an ad is approved and live. Admin may reject ads that violate community guidelines.</p>
          </div>
          <div className="legal-section">
            <h3>4. Account Responsibility</h3>
            <p>You are responsible for all activity under your account. Keep your password secure. Notify us immediately if you suspect unauthorized access.</p>
          </div>
          <div className="legal-section">
            <h3>5. Intellectual Property</h3>
            <p>Animal X content (design, code, data) is owned by Animal X. Content you upload remains yours, but you grant Animal X a license to display it within the platform.</p>
          </div>
          <div className="legal-section">
            <h3>6. Limitation of Liability</h3>
            <p>Animal X is provided "as is". We are not liable for damages arising from use of the platform, user-generated content, or temporary service unavailability.</p>
          </div>
        </div>
      )}

      {activeTab === "Community" && (
        <div className="legal-page">
          <h2>🌿 Community Guidelines</h2>
          <div className="community-rules">
            <div className="community-rule">
              <span className="rule-icon">✅</span>
              <div>
                <b>Wildlife content only</b>
                <p>Post only animals, nature, wildlife, conservation, and ecology content.</p>
              </div>
            </div>
            <div className="community-rule">
              <span className="rule-icon">🤝</span>
              <div>
                <b>Be respectful</b>
                <p>Treat all community members with respect. No harassment, bullying, or personal attacks.</p>
              </div>
            </div>
            <div className="community-rule">
              <span className="rule-icon">🎯</span>
              <div>
                <b>Authentic content</b>
                <p>Share real wildlife experiences. No deepfakes, staged animal cruelty, or misinformation about species.</p>
              </div>
            </div>
            <div className="community-rule">
              <span className="rule-icon">🛡️</span>
              <div>
                <b>Conservation first</b>
                <p>Support wildlife conservation. Do not share content that promotes poaching, illegal wildlife trade, or animal harm.</p>
              </div>
            </div>
            <div className="community-rule">
              <span className="rule-icon">📸</span>
              <div>
                <b>Credit creators</b>
                <p>If you share others' wildlife photos or videos, credit the original creator.</p>
              </div>
            </div>
            <div className="community-rule">
              <span className="rule-icon">🚫</span>
              <div>
                <b>Zero tolerance</b>
                <p>We have zero tolerance for: animal abuse content, illegal wildlife products, spam, or hate speech. Violators are permanently banned.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FAQItem({ question, answer }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`faq-item ${open ? "open" : ""}`}>
      <button className="faq-question" onClick={() => setOpen(!open)}>
        <span>{question}</span>
        <span className="faq-arrow">{open ? "▲" : "▼"}</span>
      </button>
      {open && <div className="faq-answer">{answer}</div>}
    </div>
  );
}
