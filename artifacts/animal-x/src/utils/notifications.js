import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";

// 1. Reel Like hone par call karein
export const triggerLikeNotification = async (currentUser, reelOwnerId, reel) => {
  if (!currentUser || !reelOwnerId || currentUser.uid === reelOwnerId) return;
  try {
    await addDoc(collection(db, "notifications"), {
      recipientId: reelOwnerId,
      senderId: currentUser.uid,
      senderName: currentUser.displayName || currentUser.email?.split("@")[0] || "Wildlife Fan",
      senderAvatar: currentUser.photoURL || "",
      type: "like",
      reelId: reel.id || "",
      reelThumbnail: reel.thumbnailUrl || reel.videoUrl || "",
      read: false,
      createdAt: serverTimestamp(),
    });
  } catch (err) {
    console.warn("Like notification error:", err);
  }
};

// 2. User Follow hone par call karein
export const triggerFollowNotification = async (currentUser, targetUserId) => {
  if (!currentUser || !targetUserId || currentUser.uid === targetUserId) return;
  try {
    await addDoc(collection(db, "notifications"), {
      recipientId: targetUserId,
      senderId: currentUser.uid,
      senderName: currentUser.displayName || currentUser.email?.split("@")[0] || "Explorer",
      senderAvatar: currentUser.photoURL || "",
      type: "follow",
      read: false,
      createdAt: serverTimestamp(),
    });
  } catch (err) {
    console.warn("Follow notification error:", err);
  }
};
