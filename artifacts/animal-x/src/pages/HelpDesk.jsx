import { useState } from "react";

export default function HelpDesk() {
  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const contacts = [
    { icon: "📧", label: "Email", value: "animalx00001@gmail.com", href: "mailto:animalx00001@gmail.com", color: "#ea4335" },
    { icon: "📸", label: "Instagram", value: "@wild_life_animal_fight", href: "https://instagram.com/wild_life_animal_fight", color: "#e1306c" },
    { icon: "▶️", label: "YouTube", value: "wild_life_animal_fight", href: "https://youtube.com/@wild_life_animal_fight", color: "#ff0000" },
    { icon: "👥", label: "Facebook", value: "wild_life_animal_fight", href: "https://facebook.com/wild_life_animal_fight", color: "#1877f2" },
  ];

  const faqs = [
    { q: "How do I use the Wildlife Explorer?", a: "Browse by category using the filter buttons at the top of the Animals page. You can also search for specific animals or habitats using the search bar." },
    { q: "How does the image system work?", a: "Animal images are loaded dynamically. If an image fails to load, a category-specific emoji will display as a fallback, ensuring a smooth experience at all times." },
    { q: "Can I use the map to plan a zoo visit?", a: "Yes! The Zoo World Map shows 150+ zoos globally. Click any marker to see zoo details including the number of animals and rating. Filter by country to find zoos near you." },
    { q: "What topics can the chatbot answer?", a: "The Wildlife Assistant only responds to questions about animals, nature, habitats, conservation, and ecology. For general topics, please use other resources." },
    { q: "How can I report a bug or suggest a feature?", a: "Use the contact form on this page or reach out via our social media channels. We review all feedback and aim to respond within 48 hours." },
  ];

  return (
    <div className="help-page">
      <div className="help-header">
        <h1 className="page-title">Help & Support</h1>
        <p className="page-subtitle">Get in touch with the Animal X team</p>
      </div>

      <div className="help-grid">
        <div className="contact-section">
          <h2 className="section-title">📬 Contact Us</h2>
          <div className="contact-cards">
            {contacts.map(c => (
              <a
                key={c.label}
                href={c.href}
                target="_blank"
                rel="noopener noreferrer"
                className="contact-card"
                style={{ borderLeft: `4px solid ${c.color}` }}
              >
                <span className="contact-icon">{c.icon}</span>
                <div>
                  <div className="contact-label">{c.label}</div>
                  <div className="contact-value">{c.value}</div>
                </div>
              </a>
            ))}
          </div>

          <div className="social-follow">
            <h3>Follow Our Wildlife Content</h3>
            <p>Stay updated with the latest wildlife videos, animal facts, and nature photography on our social channels.</p>
          </div>
        </div>

        <div className="form-section">
          <h2 className="section-title">✉️ Send a Message</h2>
          {submitted ? (
            <div className="success-message">
              <div className="success-icon">✅</div>
              <h3>Message Sent!</h3>
              <p>Thank you for reaching out. We'll respond within 48 hours.</p>
              <button className="reset-btn" onClick={() => { setSubmitted(false); setFormData({ name: "", email: "", subject: "", message: "" }); }}>
                Send Another
              </button>
            </div>
          ) : (
            <form className="contact-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Your name"
                />
              </div>
              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  placeholder="your@email.com"
                />
              </div>
              <div className="form-group">
                <label>Subject</label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={e => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="How can we help?"
                />
              </div>
              <div className="form-group">
                <label>Message *</label>
                <textarea
                  required
                  rows={5}
                  value={formData.message}
                  onChange={e => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Tell us what you need..."
                />
              </div>
              <button type="submit" className="submit-btn">Send Message 📬</button>
            </form>
          )}
        </div>
      </div>

      <div className="faq-section">
        <h2 className="section-title">❓ Frequently Asked Questions</h2>
        <div className="faq-list">
          {faqs.map((faq, i) => (
            <FAQItem key={i} question={faq.q} answer={faq.a} />
          ))}
        </div>
      </div>
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
