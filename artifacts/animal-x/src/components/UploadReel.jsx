import { useState, useRef } from "react";
import { collection, addDoc, serverTimestamp, doc, setDoc, increment } from "firebase/firestore";
import { db } from "../utils/firebase";
import { useAuth } from "../context/AuthContext";
import { moderateContent } from "../utils/moderation";

const CATEGORIES = ["Mammals","Birds","Aquatic","Reptiles","Small Creatures","Trees","Mountains","Sea","Desert"];

const WILDLIFE_KEYWORDS = [
  "animal","lion","tiger","elephant","eagle","wolf","dolphin","whale","shark","cheetah",
  "gorilla","panda","penguin","crocodile","leopard","orca","falcon","bear","fox","lynx",
  "wildlife","nature","wild","jungle","forest","ocean","reptile","bird","marine","safari",
  "savanna","arctic","mountain","desert","rainforest","conservation","habitat","species",
];

function checkModeration(title, desc, hashtags) {
  const text = `${title} ${desc} ${hashtags}`.toLowerCase();
  return WILDLIFE_KEYWORDS.some(w => text.includes(w));
}

async function getStrikeInfo(uid) {
  try {
    const { getDoc } = await import("firebase/firestore");
    const snap = await getDoc(doc(db, "userStrikes", uid));
    return snap.exists() ? snap.data() : { strikes: 0, banned: false };
  } catch { return { strikes: 0, banned: false }; }
}

async function addStrike(uid) {
  try {
    const ref = doc(db, "userStrikes", uid);
    const { getDoc, updateDoc, setDoc: setDocFn } = await import("firebase/firestore");
    const snap = await getDoc(ref);
    const data = snap.exists() ? snap.data() : { strikes: 0 };
    const newStrikes = (data.strikes || 0) + 1;
    const banned = newStrikes >= 3;
    const banExpiry = banned ? Date.now() + 30 * 24 * 60 * 60 * 1000 : null;
    await setDocFn(ref, { strikes: newStrikes, banned, banExpiry, lastStrike: Date.now() }, { merge: true });
    return { strikes: newStrikes, banned };
  } catch { return { strikes: 1, banned: false }; }
}

export default function UploadReel({ onClose, onUploaded }) {
  const { user, profile } = useAuth();
  const [step, setStep] = useState(1); // 1=details, 2=video, 3=review
  const [form, setForm] = useState({
    title: "", description: "", hashtags: "", category: "Mammals", location: "",
  });
  const [videoFile, setVideoFile] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [warning, setWarning] = useState(null);
  const [banned, setBanned] = useState(false);
  const videoInputRef = useRef(null);
  const thumbInputRef = useRef(null);

  function handleField(key, val) {
    setForm(f => ({ ...f, [key]: val }));
  }

  function handleVideoFile(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 200 * 1024 * 1024) { setError("Video must be under 200 MB."); return; }
    if (!f.type.startsWith("video/")) { setError("Please select a video file."); return; }
    setVideoFile(f);
    setVideoPreview(URL.createObjectURL(f));
    setError(null);
  }

  async function uploadToStorage(file, contentType) {
    const res = await fetch("/api/storage/uploads/request-url", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: file.name, size: file.size, contentType }),
    });
    if (!res.ok) throw new Error("Failed to get upload URL");
    const { uploadURL, objectPath } = await res.json();
    const uploadRes = await fetch(uploadURL, {
      method: "PUT",
      headers: { "Content-Type": contentType },
      body: file,
    });
    if (!uploadRes.ok) throw new Error("Upload failed");
    return objectPath;
  }

  async function handleNext() {
    if (step === 1) {
      if (!form.title.trim()) { setError("Please enter a title."); return; }
      const isWildlife = checkModeration(form.title, form.description, form.hashtags);
      if (!isWildlife) {
        setWarning("⚠️ Content Warning: Your title/description doesn't appear to contain wildlife content. Animal X only allows wildlife, nature, and animal-related reels. Please revise or you may receive a strike.");
        return;
      }
      setWarning(null);
      setStep(2);
    } else if (step === 2) {
      if (!videoFile) { setError("Please select a video."); return; }
      setStep(3);
    }
  }

  async function handleSubmit() {
    if (!user) { alert("Please login first."); return; }
    setUploading(true);
    setError(null);
    setProgress(10);
    try {
      const strikeInfo = await getStrikeInfo(user.uid);
      if (strikeInfo.banned && strikeInfo.banExpiry > Date.now()) {
        const days = Math.ceil((strikeInfo.banExpiry - Date.now()) / 86400000);
        setBanned(true);
        setError(`Your upload access is banned for ${days} more day(s) due to community guideline violations.`);
        setUploading(false);
        return;
      }

      let videoUrl = null;
      let thumbnailUrl = null;

      setProgress(20);
      videoUrl = await uploadToStorage(videoFile, videoFile.type);
      setProgress(70);

      if (thumbnailFile) {
        thumbnailUrl = await uploadToStorage(thumbnailFile, thumbnailFile.type);
      }
      setProgress(85);

      const reelData = {
        title: form.title.trim(),
        desc: form.description.trim(),
        hashtags: form.hashtags.trim(),
        category: form.category,
        location: form.location.trim() || null,
        videoUrl,
        thumbnailUrl: thumbnailUrl || null,
        userId: user.uid,
        username: profile?.username || user.name || user.email?.split("@")[0],
        userVerified: profile?.manualVerified || false,
        userAvatar: profile?.avatar || null,
        likes: 0,
        views: 0,
        comments: 0,
        shares: 0,
        createdAt: serverTimestamp(),
        type: "live",
        moderated: true,
      };

      await addDoc(collection(db, "reels"), reelData);
      await setDoc(doc(db, "users", user.uid), { reels: increment(1) }, { merge: true });
      setProgress(100);
      onUploaded?.();
    } catch (e) {
      setError("Upload failed: " + e.message);
    }
    setUploading(false);
  }

  return (
    <div className="upload-modal-backdrop" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="upload-modal">
        <div className="upload-modal-header">
          <div className="upload-modal-steps">
            {[1, 2, 3].map(s => (
              <div key={s} className={`upload-step ${step === s ? "active" : step > s ? "done" : ""}`}>{s}</div>
            ))}
          </div>
          <div className="upload-modal-title">
            {step === 1 ? "📝 Reel Details" : step === 2 ? "🎬 Upload Video" : "✅ Review & Post"}
          </div>
          <button className="upload-modal-close" onClick={onClose}>✕</button>
        </div>

        {banned && (
          <div className="upload-banned-msg">
            🚫 Upload access banned. Please contact support.
          </div>
        )}

        {error && <div className="upload-error">{error}</div>}
        {warning && (
          <div className="upload-warning">
            {warning}
            <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
              <button className="upload-warning-revise" onClick={() => setWarning(null)}>✏️ Revise</button>
              <button className="upload-warning-proceed" onClick={async () => {
                const { strikes } = await addStrike(user.uid);
                setWarning(null);
                if (strikes >= 3) { setBanned(true); setError("Upload access banned due to repeat violations."); }
                else { alert(`⚠️ Strike ${strikes}/3 added. ${3 - strikes} violation(s) remaining before 30-day ban.`); }
              }}>Post Anyway (Risk Strike)</button>
            </div>
          </div>
        )}

        {!warning && !banned && (
          <>
            {step === 1 && (
              <div className="upload-form">
                <label className="upload-label">Title *</label>
                <input
                  className="upload-input"
                  value={form.title}
                  onChange={e => handleField("title", e.target.value)}
                  placeholder="e.g. Lion Pride at Dusk 🦁"
                  maxLength={100}
                />
                <label className="upload-label">Description</label>
                <textarea
                  className="upload-textarea"
                  value={form.description}
                  onChange={e => handleField("description", e.target.value)}
                  placeholder="Describe your wildlife footage…"
                  maxLength={500}
                  rows={3}
                />
                <label className="upload-label">Hashtags</label>
                <input
                  className="upload-input"
                  value={form.hashtags}
                  onChange={e => handleField("hashtags", e.target.value)}
                  placeholder="#wildlife #lion #nature"
                />
                <label className="upload-label">Category</label>
                <select
                  className="upload-select"
                  value={form.category}
                  onChange={e => handleField("category", e.target.value)}
                >
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
                <label className="upload-label">Location (optional)</label>
                <input
                  className="upload-input"
                  value={form.location}
                  onChange={e => handleField("location", e.target.value)}
                  placeholder="e.g. Maasai Mara, Kenya"
                />
                <div className="upload-moderation-note">
                  🤖 AI Moderation: Only wildlife, nature & animal content allowed.
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="upload-video-step">
                <div
                  className="upload-drop-zone"
                  onClick={() => videoInputRef.current?.click()}
                >
                  {videoPreview ? (
                    <video src={videoPreview} className="upload-preview-video" muted playsInline />
                  ) : (
                    <>
                      <div style={{ fontSize: "4rem" }}>🎬</div>
                      <div className="upload-drop-text">Tap to select video</div>
                      <div className="upload-drop-hint">MP4, MOV, WebM · Max 200 MB</div>
                    </>
                  )}
                </div>
                <input
                  ref={videoInputRef}
                  type="file"
                  accept="video/*"
                  style={{ display: "none" }}
                  onChange={handleVideoFile}
                />
                {videoFile && (
                  <div className="upload-file-info">
                    ✅ {videoFile.name} ({(videoFile.size / 1024 / 1024).toFixed(1)} MB)
                  </div>
                )}
                <div className="upload-thumb-row">
                  <label className="upload-label">Custom Thumbnail (optional)</label>
                  <button className="upload-thumb-btn" onClick={() => thumbInputRef.current?.click()}>
                    {thumbnailFile ? "✅ " + thumbnailFile.name : "📷 Choose thumbnail"}
                  </button>
                  <input
                    ref={thumbInputRef}
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={e => setThumbnailFile(e.target.files?.[0] || null)}
                  />
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="upload-review-step">
                <div className="upload-review-card">
                  <div className="upload-review-emoji">🎬</div>
                  <div className="upload-review-details">
                    <div className="upload-review-title">{form.title}</div>
                    <div className="upload-review-cat">{form.category}{form.location ? " · " + form.location : ""}</div>
                    {form.hashtags && <div className="upload-review-tags">{form.hashtags}</div>}
                    <div className="upload-review-file">{videoFile?.name}</div>
                  </div>
                </div>
                <div className="upload-guidelines">
                  <div className="upload-guidelines-title">📋 Community Guidelines</div>
                  <ul>
                    <li>✅ Wildlife, nature, animals, oceans, forests</li>
                    <li>❌ No unrelated content (gets rejected + strike)</li>
                    <li>❌ No violence, abuse, or harmful content</li>
                    <li>3 strikes = 30-day upload ban</li>
                  </ul>
                </div>
                {uploading && (
                  <div className="upload-progress-wrap">
                    <div className="upload-progress-bar" style={{ width: `${progress}%` }} />
                    <div className="upload-progress-text">Uploading… {progress}%</div>
                  </div>
                )}
              </div>
            )}

            <div className="upload-modal-footer">
              {step > 1 && !uploading && (
                <button className="upload-back-btn" onClick={() => setStep(s => s - 1)}>← Back</button>
              )}
              {step < 3 ? (
                <button className="upload-next-btn" onClick={handleNext}>
                  {step === 2 ? "Review →" : "Next →"}
                </button>
              ) : (
                <button
                  className="upload-post-btn"
                  onClick={handleSubmit}
                  disabled={uploading}
                >
                  {uploading ? "Posting…" : "🚀 Post Reel"}
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
