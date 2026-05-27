import { useState, useEffect } from "react";
import { useParams, Link } from "wouter";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../utils/firebase";
import { useAuth } from "../context/AuthContext";
import { useSocial } from "../context/SocialContext";
import { DEMO_USERS, DEMO_REELS } from "../data/demoUsers";
import BlueTick from "../components/BlueTick";

function fmtNum(n) {
  if (!n) return "0";
  if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
  if (n >= 1000) return (n / 1000).toFixed(1) + "K";
  return String(n);
}

export default function UserProfile() {
  const { userId } = useParams();
  const { user: currentUser } = useAuth();
  const { following, followUser, unfollowUser } = useSocial();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userReels, setUserReels] = useState([]);

  const isFollowing = !!following[userId];

  useEffect(() => {
    async function load() {
      setLoading(true);
      const demo = DEMO_USERS.find(u => u.id === userId || u.username === userId);
      if (demo) {
        setProfile({
          uid: demo.id,
          name: demo.name,
          username: demo.username,
          bio: demo.bio,
          country: demo.country,
          followers: demo.followers,
          following: demo.following,
          reels: demo.reelCount,
          isVerified: demo.verified,
          avatar: demo.avatar,
        });
        setUserReels(DEMO_REELS.filter(r => r.userId === demo.id));
        setLoading(false);
        return;
      }
      try {
        const snap = await getDoc(doc(db, "users", userId));
        if (snap.exists()) {
          setProfile({ uid: userId, ...snap.data() });
        } else {
          setProfile(null);
        }
      } catch {
        setProfile(null);
      }
      setLoading(false);
    }
    load();
  }, [userId]);

  if (loading) {
    return (
      <div className="user-profile-page">
        <div className="user-profile-loading">
          <div className="reel-emoji-large">🐾</div>
          <p>Loading profile…</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="user-profile-page">
        <div className="not-found">
          <div className="not-found-emoji">👤</div>
          <h2>User not found</h2>
          <Link href="/reels" className="back-btn">← Back to Reels</Link>
        </div>
      </div>
    );
  }

  const isOwn = currentUser?.uid === profile.uid;

  return (
    <div className="user-profile-page">
      <div className="up-header">
        <Link href="/reels" className="back-link">← Back</Link>
      </div>

      <div className="up-card">
        <div className="up-avatar">{profile.avatar || (profile.name?.[0]?.toUpperCase() || "U")}</div>
        <div className="up-name">
          {profile.name || profile.username}
          {profile.isVerified && <BlueTick size={20} />}
        </div>
        <div className="up-username">@{profile.username || profile.email?.split("@")[0]}</div>
        {profile.bio && <p className="up-bio">{profile.bio}</p>}
        {profile.country && <div className="up-country">📍 {profile.country}</div>}

        <div className="up-stats">
          <div className="up-stat">
            <div className="up-stat-val">{fmtNum(profile.followers || 0)}</div>
            <div className="up-stat-label">Followers</div>
          </div>
          <div className="up-stat">
            <div className="up-stat-val">{fmtNum(profile.following || 0)}</div>
            <div className="up-stat-label">Following</div>
          </div>
          <div className="up-stat">
            <div className="up-stat-val">{fmtNum(profile.reels || 0)}</div>
            <div className="up-stat-label">Reels</div>
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
        {isOwn && (
          <Link href="/profile" className="up-follow-btn">Edit Profile</Link>
        )}
      </div>

      {userReels.length > 0 && (
        <div className="up-reels-section">
          <h3 className="up-section-title">🎬 Reels</h3>
          <div className="up-reels-grid">
            {userReels.map(r => (
              <div key={r.id} className="up-reel-thumb" style={{ background: r.bg }}>
                <div className="up-reel-emoji">{r.emoji}</div>
                <div className="up-reel-title">{r.title}</div>
                <div className="up-reel-likes">❤️ {fmtNum(r.likes)}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
