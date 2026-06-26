import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import {
  doc, setDoc, getDoc, collection,
  query, where, onSnapshot, orderBy, limit,
  serverTimestamp, updateDoc, increment, addDoc,
} from "firebase/firestore";
import { ref, onValue, set as rtdbSet, onDisconnect } from "firebase/database";
import { db, rtdb } from "../utils/firebase";
import { reportFirebaseError } from "../components/FirebaseStatusBanner";
import { useAuth } from "./AuthContext";

function silentCatch(err) {
  if (err?.code) reportFirebaseError(err.code, "Firestore");
}

const EMPTY_CTX = {
  likedReels: {}, likeReel: () => Promise.resolve(),
  following: {}, followUser: () => Promise.resolve(), unfollowUser: () => Promise.resolve(),
  notifications: [], unreadCount: 0, markAllRead: () => Promise.resolve(),
  broadcast: null, dismissBroadcast: () => Promise.resolve(),
  sendBroadcast: () => Promise.resolve(), submitAd: () => Promise.resolve(false),
  onlineCount: 0, liveViews: {}, trending: [],
  trackReelView: () => {}, likeReelLive: () => {},
  autoTickPopup: false, dismissAutoTickPopup: () => {},
};
const SocialContext = createContext(EMPTY_CTX);

export function SocialProvider({ children }) {
  const { user, profile, updateProfile } = useAuth();
  const [likedReels, setLikedReels] = useState({});
  const [following, setFollowing] = useState({});
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [broadcast, setBroadcast] = useState(null);
  const [onlineCount, setOnlineCount] = useState(0);
  const [liveViews, setLiveViews] = useState({});
  const [trending, setTrending] = useState([]);
  const [autoTickPopup, setAutoTickPopup] = useState(false);
  const prevFollowers = useRef(0);

  /* Auto blue tick at 100K followers */
  useEffect(() => {
    if (!user?.uid || !profile) return;
    const f = profile.followers || 0;
    if (f >= 100000 && prevFollowers.current < 100000 && !profile.manualVerified && !profile.autoVerifiedAt) {
      updateProfile({ autoVerifiedAt: Date.now(), manualVerified: true }).catch(() => {});
      setAutoTickPopup(true);
    }
    prevFollowers.current = f;
  }, [profile?.followers]);

  function dismissAutoTickPopup() { setAutoTickPopup(false); }

  useEffect(() => {
    if (!user?.uid) {
      setLikedReels({}); setFollowing({}); setNotifications([]); setUnreadCount(0);
      return;
    }
    const cached = {};
    try { Object.assign(cached, JSON.parse(localStorage.getItem(`ax_liked_${user.uid}`) || "{}")); } catch {}
    setLikedReels(cached);

    const followCached = {};
    try { Object.assign(followCached, JSON.parse(localStorage.getItem(`ax_following_${user.uid}`) || "{}")); } catch {}
    setFollowing(followCached);

    loadUserLikes(user.uid);
    loadUserFollowing(user.uid);

    const notifUnsub = onSnapshot(
      query(collection(db, "notifications"), where("targetUid", "==", user.uid), orderBy("createdAt", "desc"), limit(30)),
      (snap) => {
        const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setNotifications(items);
        setUnreadCount(items.filter(n => !n.read).length);
      },
      () => {}
    );
    return notifUnsub;
  }, [user?.uid]);

  useEffect(() => {
    const unsub = onSnapshot(
      query(collection(db, "adminBroadcasts"), where("active", "==", true), limit(1)),
      (snap) => {
        if (!snap.empty) setBroadcast({ id: snap.docs[0].id, ...snap.docs[0].data() });
        else setBroadcast(null);
      },
      () => {}
    );
    return unsub;
  }, []);

  useEffect(() => {
    const onlineRef = ref(rtdb, "online-users");
    const unsub = onValue(onlineRef, (snap) => {
      const data = snap.val() || {};
      setOnlineCount(Object.keys(data).filter(k => data[k] === true).length);
    }, () => {});
    const trendRef = ref(rtdb, "trending");
    const trendUnsub = onValue(trendRef, (snap) => {
      const data = snap.val() || {};
      setTrending(Object.entries(data).map(([id, v]) => ({ id, ...v })).sort((a, b) => (b.score||0)-(a.score||0)).slice(0,10));
    }, () => {});
    const viewsRef = ref(rtdb, "live-views");
    const viewsUnsub = onValue(viewsRef, (snap) => { setLiveViews(snap.val() || {}); }, () => {});
    return () => { unsub(); trendUnsub(); viewsUnsub(); };
  }, []);

  useEffect(() => {
    if (!user?.uid) return;
    const userOnlineRef = ref(rtdb, `online-users/${user.uid}`);
    rtdbSet(userOnlineRef, true).catch(() => {});
    onDisconnect(userOnlineRef).set(null);
    return () => { rtdbSet(userOnlineRef, null).catch(() => {}); };
  }, [user?.uid]);

  function trackReelView(reelId) {
    if (!reelId || !user?.uid) return;
    if (reelId.startsWith("ff") || reelId.startsWith("dr") || reelId.startsWith("du") || reelId.startsWith("fu")) return;
    const viewRef = ref(rtdb, `live-views/${reelId}`);
    rtdbSet(viewRef, (liveViews[reelId] || 0) + 1).catch(() => {});
    const trendRef = ref(rtdb, `trending/${reelId}/score`);
    rtdbSet(trendRef, ((trending.find(t => t.id === reelId)?.score) || 0) + 1).catch(() => {});
  }

  function likeReelLive(reelId) {
    if (!reelId || !user?.uid) return;
    const likeRef = ref(rtdb, `live-likes/${reelId}`);
    rtdbSet(likeRef, Date.now()).catch(() => {});
  }

  async function loadUserLikes(uid) {
    try {
      const snap = await getDoc(doc(db, "userLikes", uid));
      if (snap.exists()) {
        const liked = snap.data().liked || {};
        setLikedReels(liked);
        localStorage.setItem(`ax_liked_${uid}`, JSON.stringify(liked));
      }
    } catch {}
  }

  async function loadUserFollowing(uid) {
    try {
      const snap = await getDoc(doc(db, "userFollowing", uid));
      if (snap.exists()) {
        const f = snap.data().following || {};
        setFollowing(f);
        localStorage.setItem(`ax_following_${uid}`, JSON.stringify(f));
      }
    } catch {}
  }

  async function likeReel(reelId) {
    if (!user?.uid) return;
    const uid = user.uid;
    const isLiked = !!likedReels[reelId];
    setLikedReels(prev => {
      const next = { ...prev };
      if (isLiked) delete next[reelId]; else next[reelId] = true;
      localStorage.setItem(`ax_liked_${uid}`, JSON.stringify(next));
      return next;
    });
    try {
      await setDoc(doc(db, "userLikes", uid), { liked: { [reelId]: isLiked ? null : true } }, { merge: true });
      await setDoc(doc(db, "reelMeta", reelId), { likesCount: increment(isLiked ? -1 : 1) }, { merge: true });
    } catch {}
  }

  async function followUser(targetId, targetName) {
    if (!user?.uid || targetId === user.uid) return;
    const uid = user.uid;
    setFollowing(prev => {
      const next = { ...prev, [targetId]: true };
      localStorage.setItem(`ax_following_${uid}`, JSON.stringify(next));
      return next;
    });
    try {
      await setDoc(doc(db, "userFollowing", uid), { following: { [targetId]: true } }, { merge: true });
      await setDoc(doc(db, "userFollowers", targetId), { followers: { [uid]: true } }, { merge: true });
      await addDoc(collection(db, "notifications"), {
        targetUid: targetId, actorUid: uid,
        actorName: user.name || user.email, type: "follow",
        message: `@${user.name || user.email} started following you`,
        read: false, createdAt: serverTimestamp(),
      });
    } catch {}
  }

  async function unfollowUser(targetId) {
    if (!user?.uid) return;
    const uid = user.uid;
    setFollowing(prev => {
      const next = { ...prev }; delete next[targetId];
      localStorage.setItem(`ax_following_${uid}`, JSON.stringify(next));
      return next;
    });
    try {
      await setDoc(doc(db, "userFollowing", uid), { following: { [targetId]: null } }, { merge: true });
      await setDoc(doc(db, "userFollowers", targetId), { followers: { [uid]: null } }, { merge: true });
    } catch {}
  }

  async function markAllRead() {
    if (!user?.uid || notifications.length === 0) return;
    setUnreadCount(0);
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    for (const n of notifications.filter(n => !n.read)) {
      try { await updateDoc(doc(db, "notifications", n.id), { read: true }); } catch {}
    }
  }

  async function sendBroadcast(message) {
    try {
      await addDoc(collection(db, "adminBroadcasts"), { message, active: true, createdAt: serverTimestamp() });
    } catch {}
  }

  async function dismissBroadcast(id) {
    try { await updateDoc(doc(db, "adminBroadcasts", id), { active: false }); } catch {}
    setBroadcast(null);
  }

  async function submitAd(adData) {
    if (!user?.uid) return false;
    try {
      await addDoc(collection(db, "advertisements"), {
        ...adData, userId: user.uid, userName: user.name || user.email,
        status: "pending", viewsCount: 0, createdAt: serverTimestamp(),
      });
      return true;
    } catch { return false; }
  }

  return (
    <SocialContext.Provider value={{
      likedReels, likeReel,
      following, followUser, unfollowUser,
      notifications, unreadCount, markAllRead,
      broadcast, dismissBroadcast, sendBroadcast, submitAd,
      onlineCount, liveViews, trending, trackReelView, likeReelLive,
      autoTickPopup, dismissAutoTickPopup,
    }}>
      {children}
    </SocialContext.Provider>
  );
}

export function useSocial() { return useContext(SocialContext); }
