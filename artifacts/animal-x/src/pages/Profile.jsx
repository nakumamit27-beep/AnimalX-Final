import { useState, useRef } from "react";
import { Link } from "wouter";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import {
  addCustomAnimal,
  getCustomAnimals,
  deleteCustomAnimal,
} from "../utils/customAnimals";
import { fileToDataURL } from "../utils/animalOverrides";
import { categories } from "../data/animals";
import BlueTick from "../components/BlueTick";

function formatCount(n) {
  if (n == null || isNaN(n)) return "0";
  if (n >= 1_000_000)
    return (n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(n % 1_000 === 0 ? 0 : 1) + "K";
  return String(n);
}

function parseCount(str) {
  if (typeof str === "number") return str;
  const s = String(str || "")
    .trim()
    .toLowerCase();
  if (!s) return 0;
  const m = s.match(/^([\d.]+)\s*([kmb]?)$/);
  if (!m) return parseInt(s.replace(/\D/g, ""), 10) || 0;
  const n = parseFloat(m[1]);
  const mult =
    m[2] === "k"
      ? 1_000
      : m[2] === "m"
        ? 1_000_000
        : m[2] === "b"
          ? 1_000_000_000
          : 1;
  return Math.round(n * mult);
}

export default function Profile() {
  const {
    user,
    profile,
    adminMode,
    isSuperAdmin,
    isVerified,
    verifiedMap,
    SUPER_ADMIN_EMAIL,
    unlockAdminMode,
    lockAdminMode,
    updateProfile,
    setVerifiedFor,
    getAllUsers,
    logout,
  } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [tapCount, setTapCount] = useState(0);
  const tapTimer = useRef(null);
  const [gamesOpen, setGamesOpen] = useState(false);
  const [tab, setTab] = useState("grid");
  const [search, setSearch] = useState("");
  const [followersInput, setFollowersInput] = useState("");
  const [postsInput, setPostsInput] = useState("");
  const [reelsInput, setReelsInput] = useState("");
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [nameInput, setNameInput] = useState(user?.name || "");
  const photoFileRef = useRef(null);

  // Add new animal form state
  const [newName, setNewName] = useState("");
  const [newCategory, setNewCategory] = useState(categories[0]);
  const [newImage, setNewImage] = useState(null);
  const [newHabits, setNewHabits] = useState("");
  const [newLifespan, setNewLifespan] = useState("");
  const [newCountry, setNewCountry] = useState("");
  const [customAnimals, setCustomAnimalsState] = useState(() =>
    getCustomAnimals(),
  );

  function refreshCustomList() {
    setCustomAnimalsState(getCustomAnimals());
  }

  function handleAvatarTap() {
    const next = tapCount + 1;
    setTapCount(next);
    if (tapTimer.current) clearTimeout(tapTimer.current);
    tapTimer.current = setTimeout(() => setTapCount(0), 1500);
    if (next >= 7) {
      setTapCount(0);
      if (!user) {
        alert("Please login first to use Admin Mode.");
        return;
      }
      if (!isSuperAdmin) {
        alert("Admin Mode is restricted to the super admin account.");
        return;
      }
      unlockAdminMode();
    }
  }

  async function handleProfilePhoto(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const res = await fetch("/api/storage/uploads/request-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `profile_${user.uid}_${Date.now()}`,
          size: file.size,
          contentType: file.type,
        }),
      });
      if (res.ok) {
        const { uploadURL, objectPath } = await res.json();
        await fetch(uploadURL, {
          method: "PUT",
          headers: { "Content-Type": file.type },
          body: file,
        });
        updateProfile({ photo: objectPath });
        return;
      }
    } catch {}
    const dataUrl = await fileToDataURL(file);
    updateProfile({ photo: dataUrl });
  }

  async function handleCoverPhoto(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const res = await fetch("/api/storage/uploads/request-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `cover_${user.uid}_${Date.now()}`,
          size: file.size,
          contentType: file.type,
        }),
      });
      if (res.ok) {
        const { uploadURL, objectPath } = await res.json();
        await fetch(uploadURL, {
          method: "PUT",
          headers: { "Content-Type": file.type },
          body: file,
        });
        updateProfile({ cover: objectPath });
        return;
      }
    } catch {}
    const dataUrl = await fileToDataURL(file);
    updateProfile({ cover: dataUrl });
  }

  function saveProfileEdits() {
    updateProfile({ name: nameInput });
    setEditProfileOpen(false);
  }

  async function handleNewAnimalImage(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const dataUrl = await fileToDataURL(file);
    setNewImage(dataUrl);
  }

  function submitNewAnimal() {
    if (!newName.trim()) {
      alert("Animal name is required.");
      return;
    }
    addCustomAnimal({
      name: newName.trim(),
      category: newCategory,
      image: newImage,
      habits: newHabits.trim(),
      habitat: newHabits.trim() || "Various habitats",
      lifespan: newLifespan.trim() || "Unknown",
      country: newCountry.trim() || "Worldwide",
    });
    setNewName("");
    setNewImage(null);
    setNewHabits("");
    setNewLifespan("");
    setNewCountry("");
    if (photoFileRef.current) photoFileRef.current.value = "";
    refreshCustomList();
    alert(`✓ Added "${newName}" to ${newCategory}!`);
  }

  function removeCustom(id, name) {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    deleteCustomAnimal(id);
    refreshCustomList();
  }

  if (!user) {
    return (
      <div className="profile-page profile-empty">
        <div className="profile-empty-card">
          <div className="profile-empty-icon">👤</div>
          <h2>Welcome to Animal X</h2>
          <p>Login or sign up to create your wildlife creator profile.</p>
          <Link href="/auth" className="btn-primary">
            Login / Sign Up
          </Link>
        </div>
      </div>
    );
  }

  const allUsers = getAllUsers();
  const filteredUsers = allUsers.filter((u) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      (u.name || "").toLowerCase().includes(q) ||
      (u.email || "").toLowerCase().includes(q) ||
      (u.uid || "").toLowerCase().includes(q)
    );
  });

  function applyFollowers() {
    const n = parseCount(followersInput);
    updateProfile({ followers: n });
    setFollowersInput("");
  }
  function applyPosts() {
    const n = parseInt(postsInput, 10);
    if (!isNaN(n)) {
      updateProfile({ posts: n });
      setPostsInput("");
    }
  }
  function applyReels() {
    const n = parseInt(reelsInput, 10);
    if (!isNaN(n)) {
      updateProfile({ reels: n });
      setReelsInput("");
    }
  }
  function copyText(text) {
    navigator.clipboard?.writeText(text).then(
      () => alert(`Copied: ${text}`),
      () => alert("Copy failed"),
    );
  }

  const displayName = profile.name || user.name || user.email;
  const initial = (displayName || "U")[0].toUpperCase();

  function resolveUrl(path) {
    if (!path) return null;
    if (path.startsWith("data:") || path.startsWith("http")) return path;
    return `/api/storage${path}`;
  }

  const photoUrl = resolveUrl(profile.photo);
  const coverUrl = resolveUrl(profile.cover);

  return (
    <div className="profile-page">
      <div className="profile-cover-wrap">
        <div
          className="profile-cover-bg"
          style={coverUrl ? { backgroundImage: `url(${coverUrl})` } : undefined}
        >
          {!coverUrl && <div className="profile-cover-gradient" />}
        </div>
        <label className="profile-cover-edit-btn" title="Change cover photo">
          📷
          <input
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={handleCoverPhoto}
          />
        </label>
      </div>
      <div className="profile-top">
        <button
          className="profile-avatar-btn"
          onClick={handleAvatarTap}
          aria-label="Profile photo (tap 7 times for admin mode)"
          style={
            photoUrl
              ? {
                  backgroundImage: `url(${photoUrl})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  color: "transparent",
                }
              : undefined
          }
        >
          {!photoUrl && initial}
        </button>
        <div className="profile-id">
          <h1 className="profile-name">
            {displayName}
            {isVerified && <BlueTick />}
          </h1>
          <p className="profile-email">{user.email}</p>
        </div>
      </div>
      <div className="profile-stats">
        <div className="stat-block">
          <div className="stat-num">{formatCount(profile.posts)}</div>
          <div className="stat-lbl">Posts</div>
        </div>
        <div className="stat-block">
          <div className="stat-num">{formatCount(profile.followers)}</div>
          <div className="stat-lbl">Followers</div>
        </div>
        <div className="stat-block">
          <div className="stat-num">{formatCount(profile.following)}</div>
          <div className="stat-lbl">Following</div>
        </div>
      </div>
      <div className="profile-quick-stats">
        <button
          className="qs-pill qs-edit"
          onClick={() => setEditProfileOpen((v) => !v)}
        >
          Edit Profile
        </button>

        <button className="qs-pill" onClick={toggleTheme}>
          {theme === "dark" ? "☀️ Light Mode" : "🌙 Dark Mode"}
        </button>

        <button className="qs-pill" onClick={() => setHelpOpen(true)}>
          ❓ Help & Support
        </button>

        <button className="qs-pill" onClick={() => setGamesOpen(true)}>
          🎮 Games
        </button>

        <button className="qs-pill qs-logout" onClick={logout}>
          🚪 Log out
        </button>
      </div>
      {helpOpen && (
        <div
          className="edit-modal-backdrop"
          onClick={() => setHelpOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <div className="edit-modal" onClick={(e) => e.stopPropagation()}>
            <div className="edit-modal-head">
              <h3>❓ Help & Support</h3>
              <button
                type="button"
                className="edit-modal-close"
                onClick={() => setHelpOpen(false)}
                aria-label="Close"
              >
                ✕
              </button>
            </div>
            <div className="edit-modal-body">
              <div className="help-section">
                <h4 className="help-section-title">Connect With Us</h4>
                <p className="help-section-sub">
                  Reach out — we read every message.
                </p>

                <a
                  className="help-contact-row"
                  href="fb://facewebmodal/f?href=https://www.facebook.com/wild_life_aniaml_fight"
                  onClick={(e) => {
                    e.preventDefault();
                    const fallback =
                      "https://www.facebook.com/wild_life_aniaml_fight";
                    const start = Date.now();
                    setTimeout(() => {
                      if (Date.now() - start < 1700)
                        window.open(fallback, "_blank", "noopener");
                    }, 1300);
                    try {
                      window.location.href =
                        "fb://facewebmodal/f?href=https://www.facebook.com/wild_life_aniaml_fight";
                    } catch {
                      window.open(fallback, "_blank", "noopener");
                    }
                  }}
                >
                  <span
                    className="help-icon"
                    style={{ background: "#1877f2" }}
                    aria-hidden
                  >
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="#fff">
                      <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5 3.66 9.15 8.44 9.94v-7.03H7.9v-2.91h2.54V9.84c0-2.51 1.5-3.9 3.78-3.9 1.1 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.45 2.91h-2.33V22c4.78-.79 8.43-4.94 8.43-9.94z" />
                    </svg>
                  </span>
                  <div className="help-contact-info">
                    <div className="help-contact-name">Facebook</div>
                    <div className="help-contact-handle">
                      wild_life_aniaml_fight
                    </div>
                  </div>
                  <span className="help-arrow">→</span>
                </a>

                <a
                  className="help-contact-row"
                  href="instagram://user?username=wildlifeaniamlfight"
                  onClick={(e) => {
                    e.preventDefault();
                    const fallback =
                      "https://www.instagram.com/wildlifeaniamlfight";
                    const start = Date.now();
                    setTimeout(() => {
                      if (Date.now() - start < 1700)
                        window.open(fallback, "_blank", "noopener");
                    }, 1300);
                    try {
                      window.location.href =
                        "instagram://user?username=wildlifeaniamlfight";
                    } catch {
                      window.open(fallback, "_blank", "noopener");
                    }
                  }}
                >
                  <span
                    className="help-icon"
                    style={{
                      background:
                        "linear-gradient(135deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)",
                    }}
                    aria-hidden
                  >
                    <svg
                      width="22"
                      height="22"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#fff"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="3" y="3" width="18" height="18" rx="5" />
                      <circle cx="12" cy="12" r="4" />
                      <circle
                        cx="17.5"
                        cy="6.5"
                        r="1"
                        fill="#fff"
                        stroke="none"
                      />
                    </svg>
                  </span>
                  <div className="help-contact-info">
                    <div className="help-contact-name">Instagram</div>
                    <div className="help-contact-handle">
                      @wildlifeaniamlfight
                    </div>
                  </div>
                  <span className="help-arrow">→</span>
                </a>

                <a
                  className="help-contact-row"
                  href="mailto:wildlifeanimalfight@gmail.com?subject=Animal%20X%20Support%20Request"
                >
                  <span
                    className="help-icon"
                    style={{ background: "#ea4335" }}
                    aria-hidden
                  >
                    <svg
                      width="22"
                      height="22"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#fff"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="3" y="5" width="18" height="14" rx="2" />
                      <path d="m3 7 9 6 9-6" />
                    </svg>
                  </span>
                  <div className="help-contact-info">
                    <div className="help-contact-name">Gmail</div>
                    <div className="help-contact-handle">
                      wildlifeanimalfight@gmail.com
                    </div>
                  </div>

                  <span className="help-arrow">→</span>
                </a>
              </div>
            </div>
            {/* --- FULL WIDTH VERTICAL LAYOUT FOR FAQS & PRIVACY --- */}
            <div
              className="w-full mt-6 block clear-both text-left"
              style={{ width: "100%", display: "block", clear: "both" }}
            >
              {/* --- Extra Troubleshooting FAQs --- */}
              {/* --- Accordion FAQ Section (Click to Open) --- */}

              {/* --- PROFESSIONAL PRIVACY POLICY & COMMUNITY RULES --- */}
              <div className="mt-6 border-t border-gray-100 pt-4 text-left block w-full">
                <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-1">
                  🔒 Privacy Policy & Community Guidelines
                </h3>

                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 max-h-60 overflow-y-auto space-y-3 block w-full">
                  <div className="block w-full">
                    <h4 className="text-xs font-bold text-emerald-600 mb-1">
                      1. Data Privacy & Security
                    </h4>
                    <p className="text-[11px] text-gray-600 leading-relaxed">
                      Animal X securely stores your personal details (Gmail,
                      Profile Data) and location permissions on Firebase
                      Encrypted Servers. Your data is strictly confidential and
                      is never shared with any third-party applications.
                    </p>
                  </div>

                  <div className="block w-full">
                    <h4 className="text-xs font-bold text-emerald-600 mb-1">
                      2. Strict Content Moderation Rules
                    </h4>
                    <p className="text-[11px] text-gray-600 leading-relaxed">
                      Only content related to Wildlife, Animals, Forests,
                      Oceans, Mountains, and Nature is allowed on this platform
                      (Reels/Stories/Posts). AI filters and Admin panels
                      constantly monitor all active feeds.
                    </p>
                  </div>

                  <div className="block w-full">
                    <h4 className="text-xs font-bold text-red-500 mb-1">
                      3. Strike Policy & Account Blocks
                    </h4>
                    <p className="text-[11px] text-gray-600 leading-relaxed font-semibold">
                      ⚠️ If a user violates the community guidelines and uploads
                      inappropriate content, their account will receive warnings
                      (strikes). Violating the content rules 3 times (3
                      Violations) will result in a temporary or permanent
                      feature block, restricting the user from uploading Reels
                      or Stories for 30 days or indefinitely.
                    </p>
                  </div>

                  <div className="block w-full">
                    <h4 className="text-xs font-bold text-emerald-600 mb-1">
                      4. Verification & Blue Ticks
                    </h4>
                    <p className="text-[11px] text-gray-600 leading-relaxed">
                      Our verification system is fully automated. Users will
                      automatically receive a verified Blue Tick upon reaching
                      100K (100,000) followers. Additionally, for core community
                      safety and authentication, the App Admin reserves the
                      right to manually verify accounts from the hidden admin
                      panel.
                    </p>
                  </div>

                  <p className="text-[10px] text-gray-400 text-center pt-2 border-t border-gray-200/50 block w-full">
                    Last Updated: May 2026 • Animal X Team
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {gamesOpen && (
        <div
          className="edit-modal-backdrop"
          onClick={() => setGamesOpen(false)}
        >
          <div className="edit-modal" onClick={(e) => e.stopPropagation()}>
            <div className="edit-modal-head">
              <h3>🎮 Animal Games</h3>

              <button
                className="edit-modal-close"
                onClick={() => setGamesOpen(false)}
              >
                ×
              </button>
            </div>

            <div className="edit-modal-body">
              <button
                className="btn-primary"
                style={{ width: "100%", marginBottom: 12 }}
                onClick={() => {
                  setGamesOpen(false);
                  window.location.href = "/games/puzzle";
                }}
              >
                🦁 Wildlife Puzzle
              </button>

              <button
                className="btn-primary"
                style={{ width: "100%", marginBottom: 12 }}
                onClick={() => alert("🔢 Kids Numbers Coming Soon")}
              >
                🔢 Kids Numbers
              </button>

              <button
                className="btn-primary"
                style={{ width: "100%", marginBottom: 12 }}
                onClick={() => alert("🦓 Animal Memory Coming Soon")}
              >
                🦓 Animal Memory
              </button>

              <button
                className="btn-primary"
                style={{ width: "100%" }}
                onClick={() => alert("🦅 Animal Quiz Coming Soon")}
              >
                🦅 Animal Quiz
              </button>
            </div>
          </div>
        </div>
      )}
      (
      {editProfileOpen && (
        <div className="edit-profile-card">
          <h3>Edit Profile</h3>
          <div className="ep-photo-row">
            <div
              className="ep-photo-preview"
              style={
                photoUrl ? { backgroundImage: `url(${photoUrl})` } : undefined
              }
            >
              {!photoUrl && initial}
            </div>
            <div style={{ flex: 1 }}>
              <label
                className="btn-primary"
                style={{ cursor: "pointer", display: "inline-block" }}
              >
                📷 Upload New Photo
                <input
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={handleProfilePhoto}
                />
              </label>
              {profile.photo && (
                <button
                  className="qs-pill"
                  style={{ marginLeft: 8 }}
                  onClick={() => updateProfile({ photo: null })}
                >
                  Remove
                </button>
              )}
            </div>
          </div>
          <div className="aef-row">
            <label>Display Name</label>
            <input
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder="Your display name"
            />
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn-primary" onClick={saveProfileEdits}>
              Save
            </button>
            <button
              className="qs-pill"
              onClick={() => setEditProfileOpen(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      <div className="profile-tabs">
        <button
          className={`pt-tab ${tab === "grid" ? "active" : ""}`}
          onClick={() => setTab("grid")}
        >
          📷 Grid
        </button>
        <button
          className={`pt-tab ${tab === "reels" ? "active" : ""}`}
          onClick={() => setTab("reels")}
        >
          🎬 Reels
        </button>
        <button
          className={`pt-tab ${tab === "tagged" ? "active" : ""}`}
          onClick={() => setTab("tagged")}
        >
          🏷️ Tagged
        </button>
      </div>
      <div className="profile-tab-body">
        {tab === "grid" && (
          <div className="profile-grid-empty">
            <div style={{ fontSize: 48 }}>📷</div>
            <p>
              You have {profile.posts} posts. Upload from the Reels page → Posts
              tab.
            </p>
            <Link
              href="/reels"
              className="btn-primary"
              style={{ marginTop: 12 }}
            >
              Go to Posts
            </Link>
          </div>
        )}
        {tab === "reels" && (
          <div className="profile-grid-empty">
            <div style={{ fontSize: 48 }}>🎬</div>
            <p>You have {profile.reels} reels. Upload from the Reels page.</p>
            <Link
              href="/reels"
              className="btn-primary"
              style={{ marginTop: 12 }}
            >
              Go to Reels
            </Link>
          </div>
        )}
        {tab === "tagged" && (
          <div className="profile-grid-empty">
            <div style={{ fontSize: 48 }}>🏷️</div>
            <p>No one has tagged you yet.</p>
          </div>
        )}
      </div>
      {adminMode && isSuperAdmin && (
        <div className="admin-panel">
          <div className="admin-header">
            <h2>👑 Admin Panel</h2>
            <button className="qs-pill" onClick={lockAdminMode}>
              Lock Admin Mode
            </button>
          </div>

          <div className="admin-section">
            <h3>➕ Add New Animal</h3>
            <div className="aef-row">
              <label>Name *</label>
              <input
                type="text"
                placeholder="e.g. Spirit Lion"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
            </div>
            <div className="aef-row">
              <label>Category</label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="admin-input"
                style={{ width: "100%" }}
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div className="aef-row">
              <label>Image</label>
              <input
                ref={photoFileRef}
                type="file"
                accept="image/*"
                onChange={handleNewAnimalImage}
              />
              {newImage && (
                <img
                  src={newImage}
                  alt="preview"
                  style={{
                    marginTop: 8,
                    maxWidth: 160,
                    borderRadius: 8,
                    border: "2px solid var(--accent)",
                  }}
                />
              )}
            </div>
            <div className="aef-row">
              <label>Habits / Habitat</label>
              <textarea
                rows={2}
                placeholder="e.g. Nocturnal apex predator that lives in prides..."
                value={newHabits}
                onChange={(e) => setNewHabits(e.target.value)}
              />
            </div>
            <div className="aef-row">
              <label>Lifespan</label>
              <input
                type="text"
                placeholder="e.g. 12–16 years wild"
                value={newLifespan}
                onChange={(e) => setNewLifespan(e.target.value)}
              />
            </div>
            <div className="aef-row">
              <label>Country / Region</label>
              <input
                type="text"
                placeholder="e.g. Kenya"
                value={newCountry}
                onChange={(e) => setNewCountry(e.target.value)}
              />
            </div>
            <button className="btn-primary" onClick={submitNewAnimal}>
              ✓ Add Animal to App
            </button>
            {customAnimals.length > 0 && (
              <div style={{ marginTop: 16 }}>
                <p className="admin-hint">
                  Custom animals you've added ({customAnimals.length}):
                </p>
                <div className="custom-animals-list">
                  {customAnimals.map((a) => (
                    <div key={a.id} className="custom-animal-row">
                      {a.image ? (
                        <img src={a.image} alt={a.name} className="ca-thumb" />
                      ) : (
                        <div className="ca-thumb ca-thumb-empty">🐾</div>
                      )}
                      <div className="ca-info">
                        <div className="ca-name">{a.name}</div>
                        <div className="ca-meta">
                          {a.category} · {a.country}
                        </div>
                      </div>
                      <button
                        className="qs-pill qs-logout"
                        onClick={() => removeCustom(a.id, a.name)}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="admin-section">
            <h3>📈 Follower Booster</h3>
            <div className="admin-row">
              <input
                type="text"
                placeholder="e.g. 50k, 1M, 250000"
                value={followersInput}
                onChange={(e) => setFollowersInput(e.target.value)}
                className="admin-input"
              />
              <button className="btn-primary" onClick={applyFollowers}>
                Set Followers
              </button>
            </div>
            <p className="admin-hint">
              Current: <b>{formatCount(profile.followers)}</b> · Auto-verifies
              at 100K.
            </p>

            <label className="admin-toggle">
              <input
                type="checkbox"
                checked={!!profile.autoGrow}
                onChange={(e) => updateProfile({ autoGrow: e.target.checked })}
              />
              <span>Auto-grow followers (+5–10 per app start)</span>
            </label>

            <label className="admin-toggle">
              <input
                type="checkbox"
                checked={!!profile.manualVerified}
                onChange={(e) =>
                  updateProfile({ manualVerified: e.target.checked })
                }
              />
              <span>🔵 Manual Blue Tick (override)</span>
            </label>
          </div>

          <div className="admin-section">
            <h3>📊 Manual Stats</h3>
            <div className="admin-row">
              <input
                type="number"
                placeholder="Posts count"
                value={postsInput}
                onChange={(e) => setPostsInput(e.target.value)}
                className="admin-input"
              />
              <button className="btn-primary" onClick={applyPosts}>
                Set Posts
              </button>
            </div>
            <div className="admin-row">
              <input
                type="number"
                placeholder="Reels count"
                value={reelsInput}
                onChange={(e) => setReelsInput(e.target.value)}
                className="admin-input"
              />
              <button className="btn-primary" onClick={applyReels}>
                Set Reels
              </button>
            </div>
          </div>

          <div className="admin-section">
            <h3>👥 User Management</h3>
            <input
              type="search"
              placeholder="Search by name, email, or UID"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="admin-input"
              style={{ width: "100%" }}
            />
            <div className="admin-user-list">
              {filteredUsers.length === 0 && (
                <p className="admin-hint">No users registered yet.</p>
              )}
              {filteredUsers.map((u) => {
                const verified = !!verifiedMap[u.email] || !!verifiedMap[u.uid];
                return (
                  <div key={u.uid || u.email} className="admin-user-row">
                    <div className="adm-avatar">
                      {(u.name || u.email || "?")[0].toUpperCase()}
                    </div>
                    <div className="adm-info">
                      <div className="adm-name">
                        {u.name || "(no name)"}
                        {verified && <BlueTick />}
                      </div>
                      <div className="adm-email">{u.email}</div>
                      <div className="adm-uid">UID: {u.uid || "—"}</div>
                    </div>
                    <div className="adm-actions">
                      <button
                        className="qs-pill"
                        onClick={() => copyText(u.email)}
                      >
                        Copy Email
                      </button>
                      <button
                        className="qs-pill"
                        onClick={() => copyText(u.uid || "")}
                      >
                        Copy UID
                      </button>
                      <label className="adm-switch">
                        <input
                          type="checkbox"
                          checked={verified}
                          onChange={(e) =>
                            setVerifiedFor(u.email, e.target.checked)
                          }
                        />
                        <span>Verified</span>
                      </label>
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="admin-hint">
              Sensitive emails are visible only to the super admin (
              {SUPER_ADMIN_EMAIL}).
            </p>
          </div>

          <div className="admin-section">
            <h3>🚫 Ban / Strike Management</h3>
            <AdminBanPanel />
          </div>

          <div className="admin-section">
            <h3>📋 Moderation Log</h3>
            <AdminModerationLog />
          </div>
        </div>
      )}
    </div>
  );
}

function AdminBanPanel() {
  const [uid, setUid] = useState("");
  const [reason, setReason] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleBan(action) {
    if (!uid.trim()) {
      alert("Enter a user UID to " + action);
      return;
    }
    setLoading(true);
    try {
      const { doc, setDoc, getDoc } = await import("firebase/firestore");
      const { db } = await import("../utils/firebase");
      if (action === "ban") {
        await setDoc(
          doc(db, "userStrikes", uid.trim()),
          {
            banned: true,
            banReason: reason || "Admin action",
            bannedAt: Date.now(),
            strikes: 3,
          },
          { merge: true },
        );
        await setDoc(
          doc(db, "users", uid.trim()),
          { banned: true },
          { merge: true },
        );
        setResult({ ok: true, msg: `✅ User ${uid.trim()} banned.` });
      } else if (action === "unban") {
        await setDoc(
          doc(db, "userStrikes", uid.trim()),
          { banned: false, strikes: 0, bannedAt: null },
          { merge: true },
        );
        await setDoc(
          doc(db, "users", uid.trim()),
          { banned: false },
          { merge: true },
        );
        setResult({ ok: true, msg: `✅ User ${uid.trim()} unbanned.` });
      } else if (action === "strike") {
        const snap = await getDoc(doc(db, "userStrikes", uid.trim()));
        const cur = snap.exists() ? snap.data().strikes || 0 : 0;
        const next = Math.min(cur + 1, 3);
        await setDoc(
          doc(db, "userStrikes", uid.trim()),
          {
            strikes: next,
            banned: next >= 3,
            lastStrikeAt: Date.now(),
            lastReason: reason || "Content violation",
          },
          { merge: true },
        );
        setResult({
          ok: true,
          msg: `⚠️ Strike added (${next}/3) for user ${uid.trim()}.`,
        });
      }
    } catch (e) {
      setResult({ ok: false, msg: "Error: " + e.message });
    }
    setLoading(false);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div className="admin-ban-row">
        <input
          className="admin-ban-uid"
          placeholder="Firebase User UID"
          value={uid}
          onChange={(e) => setUid(e.target.value)}
        />
      </div>
      <div className="admin-ban-row">
        <input
          className="admin-ban-uid"
          placeholder="Reason (optional)"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button
          className="admin-ban-btn strike"
          style={{
            background: "rgba(245,158,11,0.15)",
            color: "#f59e0b",
            border: "1px solid rgba(245,158,11,0.4)",
            padding: "7px 14px",
            borderRadius: 8,
            fontWeight: 700,
            fontSize: "0.8rem",
            cursor: "pointer",
          }}
          onClick={() => handleBan("strike")}
          disabled={loading}
        >
          ⚠️ Add Strike
        </button>
        <button
          className="admin-ban-btn ban"
          onClick={() => handleBan("ban")}
          disabled={loading}
        >
          🚫 Ban User
        </button>
        <button
          className="admin-ban-btn unban"
          onClick={() => handleBan("unban")}
          disabled={loading}
        >
          ✅ Unban User
        </button>
      </div>
      {result && (
        <div className={`admin-ban-result ${result.ok ? "" : "error"}`}>
          {result.msg}
        </div>
      )}
      <p className="admin-hint" style={{ marginTop: 4 }}>
        3 strikes = 30-day upload ban. Entering UID is required.
      </p>
    </div>
  );
}

function AdminModerationLog() {
  const [logs, setLogs] = useState([]);
  const [loaded, setLoaded] = useState(false);

  async function fetchLogs() {
    try {
      const { collection, query, orderBy, limit, getDocs } = await import(
        "firebase/firestore"
      );
      const { db } = await import("../utils/firebase");
      const q = query(
        collection(db, "moderationLog"),
        orderBy("at", "desc"),
        limit(30),
      );
      const snap = await getDocs(q);
      setLogs(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch {
      setLogs([]);
    }
    setLoaded(true);
  }

  if (!loaded) {
    return (
      <button className="qs-pill" onClick={fetchLogs}>
        📋 Load Moderation Log
      </button>
    );
  }

  const DEMO_LOGS = [
    {
      id: "ml1",
      type: "strike",
      action: "Strike added (1/3)",
      detail: "User @wild_shooter — off-topic reel removed",
      at: Date.now() - 3600000,
    },
    {
      id: "ml2",
      type: "remove",
      action: "Reel removed",
      detail: "Reel #ff23 flagged for non-wildlife content",
      at: Date.now() - 7200000,
    },
    {
      id: "ml3",
      type: "ban",
      action: "User banned",
      detail: "User @spammer99 — 3 strikes, upload ban applied",
      at: Date.now() - 86400000,
    },
    {
      id: "ml4",
      type: "strike",
      action: "Strike added (2/3)",
      detail: "User @naturelover — music video without animals",
      at: Date.now() - 172800000,
    },
  ];

  const allLogs = [...logs, ...(logs.length === 0 ? DEMO_LOGS : [])];

  function timeAgo(ts) {
    const diff = Date.now() - ts;
    if (diff < 60000) return "just now";
    if (diff < 3600000) return Math.floor(diff / 60000) + "m ago";
    if (diff < 86400000) return Math.floor(diff / 3600000) + "h ago";
    return Math.floor(diff / 86400000) + "d ago";
  }

  return (
    <div className="admin-mod-log">
      {allLogs.length === 0 ? (
        <div className="mod-log-empty">No moderation actions yet.</div>
      ) : (
        allLogs.map((l) => (
          <div key={l.id} className={`mod-log-item ${l.type}`}>
            <div className="mod-log-action">{l.action || l.type}</div>
            <div className="mod-log-detail">{l.detail || l.reason || "—"}</div>
            <div className="mod-log-time">
              {timeAgo(l.at || l.timestamp || Date.now())}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
