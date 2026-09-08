import React, { useState, useEffect, useRef, useCallback } from "react";
import { useLocation, Link } from "wouter";
import {
  collection, query, orderBy, limit, where,
  onSnapshot, doc, updateDoc, increment, deleteDoc,
  addDoc, serverTimestamp,getDoc
} from "firebase/firestore";
import { db } from "../utils/firebase";
import { useAuth } from "../context/AuthContext";
import { useSocial } from "../context/SocialContext";
import BlueTick from "../components/BlueTick";
import CommentsPanel from "../components/CommentsPanel";
import UploadReel from "../components/UploadReel";
import { resolveMediaUrl } from "../utils/firebaseUpload";

function fmt(n) {
  if (!n) return "0";
  if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
  if (n >= 1000) return (n / 1000).toFixed(1) + "K";
  return String(n);
}

const CATS = ["All", "Mammals", "Birds", "Aquatic", "Reptiles", "Small Creatures", "Trees", "Mountains", "Sea", "Desert"];

function buildFeed(liveReels, catFilter) {
  const all = liveReels.map(r => ({ ...r, _rank: 2000 + (r.likes || 0) * 0.01 + (Date.now() - (r.createdAt?.toMillis?.() || 0)) * -0.000001 }));
  const seen = new Set();
  const deduped = all.filter(r => { if (seen.has(r.id)) return false; seen.add(r.id); return true; });
  const filtered = catFilter === "All" ? deduped : deduped.filter(r => r.category === catFilter || r.cat === catFilter);
  return filtered.sort((a, b) => b._rank - a._rank);
}

export default function Reels() {
  const [, navigate] = useLocation();
  const { user, profile, adminMode, isSuperAdmin } = useAuth();
  const { likedReels, likeReel, following, followUser, unfollowUser, trackReelView } = useSocial();

  const [liveReels, setLiveReels] = useState([]);
  const [feed, setFeed] = useState([]);
  const [catFilter, setCatFilter] = useState("All");
  const [activeIdx, setActiveIdx] = useState(0);
  const [muted, setMuted] = useState(true);
  const [commentsReel, setCommentsReel] = useState(null);
  const [uploadOpen, setUploadOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
  const [heartAnims, setHeartAnims] = useState({});
  const [savedReels, setSavedReels] = useState(() => {
    try { return JSON.parse(localStorage.getItem("ax_saved_reels") || "{}"); } catch { return {}; }
  });

  const [liveLikes, setLiveLikes] = useState({});
  const [authorProfiles, setAuthorProfiles] = useState({});
  const [failedMedia, setFailedMedia] = useState({});
  const scrollRef = useRef(null);
  const videoRefs = useRef({});
  const observerRef = useRef(null);
  const lastTapRef = useRef({});
  const viewedAdsRef = useRef(new Set());
    useEffect(() => {
    const handleJump = (e) => {
      const targetId = e.detail;
      if (!targetId || !feed.length) return;
      const idx = feed.findIndex((r) => (r.id || r._id) === targetId);
      if (idx !== -1) {
        setActiveIdx(idx);
        const container = scrollRef.current;
        if (container) {
          container.scrollTo({
            top: idx * window.innerHeight,
            behavior: "smooth",
          });
        }
      }
    };

    window.addEventListener("jump-reel", handleJump);
    return () => window.removeEventListener("jump-reel", handleJump);
  }, [feed]);

  useEffect(() => {
    const q = query(collection(db, "reels"), orderBy("createdAt", "desc"), limit(100));
    const adsQ = query(
      collection(db, "advertisements"),
      where("status", "in", ["active", "approved"])
    );

    let reels = [];
    let ads = [];
    const merge = () => {
      const usableAds = ads.filter((ad) => /^https?:\/\//.test(resolveMediaUrl(ad.adVideoUrl || ad.videoUrl) || ""));
      const merged = [];
      let adIdx = 0;
      reels.forEach((reel, index) => {
        merged.push(reel);
        if ((index + 1) % 15 === 0 && usableAds[adIdx]) {
          merged.push(usableAds[adIdx]);
          adIdx = (adIdx + 1) % usableAds.length;
        }
      });
      setLiveReels(merged.length > 0 ? merged : usableAds);
    };
    const unsubReels = onSnapshot(q, (snap) => {
      reels = snap.docs
        .map((d) => ({ id: d.id, ...d.data(), type: "live" }))
        .filter((reel) => /^https?:\/\//.test(resolveMediaUrl(reel.videoUrl) || ""));
      merge();
    }, () => setLiveReels([]));
    const unsubAds = onSnapshot(adsQ, (snap) => {
      ads = snap.docs.map((d) => ({ id: d.id, ...d.data(), isAd: true, type: "ad" }));
      merge();
    }, () => merge());

    return () => {
      unsubReels();
      unsubAds();
    };
  }, []);

  useEffect(() => {
    const userIds = [...new Set(liveReels.map((reel) => reel.userId).filter(Boolean))];
    const unsubscribers = userIds.map((uid) => onSnapshot(
      doc(db, "users", uid),
      (snap) => {
        if (!snap.exists()) return;
        setAuthorProfiles((prev) => ({ ...prev, [uid]: snap.data() }));
      },
      () => {},
    ));
    return () => unsubscribers.forEach((unsubscribe) => unsubscribe());
  }, [liveReels]);

  useEffect(() => {
    setFeed(buildFeed(liveReels, catFilter).map((reel) => {
      const author = authorProfiles[reel.userId];
      if (!author) return reel;
      return {
        ...reel,
        username: author.username || author.name || reel.username,
        userAvatar: author.photo || author.avatar || reel.userAvatar,
        userVerified: !!(author.manualVerified || author.verified || author.isVerified),
      };
    }));
        // Like ya liveReels update hone par scroll top reset nahi hoga
  }, [liveReels, catFilter, authorProfiles]);

  useEffect(() => {
    if (!scrollRef.current || feed.length === 0) return;
    observerRef.current?.disconnect();

    const obs = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.6) {
          const idx = Number(entry.target.dataset.idx);
          setActiveIdx(idx);
          const reel = feed[idx];
                  if (reel?.id) {
          trackReelView(reel.id);

          // Agar Ad reel hai, toh Real View +1 karega
          if ((reel.isAd || reel.type === "ad") && !viewedAdsRef.current.has(reel.id)) {
            viewedAdsRef.current.add(reel.id);
            handleRealAdView(reel.id);
          }
        }

          Object.entries(videoRefs.current).forEach(([vi, el]) => {
            if (!el) return;
            if (Number(vi) === idx) {
              el.muted = muted;
              el.play().catch(() => {});
            } else {
              el.pause();
            }
          });
        }
      });
    }, { threshold: 0.6, root: scrollRef.current });

    const slides = scrollRef.current.querySelectorAll("[data-idx]");
    slides.forEach(s => obs.observe(s));
    observerRef.current = obs;

    return () => obs.disconnect();
  }, [feed.length, muted]);

  const triggerHeart = useCallback((id) => {
    setHeartAnims(h => ({ ...h, [id]: true }));
    setTimeout(() => setHeartAnims(h => ({ ...h, [id]: false })), 800);
  }, []);
  // Ad Link Click Counter Function
const handleAdClick = async (adId) => {
  if (!adId) return;
  try {
    const adRef = doc(db, "advertisements", adId);
    await updateDoc(adRef, {
      clicksCount: increment(1)
    });
  } catch (err) {
    console.error("Ad click error:", err);
  }
};
  // Real User View Track Handler
const handleRealAdView = async (adId) => {
  if (!adId) return;
  try {
    const adRef = doc(db, "advertisements", adId);
    await updateDoc(adRef, {
      viewsCount: increment(1)
    });
  } catch (err) {
    console.error("Ad view update error:", err);
  }
};

    async function handleLike(reel) {
    if (!user) { navigate("/auth"); return; }
    const reelId = reel?.id || reel?._id;
    const currentlyLiked = !!likedReels[reelId];
    if (!currentlyLiked) triggerHeart(reelId);
      
          setLiveLikes(p => ({
      ...p,
      [reelId]: Math.max(0, (p[reelId] ?? reel.likes ?? 0) + (!currentlyLiked ? 1 : -1))
    }));

    // Like count update (Ads aur Normal Reels dono ke liye)
    if (reel.isAd) {
      try {
        const adRef = doc(db, "advertisements", reelId);
        await updateDoc(adRef, {
          likes: currentlyLiked ? increment(-1) : increment(1),
        });
        await likeReel(reelId, reel.likes || 0).catch(() => {});
      } catch (err) {
        console.error("Ad like error:", err);
      }
    } else {
      await likeReel(reelId, reel.likes || 0);
    }

        // Like Notification Trigger (Sender DP + Thumbnail preview)
    if (!currentlyLiked && user) {
      // Pura reel object find karein agar parameter incomplete ho
      const target = (reel && (reel.userId || reel.authorId || reel.creatorId || reel.advertiserId))
        ? reel 
        : (feed?.find(r => (r.id || r._id) === reelId) || liveReels?.find(r => (r.id || r._id) === reelId) || reel);

      const ownerId = target?.userId || target?.authorId || target?.creatorId || target?.advertiserId;

      console.log("📢 Like triggered! Target Owner:", ownerId, "Current User:", user?.uid);

      // Testing ke liye: Agar dusra account nahi hai toh self-like par bhi notification dekhne ke liye "ownerId !== user.uid" ko check karein
                              if (ownerId) {
        (async () => {
          try {
            const avatarRaw = profile?.photoURL || profile?.avatar || profile?.avatarUrl || profile?.profilePic || profile?.image || user?.photoURL || "";
            const finalAvatar = typeof resolveMediaUrl === "function" && avatarRaw ? resolveMediaUrl(avatarRaw) : (avatarRaw || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`);
            
            const finalName = profile?.displayName || profile?.name || profile?.username || user?.displayName || user?.email?.split("@")[0] || "Wildlife Explorer";

            const rawThumb = target?.thumbnailUrl || target?.poster || target?.adVideoUrl || target?.videoUrl || "";
            const finalThumb = typeof resolveMediaUrl === "function" && rawThumb ? resolveMediaUrl(rawThumb) : rawThumb;

            await addDoc(collection(db, "notifications"), {
              recipientId: ownerId,
              senderId: user.uid,
              senderName: finalName,
              senderAvatar: finalAvatar,
              type: "like",
              reelId: reelId,
              reelThumbnail: finalThumb || "",
              isAd: Boolean(target?.isAd),
              read: false,
              createdAt: serverTimestamp(),
            });

            console.log("✅ Like notification saved with Cloudinary avatar:", finalAvatar);
          } catch (e) {
            console.error("❌ Notification send error:", e);
          }
        })();
      }
    }
  }

  function handleDoubleTap(reel, e) {
    const now = Date.now();
    const last = lastTapRef.current[reel.id] || 0;
    if (now - last < 350) {
      if (user && !likedReels[reel.id]) {
        handleLike(reel);
      } else if (!user) {
        triggerHeart(reel.id);
      }
    }
    lastTapRef.current[reel.id] = now;
  }

  function handleSave(reelId) {
    const next = { ...savedReels, [reelId]: !savedReels[reelId] };
    if (!next[reelId]) delete next[reelId];
    setSavedReels(next);
    localStorage.setItem("ax_saved_reels", JSON.stringify(next));
  }

  async function handleShare(reel) {
    const text = `${reel.title} WildSphere Wildlife\n#wildlifeapp`;
    if (navigator.share) {
      try { await navigator.share({ title: reel.title, text, url: window.location.href }); return; } catch {}
    }
    try {
      await navigator.clipboard.writeText(text);
      alert("Link copied!");
    } catch {}
  }

  function handleMediaError(reelId, idx) {
    setFailedMedia((prev) => ({ ...prev, [reelId]: true }));
    window.setTimeout(() => {
      const next = scrollRef.current?.querySelector(`[data-idx="${idx + 1}"]`);
      next?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 120);
  }

      function handleDeleteReel(reelItem) {
    setItemToDelete(reelItem);
  }

  async function confirmDeleteReel() {
    if (!itemToDelete) return;
    const reelItem = itemToDelete;
    setItemToDelete(null);

    const reelId = typeof reelItem === "object" ? reelItem.id : reelItem;
    const isAd = typeof reelItem === "object" && (reelItem.isAd || reelItem.type === "ad");

    try {
      if (isAd) {
        await deleteDoc(doc(db, "advertisements", reelId));
      } else {
        await deleteDoc(doc(db, "reels", reelId));
      }
    } catch (e) {
      console.error("Delete error:", e);
    }
  }

  function handleFollowToggle(targetUserId) {
    if (!user) { navigate("/auth"); return; }
    if (following[targetUserId]) unfollowUser(targetUserId);
    else followUser(targetUserId);
  }

  return (
    <div className="reels-page" style={{ height: "calc(100vh - 65px)", width: "100%", display: "flex", flexDirection: "column", overflow: "hidden", background: "#000", position: "relative" }}>
      <div className="reels-top-bar" style={{ flexShrink: 0, zIndex: 30 }}>
        <span className="reels-top-title">Wildlife Reels</span>
        <div className="reels-top-actions">
          {user && (
            <button className="reels-upload-btn" onClick={() => setUploadOpen(true)}>
              + Upload
            </button>
          )}
        </div>
      </div>

      <div className="reels-cat-bar" style={{ flexShrink: 0, zIndex: 30 }}>
        {CATS.map(c => (
          <button
            key={c}
            className={`reel-cat-pill ${catFilter === c ? "active" : ""}`}
            onClick={() => setCatFilter(c)}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="reels-scroll" ref={scrollRef} style={{ flex: 1, width: "100%", overflowY: "scroll", scrollSnapType: "y mandatory", scrollbarWidth: "none" }}>
        {feed.length === 0 ? (
          <div className="reels-empty">
            <div style={{ fontSize: "4rem" }}>🐾</div>
            <h3>No reels yet</h3>
            <p>Be the first to upload a wildlife reel!</p>
          </div>
        ) : (
          feed.map((reel, idx) => {
            const liked = !!likedReels[reel.id];
            const saved = !!savedReels[reel.id];
            const likes = liveLikes[reel.id] ?? reel.likes ?? 0;
            const isOwn = user?.uid === reel.userId;
            const isAdmin = isSuperAdmin && adminMode;
            const isFollowed = !!following[reel.userId];
            const isActive = idx === activeIdx;
            const avatarUrl = resolveMediaUrl(reel.userAvatar);

            return (
              <div
                key={reel.id}
                className={`reel-item ${isActive ? "active" : ""}`}
                data-idx={idx}
                onClick={(e) => handleDoubleTap(reel, e)}
                style={{ height: "100%", width: "100%", scrollSnapAlign: "start", scrollSnapStop: "always", position: "relative", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}
              >
                <div style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
                  {(() => {
                    const mediaUrl = resolveMediaUrl(reel.isAd ? (reel.adVideoUrl || reel.videoUrl) : reel.videoUrl);
                    const playable = mediaUrl && !failedMedia[reel.id];
                    return playable ? (
                    <video
                      ref={el => { if (el) videoRefs.current[idx] = el; }}
                      className="reel-video"
                      src={mediaUrl}
                      loop
                      playsInline
                      autoPlay={isActive}
                      muted={muted}
                      preload={isActive ? "auto" : "metadata"}
                      onError={() => handleMediaError(reel.id, idx)}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      poster={resolveMediaUrl(reel.thumbnailUrl)}
                    />
                    ) : (
                      <div style={{ width: "100%", height: "100%", background: "#111827", color: "#cbd5e1", display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", padding: 24 }}>
                        <div>{failedMedia[reel.id] ? "This video is unavailable." : "Video unavailable."}</div>
                      </div>
                    );
                  })()}
                </div>

                {heartAnims[reel.id] && <div className="reel-heart-burst">❤️</div>}
                                  <div className="reel-gradient-overlay" />

                        {/* Target Views Pura Hone Tak Hi #AD Tag Aur Button Dikhega */}
      {reel.isAd && (reel.viewsCount || reel.views || 0) < (reel.targetViews || 2000) && (
        <>
          {/* Top #AD Badge */}
          <div style={{
            position: "absolute",
            top: "60px",
            left: "12px",
            background: "#f59e0b",
            color: "#000000",
            padding: "4px 10px",
            borderRadius: "6px",
            fontWeight: "bold",
            fontSize: "12px",
            zIndex: 20
          }}>
            📣 #AD
          </div>

          {/* Bottom Visit Website Button */}
          <div style={{
            position: "absolute",
            bottom: "105px",
            left: "12px",
            right: "70px",
            zIndex: 30
          }}>
            <a
              href={reel.targetUrl || reel.link || reel.website || reel.siteUrl || "https://google.com"}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => {
                e.stopPropagation();
                handleAdClick(reel.id || reel.adId);
              }}
              style={{
                display: "flex",
                alignItems: "center",
                justify: "space-between",
                background: "#16a34a",
                color: "#ffffff",
                padding: "10px 14px",
                borderRadius: "8px",
                fontWeight: "bold",
                fontSize: "13px",
                textDecoration: "none",
                boxShadow: "0 4px 12px rgba(0,0,0,0.6)"
              }}
            >
              <span>🔗 Visit Website / Learn More</span>
              <span>➔</span>
            </a>
          </div>
        </>
      )}

                <div className="reel-overlay-bottom">
                  <div className="reel-creator-row">
                    <Link href={`/user/${reel.userId}`} onClick={e => e.stopPropagation()}>
                      <div className="reel-avatar">
                        {avatarUrl
                          ? <img src={avatarUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }} />
                          : (reel.username?.[0]?.toUpperCase() || "W")}
                      </div>
                    </Link>
                    <div className="reel-creator-info">
                      <Link href={`/user/${reel.userId}`} onClick={e => e.stopPropagation()} className="reel-username-link">
                        @{reel.username || reel.userDisplayName || user?.displayName || "wildlifeuser"}
                        {reel.userVerified && <BlueTick size={14} />}
                      </Link>
                    </div>
                    {!isOwn && (
                      <button
                        className={`reel-follow-btn ${isFollowed ? "following" : ""}`}
                        onClick={e => { e.stopPropagation(); handleFollowToggle(reel.userId); }}
                      >
                        {isFollowed ? "Following" : "+ Follow"}
                      </button>
                    )}
                  </div>

                  <div className="reel-title">{reel.title}</div>
                  {reel.desc && (
                    <div className="reel-desc">
                      {reel.desc.length > 80 ? reel.desc.slice(0, 80) + "..." : reel.desc}
                    </div>
                  )}

                  {reel.hashtags && (
                    <div className="reel-hashtags">
                      {String(reel.hashtags).split(/[s,]+/).filter(Boolean).slice(0, 4).map(h => (
                        <span key={h} className="reel-hashtag">
                          {h.startsWith("#") ? h : "#" + h}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="reel-meta-row">
                    <span>👁️ {fmt(reel.views || 0)}</span>
                    <span>🔄 {fmt(reel.shares || 0)}</span>
                    {reel.location && <span>📍 {reel.location}</span>}
                    <span className="reel-cat-badge">{reel.category || reel.cat}</span>
                  </div>
                </div>

                <div className="reel-actions-right">
                  <div className="reel-action-col">
                    <button className={`reel-action-btn like-btn ${liked ? "liked" : ""}`} onClick={e => { e.stopPropagation(); handleLike(reel); }}>
                      <span className="reel-action-icon">{liked ? "❤️" : "🤍"}</span>
                      <span className="reel-action-count">{fmt(likes)}</span>
                    </button>

                    <button className="reel-action-btn" onClick={e => { e.stopPropagation(); setCommentsReel(reel); }}>
                      <span className="reel-action-icon">💬</span>
                      <span className="reel-action-count">{fmt(reel.comments || 0)}</span>
                    </button>

                    <button className="reel-action-btn" onClick={e => { e.stopPropagation(); handleShare(reel); }}>
                      <span className="reel-action-icon">✈️</span>
                      <span className="reel-action-count">{fmt(reel.shares || 0)}</span>
                    </button>

                    <button className={`reel-action-btn ${saved ? "saved" : ""}`} onClick={e => { e.stopPropagation(); handleSave(reel.id); }}>
                      <span className="reel-action-icon">{saved ? "🔖" : "📑"}</span>
                      <span className="reel-action-count">Save</span>
                    </button>

                    {resolveMediaUrl(reel.isAd ? (reel.adVideoUrl || reel.videoUrl) : reel.videoUrl) && (
                      <button className="reel-action-btn" onClick={e => { e.stopPropagation(); setMuted(m => !m); }}>
                        <span className="reel-action-icon">{muted ? "🔇" : "🔊"}</span>
                        <span className="reel-action-count">{muted ? "Muted" : "Sound"}</span>
                      </button>
                    )}

                    {(isOwn || isAdmin) && (
                      <button className="reel-action-btn danger-btn" onClick={e => { e.stopPropagation(); handleDeleteReel(reel); }}>
                        <span className="reel-action-icon">🗑️</span>
                        <span className="reel-action-count">Delete</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {commentsReel && (
        <CommentsPanel reel={commentsReel} onClose={() => setCommentsReel(null)} />
                          )}

          {itemToDelete && (
            <div style={{
              position: "fixed",
              inset: 0,
              zIndex: 9999,
              background: "rgba(0,0,0,0.65)",
              backdropFilter: "blur(4px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "16px"
            }}>
              <div style={{
                background: "#262626",
                borderRadius: "16px",
                width: "100%",
                maxWidth: "280px",
                textAlign: "center",
                overflow: "hidden",
                boxShadow: "0 10px 25px rgba(0,0,0,0.5)",
                border: "1px solid rgba(255,255,255,0.08)"
              }}>
                <div style={{ padding: "22px 16px 18px" }}>
                  <div style={{ fontSize: "17px", fontWeight: "700", color: "#fff", marginBottom: "6px" }}>
                    {itemToDelete.type === "ad" ? "Delete Ad?" : "Delete Reel?"}
                  </div>
                  <div style={{ fontSize: "13px", color: "#a8a8a8", lineHeight: "1.4" }}>
                    Are you sure you want to delete this? This action cannot be undone.
                  </div>
                </div>
                <div style={{ borderTop: "1px solid rgba(255,255,255,0.12)" }}>
                  <button
                    onClick={confirmDeleteReel}
                    style={{
                      width: "100%",
                      padding: "14px 0",
                      background: "transparent",
                      border: "none",
                      borderBottom: "1px solid rgba(255,255,255,0.12)",
                      color: "#ed4956",
                      fontWeight: "700",
                      fontSize: "14px",
                      cursor: "pointer"
                    }}
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => setItemToDelete(null)}
                    style={{
                      width: "100%",
                      padding: "14px 0",
                      background: "transparent",
                      border: "none",
                      color: "#fff",
                      fontSize: "14px",
                      cursor: "pointer"
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {uploadOpen && (
        <UploadReel onClose={() => setUploadOpen(false)} onUploaded={() => setUploadOpen(false)} />
      )}
    </div>
  );
}
