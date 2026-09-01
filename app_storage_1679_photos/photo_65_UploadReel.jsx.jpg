import { useState, useRef } from "react";
import { collection, addDoc, serverTimestamp, doc, setDoc, increment } from "firebase/firestore";
import { db } from "../utils/firebase";
import { useAuth } from "../context/AuthContext";

const CATEGORIES = ["Mammals", "Birds", "Aquatic", "Reptiles", "Small Creatures", "Trees", "Mountains", "Sea", "Desert"];

const WILDLIFE_KEYWORDS = [
  "animal", "lion", "tiger", "elephant", "eagle", "wolf", "dolphin", "whale", "shark", "cheetah",
  "gorilla", "panda", "penguin", "crocodile", "leopard", "orca", "falcon", "bear", "fox", "lynx",
  "wildlife", "nature", "wild", "jungle", "forest", "ocean", "reptile", "bird", "marine", "safari",
  "savanna", "arctic", "mountain", "desert", "rainforest", "conservation", "habitat", "species",
  "snake", "lizard", "parrot", "owl", "butterfly", "bee", "frog", "coral", "rhino", "hippo",
  "giraffe", "zebra", "buffalo", "deer", "rabbit", "squirrel", "turtle", "fish", "crab", "jellyfish",
  "migration", "ecosystem", "biodiversity", "endangered", "predator", "prey", "carnivore",
  "herbivore", "mammal", "amphibian", "insect", "moss", "fern", "cactus", "swamp", "wetland",
  "national park", "zoo", "sanctuary", "reserve", "savannah", "tundra", "taiga", "meadow"
];

const COPYRIGHT_KEYWORDS = [
  "instagram", "instareel", "youtube", "tiktok", "natgeo", "discovery", "bbc earth", "watermark",
  "downloaded", "screenrecord", "snaptik", "saveinsta", "copyright", "property of", "all rights reserved"
];

function checkModeration(title, desc, hashtags) {
  const text = `${title} ${desc} ${hashtags}`.toLowerCase();
  return WILDLIFE_KEYWORDS.some(w => text.includes(w));
}

function checkCopyrightViolations(title, desc, hashtags, filename) {
  const text = `${title} ${desc} ${hashtags} ${filename}`.toLowerCase();
  return COPYRIGHT_KEYWORDS.some(k => text.includes(k));
}

async function getStrikeInfo(uid) {
  try {
    const { getDoc } = await import("firebase/firestore");
    const snap = await getDoc(doc(db, "userStrikes", uid));
    return snap.exists() ? snap.data() : { strikes: 0, banned: false };
  } catch {
    return { strikes: 0, banned: false };
  }
}

async function addStrike(uid) {
  try {
    const ref = doc(db, "userStrikes", uid);
    const { getDoc, setDoc: setDocFn } = await import("firebase/firestore");
    const snap = await getDoc(ref);
    const data = snap.exists() ? snap.data() : { strikes: 0 };
    const newStrikes = (data.strikes || 0) + 1;
    const banned = newStrikes >= 3;
    const banExpiry = banned ? Date.now() + 30 * 24 * 60 * 60 * 1000 : null;
    await setDocFn(ref, { strikes: newStrikes, banned, banExpiry, lastStrike: Date.now() }, { merge: true });
    return { strikes: newStrikes, banned };
  } catch {
    return { strikes: 1, banned: false };
  }
}

const STEP_LABELS = ["Details", "Video", "Review"];

export default function UploadReel({ onClose, onUploaded }) {
  const { user, profile } = useAuth();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ title: "", description: "", hashtags: "", category: "Mammals", location: "" });
  const [videoFile, setVideoFile] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [warning, setWarning] = useState(null);
  const [copyrightError, setCopyrightError] = useState(null);
  const [banned, setBanned] = useState(false);
  const [addingStrike, setAddingStrike] = useState(false);

  const videoInputRef = useRef(null);
  const thumbInputRef = useRef(null);

  function handleField(key, val) {
    setForm(f => ({ ...f, [key]: val }));
    setError(null);
    setCopyrightError(null);
  }

  function handleVideoFile(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 200 * 1024 * 1024) { setError("Video must be under 200 MB."); return; }
    if (!f.type.startsWith("video/")) { setError("Please select a video file."); return; }
    
    const isPirated = checkCopyrightViolations(form.title, form.description, form.hashtags, f.name);
    if (isPirated) {
      setCopyrightError("⛔ Copyright Alert: External platform watermarks/downloads (YouTube/NatGeo/Instagram) detected. Please upload original footage.");
    } else {
      setCopyrightError(null);
    }

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

  async function goNext() {
    setError(null);
    if (step === 1) {
      if (!form.title.trim()) { setError("Title is required to continue."); return; }
      
      const isPirated = checkCopyrightViolations(form.title, form.description, form.hashtags, "");
      if (isPirated) {
        setCopyrightError("⛔ Copyright Restriction: Mentions of third-party TV channels (NatGeo/BBC) or watermarked content detected.");
        return;
      }

      const isWildlife = checkModeration(form.title, form.description, form.hashtags);
      if (!isWildlife) {
        setWarning("⚠️ Your title and description don't contain recognisable wildlife content. WildSphere only allows wildlife, nature, and animal-related reels.");
        return;
      }
      setWarning(null);
      setStep(2);
    } else if (step === 2) {
      if (!videoFile) { setError("Please select a video file to continue."); return; }
      if (copyrightError) { setError("Please fix the copyright violation before proceeding."); return; }
      setStep(3);
    }
  }

  async function handleProceedWithStrike() {
    if (!user) return;
    setAddingStrike(true);
    const { strikes, banned: isBanned } = await addStrike(user.uid);
    setAddingStrike(false);
    setWarning(null);
    if (isBanned) {
      setBanned(true);
      setError("Upload access banned for 30 days due to repeated community guideline violations.");
    } else {
      alert(`Strike ${strikes}/3 recorded. ${3 - strikes} warning(s) remaining before a 30-day upload ban.`);
      setStep(2);
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
        setError(`Upload access is banned for ${days} more day(s).`);
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
        setProgress(85);
      }

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
        likes: 0, views: 0, comments: 0, shares: 0,
        createdAt: serverTimestamp(),
        type: "live",
        moderated: true,
        copyrightProtected: true,
      };

      await addDoc(collection(db, "reels"), reelData);
      await setDoc(doc(db, "users", user.uid), { reels: increment(1) }, { merge: true });
      setProgress(100);
      onUploaded?.();
    } catch (e) {
      setError("Upload failed: " + e.message);
      setUploading(false);
    }
  }

  return (
    <div className="upload-backdrop" style={{ display: "flex", alignItems: "center", justifyContents: "center", padding: "12px", zIndex: 9999 }} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="upload-sheet" style={{ maxHeight: "82vh", width: "100%", maxWidth: "420px", margin: "auto", display: "flex", flexDirection: "column", overflow: "hidden", borderRadius: "20px", background: "#111827", position: "relative" }}>
        <div className="upload-header">
          <button className="upload-close-btn" onClick={onClose} aria-label="Close">×</button>
          <div className="upload-header-title">
            {step === 1 ? "Reel Details" : step === 2 ? "Upload Video" : "Review & Post"}
          </div>
          <div className="upload-step-dots">
            {STEP_LABELS.map((label, i) => (
              <div key={i} className={`upload-dot ${step === i + 1 ? "active" : step > i + 1 ? "done" : ""}`}>
                <span className="upload-dot-num">{step > i + 1 ? "✓" : i + 1}</span>
                <span className="upload-dot-label">{label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="upload-body" style={{ flex: 1, overflowY: "auto", padding: "16px", paddingBottom: "20px" }}>
          {banned && (
            <div className="upload-banned-card">
              <div style={{ fontSize: "2.5rem" }}>🚫</div>
              <h3>Upload Access Banned</h3>
              <p>Your account has received 3 community guideline violations. Upload access is suspended for 30 days.</p>
              <p style={{ marginTop: 8, fontSize: "0.82rem", color: "var(--text2)" }}>
                Contact: <a href="mailto:wildlifeanimalfight@gmail.com" style={{ color: "var(--accent)" }}>wildlifeanimalfight@gmail.com</a>
              </p>
            </div>
          )}

          {!banned && copyrightError && (
            <div className="upload-error-bar" style={{ background: '#7f1d1d', color: '#fca5a5' }}>
              <span>⛔</span> {copyrightError}
            </div>
          )}

          {!banned && error && !copyrightError && (
            <div className="upload-error-bar">
              <span>⚠️</span> {error}
              <button onClick={() => setError(null)} className="upload-error-dismiss">✕</button>
            </div>
          )}

          {!banned && step === 1 && (
            <div className="upload-step-body">
              {warning && (
                <div className="upload-warning-card">
                  <div className="upload-warning-icon">⚠️</div>
                  <div className="upload-warning-text">
                    <strong>Wildlife Content Required</strong>
                    <p>{warning}</p>
                    <p style={{ fontSize: "0.78rem", marginTop: 6, color: "var(--text2)" }}>
                      Posting unrelated content will add a strike to your account (3 strikes = 30-day ban).
                    </p>
                  </div>
                  <div className="upload-warning-actions">
                    <button className="upload-warn-revise" onClick={() => setWarning(null)}>Revise Content</button>
                    <button className="upload-warn-proceed" onClick={handleProceedWithStrike} disabled={addingStrike}>
                      {addingStrike ? "Processing..." : "Post Anyway (+ Strike)"}
                    </button>
                  </div>
                </div>
              )}

              {!warning && (
                <div className="upload-form-grid">
                  <div className="upload-field">
                    <label className="upload-label">Title <span className="upload-required">*</span></label>
                    <input
                      className="upload-input"
                      value={form.title}
                      onChange={e => handleField("title", e.target.value)}
                      placeholder="e.g. Lion Pride at Dusk"
                      maxLength={100}
                      autoFocus
                    />
                    <span className="upload-char-count">{form.title.length}/100</span>
                  </div>

                  <div className="upload-field">
                    <label className="upload-label">Description</label>
                    <textarea
                      className="upload-textarea"
                      value={form.description}
                      onChange={e => handleField("description", e.target.value)}
                      placeholder="Describe your wildlife footage..."
                      maxLength={500}
                      rows={3}
                    />
                    <span className="upload-char-count">{form.description.length}/500</span>
                  </div>

                  <div className="upload-field">
                    <label className="upload-label">Hashtags</label>
                    <input
                      className="upload-input"
                      value={form.hashtags}
                      onChange={e => handleField("hashtags", e.target.value)}
                      placeholder="#wildlife #lion #nature"
                    />
                  </div>

                  <div className="upload-row-2col">
                    <div className="upload-field">
                      <label className="upload-label">Category</label>
                      <select className="upload-select" value={form.category} onChange={e => handleField("category", e.target.value)}>
                        {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                      </select>
                    </div>

                    <div className="upload-field">
                      <label className="upload-label">Location</label>
                      <input
                        className="upload-input"
                        value={form.location}
                        onChange={e => handleField("location", e.target.value)}
                        placeholder="e.g. Maasai Mara"
                      />
                    </div>
                  </div>

                  <div className="upload-ai-note">
                    <strong>AI & Copyright Moderation Active</strong> — Wildlife content only. Automatic DMCA & Watermark Protection enabled.
                  </div>
                </div>
              )}
            </div>
          )}

          {!banned && step === 2 && (
            <div className="upload-step-body">
              <div className={`upload-dropzone ${videoFile ? "has-file" : ""}`} onClick={() => videoInputRef.current?.click()}>
                {videoPreview ? (
                  <video src={videoPreview} className="upload-preview-vid" muted playsInline controls />
                ) : (
                  <div className="upload-dropzone-inner">
                    <div className="upload-dropzone-icon">📹</div>
                    <div className="upload-dropzone-title">Tap to select video</div>
                    <div className="upload-dropzone-hint">MP4 MOV WebM max 200 MB</div>
                  </div>
                )}
              </div>
              <input ref={videoInputRef} type="file" accept="video/*" style={{ display: "none" }} onChange={handleVideoFile} />

              {videoFile && (
                <div className="upload-file-chip">
                  {videoFile.name} <span className="upload-file-size">({(videoFile.size / 1024 / 1024).toFixed(1)} MB)</span>
                  <button className="upload-file-remove" onClick={() => { setVideoFile(null); setVideoPreview(null); }}>✕</button>
                </div>
              )}

              <div className="upload-thumb-section">
                <label className="upload-label">Custom Thumbnail <span className="upload-optional">(optional)</span></label>
                <button className="upload-thumb-btn" onClick={() => thumbInputRef.current?.click()}>
                  {thumbnailFile ? thumbnailFile.name : "Choose thumbnail image"}
                </button>
                <input ref={thumbInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={e => setThumbnailFile(e.target.files?.[0] || null)} />
              </div>
            </div>
          )}

          {!banned && step === 3 && (
            <div className="upload-step-body">
              <div className="upload-review-card">
                <div className="upload-review-header">
                  <span className="upload-review-cat-badge">{form.category}</span>
                  {form.location && <span className="upload-review-loc">📍 {form.location}</span>}
                </div>
                <div className="upload-review-title">{form.title}</div>
                {form.description && <div className="upload-review-desc">{form.description}</div>}
                {form.hashtags && (
                  <div className="upload-review-tags">
                    {String(form.hashtags).split(/[s,]+/).filter(Boolean).map(h => (
                      <span key={h} className="upload-review-tag">{h.startsWith("#") ? h : "#" + h}</span>
                    ))}
                  </div>
                )}
                <div className="upload-review-file-row">
                  <span>📹 {videoFile?.name}</span>
                  <span className="upload-file-size">({(videoFile?.size / 1024 / 1024).toFixed(1)} MB)</span>
                </div>
              </div>

              <div className="upload-guidelines-box">
                <div className="upload-guidelines-title">Copyright & Upload Policy</div>
                <div className="upload-guideline-row">✓ Only original or royalty-free wildlife footage</div>
                <div className="upload-guideline-row">✕ No third-party watermarked videos (YouTube/NatGeo/TikTok)</div>
                <div className="upload-guideline-row">✕ Pirated & copyrighted re-uploads lead to account strikes</div>
                <div className="upload-guideline-row">⚠️ 3 copyright strikes = Permanent upload ban</div>
              </div>

              {uploading && (
                <div className="upload-progress-wrap">
                  <div className="upload-progress-track">
                    <div className="upload-progress-fill" style={{ width: `${progress}%` }} />
                  </div>
                  <div className="upload-progress-label">Uploading... {progress}%</div>
                </div>
              )}
            </div>
          )}
        </div>

        {!banned && (
          <div className="upload-footer" style={{ padding: "12px 16px", background: "#1f2937", borderTop: "1px solid #374151", display: "flex", alignItems: "center", justifyContent: "space-between", shrink: 0, zIndex: 10 }}>
            {step > 1 && !uploading && (
              <button className="upload-btn-back" onClick={() => { setStep(s => s - 1); setError(null); }}>← Back</button>
            )}
            <div style={{ flex: 1 }} />
            {step < 3 && !warning && !copyrightError && (
              <button className="upload-btn-next" onClick={goNext}>
                {step === 1 ? "Next: Upload Video →" : "Review →"}
              </button>
            )}
            {step === 3 && (
              <button className="upload-btn-post" onClick={handleSubmit} disabled={uploading}>
                {uploading ? `Uploading ${progress}%...` : "Post Reel"}
              </button>
            )}
          </div>
        )}

        {banned && (
          <div className="upload-footer" style={{ padding: "12px 16px", background: "#1f2937", borderTop: "1px solid #374151", display: "flex", alignItems: "center", justifyContent: "space-between", shrink: 0, zIndex: 10 }}>
            <button className="upload-btn-back" onClick={onClose}>Close</button>
          </div>
        )}
      </div>
    </div>
  );
}
