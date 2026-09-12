import { useState, useRef, useEffect } from "react";
import { Link } from "wouter";
import { collection, query, where, limit, onSnapshot, doc,
getDoc, getDocs, setDoc, updateDoc, deleteDoc,
serverTimestamp } from "firebase/firestore";
import { db } from "../utils/firebase";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useSocial } from "../context/SocialContext";
import {
  addCustomAnimal,
  getCustomAnimals,
  deleteCustomAnimal,
} from "../utils/customAnimals";
import { categories } from "../data/animals";
import BlueTick from "../components/BlueTick";
import StoriesRow from "../components/StoriesRow";
import UploadStory from "../components/UploadStory";
import CreatorDashboard from "../components/CreatorDashboard";
import { uploadToCloudinary } from "../utils/cloudinary";
import { resolveMediaUrl } from "../utils/firebaseUpload";
const resolveUrl = (url) => {
  if (!url) return "";
  if (typeof url === "string") return url;
  return url.secure_url || url.url || "";
};

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
    const { following } = useSocial();

  const [tapCount, setTapCount] = useState(0);
  const tapTimer = useRef(null);
  const [tab, setTab] = useState("grid");
  const [storyUploadOpen, setStoryUploadOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [nameInput, setNameInput] = useState(user?.name || "");
  const photoFileRef = useRef(null);
    const [followModalType, setFollowModalType] = useState(null);
  const [followListUsers, setFollowListUsers] = useState([]);
  const [loadingFollowList, setLoadingFollowList] = useState(false);
    const [userReels, setUserReels] = useState([]);
    const [toastMsg, setToastMsg] = useState("");

  useEffect(() => {
    const targetUid = user?.uid || profile?.uid || profile?.id;
    if (!targetUid) return;

    const q = query(
      collection(db, "reels"),
      where("userId", "==", targetUid)
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setUserReels(list);
      },
      (err) => console.error("Error fetching user reels:", err)
    );

    return () => unsub();
  }, [user?.uid, profile?.uid, profile?.id]);

    const openFollowModal = async (type) => {
    setFollowModalType(type);
    setLoadingFollowList(true);
    const targetUid = user?.uid || profile?.uid || profile?.id;
    if (!targetUid) {
      setFollowListUsers([]);
      setLoadingFollowList(false);
      return;
    }

    try {
      let ids = [];
      if (type === "followers") {
        const q = query(
          collection(db, "followers"),
          where("targetUserId", "==", targetUid)
        );
        const snap = await getDocs(q);
        ids = snap.docs
          .map((d) => d.data()?.followerUserId || d.data()?.followerId)
          .filter(Boolean);
      } else {
        const q = query(
          collection(db, "followers"),
          where("followerUserId", "==", targetUid)
        );
        const snap = await getDocs(q);
        ids = snap.docs
          .map((d) => d.data()?.targetUserId || d.data()?.followingId)
          .filter(Boolean);
      }

      const uniqueIds = Array.from(new Set(ids));
      if (uniqueIds.length === 0) {
        setFollowListUsers([]);
        setLoadingFollowList(false);
        return;
      }

      const usersData = [];
      for (const uid of uniqueIds) {
        try {
          const userDoc = await getDoc(doc(db, "users", uid));
          if (userDoc.exists()) {
            usersData.push({ id: uid, ...userDoc.data() });
          } else {
            usersData.push({ id: uid, username: "User", name: "WildSphere User" });
          }
        } catch (err) {
          console.error("Error loading user:", uid, err);
        }
      }
      setFollowListUsers(usersData);
    } catch (e) {
      console.error("Error loading follow list:", e);
      setFollowListUsers([]);
    } finally {
      setLoadingFollowList(false);
    }
  };
    useEffect(() => {
    const currentName = profile?.name || profile?.displayName || user?.displayName || user?.name || "";
    if (currentName) {
      setNameInput(currentName);
    }
  }, [profile, user]);
    // 📍 Live Real-time Counters Hook
  const [realStats, setRealStats] = useState({
    postsCount: 0,
    reelsCount: 0,
    followersCount: 0,
    followingCount: 0
  });

    useEffect(() => {
    const targetUid = user?.uid || profile?.uid || profile?.id;
    if (!targetUid) return;
    let canonicalFollowerIds = new Set();
    let legacyFollowerIds = new Set();
    let canonicalFollowingIds = new Set();
    let legacyFollowingIds = new Set();
                          const refreshRelationshipCounts = () => {
  setRealStats((prev) => ({
    ...prev,
    followersCount: canonicalFollowerIds.size,
followingCount: canonicalFollowingIds.size,
  }));
};

    const reelsQuery = query(collection(db, "reels"), where("userId", "==", targetUid));
    const unsubReels = onSnapshot(reelsQuery, (snap) => {
      setRealStats((prev) => ({ ...prev, reelsCount: snap.size }));
    }, () => {});

    const postsQuery = query(collection(db, "posts"), where("userId", "==", targetUid));
    const unsubPosts = onSnapshot(postsQuery, (snap) => {
      setRealStats((prev) => ({ ...prev, postsCount: snap.size }));
    }, () => {});

            const followersQuery = query(
          collection(db, "followers"),
          where("targetUserId", "==", targetUid)
        );
        const unsubFollowers = onSnapshot(followersQuery, (snap) => {
          canonicalFollowerIds = new Set(
            snap.docs
              .map((d) => d.data()?.followerUserId || d.data()?.followerId)
              .filter(Boolean)
          );
          refreshRelationshipCounts();
        }, () => {});

    const followingQuery = query(collection(db, "followers"), where("followerUserId", "==", targetUid));
    const unsubFollowing = onSnapshot(followingQuery, (snap) => {
      canonicalFollowingIds = new Set(snap.docs.map((item) => item.data()?.targetUserId || item.data()?.followingId || item.id));
      refreshRelationshipCounts();
    }, () => {});

                    const unsubLegacyFollowers = onSnapshot(doc(db, "userFollowers", targetUid), (snap) => {
  legacyFollowerIds = new Set(Object.keys(snap.data()?.followers || {}));
  refreshRelationshipCounts();
}, () => {});
    const unsubLegacyFollowing = onSnapshot(doc(db, "userFollowing", targetUid), (snap) => {
      legacyFollowingIds = new Set(Object.keys(snap.data()?.following || {}));
      refreshRelationshipCounts();
    }, () => {});

    return () => {
      unsubReels();
      unsubPosts();
      unsubFollowers();
      unsubFollowing();
      unsubLegacyFollowers();
      unsubLegacyFollowing();
    };
  }, [user?.uid, profile?.uid, profile?.id]);
    // --- Pending Ads Admin Setup ---
  const [pendingAds, setPendingAds] = useState([]);

  useEffect(() => {
    if (!adminMode) return;
    const q = query(
      collection(db, "advertisements"),
      where("status", "==", "pending")
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ads = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      setPendingAds(ads);
    });
    return () => unsubscribe();
  }, [adminMode]);

  const handleApproveAd = async (adId) => {
    try {
      await updateDoc(doc(db, "advertisements", adId), {
        status: "approved",
        approved: true,
        approvedAt: new Date(),
      });
      alert("✅ Ad Approved! Ab yeh Reels Feed me Live dikhega.");
    } catch (e) {
      console.error(e);
      alert("Approval fail hua!");
    }
  };

  const handleRejectAd = async (adId) => {
    if (window.confirm("Reject this advertisement? Its payment and review history will be kept.")) {
      try {
        await updateDoc(doc(db, "advertisements", adId), {
          status: "rejected",
          approved: false,
          rejectedAt: serverTimestamp(),
          rejectionReason: "Rejected during admin review",
        });
        alert("Advertisement rejected.");
      } catch (e) {
        console.error(e);
      }
    }
  };

  // Add new animal form state
  const [newName, setNewName] = useState("");
  const [newCategory, setNewCategory] = useState(categories[0]);
  const [newImage, setNewImage] = useState(null);
  const [newImagePublicId, setNewImagePublicId] = useState(null);
  const [newHabits, setNewHabits] = useState("");
  const [newLifespan, setNewLifespan] = useState("");
  const [newSpeed, setNewSpeed] = useState("");
  const [newWeight, setNewWeight] = useState("");
  const [newLength, setNewLength] = useState("");
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

  async function handleProfileImage(e, field) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file.");
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      alert("Profile images must be under 15 MB.");
      return;
    }
    try {
      const uploaded = await uploadToCloudinary(file);
      await updateProfile({
        [field]: uploaded.url,
        [`${field}PublicId`]: uploaded.publicId,
      });
    } catch (error) {
      alert(error.message || "Image upload failed.");
    }
  }

        async function saveProfileEdits() {
    const newName = nameInput.trim();
    if (!newName) {
      alert("Name cannot be empty");
      return;
    }

    // Username format check (spaces hatana & lowercase)
    const cleanUsername = newName.toLowerCase().replace(/\s+/g, "_");

    try {
      // Unique Username Check: Kya yeh username kisi aur user ke paas pehle se hai?
      if (user?.uid) {
        const qUsername = query(
          collection(db, "users"),
          where("username", "==", cleanUsername),
          limit(1)
        );
        const userSnap = await getDocs(qUsername);

        if (!userSnap.empty && userSnap.docs[0].id !== user.uid) {
          alert(`Username "@${cleanUsername}" pehle se kisi aur ne le rakha hai. Kripya doosra naam chunein!`);
          return;
        }
      }

      // 1. AuthContext me update karein
      if (typeof updateProfile === "function") {
        await updateProfile({ displayName: newName, name: newName, username: cleanUsername });
      }

      // 2. Firestore database me unique fields update karein
      if (user?.uid) {
        await updateDoc(doc(db, "users", user.uid), {
          name: newName,
          displayName: newName,
          username: cleanUsername,
          updatedAt: serverTimestamp(),
        });
      }

      // 3. Local input state ko lock karein
      setNameInput(newName);
      setEditProfileOpen(false);
      setToastMsg("Name changed successfully!");
setTimeout(() => setToastMsg(""), 3000);
    } catch (err) {
      console.error("Save profile error:", err);
      alert("Failed to save: " + (err.message || "Unknown error"));
    }
  }

  async function handleNewAnimalImage(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const uploaded = await uploadToCloudinary(file);
      setNewImage(uploaded.url);
      setNewImagePublicId(uploaded.publicId);
    } catch (error) {
      alert(error.message || "Animal photo upload failed.");
    }
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
      imagePublicId: newImagePublicId,
      habits: newHabits.trim(),
      habitat: newHabits.trim() || "Various habitats",
      lifespan: newLifespan.trim() || "Unknown",
      country: newCountry.trim() || "Worldwide",
    });
    setNewName("");
    setNewImage(null);
    setNewImagePublicId(null);
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
          <h2>Welcome to WildSphere</h2>
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

  function copyText(text) {
    navigator.clipboard?.writeText(text).then(
      () => alert(`Copied: ${text}`),
      () => alert("Copy failed"),
    );
  }

  const displayName = profile?.displayName || profile?.name || profile?.username || user?.displayName || user?.name || user?.email?.split("@")[0] || "User";
  const initial = (displayName || "U")[0].toUpperCase();

  const photoUrl = resolveMediaUrl(profile.photo);
  const coverUrl = resolveMediaUrl(profile.cover);
  const liveVerified = isVerified || realStats.followersCount >= 100000;

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
            style={{ opacity: 0, position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', cursor: 'pointer', zIndex: 50 }}
            onChange={(e) => handleProfileImage(e, "cover")}
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
            {liveVerified && <BlueTick />}
          </h1>
                    {/* Sirf logged in profile owner ko hi apna email dikhega */}
          {(user?.uid === profile?.uid || user?.uid === profile?.id) && (
            <p className="profile-email" style={{ color: '#9ca3af', fontSize: '13px', marginTop: '4px' }}>
              🔒 {user?.email}
            </p>
          )}
        </div>
      </div>
                <div className="profile-stats">
            <div className="stat-block">
              <div className="stat-num">{formatCount(realStats.postsCount)}</div>
              <div className="stat-lbl">Posts</div>
            </div>
                                    <div 
              className="stat-block" 
              onClick={() => openFollowModal('followers')} 
              style={{ cursor: 'pointer' }}
            >
              <div className="stat-num">
                {formatCount(realStats.followersCount)}
              </div>
              <div className="stat-lbl">Followers</div>
            </div>

            <div 
              className="stat-block" 
              onClick={() => openFollowModal('following')} 
              style={{ cursor: 'pointer' }}
            >
              <div className="stat-num">
                {formatCount(realStats.followingCount)}
              </div>
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

        <div className="profile-action-pair">
          <button className="qs-pill" onClick={() => setHelpOpen(true)}>
            ❓ Help & Support
          </button>
          <Link className="qs-pill" href="/games">
            🎮 Games
          </Link>
        </div>


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
                      WildSphere securely stores your personal details (Gmail,
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
                    Last Updated: May 2026 • WildSphere Team
                  </p>
                </div>
              </div>
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
                  style={{ opacity: 0, position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', cursor: 'pointer', zIndex: 50 }}
                  onChange={(e) => handleProfileImage(e, "photo")}
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
            {toastMsg && (
        <div style={{
          position: "fixed",
          bottom: "80px",
          left: "50%",
          transform: "translateX(-50%)",
          backgroundColor: "#1f2937",
          color: "#22c55e",
          padding: "12px 24px",
          borderRadius: "9999px",
          boxShadow: "0 10px 25px rgba(0,0,0,0.5)",
          fontSize: "14px",
          fontWeight: "600",
          zIndex: 99999,
          border: "1px solid rgba(34,197,94,0.3)"
        }}>
          ✓ {toastMsg}
        </div>
      )}
            {/* Followers / Following List Modal */}
      {followModalType && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px'
          }}
          onClick={() => setFollowModalType(null)}
        >
          <div 
            style={{
              background: '#18181b',
              width: '100%',
              maxWidth: '420px',
              maxHeight: '75vh',
              borderRadius: '16px',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              border: '1px solid rgba(255,255,255,0.1)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '14px 18px',
              borderBottom: '1px solid rgba(255,255,255,0.08)'
            }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#fff', textTransform: 'capitalize' }}>
                {followModalType}
              </h3>
              <button 
                onClick={() => setFollowModalType(null)}
                style={{ background: 'none', border: 'none', color: '#9ca3af', fontSize: '1.4rem', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <div style={{ padding: '12px', overflowY: 'auto', flex: 1 }}>
              {loadingFollowList ? (
                <div style={{ textAlign: 'center', padding: '24px', color: '#9ca3af' }}>Loading...</div>
              ) : followListUsers.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '30px', color: '#6b7280' }}>
                  No {followModalType} yet
                </div>
              ) : (
                followListUsers.map((u) => {
                  const isFollowed = following && following[u.id];
                  return (
                    <div 
                      key={u.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 8px',
                        borderRadius: '10px'
                      }}
                    >
                      <div 
                        style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
                        onClick={() => {
                          setFollowModalType(null);
                          window.location.href = `/profile/${u.id}`;
                        }}
                      >
                        <img 
                          src={resolveMediaUrl(u.avatar || u.photoURL) || '/default-avatar.png'} 
                          alt={u.username || u.name}
                          style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover' }}
                        />
                        <div>
                          <div style={{ fontWeight: '600', color: '#fff', fontSize: '0.95rem' }}>
                            {u.displayName || u.name || u.username}
                          </div>
                          <div style={{ color: '#9ca3af', fontSize: '0.82rem' }}>
                            @{u.username || 'user'}
                          </div>
                        </div>
                      </div>

                      {user?.uid !== u.id && (
                              <button
                type="button"
                onClick={async (e) => {
                  e.stopPropagation();
                  if (!user?.uid) {
                    alert("Please login first.");
                    return;
                  }
                  try {
                    const targetId = u.id || u.uid;
                    const followDocRef = doc(db, "followers", `${user.uid}_${targetId}`);

                    if (isFollowed) {
                      await deleteDoc(followDocRef);
                      // Update context state if available
                      if (typeof toggleFollow === "function") toggleFollow(targetId);
                      // Force refresh count
                      setRealStats((prev) => ({
                        ...prev,
                        followingCount: Math.max(0, (prev.followingCount || 1) - 1),
                      }));
                    } else {
                      await setDoc(followDocRef, {
                        followerUserId: user.uid,
                        targetUserId: targetId,
                        createdAt: serverTimestamp(),
                      });
                      if (typeof toggleFollow === "function") toggleFollow(targetId);
                      setRealStats((prev) => ({
                        ...prev,
                        followingCount: (prev.followingCount || 0) + 1,
                      }));
                    }
                  } catch (err) {
                    console.error("Follow/Unfollow error:", err);
                    alert("Action failed: " + err.message);
                  }
                }}
                style={{
                  padding: "6px 14px",
                  borderRadius: "8px",
                  border: isFollowed ? "1px solid rgba(255, 255, 255, 0.15)" : "none",
                  fontSize: "0.85rem",
                  fontWeight: "600",
                  cursor: "pointer",
                  background: isFollowed ? "#27272a" : "#10b981",
                  color: isFollowed ? "#e4e4e7" : "#fff",
                  minWidth: "85px",
                }}
              >
                {isFollowed ? "Following" : "Follow"}
              </button>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
{/* Stories row */}
      <div className="profile-stories-section">
        <StoriesRow />
      </div>

      <div className="profile-tabs">
        <button
          className={`pt-tab ${tab === "grid" ? "active" : ""}`}
          onClick={() => setTab("grid")}
        >
          📷 Posts
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
        <button
          className={`pt-tab ${tab === "dashboard" ? "active" : ""}`}
          onClick={() => setTab("dashboard")}
        >
          📊 Dashboard
        </button>
      </div>
      <div className="profile-tab-body">
        {tab === "grid" && (
          <div className="profile-grid-empty">
            <div style={{ fontSize: 48 }}>📷</div>
            <p>
              You have {realStats.postsCount} posts. Upload from the Reels page → Posts tab.
            </p>
            <Link href="/reels" className="btn-primary" style={{ marginTop: 12 }}>
              Go to Posts
            </Link>
          </div>
        )}
                  {tab === "reels" && (
            <div>
              {userReels && userReels.length > 0 ? (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gap: "6px",
                    padding: "10px 0",
                  }}
                >
                  {userReels.map((reel) => {
                    const videoSrc = reel.videoUrl || reel.url || reel.mediaUrl;
                    const thumbSrc = reel.thumbnailUrl || reel.thumbUrl;

                    return (
                      <div
                        key={reel.id}
                        onClick={() => {
                          window.location.href = `/reels?reelId=${reel.id}`;
                        }}
                        style={{
                          position: "relative",
                          aspectRatio: "9/16",
                          background: "#121212",
                          borderRadius: "8px",
                          overflow: "hidden",
                          cursor: "pointer",
                          border: "1px solid rgba(255,255,255,0.08)",
                        }}
                      >
                        {thumbSrc ? (
                          <img
                            src={thumbSrc}
                            alt={reel.title || "Reel"}
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          />
                        ) : videoSrc ? (
                          <video
                            src={videoSrc}
                            muted
                            playsInline
                            preload="metadata"
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          />
                        ) : (
                          <div
                            style={{
                              width: "100%",
                              height: "100%",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "1.8rem",
                            }}
                          >
                            🎬
                          </div>
                        )}

                        <div
                          style={{
                            position: "absolute",
                            bottom: "6px",
                            left: "6px",
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                            color: "#fff",
                            fontSize: "0.75rem",
                            fontWeight: "600",
                            textShadow: "0 1px 3px rgba(0,0,0,0.8)",
                          }}
                        >
                          ▶ {reel.views || reel.viewsCount || 0}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="profile-grid-empty">
                  <div style={{ fontSize: 48 }}>🎬</div>
                  <p>No wildlife reels uploaded yet.</p>
                  <Link href="/reels" className="btn-primary" style={{ marginTop: 12 }}>
                    Upload a Reel
                  </Link>
                </div>
              )}
            </div>
          )}
        {tab === "tagged" && (
          <div className="profile-grid-empty">
            <div style={{ fontSize: 48 }}>🏷️</div>
            <p>No one has tagged you yet.</p>
          </div>
        )}
        {tab === "dashboard" && (
          <CreatorDashboard />
        )}
      </div>

      {storyUploadOpen && (
        <UploadStory
          onClose={() => setStoryUploadOpen(false)}
          onUploaded={() => setStoryUploadOpen(false)}
        />
      )}
      {adminMode && isSuperAdmin && (
        <div className="admin-panel">
          <div className="admin-header">
            <h2>👑 Admin Panel</h2>
            <button className="qs-pill" onClick={lockAdminMode}>
              Lock Admin Mode
            </button>
          </div>
                    {/* --- Pending Ads Queue Section --- */}
          <div className="admin-section" style={{ border: "1px solid rgba(245, 158, 11, 0.4)", background: "rgba(17, 24, 39, 0.8)", padding: "12px", borderRadius: "10px", marginBottom: "16px" }}>
            <h3 style={{ color: "#f59e0b", margin: 0, fontWeight: "bold" }}>📢 Pending Advertisements ({pendingAds.length})</h3>
            {pendingAds.length === 0 ? (
              <p style={{ fontSize: "12px", color: "#9ca3af", marginTop: "6px" }}>Koi pending ad review ke liye nahi hai.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "10px" }}>
                {pendingAds.map((ad) => (
                  <div key={ad.id} style={{ padding: "10px", borderRadius: "8px", border: "1px solid #374151", background: "#1f2937", fontSize: "12px", color: "#e5e7eb" }}>
                    <div><strong>User:</strong> {ad.username || ad.userId}</div>
                    <div><strong>Title:</strong> {ad.title || "No Title"}</div>
                    <div><strong>Plan:</strong> {ad.plan} ({ad.views || 2000} Views - ₹{ad.price})</div>
                    <div><strong>Txn ID:</strong> <span style={{ color: "#f59e0b", fontFamily: "monospace" }}>{ad.txnId}</span></div>

                    {ad.screenshotPath && (
                      <div style={{ marginTop: "6px" }}>
                        <span style={{ color: "#9ca3af", display: "block" }}>Payment Proof:</span>
                        <a href={ad.screenshotPath} target="_blank" rel="noreferrer">
                          <img src={ad.screenshotPath} alt="Proof" style={{ width: "90px", height: "90px", objectFit: "cover", borderRadius: "6px", border: "1px solid #4b5563" }} />
                        </a>
                      </div>
                    )}

                    {ad.adVideoUrl && (
                      <div style={{ marginTop: "6px" }}>
                        <span style={{ color: "#9ca3af", display: "block" }}>Ad Video Preview:</span>
                        <video src={ad.adVideoUrl} controls style={{ width: "160px", height: "100px", borderRadius: "6px", background: "#000" }} />
                      </div>
                    )}

                    <div style={{ display: "flex", gap: "8px", marginTop: "10px" }}>
                      <button
                        onClick={() => handleApproveAd(ad.id)}
                        style={{ padding: "6px 12px", background: "#16a34a", color: "#fff", fontWeight: "bold", borderRadius: "6px", border: "none", cursor: "pointer" }}
                      >
                        ✅ Approve Ad
                      </button>
                      <button
                        onClick={() => handleRejectAd(ad.id)}
                        style={{ padding: "6px 12px", background: "#dc2626", color: "#fff", fontWeight: "bold", borderRadius: "6px", border: "none", cursor: "pointer" }}
                      >
                        ❌ Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
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
                    @{u.username || u.name || u.displayName || "User"}
                    {verified && <BlueTick />}
                  </div>
                  <div className="adm-email">{u.email || "No Email"}</div>
                  <div className="adm-uid">UID: {u.uid || u.id}</div>
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
  const [userQuery, setUserQuery] = useState("");
  const [reason, setReason] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  async function resolveTargetUid(raw) {
    const input = raw.trim().replace(/^@/, "");
    if (!input) return null;

    // 1. Agar direct UID hai toh pehle check karein
    try {
      const snap = await getDoc(doc(db, "users", input));
      if (snap.exists()) return { uid: input, name: snap.data().username || snap.data().name || input };
    } catch (_) {}

    // 2. Username ya Name se search karein
    try {
      const qUser = query(collection(db, "users"), where("username", "==", input), limit(1));
      const qSnap = await getDocs(qUser);
      if (!qSnap.empty) {
        const d = qSnap.docs[0];
        return { uid: d.id, name: d.data().username || d.data().name || input };
      }
    } catch (_) {}

    try {
      const qName = query(collection(db, "users"), where("name", "==", input), limit(1));
      const qSnap2 = await getDocs(qName);
      if (!qSnap2.empty) {
        const d = qSnap2.docs[0];
        return { uid: d.id, name: d.data().username || d.data().name || input };
      }
    } catch (_) {}

    return { uid: input, name: input };
  }

  async function handleBan(action) {
    if (!userQuery.trim()) {
      setResult({ ok: false, msg: "Enter a username (e.g. @wildsphere) or UID" });
      return;
    }
    setLoading(true);
    setResult(null);

    try {
      const target = await resolveTargetUid(userQuery);
      const targetUid = target.uid;
      const displayName = target.name;

      if (action === "ban") {
        await setDoc(doc(db, "userStrikes", targetUid), {
          banned: true,
          banReason: reason || "Admin action",
          bannedAt: Date.now(),
          strikes: 3,
        }, { merge: true });

        await setDoc(doc(db, "users", targetUid), { banned: true }, { merge: true });
        setResult({ ok: true, msg: `✅ User @${displayName} banned (30 days upload lock).` });

      } else if (action === "unban") {
        await setDoc(doc(db, "userStrikes", targetUid), {
          banned: false,
          strikes: 0,
          bannedAt: null,
        }, { merge: true });

        await setDoc(doc(db, "users", targetUid), { banned: false }, { merge: true });
        setResult({ ok: true, msg: `✅ User @${displayName} unbanned successfully.` });

      } else if (action === "strike") {
        const snap = await getDoc(doc(db, "userStrikes", targetUid));
        const cur = snap.exists() ? (snap.data().strikes || 0) : 0;
        const next = Math.min(cur + 1, 3);

        await setDoc(doc(db, "userStrikes", targetUid), {
          strikes: next,
          banned: next >= 3,
          lastStrikeAt: Date.now(),
          lastReason: reason || "Content violation",
        }, { merge: true });

        setResult({
          ok: true,
          msg: `⚠️ Strike (${next}/3) recorded for @${displayName}.${next >= 3 ? " Auto-banned." : ""}`
        });
      }
    } catch (e) {
      console.error("Ban action error:", e);
      setResult({ ok: false, msg: "Error: " + e.message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div className="admin-ban-row">
        <input
          className="admin-ban-uid"
          placeholder="Enter username (e.g. @nakum or wildsphere) or UID"
          value={userQuery}
          onChange={(e) => setUserQuery(e.target.value)}
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
        Strike 3 par 30-day upload ban automatically lagta hai. Username (@nakum) ya UID dono chalenge.
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
