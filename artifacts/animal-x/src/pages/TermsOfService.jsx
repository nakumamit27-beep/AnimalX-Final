import { useLocation } from "wouter";

export default function TermsOfService() {
  const [, navigate] = useLocation();
  return (
    <div className="policy-page">
      <div className="policy-header">
        <button className="policy-back" onClick={() => navigate(-1)}>← Back</button>
        <div className="policy-header-icon">📄</div>
        <h1 className="policy-title">Terms of Service</h1>
        <p className="policy-subtitle">Last updated: June 2026 · WildLingo v2.5</p>
      </div>

      <div className="policy-body">

        <div className="policy-section">
          <h2>1. Acceptance of Terms</h2>
          <p>By accessing or using <strong>WildLingo</strong>, you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, you may not use the app. These Terms apply to all users, visitors, and contributors of WildLingo.</p>
          <div className="policy-card blue">
            <p><strong>Age requirement:</strong> You must be at least <strong>13 years old</strong> to create an account. Users under 18 require parental consent.</p>
          </div>
        </div>

        <div className="policy-section">
          <h2>2. Account Responsibilities</h2>
          <ul className="policy-list">
            <li>You are responsible for maintaining the confidentiality of your account credentials</li>
            <li>You must provide accurate information when creating your account</li>
            <li>You may not share your account with others or use another person's account</li>
            <li>You are responsible for all activity that occurs under your account</li>
            <li>You must notify us immediately if you suspect unauthorised access</li>
          </ul>
        </div>

        <div className="policy-section">
          <h2>3. Permitted Use</h2>
          <div className="policy-card green">
            <h3>✅ What You Can Do</h3>
            <ul>
              <li>Upload and share wildlife, nature, and animal-related content</li>
              <li>Follow other wildlife creators and like their content</li>
              <li>Comment respectfully on reels and posts</li>
              <li>Use the Map to find zoos, track animals, and explore migration routes</li>
              <li>Run wildlife-related advertisements through our Ads platform</li>
              <li>Use the AI chatbot for wildlife information</li>
            </ul>
          </div>
        </div>

        <div className="policy-section">
          <h2>4. Prohibited Content & Behaviour</h2>
          <div className="policy-card red">
            <h3>🚫 Strictly Prohibited</h3>
            <ul>
              <li><strong>Non-wildlife content:</strong> Videos, photos, or posts unrelated to animals, nature, or wildlife</li>
              <li><strong>Harmful content:</strong> Violence, animal cruelty, abuse, or exploitation of any kind</li>
              <li><strong>Hate speech:</strong> Content promoting discrimination based on race, religion, gender, or other characteristics</li>
              <li><strong>Spam:</strong> Automated posting, fake engagement, or repeated unwanted messages</li>
              <li><strong>Misinformation:</strong> Deliberately false wildlife facts or dangerous advice</li>
              <li><strong>Copyright infringement:</strong> Posting content you do not own without permission</li>
              <li><strong>Illegal activity:</strong> Poaching, illegal wildlife trade, or any content promoting illegal acts</li>
              <li><strong>Privacy violations:</strong> Sharing others' private information without consent</li>
            </ul>
          </div>
        </div>

        <div className="policy-section">
          <h2>5. Violation Consequences</h2>
          <div className="policy-card orange">
            <h3>⚠️ Enforcement Actions</h3>
            <ul>
              <li><strong>Strike 1:</strong> Warning issued, content removed</li>
              <li><strong>Strike 2:</strong> Second warning, content removed, temporary restrictions</li>
              <li><strong>Strike 3:</strong> 30-day upload ban</li>
              <li><strong>Severe violation:</strong> Immediate permanent account ban</li>
            </ul>
          </div>
          <p>WildLingo reserves the right to remove any content and suspend or terminate any account at our discretion, with or without prior notice, for violations of these Terms.</p>
        </div>

        <div className="policy-section">
          <h2>6. Content Ownership & Licence</h2>
          <ul className="policy-list">
            <li>You retain ownership of content you upload to WildLingo</li>
            <li>By uploading content, you grant WildLingo a worldwide, non-exclusive, royalty-free licence to display and distribute your content on the platform</li>
            <li>You confirm you have the right to upload all content you post (no copyright infringement)</li>
            <li>WildLingo's own content, design, and branding remain our intellectual property</li>
          </ul>
        </div>

        <div className="policy-section">
          <h2>7. Advertisements</h2>
          <ul className="policy-list">
            <li>Advertisements must be wildlife-related and comply with all content guidelines</li>
            <li>Payments are non-refundable once an ad campaign is activated</li>
            <li>WildLingo reserves the right to reject any advertisement that violates our policies</li>
            <li>Ad placement and timing are at WildLingo's discretion</li>
          </ul>
        </div>

        <div className="policy-section">
          <h2>8. Disclaimers & Limitation of Liability</h2>
          <p>WildLingo is provided "as is" without warranty of any kind. We do not guarantee:</p>
          <ul className="policy-list">
            <li>Uninterrupted or error-free service</li>
            <li>The accuracy of all wildlife information presented</li>
            <li>The availability of any specific feature at any time</li>
          </ul>
          <p>To the maximum extent permitted by law, WildLingo shall not be liable for any indirect, incidental, or consequential damages arising from your use of the app.</p>
        </div>

        <div className="policy-section">
          <h2>9. Governing Law</h2>
          <p>These Terms shall be governed by applicable laws. Any disputes shall be resolved through good-faith negotiation. If unresolved, disputes shall be subject to binding arbitration.</p>
        </div>

        <div className="policy-section">
          <h2>10. Changes to Terms</h2>
          <p>We reserve the right to modify these Terms at any time. We will notify users of material changes via in-app notifications. Continued use of WildLingo after changes constitutes acceptance.</p>
        </div>

        <div className="policy-section">
          <h2>11. Contact</h2>
          <div className="policy-contact-box">
            <div>📧 <strong>Email:</strong> <a href="mailto:wildlifeanimalfight@gmail.com" className="policy-link">wildlifeanimalfight@gmail.com</a></div>
            <div>📸 <strong>Instagram:</strong> @wildlifeanimalfight</div>
          </div>
        </div>

        <div className="policy-footer-note">
          © 2026 WildLingo · All rights reserved
        </div>
      </div>
    </div>
  );
}
