import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { useAuth } from "../context/AuthContext";
import { db } from "../utils/firebase";
import { resolveMediaUrl } from "../utils/firebaseUpload";
import {
  collection,
  query,
  where,
  limit,
  onSnapshot,
  doc,
  updateDoc,
} from "firebase/firestore";

export default function NotificationBell() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    const q = query(
      collection(db, "notifications"),
      where("recipientId", "in", [user.uid, "all"]),
      limit(25)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));

        list.sort((a, b) => {
          const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : (a.createdAt ? new Date(a.createdAt).getTime() : 0);
          const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : (b.createdAt ? new Date(b.createdAt).getTime() : 0);
          return timeB - timeA;
        });

        setNotifications(list);
        const unread = list.filter((n) => !n.read && n.recipientId !== "all").length;
        setUnreadCount(unread);
      },
      (err) => console.warn("Notification listener error:", err)
    );

    return () => unsubscribe();
  }, [user]);

    const handleItemClick = async (item) => {
    if (!item) return;
    setIsOpen(false);

    if (!item.read && item.recipientId !== "all") {
      try {
        await updateDoc(doc(db, "notifications", item.id), { read: true });
      } catch (_) {}
    }

    if ((item.type === "like" || item.type === "comment") && item.reelId) {
      navigate(`/reels?reelId=${item.reelId}`);
      window.dispatchEvent(new CustomEvent("jump-reel", { detail: item.reelId }));
    } else if (item.type === "follow" && item.senderId) {
      if (user && item.senderId === user.uid) {
        navigate("/profile");
      } else {
        navigate(`/user/${item.senderId}`);
      }
    } else if (item.senderId && item.senderId !== "admin") {
      if (user && item.senderId === user.uid) {
        navigate("/profile");
      } else {
        navigate(`/user/${item.senderId}`);
      }
    }
  };

    const handleProfileClick = (e, senderId) => {
      e.stopPropagation();
      setIsOpen(false);
      if (!senderId || senderId === "admin") return;
      if (user && senderId === user.uid) {
        navigate("/profile");
      } else {
        navigate(`/user/${senderId}`);
      }
    };

  const formatTime = (ts) => {
    if (!ts) return "";
    const date = ts.toDate ? ts.toDate() : new Date(ts);
    const diff = Math.floor((new Date() - date) / 1000);
    if (diff < 60) return `${diff}s`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
    return `${Math.floor(diff / 86400)}d`;
  };

  return (
    <div ref={dropdownRef} style={{ position: "relative", display: "inline-block" }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          background: "transparent",
          border: "none",
          position: "relative",
          cursor: "pointer",
          padding: "6px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#fff",
        }}
      >
        <span style={{ fontSize: "20px" }}>🔔</span>
        {unreadCount > 0 && (
          <span
            style={{
              position: "absolute",
              top: "2px",
              right: "2px",
              background: "#ef4444",
              color: "#fff",
              fontSize: "10px",
              fontWeight: "bold",
              borderRadius: "50%",
              width: "16px",
              height: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "1.5px solid #000",
            }}
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            right: 0,
            width: "320px",
            maxHeight: "400px",
            background: "#121212",
            borderRadius: "16px",
            border: "1px solid rgba(255, 255, 255, 0.12)",
            boxShadow: "0 14px 35px rgba(0,0,0,0.85)",
            overflow: "hidden",
            zIndex: 99999,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              padding: "12px 16px",
              borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              background: "#18181b",
            }}
          >
            <span style={{ fontSize: "14px", fontWeight: "700", color: "#fff" }}>
              Notifications
            </span>
            <span style={{ fontSize: "11px", color: "#9ca3af" }}>
              {notifications.length} recent
            </span>
          </div>

          <div style={{ overflowY: "auto", maxHeight: "340px" }}>
            {notifications.length === 0 ? (
              <div style={{ padding: "32px 16px", textAlign: "center", color: "#71717a", fontSize: "13px" }}>
                Koi notification nahi hai abhi
              </div>
            ) : (
                              notifications.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleItemClick(item)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      padding: "10px 14px",
                      borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
                      background: item.read ? "transparent" : "rgba(56, 189, 248, 0.08)",
                      cursor: "pointer",
                    }}
                  >
                    {/* Sender DP with Icon Badge */}
                    <div
                      onClick={(e) => handleProfileClick(e, item.senderId)}
                      style={{ position: "relative", flexShrink: 0, cursor: "pointer" }}
                    >
                      <img
                        src={
                          item.senderAvatar && item.senderAvatar.startsWith("http")
                            ? item.senderAvatar
                            : `https://api.dicebear.com/7.x/avataaars/svg?seed=${item.senderId || item.senderName || "user"}`
                        }
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${item.senderId || item.senderName || "user"}`;
                        }}
                        alt=""
                        style={{
                          width: "38px",
                          height: "38px",
                          borderRadius: "50%",
                          objectFit: "cover",
                          border: "1px solid rgba(255, 255, 255, 0.2)",
                        }}
                      />
                      <span
                        style={{
                          position: "absolute",
                          bottom: "-2px",
                          right: "-2px",
                          fontSize: "10px",
                          background: "#000",
                          borderRadius: "50%",
                          padding: "2px",
                        }}
                      >
                        {item.type === "like"
                          ? "❤️"
                          : item.type === "comment"
                          ? "💬"
                          : item.type === "follow"
                          ? "👤"
                          : "📢"}
                      </span>
                    </div>

                    {/* Body Text */}
                    <div style={{ flex: 1, minWidth: 0, fontSize: "12px", lineHeight: "1.3", color: "#d4d4d8" }}>
                      <div>
                        <b
                          onClick={(e) => handleProfileClick(e, item.senderId)}
                          style={{ color: "#fff", cursor: "pointer" }}
                        >
                          {item.senderName || "User"}
                        </b>{" "}
                        {item.type === "like" && "liked your reel."}
                        {item.type === "comment" && (item.text || "commented on your reel.")}
                        {item.type === "follow" && "started following you."}
                        {item.type === "broadcast" && (item.message || item.text)}
                      </div>
                      <div style={{ fontSize: "10px", color: "#71717a", marginTop: "2px" }}>
                        {formatTime(item.createdAt)}
                      </div>
                    </div>

                                        {/* Right-Side Thumbnail for Reels */}
                    {(item.type === "like" || item.type === "comment") && (item.reelThumbnail || item.reelUrl) && (
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          handleItemClick(item);
                        }}
                        style={{
                          width: "36px",
                          height: "36px",
                          borderRadius: "6px",
                          overflow: "hidden",
                          flexShrink: 0,
                          background: "#1e1e1e",
                          cursor: "pointer",
                        }}
                      >
                        <img
                          src={
                            typeof resolveMediaUrl === "function"
                              ? resolveMediaUrl(item.reelThumbnail || item.reelUrl)
                              : (item.reelThumbnail || item.reelUrl)
                          }
                          alt="Reel"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                      </div>
                    )}

                    {item.type === "follow" && (
                      <button
                        onClick={(e) => handleProfileClick(e, item.senderId)}
                        style={{
                          background: "#0284c7",
                          color: "#fff",
                          border: "none",
                          borderRadius: "6px",
                          padding: "4px 8px",
                          fontSize: "11px",
                          fontWeight: "600",
                          cursor: "pointer",
                          flexShrink: 0,
                        }}
                      >
                        Profile
                      </button>
                                        )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    );
  }