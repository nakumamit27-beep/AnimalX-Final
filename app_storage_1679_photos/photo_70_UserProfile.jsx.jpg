import { useState, useEffect } from "react";
import { useParams, Link, useLocation } from "wouter";
import {
  doc, getDoc, setDoc, collection, query,
  where, orderBy, getDocs, limit
} from "firebase/firestore";
import { db } from "../utils/firebase";
import { useAuth } from "../context/AuthContext";
import { useSocial } from "../context/SocialContext";
import BlueTick from "../components/BlueTick";

function fmt(n) {
  if (!n) return "0";
  if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
  if (n >= 1000) return (n / 1000).toFixed(1) + "K";
  return String(n);
}

function resolveUrl(path) {
  if (!path) return null;
  if (path.startsWith("data:") || path.startsWith("http")) return path;
  return `/api/storage${path}`;
}

export default function UserProfile() {
  const { userId } = useParams();
  const [, navigate] = useLocation();
  const { user: currentUser, isSuperAdmin, adminMode } = useAuth();
  const { following, followUser, unfollowUser } = useSocial();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userReels, setUserReels] = useState([]);
  const [reelsLoading, setReelsLoading] = useState(true);
  const [tab, setTab] = useState("reels");
  const [followersList, setFollowersList] = useState([]);
  const [followingList, setFollowingList] = useState([]);
  const [listsLoading, setListsLoading] = useState(false);
  const [tickMsg, setTickMsg] = useState(null);
  const [totalLikes, setTotalLikes] = useState(0);

  const isFollowing = !!following[userId];
  const isOwn = currentUser?.uid === userId;
  const canManageTick = isSuperAdmin && adminMode;

  // Load profile from Firestore
  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    setReelsLoading(true);

    // Load profile
    getDoc(doc(db, "users", userId)).then(snap => {
      if (snap.exists()) {
        setProfile({ uid: userId, ...snap.data() });
      } else {
        setProfile(null);
      }
      setLoading(false);
    }).catch(() => { setProfile(null); setLoading(false); });

    // Load user's reels from Firestore
    const reelsQ = query(
      collection(db, "reels"),
      where("userId", "==", userId),
      orderBy("createdAt", "desc"),
      limit(50)
    );
    getDocs(reelsQ).then(snap => {
      const reels = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setUserReels(reels);
      // Compute total likes
      const tl = reels.reduce((sum, r) => sum + (r.likes || 0), 0);
      setTotalLikes(tl);
      setReelsLoading(false);
    }).catch(() => { setUserReels([]); setReelsLoading(false); });
  }, [userId]);

  // Load followers/following when tab changes
  useEffect(() => {
    if (tab !== "followers" && tab !== "following") return;
    if (followersList.length > 0 || followingList.length > 0) return;
    setListsLoading(true);

    Promise.all([
      getDoc(doc(db, "userFollowers", userId)),
      getDoc(doc(db, "userFollowing", userId)),
    ]).then(async ([fSnap, fgSnap]) => {
      const followerIds = Object.keys(fSnap.data()?.followers || {}).filter(Boolean).slice(0, 50);
      const followingIds = Object.keys(fgSnap.data()?.following || {}).filter(Boolean).slice(0, 50);

      // Resolve user profiles for these IDs
      const resolveUsers = async (ids) => {
        const results = await Promise.all(ids.map(async id => {
          try {
            const snap = await getDoc(doc(db, "users", id));
            return snap.exists() ? { id, uid: id, ...snap.data() } : { id, uid: id, name: id };
          } catch { return { id, uid: id, name: id }; }
        }));
        return results;
      };

      const [fl, fgl] = await Promise.all([resolveUsers(followerIds), resolveUsers(followingIds)]);
      setFollowersList(fl);
      setFollowingList(fgl);
      setListsLoading(false);
    }).catch(() => setListsLoading(false));
  }, [tab, userId]);

  async function handleGiveTick(give) {
    try {
      await setDoc(doc(db, "users", userId), { manualVerified: give }, { merge: true });
      setProfile(p => ({ ...p, manualVerified: give, isVerified: give }));
      setTickMsg(give ? "✅ Blue tick granted!" : "❌ Blue tick removed!");
      setTimeout(() => setTickMsg(null), 3000);
    } catch (e) { alert("Error: " + e.message); }
  }

  if (loading) {
    return (
      <div className="user-profile-page">
        <div className="user-profile-loading">
          <div style={{ fontSize: "3rem" }}>🐾</div>
          <p>Loading profile…</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="user-profile-page">
        <div className="not-found">
          <div style={{ fontSize: "4rem" }}>👤</div>
          <h2>User not found</h2>
          <p style={{ color: "var(--text2)", marginTop: 8 }}>This profile doesn't exist or has been removed.</p>
          <button onClick={() => navigate(-1)} className="btn-primary" style={{ marginTop: 16 }}>← Go Back</button>
        </div>
      </div>
    );
  }

  const displayName = profile.name || profile.username || profile.email?.split("@")[0] || "Wildlife Creator";
  const username = profile.username || profile.email?.split("@")[0] || profile.uid?.slice(0, 8);
  const isVerified = profile.manualVerified || profile.isVerified || false;
  const photoUrl = resolveUrl(profile.photo || profile.avatar || null);
  const coverUrl = resolveUrl(profile.cover || null);

  return (
    <div className="user-profile-page">
      {tickMsg && <div className="tick-msg-toast">{tickMsg}</div>}

      {/* Header bar */}
      <div className="up-header">
        <button className="up-back-btn" onClick={() => navigate(-1)}>← Back</button>
        {canManageTick && (
          <div className="admin-tick-controls">
            <span className="admin-label">ADMIN</span>
            <button className="atick-btn give" onClick={() => handleGiveTick(true)}>✓ Give Blue Tick</button>
            <button className="atick-btn remove" onClick={() => handleGiveTick(false)}>✕ Remove Tick</button>
          </div>
        )}
      </div>

      {/* Cover image */}
      <div
        className="up-cover"
        style={coverUrl ? { backgroundImage: `url(${coverUrl})` } : undefined}
      />

      {/* Profile card */}
      <div className="up-card">
        <div className="up-avatar-wrap">
          {photoUrl
            ? <img src={photoUrl} alt={displayName} className="up-avatar-img" />
            : <div className="up-avatar-initials">{displayName[0]?.toUpperCase() || "🦁"}</div>
          }
          {isVerified && (
            <div className="up-avatar-tick"><BlueTick size={18} /></div>
          )}
        </div>

        <div className="up-name">
          {displayName}
          {isVerified && <BlueTick size={20} />}
        </div>
        <div className="up-username">@{username}</div>
        {profile.bio && <p className="up-bio">{profile.bio}</p>}
        {profile.country && <div className="up-country">📍 {profile.country}</div>}

        {/* Stats */}
        <div className="up-stats">
          <div className="up-stat" onClick={() => setTab("reels")} style={{ cursor: "pointer" }}>
            <div className="up-stat-val">{fmt(userReels.length || profile.reels || 0)}</div>
            <div className="up-stat-label">Reels</div>
          </div>
          <div className="up-stat" onClick={() => setTab("followers")} style={{ cursor: "pointer" }}>
            <div className="up-stat-val">{fmt(profile.followers || 0)}</div>
            <div className="up-stat-label">Followers</div>
          </div>
          <div className="up-stat" onClick={() => setTab("following")} style={{ cursor: "pointer" }}>
            <div className="up-stat-val">{fmt(profile.following || 0)}</div>
            <div className="up-stat-label">Following</div>
          </div>
          {totalLikes > 0 && (
            <div className="up-stat">
              <div className="up-stat-val">{fmt(totalLikes)}</div>
              <div className="up-stat-label">❤️ Likes</div>
            </div>
          )}
        </div>

        {/* Follow / Edit buttons */}
        {!isOwn && currentUser && (
          <button
            className={`up-follow-btn ${isFollowing ? "following" : ""}`}
            onClick={() => isFollowing ? unfollowUser(userId) : followUser(userId, username)}
          >
            {isFollowing ? "✓ Following" : "+ Follow"}
          </button>
        )}
        {isOwn && (
          <Link href="/profile" className="up-follow-btn">✏️ Edit Profile</Link>
        )}
        {!currentUser && (
          <Link href="/auth" className="up-follow-btn">+ Follow</Link>
        )}
      </div>

      {/* Tabs */}
      <div className="up-tabs">
        <button className={`up-tab ${tab === "reels" ? "active" : ""}`} onClick={() => setTab("reels")}>
          🎬 Reels {userReels.length > 0 && `(${userReels.length})`}
        </button>
        <button className={`up-tab ${tab === "followers" ? "active" : ""}`} onClick={() => setTab("followers")}>
          👥 Followers
        </button>
        <button className={`up-tab ${tab === "following" ? "active" : ""}`} onClick={() => setTab("following")}>
          ✅ Following
        </button>
      </div>

      {/* Reels grid */}
      {tab === "reels" && (
        <div className="up-reels-grid">
          {reelsLoading ? (
            <div className="up-empty">
              <div style={{ fontSize: "2rem" }}>🐾</div>
              <p>Loading reels…</p>
            </div>
          ) : userReels.length === 0 ? (
            <div className="up-empty">
              <div style={{ fontSize: "3rem" }}>🎬</div>
              <p>No wildlife reels uploaded yet.</p>
              {isOwn && (
                <Link href="/reels" className="btn-primary" style={{ marginTop: 12 }}>
                  Upload Your First Reel
                </Link>
              )}
            </div>
          ) : (
            userReels.map(r => {
              const videoUrl = resolveUrl(r.videoUrl);
              const thumbUrl = resolveUrl(r.thumbnailUrl);
              return (
                <div key={r.id} className="up-reel-thumb">
                  {videoUrl ? (
                    thumbUrl
                      ? <img src={thumbUrl} alt={r.title} className="up-reel-img" />
                      : (
                        <video
                          src={videoUrl}
                          muted
                          loop
                          playsInline
                          preload="metadata"
                          className="up-reel-video"
                        />
                      )
                  ) : (
                    <div className="up-reel-placeholder">🦁</div>
                  )}
                  <div className="up-reel-overlay">
                    <div className="up-reel-title">{r.title}</div>
                    <div className="up-reel-likes">❤️ {fmt(r.likes || 0)}</div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Followers list */}
      {tab === "followers" && (
        listsLoading ? (
          <div className="up-empty"><div style={{ fontSize: "2rem" }}>🐾</div><p>Loading…</p></div>
        ) : (
          <UserList
            users={followersList}
            emptyMsg="No followers yet."
            following={following}
            currentUser={currentUser}
            followUser={followUser}
            unfollowUser={unfollowUser}
          />
        )
      )}

      {/* Following list */}
      {tab === "following" && (
        listsLoading ? (
          <div className="up-empty"><div style={{ fontSize: "2rem" }}>🐾</div><p>Loading…</p></div>
        ) : (
          <UserList
            users={followingList}
            emptyMsg="Not following anyone yet."
            following={following}
            currentUser={currentUser}
            followUser={followUser}
            unfollowUser={unfollowUser}
          />
        )
      )}
    </div>
  );
}

function UserList({ users, emptyMsg, following, currentUser, followUser, unfollowUser }) {
  if (users.length === 0) return (
    <div className="up-empty"><div style={{ fontSize: "2.5rem" }}>👥</div><p>{emptyMsg}</p></div>
  );
  return (
    <div className="up-user-list">
      {users.map(u => {
        const isFollowingU = !!following[u.id || u.uid];
        const isOwn = currentUser?.uid === (u.id || u.uid);
        const photoUrl = u.photo ? (u.photo.startsWith("/api") || u.photo.startsWith("http") ? u.photo : `/api/storage${u.photo}`) : null;
        return (
          <div key={u.id || u.uid} className="up-user-row">
            <Link href={`/user/${u.id || u.uid}`} className="up-user-row-left">
              {photoUrl
                ? <img src={photoUrl} alt={u.name} className="up-user-row-avatar-img" />
                : <div className="up-user-row-avatar">{(u.name || u.username || "U")[0].toUpperCase()}</div>
              }
              <div>
                <div className="up-user-row-username">
                  @{u.username || u.name || u.uid?.slice(0, 8)}
                  {(u.manualVerified || u.verified) && <BlueTick size={13} />}
                </div>
                {u.name && <div className="up-user-row-name">{u.name}</div>}
                {u.country && <div className="up-user-row-country">📍 {u.country}</div>}
              </div>
            </Link>
            {!isOwn && currentUser && (
              <button
                className={`up-mini-follow-btn ${isFollowingU ? "following" : ""}`}
                onClick={() => isFollowingU ? unfollowUser(u.id || u.uid) : followUser(u.id || u.uid, u.username || u.name)}
              >
                {isFollowingU ? "✓" : "+ Follow"}
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
