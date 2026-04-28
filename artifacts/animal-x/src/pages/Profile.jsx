import { useState, useRef } from "react";
import { Link } from "wouter";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { addCustomAnimal, getCustomAnimals, deleteCustomAnimal } from "../utils/customAnimals";
import { fileToDataURL } from "../utils/animalOverrides";
import { categories } from "../data/animals";
import BlueTick from "../components/BlueTick";

function formatCount(n) {
  if (n == null || isNaN(n)) return "0";
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(n % 1_000 === 0 ? 0 : 1) + "K";
  return String(n);
}

function parseCount(str) {
  if (typeof str === "number") return str;
  const s = String(str || "").trim().toLowerCase();
  if (!s) return 0;
  const m = s.match(/^([\d.]+)\s*([kmb]?)$/);
  if (!m) return parseInt(s.replace(/\D/g, ""), 10) || 0;
  const n = parseFloat(m[1]);
  const mult = m[2] === "k" ? 1_000 : m[2] === "m" ? 1_000_000 : m[2] === "b" ? 1_000_000_000 : 1;
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
  const [tab, setTab] = useState("grid");
  const [search, setSearch] = useState("");
  const [followersInput, setFollowersInput] = useState("");
  const [postsInput, setPostsInput] = useState("");
  const [reelsInput, setReelsInput] = useState("");
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [nameInput, setNameInput] = useState(user?.name || "");
  const photoFileRef = useRef(null);

  // Add new animal form state
  const [newName, setNewName] = useState("");
  const [newCategory, setNewCategory] = useState(categories[0]);
  const [newImage, setNewImage] = useState(null);
  const [newHabits, setNewHabits] = useState("");
  const [newLifespan, setNewLifespan] = useState("");
  const [newCountry, setNewCountry] = useState("");
  const [customAnimals, setCustomAnimalsState] = useState(() => getCustomAnimals());

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
    const dataUrl = await fileToDataURL(file);
    updateProfile({ photo: dataUrl });
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
          <Link href="/auth" className="btn-primary">Login / Sign Up</Link>
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
    if (!isNaN(n)) { updateProfile({ posts: n }); setPostsInput(""); }
  }
  function applyReels() {
    const n = parseInt(reelsInput, 10);
    if (!isNaN(n)) { updateProfile({ reels: n }); setReelsInput(""); }
  }
  function copyText(text) {
    navigator.clipboard?.writeText(text).then(
      () => alert(`Copied: ${text}`),
      () => alert("Copy failed")
    );
  }

  const displayName = profile.name || user.name || user.email;
  const initial = (displayName || "U")[0].toUpperCase();

  return (
    <div className="profile-page">
      <div className="profile-top">
        <button
          className="profile-avatar-btn"
          onClick={handleAvatarTap}
          aria-label="Profile photo (tap 7 times for admin mode)"
          style={profile.photo ? { backgroundImage: `url(${profile.photo})`, backgroundSize: "cover", backgroundPosition: "center", color: "transparent" } : undefined}
        >
          {!profile.photo && initial}
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
        <button className="qs-pill qs-edit" onClick={() => setEditProfileOpen((v) => !v)}>
          ✏️ Edit Profile
        </button>
        <button className="qs-pill" onClick={toggleTheme}>
          {theme === "dark" ? "☀️ Light Mode" : "🌙 Dark Mode"}
        </button>
        <button className="qs-pill qs-logout" onClick={logout}>↪ Log out</button>
      </div>

      {editProfileOpen && (
        <div className="edit-profile-card">
          <h3>Edit Profile</h3>
          <div className="ep-photo-row">
            <div
              className="ep-photo-preview"
              style={profile.photo ? { backgroundImage: `url(${profile.photo})` } : undefined}
            >
              {!profile.photo && initial}
            </div>
            <div style={{ flex: 1 }}>
              <label className="btn-primary" style={{ cursor: "pointer", display: "inline-block" }}>
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
            <button className="btn-primary" onClick={saveProfileEdits}>Save</button>
            <button className="qs-pill" onClick={() => setEditProfileOpen(false)}>Cancel</button>
          </div>
        </div>
      )}

      <div className="profile-tabs">
        <button className={`pt-tab ${tab === "grid" ? "active" : ""}`} onClick={() => setTab("grid")}>📷 Grid</button>
        <button className={`pt-tab ${tab === "reels" ? "active" : ""}`} onClick={() => setTab("reels")}>🎬 Reels</button>
        <button className={`pt-tab ${tab === "tagged" ? "active" : ""}`} onClick={() => setTab("tagged")}>🏷️ Tagged</button>
      </div>

      <div className="profile-tab-body">
        {tab === "grid" && (
          <div className="profile-grid-empty">
            <div style={{ fontSize: 48 }}>📷</div>
            <p>You have {profile.posts} posts. Upload from the Reels page → Posts tab.</p>
            <Link href="/reels" className="btn-primary" style={{ marginTop: 12 }}>Go to Posts</Link>
          </div>
        )}
        {tab === "reels" && (
          <div className="profile-grid-empty">
            <div style={{ fontSize: 48 }}>🎬</div>
            <p>You have {profile.reels} reels. Upload from the Reels page.</p>
            <Link href="/reels" className="btn-primary" style={{ marginTop: 12 }}>Go to Reels</Link>
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
            <button className="qs-pill" onClick={lockAdminMode}>Lock Admin Mode</button>
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
                {categories.map((c) => <option key={c} value={c}>{c}</option>)}
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
                  style={{ marginTop: 8, maxWidth: 160, borderRadius: 8, border: "2px solid var(--accent)" }}
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
                <p className="admin-hint">Custom animals you've added ({customAnimals.length}):</p>
                <div className="custom-animals-list">
                  {customAnimals.map((a) => (
                    <div key={a.id} className="custom-animal-row">
                      {a.image
                        ? <img src={a.image} alt={a.name} className="ca-thumb" />
                        : <div className="ca-thumb ca-thumb-empty">🐾</div>}
                      <div className="ca-info">
                        <div className="ca-name">{a.name}</div>
                        <div className="ca-meta">{a.category} · {a.country}</div>
                      </div>
                      <button className="qs-pill qs-logout" onClick={() => removeCustom(a.id, a.name)}>✕</button>
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
              <button className="btn-primary" onClick={applyFollowers}>Set Followers</button>
            </div>
            <p className="admin-hint">Current: <b>{formatCount(profile.followers)}</b> · Auto-verifies at 100K.</p>

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
                onChange={(e) => updateProfile({ manualVerified: e.target.checked })}
              />
              <span>🔵 Manual Blue Tick (override)</span>
            </label>
          </div>

          <div className="admin-section">
            <h3>📊 Manual Stats</h3>
            <div className="admin-row">
              <input type="number" placeholder="Posts count" value={postsInput} onChange={(e) => setPostsInput(e.target.value)} className="admin-input" />
              <button className="btn-primary" onClick={applyPosts}>Set Posts</button>
            </div>
            <div className="admin-row">
              <input type="number" placeholder="Reels count" value={reelsInput} onChange={(e) => setReelsInput(e.target.value)} className="admin-input" />
              <button className="btn-primary" onClick={applyReels}>Set Reels</button>
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
              {filteredUsers.length === 0 && <p className="admin-hint">No users registered yet.</p>}
              {filteredUsers.map((u) => {
                const verified = !!verifiedMap[u.email] || !!verifiedMap[u.uid];
                return (
                  <div key={u.uid || u.email} className="admin-user-row">
                    <div className="adm-avatar">{(u.name || u.email || "?")[0].toUpperCase()}</div>
                    <div className="adm-info">
                      <div className="adm-name">
                        {u.name || "(no name)"}
                        {verified && <BlueTick />}
                      </div>
                      <div className="adm-email">{u.email}</div>
                      <div className="adm-uid">UID: {u.uid || "—"}</div>
                    </div>
                    <div className="adm-actions">
                      <button className="qs-pill" onClick={() => copyText(u.email)}>Copy Email</button>
                      <button className="qs-pill" onClick={() => copyText(u.uid || "")}>Copy UID</button>
                      <label className="adm-switch">
                        <input
                          type="checkbox"
                          checked={verified}
                          onChange={(e) => setVerifiedFor(u.email, e.target.checked)}
                        />
                        <span>Verified</span>
                      </label>
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="admin-hint">Sensitive emails are visible only to the super admin ({SUPER_ADMIN_EMAIL}).</p>
          </div>
        </div>
      )}
    </div>
  );
}
