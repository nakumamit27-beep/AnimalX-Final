import { useState, useEffect } from "react";
import { useParams, Link, useLocation } from "wouter";
import { doc, getDoc, updateDoc, setDoc } from "firebase/firestore";
import { db } from "../utils/firebase";
import { useAuth } from "../context/AuthContext";
import { useSocial } from "../context/SocialContext";
import { ALL_USERS, getUserReels, FAKE_USERS } from "../data/demoUsers";
import BlueTick from "../components/BlueTick";

function fmtNum(n) {
  if (!n) return "0";
  if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
  if (n >= 1000) return (n / 1000).toFixed(1) + "K";
  return String(n);
}

export default function UserProfile() {
  const { userId } = useParams();
  const [, navigate] = useLocation();
  const { user: currentUser, isSuperAdmin, adminMode } = useAuth();
  const { following, followUser, unfollowUser } = useSocial();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userReels, setUserReels] = useState([]);
  const [tab, setTab] = useState("reels"); // reels | followers | following
  const [followersList, setFollowersList] = useState([]);
  const [followingList, setFollowingList] = useState([]);
  const [tickMsg, setTickMsg] = useState(null);

  const isFollowing = !!following[userId];

  useEffect(() => {
    async function load() {
      setLoading(true);
      const demo = ALL_USERS.find(u => u.id === userId || u.username === userId);
      if (demo) {
        const prof = {
          uid: demo.id, name: demo.name, username: demo.username,
          bio: demo.bio, country: demo.country,
          followers: demo.followers, following: demo.following,
          reels: demo.reelCount, isVerified: demo.verified, avatar: demo.avatar,
        };
        setProfile(prof);
        setUserReels(getUserReels(demo.id));
        // Build fake followers/following lists from ALL_USERS
        const seedN = parseInt(demo.id.replace(/\D/g, "")) || 1;
        const fakeFollowers = ALL_USERS
          .filter((u, i) => u.id !== demo.id && (i % (seedN % 5 + 2) === 0))
          .slice(0, Math.min(demo.followers, 30));
        const fakeFollowing = ALL_USERS
          .filter((u, i) => u.id !== demo.id && (i % (seedN % 3 + 1) === 0))
          .slice(0, Math.min(demo.following, 30));
        setFollowersList(fakeFollowers);
        setFollowingList(fakeFollowing);
        setLoading(false);
        return;
      }
      try {
        const snap = await getDoc(doc(db, "users", userId));
        if (snap.exists()) {
          const data = snap.data();
          setProfile({ uid: userId, ...data });
          // load followers/following from Firestore
          try {
            const [fSnap, fgSnap] = await Promise.all([
              getDoc(doc(db, "userFollowers", userId)),
              getDoc(doc(db, "userFollowing", userId)),
            ]);
            const fIds = Object.keys(fSnap.data()?.followers || {}).filter(Boolean).slice(0, 30);
            const fgIds = Object.keys(fgSnap.data()?.following || {}).filter(Boolean).slice(0, 30);
            // Resolve names from ALL_USERS or minimal stubs
            setFollowersList(fIds.map(id => ALL_USERS.find(u => u.id === id) || { id, username: id, name: id }));
            setFollowingList(fgIds.map(id => ALL_USERS.find(u => u.id === id) || { id, username: id, name: id }));
          } catch {}
        } else {
          setProfile(null);
        }
      } catch { setProfile(null); }
      setLoading(false);
    }
    load();
  }, [userId]);

  async function handleGiveTick(give) {
    const target = ALL_USERS.find(u => u.id === userId);
    if (target) {
      target.verified = give;
      setProfile(p => ({ ...p, isVerified: give }));
      setTickMsg(give ? "✅ Blue tick granted!" : "❌ Blue tick removed!");
      setTimeout(() => setTickMsg(null), 3000);
      return;
    }
    try {
      await setDoc(doc(db, "users", userId), { manualVerified: give }, { merge: true });
      setProfile(p => ({ ...p, isVerified: give, manualVerified: give }));
      setTickMsg(give ? "✅ Blue tick granted!" : "❌ Blue tick removed!");
      setTimeout(() => setTickMsg(null), 3000);
    } catch (e) { alert("Error: " + e.message); }
  }

  if (loading) return (
    <div className="user-profile-page">
      <div className="user-profile-loading"><div style={{ fontSize: "3rem" }}>🐾</div><p>Loading profile…</p></div>
    </div>
  );

  if (!profile) return (
    <div className="user-profile-page">
      <div className="not-found">
        <div style={{ fontSize: "3rem" }}>👤</div>
        <h2>User not found</h2>
        <Link href="/reels" className="back-btn">← Back to Reels</Link>
      </div>
    </div>
  );

  const isOwn = currentUser?.uid === profile.uid;
  const canManageTick = isSuperAdmin && adminMode;

  return (
    <div className="user-profile-page">
      {tickMsg && <div className="tick-msg-toast">{tickMsg}</div>}

      <div className="up-header">
        <button className="up-back-btn" onClick={() => navigate(-1)}>← Back</button>
        {canManageTick && (
          <div className="admin-tick-controls">
            <span style={{ fontSize: "0.72rem", color: "#a855f7", fontWeight: 700 }}>ADMIN</span>
            <button className="atick-btn give" onClick={() => handleGiveTick(true)}>✓ Give Blue Tick</button>
            <button className="atick-btn remove" onClick={() => handleGiveTick(false)}>✕ Remove Tick</button>
          </div>
        )}
      </div>

      <div className="up-card">
        <div className="up-avatar-wrap">
          <div className="up-avatar">{profile.avatar || (profile.name?.[0]?.toUpperCase() || "U")}</div>
          {profile.isVerified && <div className="up-avatar-tick"><BlueTick size={18} /></div>}
        </div>
        <div className="up-name">
          {profile.name || profile.username}
          {profile.isVerified && <BlueTick size={20} />}
        </div>
        <div className="up-username">@{profile.username || profile.email?.split("@")[0]}</div>
        {profile.bio && <p className="up-bio">{profile.bio}</p>}
        {profile.country && <div className="up-country">📍 {profile.country}</div>}

        <div className="up-stats">
          <div className="up-stat" onClick={() => setTab("reels")} style={{ cursor: "pointer" }}>
            <div className="up-stat-val">{fmtNum(profile.reels || 0)}</div>
            <div className="up-stat-label">Reels</div>
          </div>
          <div className="up-stat" onClick={() => setTab("followers")} style={{ cursor: "pointer" }}>
            <div className="up-stat-val">{fmtNum(profile.followers || 0)}</div>
            <div className="up-stat-label">Followers</div>
          </div>
          <div className="up-stat" onClick={() => setTab("following")} style={{ cursor: "pointer" }}>
            <div className="up-stat-val">{fmtNum(profile.following || 0)}</div>
            <div className="up-stat-label">Following</div>
          </div>
        </div>

        {!isOwn && currentUser && (
          <button
            className={`up-follow-btn ${isFollowing ? "following" : ""}`}
            onClick={() => isFollowing ? unfollowUser(userId) : followUser(userId, profile.username || profile.name)}
          >
            {isFollowing ? "✓ Following" : "+ Follow"}
          </button>
        )}
        {isOwn && <Link href="/profile" className="up-follow-btn">✏️ Edit Profile</Link>}
      </div>

      {/* Tabs */}
      <div className="up-tabs">
        <button className={`up-tab ${tab === "reels" ? "active" : ""}`} onClick={() => setTab("reels")}>🎬 Reels</button>
        <button className={`up-tab ${tab === "followers" ? "active" : ""}`} onClick={() => setTab("followers")}>👥 Followers</button>
        <button className={`up-tab ${tab === "following" ? "active" : ""}`} onClick={() => setTab("following")}>✅ Following</button>
      </div>

      {/* Reels grid */}
      {tab === "reels" && (
        <div className="up-reels-grid">
          {userReels.length === 0 && <div className="up-empty">No reels yet.</div>}
          {userReels.map(r => (
            <div key={r.id} className="up-reel-thumb" style={{ background: r.bg }}>
              {r.url
                ? <video src={r.url} muted loop autoPlay playsInline className="up-reel-video" />
                : <div className="up-reel-emoji-inner">{r.emoji}</div>
              }
              <div className="up-reel-overlay">
                <div className="up-reel-title">{r.title}</div>
                <div className="up-reel-likes">❤️ {fmtNum(r.likes)}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Followers list */}
      {tab === "followers" && (
        <UserList users={followersList} emptyMsg="No followers yet." following={following} currentUser={currentUser} followUser={followUser} unfollowUser={unfollowUser} />
      )}

      {/* Following list */}
      {tab === "following" && (
        <UserList users={followingList} emptyMsg="Not following anyone yet." following={following} currentUser={currentUser} followUser={followUser} unfollowUser={unfollowUser} />
      )}
    </div>
  );
}

function UserList({ users, emptyMsg, following, currentUser, followUser, unfollowUser }) {
  if (users.length === 0) return <div className="up-empty">{emptyMsg}</div>;
  return (
    <div className="up-user-list">
      {users.map(u => {
        const isFollowing = !!following[u.id];
        const isOwn = currentUser?.uid === u.id;
        return (
          <div key={u.id} className="up-user-row">
            <Link href={`/user/${u.id}`} className="up-user-row-left">
              <div className="up-user-row-avatar">{u.avatar || u.username?.[0]?.toUpperCase() || "U"}</div>
              <div>
                <div className="up-user-row-username">
                  @{u.username || u.id}
                  {u.verified && <BlueTick size={13} />}
                </div>
                {u.name && <div className="up-user-row-name">{u.name}</div>}
              </div>
            </Link>
            {!isOwn && currentUser && (
              <button
                className={`up-mini-follow-btn ${isFollowing ? "following" : ""}`}
                onClick={() => isFollowing ? unfollowUser(u.id) : followUser(u.id, u.username)}
              >
                {isFollowing ? "✓" : "+ Follow"}
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
