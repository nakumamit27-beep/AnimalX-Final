import { doc, deleteDoc } from "firebase/firestore";
import { db } from "./firebase";

export async function deleteReelOrStory(collectionName, docId, publicId) {
  try {
    if (publicId) {
      const cloudName = "x1ekanir";
      const apiKey = "735145446791451";

      const formData = new FormData();
      formData.append("public_id", publicId);
      formData.append("api_key", apiKey);

      await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`, {
        method: "POST",
        body: formData,
      });

      await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/video/destroy`, {
        method: "POST",
        body: formData,
      });
    }

    await deleteDoc(doc(db, collectionName, docId));
    return { success: true };
  } catch (error) {
    console.error("Delete Error:", error);
    throw error;
  }
}
