import { useLocation } from "wouter";

export default function CommunityGuidelines() {
  const [, navigate] = useLocation();
  return (
    <div className="policy-page">
      <div className="policy-header">
        <button className="policy-back" onClick={() => navigate(-1)}>← Back</button>
        <div className="policy-header-icon">📋</div>
        <h1 className="policy-title">Community Guidelines</h1>
        <p className="policy-subtitle">Last updated: June 2026 · WildSphere v2.5</p>
      </div>

      <div className="policy-body">

        <div className="policy-section">
          <div className="policy-intro-card">
            <div style={{ fontSize: "2.5rem" }}>🦁</div>
            <p>WildSphere is a community built around <strong>wildlife, nature, and conservation</strong>. Our guidelines exist to protect animals, creators, and the environment we all love. Every user has a responsibility to uphold these standards.</p>
          </div>
        </div>

        <div className="policy-section">
          <h2>✅ What We Celebrate</h2>
          <div className="policy-grid">
            <div className="policy-good-card">
              <div className="policy-good-icon">🎬</div>
              <h3>Wildlife Content</h3>
              <p>Videos, photos, and stories of animals in their natural habitat, zoos, sanctuaries, or wildlife reserves.</p>
            </div>
            <div className="policy-good-card">
              <div className="policy-good-icon">🌿</div>
              <h3>Nature & Ecosystems</h3>
              <p>Forests, oceans, mountains, deserts, rainforests, and the incredible biodiversity they support.</p>
            </div>
            <div className="policy-good-card">
              <div className="policy-good-icon">🔬</div>
              <h3>Wildlife Science</h3>
              <p>Conservation research, animal behaviour studies, migration patterns, and ecological discoveries.</p>
            </div>
            <div className="policy-good-card">
              <div className="policy-good-icon">💚</div>
              <h3>Conservation Efforts</h3>
              <p>Anti-poaching campaigns, habitat restoration, endangered species protection, and community programmes.</p>
            </div>
            <div className="policy-good-card">
              <div className="policy-good-icon">🧭</div>
              <h3>Safari & Travel</h3>
              <p>Responsible wildlife tourism, national park visits, and eco-friendly travel experiences.</p>
            </div>
            <div className="policy-good-card">
              <div className="policy-good-icon">📚</div>
              <h3>Education</h3>
              <p>Animal facts, wildlife quizzes, habitat guides, and educational content for all ages.</p>
            </div>
          </div>
        </div>

        <div className="policy-section">
          <h2>🚫 What Is Not Allowed</h2>

          <div className="policy-rule-block">
            <div className="policy-rule-badge red">🚫 Critical</div>
            <h3>Animal Cruelty & Harm</h3>
            <p>Any content depicting, promoting, or glorifying harm, abuse, torture, or exploitation of animals. This includes poaching, illegal wildlife trade, or any acts of violence toward animals. Immediate permanent ban.</p>
          </div>

          <div className="policy-rule-block">
            <div className="policy-rule-badge red">🚫 Prohibited</div>
            <h3>Non-Wildlife Content</h3>
            <p>Music videos, personal vlogs, gaming clips, cooking videos, fashion content, or anything unrelated to wildlife, nature, or animals. First offence = Strike. Third offence = 30-day upload ban.</p>
          </div>

          <div className="policy-rule-block">
            <div className="policy-rule-badge red">🚫 Prohibited</div>
            <h3>Hate Speech & Discrimination</h3>
            <p>Content targeting individuals or groups based on race, ethnicity, religion, gender, sexuality, disability, or nationality. Zero tolerance — immediate account suspension.</p>
          </div>

          <div className="policy-rule-block">
            <div className="policy-rule-badge orange">⚠️ Restricted</div>
            <h3>Misinformation</h3>
            <p>Deliberately false animal facts, misleading conservation claims, or dangerous misinformation about wildlife. Content will be removed and fact-checked.</p>
          </div>

          <div className="policy-rule-block">
            <div className="policy-rule-badge orange">⚠️ Restricted</div>
            <h3>Spam & Fake Engagement</h3>
            <p>Automated likes, fake followers, repetitive comments, or any form of artificial engagement manipulation. Account may be suspended.</p>
          </div>

          <div className="policy-rule-block">
            <div className="policy-rule-badge orange">⚠️ Restricted</div>
            <h3>Copyright Violations</h3>
            <p>Uploading copyrighted video, music, or photos without permission. Always use content you own or have rights to.</p>
          </div>

          <div className="policy-rule-block">
            <div className="policy-rule-badge orange">⚠️ Restricted</div>
            <h3>Privacy Violations</h3>
            <p>Sharing private information, photos, or location data of individuals without their consent.</p>
          </div>
        </div>

        <div className="policy-section">
          <h2>⚠️ Strike System</h2>
          <div className="policy-strike-timeline">
            <div className="policy-strike-step green">
              <div className="policy-strike-num">1</div>
              <div>
                <strong>First Violation</strong>
                <p>Content removed + warning issued. Strike recorded on your account.</p>
              </div>
            </div>
            <div className="policy-strike-step orange">
              <div className="policy-strike-num">2</div>
              <div>
                <strong>Second Violation</strong>
                <p>Content removed + final warning. Restricted features may apply.</p>
              </div>
            </div>
            <div className="policy-strike-step red">
              <div className="policy-strike-num">3</div>
              <div>
                <strong>Third Violation</strong>
                <p>30-day upload ban. All new content blocked for one month.</p>
              </div>
            </div>
            <div className="policy-strike-step black">
              <div className="policy-strike-num">🚫</div>
              <div>
                <strong>Severe Violation</strong>
                <p>Immediate permanent account ban, regardless of strike count.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="policy-section">
          <h2>🚩 How to Report</h2>
          <div className="policy-card blue">
            <h3>Reporting Content</h3>
            <ol className="policy-list">
              <li>Tap ⋮ (three dots) on any reel, post, or comment</li>
              <li>Select <strong>"Report"</strong></li>
              <li>Choose the violation type from the list</li>
              <li>Submit your report</li>
            </ol>
            <p style={{ marginTop: 10 }}>Our moderation team reviews all reports within <strong>24 hours</strong>. Severe violations are acted upon immediately.</p>
          </div>
          <p style={{ marginTop: 12 }}>For urgent reports: <a href="mailto:wildlifeanimalfight@gmail.com" className="policy-link">wildlifeanimalfight@gmail.com</a></p>
        </div>

        <div className="policy-section">
          <h2>🌍 Our Mission</h2>
          <div className="policy-intro-card">
            <p>WildSphere exists to build the world's most passionate wildlife community — where every post celebrates life on Earth, educates future conservationists, and protects the species we share our planet with.</p>
            <p style={{ marginTop: 10 }}><strong>Together, we make a difference.</strong> 🌿</p>
          </div>
        </div>

        <div className="policy-footer-note">
          © 2026 WildSphere · <a href="mailto:wildlifeanimalfight@gmail.com" className="policy-link">wildlifeanimalfight@gmail.com</a>
        </div>
      </div>
    </div>
  );
}
