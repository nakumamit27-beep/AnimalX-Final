import React, { createContext, useContext, useEffect, useState } from "react";
import { db, rtdb, auth } from '../utils/firebase';
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  setDoc,
  deleteDoc,
  serverTimestamp,
  updateDoc,
  increment
} from 'firebase/firestore';
import { ref, onValue, set as rtdbSet } from "firebase/database";
import { useAuth } from "./AuthContext";

const SocialContext = createContext();

export function SocialProvider({ children }) {
  const { user } = useAuth();
  const [likedReels, setLikedReels] = useState({});
  const [following, setFollowing] = useState({});
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [broadcast, setBroadcast] = useState(null);
  const [onlineCount, setOnlineCount] = useState(1);
  const [liveViews, setLiveViews] = useState({});
  const [liveLikes, setLiveLikes] = useState({});
  const [trending, setTrending] = useState([]);
  const [autoTickPopup, setAutoTickPopup] = useState(false);

  // Load user likes
  useEffect(() => {
    if (!user?.uid) {
      setLikedReels({});
      return;
    }
    const saved = localStorage.getItem(`ax_liked_${user.uid}`);
    if (saved) {
      try {
        setLikedReels(JSON.parse(saved));
      } catch (e) {}
    }

    const unsub = onSnapshot(doc(db, "userLikes", user.uid), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        const likesMap = data.liked || {};
        setLikedReels(likesMap);
        localStorage.setItem(`ax_liked_${user.uid}`, JSON.stringify(likesMap));
      }
    }, () => {});

    return () => unsub();
  }, [user?.uid]);

    // Load following list in real-time
    useEffect(() => {
    if (!user?.uid) {
      setFollowing({});
      return;
    }

    const q = query(collection(db, "followers"), where("followerUserId", "==", user.uid));
    const unsub = onSnapshot(q, (snap) => {
      const map = {};
      snap.docs.forEach((d) => {
        const data = d.data();
        if (data.targetUserId) {
          map[data.targetUserId] = true;
        }
      });
      setFollowing(map);
    }, (err) => console.error("Followers listener error:", err));

    return () => unsub();
  }, [user?.uid]);

  // RTDB Live Views
  useEffect(() => {
    if (!rtdb) return;
    const viewRef = ref(rtdb, "live-views");
    const unsub = onValue(viewRef, (snapshot) => {
      if (snapshot.exists()) {
        setLiveViews(snapshot.val() || {});
      }
    }, () => {});
    return () => unsub();
  }, []);

  // RTDB Live Likes
  useEffect(() => {
    if (!rtdb) return;
    const likesRef = ref(rtdb, "live-likes");
    const unsub = onValue(likesRef, (snapshot) => {
      if (snapshot.exists()) {
        setLiveLikes(snapshot.val() || {});
      }
    }, () => {});
    return () => unsub();
  }, []);

  // RTDB Online Presence
  useEffect(() => {
    if (!rtdb) return;
    const onlineRef = ref(rtdb, "online-count");
    const unsub = onValue(onlineRef, (snapshot) => {
      if (snapshot.exists()) {
        setOnlineCount(snapshot.val() || 1);
      }
    }, () => {});
    return () => unsub();
  }, []);

  // Notifications Listener
  useEffect(() => {
    if (!user?.uid) return;
    const q = query(
      collection(db, "notifications"),
      where("recipientId", "==", user.uid)
    );
    const unsub = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      setNotifications(list);
      setUnreadCount(list.filter((n) => !n.read).length);
    }, () => {});
    return () => unsub();
  }, [user?.uid]);

    // Har session me reel aur ad sirf 1 baar count hogi
  const viewedItemsSet = useState(() => new Set())[0];

      const trackReelView = async (reelId, authorId = null) => {
    if (!reelId) return;

    // 1. Agar user apni hi reel dekh raha hai, toh view count na badhayein
    if (user?.uid && authorId && user.uid === authorId) return;

    // 2. Persistent storage check (1 user / browser = 1 view per reel)
    const storageKey = `viewed_reel_${reelId}`;
    if (localStorage.getItem(storageKey)) {
      return;
    }

    // Mark as viewed in browser storage
    localStorage.setItem(storageKey, "true");

    try {
      let viewerCountry = "Global";
      try {
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
        if (tz.includes("Calcutta") || tz.includes("Kolkata")) viewerCountry = "India";
        else if (tz.includes("New_York") || tz.includes("Los_Angeles") || tz.includes("Chicago")) viewerCountry = "United States";
        else if (tz.includes("London")) viewerCountry = "United Kingdom";
        else if (tz.includes("Dubai")) viewerCountry = "UAE";
        else if (tz.includes("Toronto")) viewerCountry = "Canada";
        else if (tz.includes("Berlin") || tz.includes("Paris")) viewerCountry = "Europe";
        else if (tz.includes("Tokyo")) viewerCountry = "Japan";
        else if (tz.includes("/")) viewerCountry = tz.split("/")[1]?.replace(/_/g, " ") || tz.split("/")[0];
      } catch (_) {}

      const reelRef = doc(db, "reels", reelId);
      await updateDoc(reelRef, {
        views: increment(1),
        [`countryViews.${viewerCountry}`]: increment(1)
      });

      if (rtdb) {
        const viewRef = ref(rtdb, `live-views/${reelId}`);
        rtdbSet(viewRef, (liveViews?.[reelId] || 0) + 1).catch(() => {});
      }
    } catch (err) {
      console.error("Firestore view update error:", err);
    }
  };

  const trackAdView = async (adId) => {
    if (!adId || viewedItemsSet.has(`ad_${adId}`)) return;
    viewedItemsSet.add(`ad_${adId}`);

    try {
      const adRef = doc(db, "advertisements", adId);
      await updateDoc(adRef, {
        viewsCount: increment(1)
      });
    } catch (err) {
      console.error("Ad view update error:", err);
    }
  };

  const likeReelLive = (reelId) => {
    if (!rtdb || !reelId) return;
    const countRef = ref(rtdb, `live-likes/${reelId}`);
    rtdbSet(countRef, (liveLikes[reelId] || 0) + 1).catch(() => {});
  };

  async function likeReel(reelId) {
    if (!user?.uid || !reelId) return;
    const uid = user.uid;
    
    // Strict true/false check
    const alreadyLiked = Boolean(likedReels[reelId]);
    const nextState = !alreadyLiked;

    // 1. Local state update
    setLikedReels((prev) => {
      const next = { ...prev };
      if (nextState) {
        next[reelId] = true;
      } else {
        delete next[reelId];
      }
      localStorage.setItem(`ax_liked_${uid}`, JSON.stringify(next));
      return next;
    });

    try {
      // 2. User specific like document
      await setDoc(
        doc(db, "userLikes", uid),
        { liked: { [reelId]: nextState ? true : null } },
        { merge: true }
      );

      // 3. Reels main document count (+1 on like, -1 on unlike)
      await updateDoc(doc(db, "reels", reelId), {
        likes: increment(nextState ? 1 : -1)
      });
    } catch (err) {
      console.error("Like update error:", err);
    }
  }

    const followUser = async (targetUserId, targetUsername = '') => {
    if (!user?.uid || !targetUserId || user.uid === targetUserId) return;

    const pairId = `${user.uid}_${targetUserId}`;

    // Instant UI update
    setFollowing(prev => ({ ...prev, [targetUserId]: true }));

    try {
      await setDoc(doc(db, "followers", pairId), {
        followerUserId: user.uid,
        targetUserId: targetUserId,
        createdAt: serverTimestamp()
      });

      try {
        await setDoc(doc(db, "userFollowing", user.uid, "targets", targetUserId), {
          targetUserId,
          targetUsername,
          createdAt: serverTimestamp()
        });
        await setDoc(doc(db, "userFollowers", targetUserId, "targets", user.uid), {
          followerUserId: user.uid,
          createdAt: serverTimestamp()
        });
      } catch (_) {}
    } catch (err) {
      console.error("Follow error:", err);
      setFollowing(prev => {
        const next = { ...prev };
        delete next[targetUserId];
        return next;
      });
    }
  };

  const unfollowUser = async (targetUserId) => {
    if (!user?.uid || !targetUserId) return;

    const pairId = `${user.uid}_${targetUserId}`;

    // Instant UI update
    setFollowing(prev => {
      const next = { ...prev };
      delete next[targetUserId];
      return next;
    });

    try {
      await deleteDoc(doc(db, "followers", pairId));

      try {
        await deleteDoc(doc(db, "userFollowing", user.uid, "targets", targetUserId));
        await deleteDoc(doc(db, "userFollowers", targetUserId, "targets", user.uid));
      } catch (_) {}
    } catch (err) {
      console.error("Unfollow error:", err);
      setFollowing(prev => ({ ...prev, [targetUserId]: true }));
    }
  };

  const markAllRead = async () => {
    setUnreadCount(0);
  };

  const dismissBroadcast = () => setBroadcast(null);
  const sendBroadcast = (msg) => setBroadcast(msg);
  const submitAd = () => {};
  const dismissAutoTickPopup = () => setAutoTickPopup(false);

  return (
    <SocialContext.Provider
              value={{
          likedReels,
          likeReel,
          following,
          followUser,
          unfollowUser,
          notifications,
          unreadCount,
          markAllRead,
          broadcast,
          dismissBroadcast,
          sendBroadcast,
          submitAd,
          onlineCount,
          liveViews,
          liveLikes,
          trending,
          trackReelView,
          trackAdView,
          likeReelLive,
          autoTickPopup,
          dismissAutoTickPopup,
        }}
    >
      {children}
    </SocialContext.Provider>
  );
}

export function useSocial() {
  return useContext(SocialContext);
}
