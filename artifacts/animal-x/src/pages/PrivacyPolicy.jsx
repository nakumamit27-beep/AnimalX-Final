import { useLocation } from "wouter";

export default function PrivacyPolicy() {
  const [, navigate] = useLocation();
  return (
    <div className="policy-page">
      <div className="policy-header">
        <button className="policy-back" onClick={() => navigate(-1)}>← Back</button>
        <div className="policy-header-icon">🔒</div>
        <h1 className="policy-title">Privacy Policy</h1>
        <p className="policy-subtitle">Last updated: June 2026 · WildLingo v2.5</p>
      </div>

      <div className="policy-body">

        <div className="policy-section">
          <h2>1. Introduction</h2>
          <p>
            Welcome to <strong>WildLingo</strong> ("we," "our," or "us"). We are committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, store, and share information when you use our wildlife social media application.
          </p>
          <p>By using WildLingo, you agree to the collection and use of information in accordance with this policy.</p>
        </div>

        <div className="policy-section">
          <h2>2. Information We Collect</h2>
          <div className="policy-card green">
            <h3>✅ Information You Provide</h3>
            <ul>
              <li><strong>Account Information:</strong> Email address, display name, and password (password stored as encrypted hash only)</li>
              <li><strong>Profile Data:</strong> Profile photo, cover image, bio, country, and username</li>
              <li><strong>Content:</strong> Wildlife videos, photos, captions, hashtags, and comments you upload</li>
              <li><strong>Interactions:</strong> Likes, follows, shares, and comments on other users' content</li>
            </ul>
          </div>
          <div className="policy-card blue">
            <h3>🔵 Information Collected Automatically</h3>
            <ul>
              <li><strong>Usage data:</strong> Pages visited, time spent, features used</li>
              <li><strong>Device data:</strong> Browser type, operating system, device type</li>
              <li><strong>Location:</strong> GPS location (only when you use the Map feature, with your permission)</li>
              <li><strong>Log data:</strong> IP address, crash reports, and performance data</li>
            </ul>
          </div>
        </div>

        <div className="policy-section">
          <h2>3. How We Use Your Information</h2>
          <ul className="policy-list">
            <li>🦁 To provide, operate, and improve WildLingo services</li>
            <li>🔐 To authenticate your account and keep it secure</li>
            <li>🔔 To send notifications about follows, likes, and platform updates</li>
            <li>🤖 To power AI content moderation ensuring only wildlife content is posted</li>
            <li>📊 To analyse usage patterns and improve user experience</li>
            <li>📢 To display relevant wildlife content in your personalised feed</li>
            <li>⚖️ To enforce our Community Guidelines and Terms of Service</li>
          </ul>
        </div>

        <div className="policy-section">
          <h2>4. Data Storage & Security</h2>
          <div className="policy-card green">
            <h3>🛡️ Firebase Security</h3>
            <p>All your data is stored on <strong>Google Firebase</strong> — one of the world's most secure cloud platforms:</p>
            <ul>
              <li>All data encrypted in transit (HTTPS/TLS)</li>
              <li>Passwords are never stored in plain text</li>
              <li>Firebase Firestore Security Rules restrict data access to authorised users only</li>
              <li>Object Storage uses signed URLs with limited-time access</li>
            </ul>
          </div>
        </div>

        <div className="policy-section">
          <h2>5. Data Sharing</h2>
          <div className="policy-card red">
            <h3>🚫 What We Never Do</h3>
            <ul>
              <li>We <strong>never sell</strong> your personal data to advertisers or third parties</li>
              <li>We <strong>never share</strong> your email with other users (only admin sees emails)</li>
              <li>We <strong>never track</strong> you across other websites or apps</li>
            </ul>
          </div>
          <h3 style={{ marginTop: 16 }}>Limited Sharing:</h3>
          <ul className="policy-list">
            <li><strong>Public content:</strong> Reels, posts, and profile info you make public are visible to all users</li>
            <li><strong>Service providers:</strong> Google Firebase for data storage and authentication</li>
            <li><strong>Legal compliance:</strong> If required by law, court order, or to protect safety</li>
          </ul>
        </div>

        <div className="policy-section">
          <h2>6. Your Rights</h2>
          <ul className="policy-list">
            <li>📋 <strong>Access:</strong> Request a copy of your personal data</li>
            <li>✏️ <strong>Correction:</strong> Update your profile data at any time</li>
            <li>🗑️ <strong>Deletion:</strong> Request deletion of your account and data</li>
            <li>⏸️ <strong>Restriction:</strong> Limit how we process your data</li>
            <li>📦 <strong>Portability:</strong> Receive your data in a portable format</li>
          </ul>
          <p>To exercise any of these rights, contact us at: <a href="mailto:wildlifeanimalfight@gmail.com" className="policy-link">wildlifeanimalfight@gmail.com</a></p>
        </div>

        <div className="policy-section">
          <h2>7. Children's Privacy</h2>
          <p>WildLingo is not intended for children under the age of <strong>13</strong>. We do not knowingly collect personal data from children under 13. If you believe a child under 13 has provided us with personal information, please contact us immediately.</p>
        </div>

        <div className="policy-section">
          <h2>8. Cookies & Local Storage</h2>
          <p>We use browser local storage to:</p>
          <ul className="policy-list">
            <li>Save your login session (Firebase Auth token)</li>
            <li>Cache liked reels for instant UI response</li>
            <li>Store your app preferences (theme, saved reels)</li>
          </ul>
          <p>We do not use third-party advertising cookies.</p>
        </div>

        <div className="policy-section">
          <h2>9. Changes to This Policy</h2>
          <p>We may update this Privacy Policy periodically. We will notify you of significant changes via an in-app broadcast or notification. Continued use of WildLingo after changes constitutes acceptance of the updated policy.</p>
        </div>

        <div className="policy-section">
          <h2>10. Contact Us</h2>
          <div className="policy-contact-box">
            <div>📧 <strong>Email:</strong> <a href="mailto:wildlifeanimalfight@gmail.com" className="policy-link">wildlifeanimalfight@gmail.com</a></div>
            <div>📸 <strong>Instagram:</strong> @wildlifeanimalfight</div>
            <div>▶️ <strong>YouTube:</strong> wildlifeanimalfight</div>
          </div>
        </div>

        <div className="policy-footer-note">
          © 2026 WildLingo · All rights reserved · <a href="mailto:wildlifeanimalfight@gmail.com" className="policy-link">Contact Us</a>
        </div>
      </div>
    </div>
  );
}
