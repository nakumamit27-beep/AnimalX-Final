import { useState, useRef } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../utils/firebase";
import { useAuth } from "../context/AuthContext";

export default function UploadStory({ onClose, onUploaded }) {
  const { user, profile } = useAuth();
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [caption, setCaption] = useState("");
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  function handleFile(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 100 * 1024 * 1024) { setError("File must be under 100 MB."); return; }
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setError(null);
  }

  const isVideo = file?.type.startsWith("video/");
  const isImage = file?.type.startsWith("image/");

  async function handlePost() {
    if (!user) { alert("Please login first."); return; }
    if (!file) { setError("Please select a photo or video."); return; }
    setUploading(true);
    setError(null);
    setProgress(10);

    try {
      // Upload to Object Storage
      const res = await fetch("/api/storage/uploads/request-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: `story_${user.uid}_${Date.now()}`, size: file.size, contentType: file.type }),
      });
      if (!res.ok) throw new Error("Could not get upload URL");
      const { uploadURL, objectPath } = await res.json();
      setProgress(30);

      await fetch(uploadURL, { method: "PUT", headers: { "Content-Type": file.type }, body: file });
      setProgress(80);

      const displayName = profile?.name || profile?.username || user.name || user.email?.split("@")[0] || "user";
      const expiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

      await addDoc(collection(db, "stories"), {
        userId: user.uid,
        username: displayName,
        userVerified: profile?.manualVerified || false,
        userPhoto: profile?.photo || null,
        mediaUrl: objectPath,
        mediaType: isVideo ? "video" : "image",
        caption: caption.trim() || null,
        createdAt: serverTimestamp(),
        expiresAt,
        viewerIds: [],
        viewCount: 0,
      });

      setProgress(100);
      onUploaded?.();
    } catch (e) {
      setError("Upload failed: " + e.message);
      setUploading(false);
    }
  }

  return (
    <div className="upload-backdrop" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="upload-sheet" style={{ maxWidth: 420 }}>
        <div className="upload-header">
          <button className="upload-close-btn" onClick={onClose}>✕</button>
          <div className="upload-header-title">📸 Add Story</div>
          <div style={{ fontSize: "0.78rem", color: "var(--text2)", textAlign: "center" }}>
            Stories expire after 24 hours
          </div>
        </div>

        <div className="upload-body">
          {error && (
            <div className="upload-error-bar">⚠️ {error}
              <button onClick={() => setError(null)} className="upload-error-dismiss">✕</button>
            </div>
          )}

          {/* Media preview / dropzone */}
          <div
            className={`upload-dropzone story-dropzone ${file ? "has-file" : ""}`}
            onClick={() => fileInputRef.current?.click()}
          >
            {preview ? (
              isVideo
                ? <video src={preview} className="upload-preview-vid" muted playsInline loop controls />
                : <img src={preview} alt="preview" className="story-preview-img" />
            ) : (
              <div className="upload-dropzone-inner">
                <div className="upload-dropzone-icon">📷</div>
                <div className="upload-dropzone-title">Tap to add photo or video</div>
                <div className="upload-dropzone-hint">Image or Video · max 100 MB · expires in 24h</div>
              </div>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            style={{ display: "none" }}
            onChange={handleFile}
          />

          {file && (
            <div className="upload-file-chip">
              ✅ {file.name}
              <button className="upload-file-remove" onClick={() => { setFile(null); setPreview(null); }}>✕</button>
            </div>
          )}

          {/* Caption */}
          <div className="upload-field" style={{ marginTop: 12 }}>
            <label className="upload-label">Caption (optional)</label>
            <input
              className="upload-input"
              value={caption}
              onChange={e => setCaption(e.target.value)}
              placeholder="Add a caption to your story…"
              maxLength={150}
            />
          </div>

          {/* Progress */}
          {uploading && (
            <div className="upload-progress-wrap" style={{ marginTop: 12 }}>
              <div className="upload-progress-track">
                <div className="upload-progress-fill" style={{ width: `${progress}%` }} />
              </div>
              <div className="upload-progress-label">Uploading… {progress}%</div>
            </div>
          )}
        </div>

        <div className="upload-footer">
          <button className="upload-btn-back" onClick={onClose}>Cancel</button>
          <div style={{ flex: 1 }} />
          <button
            className="upload-btn-post"
            onClick={handlePost}
            disabled={uploading || !file}
          >
            {uploading ? `${progress}%…` : "📸 Share Story"}
          </button>
        </div>
      </div>
    </div>
  );
}
