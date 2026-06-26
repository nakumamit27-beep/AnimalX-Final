import { useState, useEffect, useRef } from "react";
import {
  collection, query, orderBy, limit, onSnapshot,
  addDoc, serverTimestamp, deleteDoc, doc
} from "firebase/firestore";
import { db } from "../utils/firebase";
import { useAuth } from "../context/AuthContext";
import BlueTick from "./BlueTick";

function fmt(n) {
  if (!n) return "0";
  if (n >= 1000) return (n / 1000).toFixed(1) + "K";
  return String(n);
}

export default function CommentsPanel({ reel, onClose }) {
  const { user, profile, isSuperAdmin, adminMode } = useAuth();
  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const panelRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!reel?.id) return;
    const q = query(
      collection(db, "reels", reel.id, "comments"),
      orderBy("createdAt", "asc"),
      limit(100)
    );
    const unsub = onSnapshot(q, snap => {
      setComments(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }, () => setComments([]));
    return unsub;
  }, [reel?.id]);

  useEffect(() => {
    function onKey(e) { if (e.key === "Escape") onClose(); }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!user) { alert("Please login to comment."); return; }
    const t = text.trim();
    if (!t) return;
    setSubmitting(true);
    try {
      await addDoc(collection(db, "reels", reel.id, "comments"), {
        text: t,
        userId: user.uid,
        username: profile?.username || user.name || user.email?.split("@")[0],
        userVerified: profile?.manualVerified || false,
        createdAt: serverTimestamp(),
      });
      setText("");
    } catch {}
    setSubmitting(false);
  }

  async function handleDelete(commentId) {
    try { await deleteDoc(doc(db, "reels", reel.id, "comments", commentId)); } catch {}
  }

  function timeAgo(ts) {
    if (!ts?.toDate) return "";
    const diff = (Date.now() - ts.toDate().getTime()) / 1000;
    if (diff < 60) return "just now";
    if (diff < 3600) return Math.floor(diff / 60) + "m";
    if (diff < 86400) return Math.floor(diff / 3600) + "h";
    return Math.floor(diff / 86400) + "d";
  }

  return (
    <div className="comments-backdrop" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="comments-panel" ref={panelRef}>
        <div className="comments-header">
          <span className="comments-title">💬 Comments ({comments.length})</span>
          <button className="comments-close" onClick={onClose}>✕</button>
        </div>

        <div className="comments-reel-preview">
          <div className="crp-emoji">{reel.emoji || "🐾"}</div>
          <div className="crp-info">
            <div className="crp-title">{reel.title}</div>
            <div className="crp-author">@{reel.username}</div>
          </div>
        </div>

        <div className="comments-list">
          {comments.length === 0 ? (
            <div className="comments-empty">
              <div style={{ fontSize: "2.5rem" }}>💬</div>
              <p>No comments yet. Be the first!</p>
            </div>
          ) : (
            comments.map(c => (
              <div key={c.id} className="comment-item">
                <div className="comment-avatar">
                  {c.username?.[0]?.toUpperCase() || "🐾"}
                </div>
                <div className="comment-body">
                  <div className="comment-username">
                    @{c.username}
                    {c.userVerified && <BlueTick size={12} />}
                    <span className="comment-time">{timeAgo(c.createdAt)}</span>
                  </div>
                  <div className="comment-text">{c.text}</div>
                </div>
                {(user?.uid === c.userId || (isSuperAdmin && adminMode)) && (
                  <button className="comment-delete" onClick={() => handleDelete(c.id)}>🗑️</button>
                )}
              </div>
            ))
          )}
        </div>

        <form className="comment-input-row" onSubmit={handleSubmit}>
          <input
            ref={inputRef}
            className="comment-input"
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder={user ? "Add a comment…" : "Login to comment…"}
            maxLength={300}
            disabled={!user || submitting}
            onClick={e => e.stopPropagation()}
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
