import { useState, useEffect, useRef } from "react";
import {
  collection, query, orderBy, limit, onSnapshot,
  addDoc, serverTimestamp, deleteDoc, doc, updateDoc, increment,
} from "firebase/firestore";
import { db } from "../utils/firebase";
import { useAuth } from "../context/AuthContext";
import BlueTick from "./BlueTick";

function fmt(n) {
  if (!n) return "0";
  if (n >= 1000) return (n / 1000).toFixed(1) + "K";
  return String(n);
}

export default function CommentsPanel({ reel, onClose, onCommentAdded }) {
  const { user, profile, isSuperAdmin, adminMode } = useAuth();
  const [comments, setComments]   = useState([]);
  const [text, setText]           = useState("");
  const [submitting, setSubmitting] = useState(false);
  const panelRef  = useRef(null);
  const inputRef  = useRef(null);
  const bottomRef = useRef(null);

  // Live comments subscription
  useEffect(() => {
    if (!reel?.id) return;
        const colName = (reel?.isAd || reel?.type === "ad") ? "advertisements" : "reels";
    const q = query(
      collection(db, colName, reel.id, "comments"),
      orderBy("createdAt", "asc"),
      limit(100),
    );
    const unsub = onSnapshot(
      q,
      (snap) => {
        setComments(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 80);
      },
      () => setComments([]),
    );
    return unsub;
  }, [reel?.id]);

  // Escape key to close
  useEffect(() => {
    function onKey(e) { if (e.key === "Escape") onClose(); }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Auto-focus input
  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 150);
  }, []);

      async function handleSubmit(e) {
    e?.preventDefault();
    if (!user) {
      alert("Please login to comment.");
      return;
    }
    const t = text.trim();
    if (!t || submitting || !reel?.id) return;

    setSubmitting(true);
    try {
      // 1. Comments subcollection me document create
          // 1. Dynamic active username nikal kar comment create karein
        const activeUsername = 
      profile?.name || 
      profile?.displayName || 
      user?.name || 
      profile?.username || 
      user?.displayName || 
      user?.email?.split("@")[0] || 
      "User";

          const targetCol = (reel?.isAd || reel?.type === "ad") ? "advertisements" : "reels";
      await addDoc(collection(db, targetCol, reel.id, "comments"), {
        text: t,
        userId: user.uid,
        username: activeUsername,
        userAvatar: profile?.photoURL || profile?.avatar || user?.photoURL || null,
        userVerified: Boolean(profile?.manualVerified || profile?.isVerified),
        createdAt: serverTimestamp(),
      });

      // Counter +1
      await updateDoc(doc(db, targetCol, reel.id), {
        comments: increment(1),
        commentsCount: increment(1),
      });
                  // Real Instagram-style Comment Notification
      const reelOwnerId = reel?.userId || reel?.authorId || reel?.creatorId;
      if (reelOwnerId && user && reelOwnerId !== user.uid) {
        const commenterAvatar =
          profile?.photoURL ||
          profile?.avatar ||
          user?.photoURL ||
          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100";

        addDoc(collection(db, "notifications"), {
          recipientId: reelOwnerId,
          senderId: user.uid,
          senderName: activeUsername || "Wildlife Explorer",
          senderAvatar: commenterAvatar,
          type: "comment",
          text: `commented: "${t.slice(0, 35)}"`,
          reelId: reel.id,
          reelThumbnail: reel.thumbnailUrl || reel.videoUrl || reel.poster || "",
          read: false,
          createdAt: serverTimestamp(),
        }).catch((err) => console.warn("Comment notif error:", err));
      }

          try {
      onCommentAdded?.();
    } catch (e) {
      console.warn("Parent comment callback skipped:", e);
    }
    } catch (err) {
      console.error("Comment post error:", err);
      alert("Comment failed: " + (err.message || "Unknown error"));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(commentId) {
    try {
            const delCol = (reel?.isAd || reel?.type === "ad") ? "advertisements" : "reels";
      await deleteDoc(doc(db, delCol, reel.id, "comments", commentId));
      await updateDoc(doc(db, delCol, reel.id), { comments: increment(-1) }).catch(() => {});
    } catch {}
  }

  function timeAgo(ts) {
    if (!ts?.toDate) return "just now"; // serverTimestamp pending
    const diff = (Date.now() - ts.toDate().getTime()) / 1000;
    if (diff < 10)    return "just now";
    if (diff < 60)    return Math.floor(diff) + "s";
    if (diff < 3600)  return Math.floor(diff / 60) + "m";
    if (diff < 86400) return Math.floor(diff / 3600) + "h";
    return Math.floor(diff / 86400) + "d";
  }

  return (
    <div
      className="comments-backdrop"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="comments-panel" ref={panelRef}>
        {/* Header */}
        <div className="comments-header">
          <span className="comments-title">💬 Comments ({comments.length})</span>
          <button className="comments-close" onClick={onClose}>✕</button>
        </div>

        {/* Reel preview */}
        <div className="comments-reel-preview">
          <div className="crp-emoji">{reel.emoji || "🐾"}</div>
          <div className="crp-info">
            <div className="crp-title">{reel.title}</div>
            <div className="crp-author">@{reel.username}</div>
          </div>
        </div>

        {/* Comments list */}
        <div className="comments-list">
          {comments.length === 0 ? (
            <div className="comments-empty">
              <div style={{ fontSize: "2.5rem" }}>💬</div>
              <p>No comments yet. Be the first!</p>
            </div>
          ) : (
            comments.map((c) => (
              <div key={c.id} className="comment-item">
                <div className="comment-avatar">
                  {c.username?.[0]?.toUpperCase() || "🐾"}
                </div>
                          <div className="comment-body">
            <div className="comment-username flex items-center gap-1 font-semibold text-white">
              @{c.username || "user"}
              {c.userVerified && <BlueTick size={12} />}
              <span className="comment-time text-xs text-neutral-400 font-normal ml-2">
                {timeAgo(c.createdAt)}
              </span>
            </div>
                  <div className="comment-text">{c.text}</div>
                </div>
                {(user?.uid === c.userId || (isSuperAdmin && adminMode)) && (
                  <button
                    className="comment-delete"
                    onClick={() => handleDelete(c.id)}
                    title="Delete comment"
                  >🗑️</button>
                )}
              </div>
            ))
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <form className="comment-input-row" onSubmit={handleSubmit}>
          <input
            ref={inputRef}
            className="comment-input"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={user ? "Add a comment…" : "Login to comment…"}
            maxLength={300}
            disabled={!user || submitting}
            onClick={(e) => e.stopPropagation()}
          />
          <button
            className="comment-submit"
            type="submit"
            disabled={!text.trim() || submitting || !user}
          >
            {submitting ? "…" : "Post"}
          </button>
        </form>
      </div>
    </div>
  );
}
