import { useState, useEffect, useRef, useLayoutEffect } from "react";
import { useParams, Link } from "wouter";
import { db } from "../utils/firebase";
import { doc, getDoc } from "firebase/firestore";
import animals from "../data/animals";
import { getAnimalImage, getEmoji, getAnimalEmoji, isPermanentImageUrl } from "../utils/image";
import { getOverride, setOverride } from "../utils/animalOverrides";
import { uploadToCloudinary } from "../utils/cloudinary";
import { getAbility, getDefaultQuiz } from "../utils/animalAbility";
import { useAuth } from "../context/AuthContext";
import "../styles/animal-detail.css";

/* ── IUCN helpers ── */
const IUCN_MAP = [
  { key: "critically endangered", cls: "iucn-cr", code: "CR" },
  { key: "extinct in the wild",   cls: "iucn-ew", code: "EW" },
  { key: "extinct",               cls: "iucn-ex", code: "EX" },
  { key: "endangered",            cls: "iucn-en", code: "EN" },
  { key: "vulnerable",            cls: "iucn-vu", code: "VU" },
  { key: "near threatened",       cls: "iucn-nt", code: "NT" },
  { key: "least concern",         cls: "iucn-lc", code: "LC" },
  { key: "data deficient",        cls: "iucn-dd", code: "DD" },
];
function iucnMeta(status) {
  if (!status) return null;
  const s = status.toLowerCase();
  return IUCN_MAP.find((m) => s.includes(m.key)) || { cls: "iucn-dd", code: "??" };
}

/* ── Behaviour chip colours ── */
const BEHAVIOUR_COLOURS = {
  "Solitary": "chip-blue", "Social": "chip-green", "Nocturnal": "chip-purple",
  "Diurnal": "chip-orange", "Territorial": "chip-red", "Migratory": "chip-blue",
  "Fast hunter": "chip-orange", "Ambush predator": "chip-red",
  "Dangerous": "chip-red", "Usually avoids humans": "chip-green",
  "Can attack if threatened": "chip-orange", "Friendly in captivity": "chip-green",
  "Rare human interaction": "chip-blue",
};
function chipColour(label) {
  return BEHAVIOUR_COLOURS[label] || "chip";
}

/* ── stat value helper ── */
const NA = <span className="na">Not available</span>;
function sv(val) { return val || NA; }

/* ── parse array field (string or array) ── */
function toArray(val) {
  if (!val) return [];
  if (Array.isArray(val)) return val.filter(Boolean);
  return String(val).split(/[,;]\s*/).filter(Boolean);
}

/* ═══════════════════════════════════════════════════
   Main page
═══════════════════════════════════════════════════ */
export default function AnimalDetail() {
  const { id } = useParams();
  const numId = parseInt(id);
  const animal = animals.find((a) => a.id === numId);

  const [imgError, setImgError]         = useState(false);
  const [override, setOverrideState]    = useState({});
  const [tapCount, setTapCount]         = useState(0);
  const tapTimer                        = useRef(null);
  const [adminOpen, setAdminOpen]       = useState(false);
  const [adminTab, setAdminTab]         = useState("photo");
  const { isSuperAdmin, adminMode }     = useAuth();
  const [uploading, setUploading]       = useState(false);
  const [uploadMsg, setUploadMsg]       = useState("");

  /* Extended Firestore data */
  const [details, setDetails]           = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(true);

  /* ── Reset on id change ── */
  useLayoutEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
    setImgError(false);
    setTapCount(0);
    setAdminOpen(false);
    setUploadMsg("");
    setDetails(null);
    setDetailsLoading(true);
    if (animal) setOverrideState(getOverride(animal.id));
  }, [numId]);

  /* ── Fetch extended details ── */
  useEffect(() => {
    if (!animal) { setDetailsLoading(false); return; }
    getDoc(doc(db, "animalDetails", String(numId)))
      .then((snap) => setDetails(snap.exists() ? snap.data() : {}))
      .catch(() => setDetails({}))
      .finally(() => setDetailsLoading(false));
  }, [numId, animal]);

  /* ── Listen for override changes ── */
  useEffect(() => {
    function refresh() {
      if (animal) { setOverrideState(getOverride(animal.id)); setImgError(false); }
    }
    window.addEventListener("ax-overrides-changed", refresh);
    return () => window.removeEventListener("ax-overrides-changed", refresh);
  }, [animal]);

  if (!animal) {
    return (
      <div className="detail-page">
        <div className="not-found">
          <div className="not-found-emoji">🐾</div>
          <h2>Animal not found</h2>
          <Link href="/animals" className="back-btn">← Back to Animals</Link>
        </div>
      </div>
    );
  }

  /* ── Derived values ── */
  const related      = animals.filter((a) => a.category === animal.category && a.id !== animal.id).slice(0, 6);
  const emoji        = getAnimalEmoji(animal.baseName || animal.name, animal.category);
  const overrideImg  = isPermanentImageUrl(override.image) ? override.image : null;
  const imgSrc       = overrideImg || getAnimalImage(animal);
  const ability      = override.ability || getAbility(animal);
  const quiz         = override.quiz || getDefaultQuiz(animal);
  const displayName  = override.name || animal.name;
  const displayDesc  = override.description || animal.description;
  const lifespan     = override.lifespan || details?.lifespan || animal.lifespan;
  const habitat      = details?.habitat || animal.habitat;
  const diet         = details?.diet || animal.diet;

  /* Extended fields from Firestore (all optional) */
  const d = details || {};
  const behaviours     = toArray(d.behaviour);
  const humanBehavs    = toArray(d.humanBehaviour);
  const distribution   = toArray(d.distribution);
  const threats        = toArray(d.threats);
  const funFacts       = toArray(d.funFacts);
  const iucn           = iucnMeta(d.conservationStatus);

  function handleBannerTap() {
    if (!isSuperAdmin || !adminMode) return;
    const next = tapCount + 1;
    setTapCount(next);
    if (tapTimer.current) clearTimeout(tapTimer.current);
    tapTimer.current = setTimeout(() => setTapCount(0), 1500);
    if (next >= 7) { setTapCount(0); setAdminOpen(true); }
  }

  async function handlePhotoFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true); setUploadMsg("Compressing & uploading…");
    try {
       const uploaded = await uploadToCloudinary(file);
       await setOverride(animal.id, {
         image: uploaded.url,
         imagePublicId: uploaded.publicId,
         imageObjectPath: null,
       });
      setOverrideState(getOverride(animal.id));
      setImgError(false);
      setUploadMsg("✅ Photo updated!");
    } catch (err) {
      setUploadMsg("❌ Upload failed: " + err.message);
    } finally {
      setUploading(false);
      e.target.value = "";
      setTimeout(() => setUploadMsg(""), 3000);
    }
  }

  async function deletePhoto() {
    if (!window.confirm("Delete custom photo?")) return;
    await setOverride(animal.id, { image: null, imageObjectPath: null });
    setOverrideState(getOverride(animal.id));
    setImgError(false);
  }

  async function saveField(field, value) {
    await setOverride(animal.id, { [field]: value });
    setOverrideState(getOverride(animal.id));
  }

  return (
    <div className="detail-page">
      <div className="detail-container">
        <Link
          href="/animals"
          className="back-link"
          onClick={() => sessionStorage.setItem("ax_back_from_detail", "1")}
        >
          ← Back to Animals
        </Link>

        {/* ── HERO ── */}
        <div className="detail-hero" onClick={handleBannerTap}>
          {imgError ? (
            <div className="detail-emoji">{emoji}</div>
          ) : (
            <img
              key={`${numId}-${imgSrc}`}
              src={imgSrc}
              alt={animal.name}
              className="detail-img"
              onError={() => setImgError(true)}
            />
          )}
          {isSuperAdmin && adminMode && (
            <div className="detail-edit-actions" onClick={(e) => e.stopPropagation()}>
              <button className="detail-edit-btn" onClick={() => { setAdminOpen(true); setAdminTab("photo"); }}>📷 Change Photo</button>
              <button className="detail-edit-btn" onClick={() => { setAdminOpen(true); setAdminTab("ability"); }}>⚡ Edit Ability</button>
              <button className="detail-edit-btn" onClick={() => { setAdminOpen(true); setAdminTab("quiz"); }}>🧠 Edit Quiz</button>
            </div>
          )}
        </div>

        {/* ── HEADER CARD ── */}
        <div className="detail-header-card">
          <div className="detail-badges">
            <span className="category-badge">{animal.category}</span>
            {d.conservationStatus && iucn && (
              <span className={`iucn-badge ${iucn.cls}`}>
                <span className="iucn-code">{iucn.code}</span>
                {d.conservationStatus}
              </span>
            )}
          </div>

          <h1 className="detail-name">
            <span>{emoji}</span>
            {displayName}
          </h1>

          {d.scientificName ? (
            <div className="detail-scientific">
              <span className="sci-icon">🔬</span>
              <em>{d.scientificName}</em>
            </div>
          ) : !detailsLoading && (
            <div className="detail-scientific">
              <span className="sci-icon">🔬</span>
              <span style={{ fontStyle: "normal", opacity: 0.5, fontSize: ".82rem" }}>Scientific name not available</span>
            </div>
          )}

          {displayDesc && <p className="detail-description">{displayDesc}</p>}
        </div>

        {/* ── QUICK STATS ── */}
        <div className="detail-section">
          <div className="detail-section-title">📊 Quick Stats</div>
          <div className="stats-grid">
            <StatBlock icon="🏠" label="Habitat"    value={habitat} />
            <StatBlock icon="🍽️" label="Diet"       value={diet} />
            <StatBlock icon="⏳" label="Lifespan"   value={lifespan} />
            <StatBlock icon="🌍" label="Region"     value={animal.country || animal.region} />
            <StatBlock icon="⚖️" label="Weight"     value={d.weight} />
            <StatBlock icon="💨" label="Top Speed"  value={d.speed} />
            <StatBlock icon="📏" label="Height"     value={d.height} />
            <StatBlock icon="📐" label="Length"     value={d.length} />
            <StatBlock icon="👥" label="Population" value={d.population} />
          </div>
        </div>

        {/* ── TAXONOMY ── */}
        <div className="detail-section">
          <div className="detail-section-title">🧬 Classification</div>
          <div className="taxonomy-row">
            <TaxonBlock label="Class"  value={d.taxonomicClass} />
            <TaxonBlock label="Order"  value={d.order} />
            <TaxonBlock label="Family" value={d.family} />
          </div>
        </div>

        {/* ── BEHAVIOUR ── */}
        <div className="detail-section">
          <div className="detail-section-title">🐾 Behaviour</div>
          <div style={{ marginBottom: behaviours.length ? 14 : 0 }}>
            <div style={{ fontSize: ".75rem", fontWeight: 600, letterSpacing: ".07em", textTransform: "uppercase", color: "var(--text2)", marginBottom: 8 }}>Animal Behaviour</div>
            <div className="chips-wrap">
              {behaviours.length
                ? behaviours.map((b) => <span key={b} className={`chip ${chipColour(b)}`}>{b}</span>)
                : <span className="chip chip-na">Not available</span>}
            </div>
          </div>
          <div style={{ marginTop: 14 }}>
            <div style={{ fontSize: ".75rem", fontWeight: 600, letterSpacing: ".07em", textTransform: "uppercase", color: "var(--text2)", marginBottom: 8 }}>Around Humans</div>
            <div className="chips-wrap">
              {humanBehavs.length
                ? humanBehavs.map((b) => <span key={b} className={`chip ${chipColour(b)}`}>{b}</span>)
                : <span className="chip chip-na">Not available</span>}
            </div>
          </div>
        </div>

        {/* ── CONSERVATION & THREATS ── */}
        <div className="detail-section">
          <div className="detail-section-title">🛡️ Conservation</div>

          {/* IUCN Red List */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: ".75rem", fontWeight: 600, letterSpacing: ".07em", textTransform: "uppercase", color: "var(--text2)", marginBottom: 8 }}>IUCN Red List Status</div>
            {d.conservationStatus && iucn ? (
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span className={`iucn-badge ${iucn.cls}`} style={{ fontSize: ".9rem", padding: "6px 14px 6px 10px" }}>
                  <span className="iucn-code" style={{ fontSize: ".78rem" }}>{iucn.code}</span>
                  {d.conservationStatus}
                </span>
              </div>
            ) : (
              <span style={{ color: "var(--text2)", fontStyle: "italic", fontSize: ".88rem" }}>Not available</span>
            )}
          </div>

          {/* Threats */}
          <div>
            <div style={{ fontSize: ".75rem", fontWeight: 600, letterSpacing: ".07em", textTransform: "uppercase", color: "var(--text2)", marginBottom: 8 }}>Main Threats</div>
            <div className="chips-wrap">
              {threats.length
                ? threats.map((t) => <span key={t} className="threat-chip">{t}</span>)
                : <span className="chip chip-na">Not available</span>}
            </div>
          </div>
        </div>

        {/* ── DISTRIBUTION ── */}
        <div className="detail-section">
          <div className="detail-section-title">🗺️ Distribution</div>
          <div className="chips-wrap">
            {distribution.length
              ? distribution.map((c) => <span key={c} className="chip chip-blue">🌐 {c}</span>)
              : <span className="chip chip-na">Not available</span>}
          </div>
          {!distribution.length && animal.country && (
            <div className="chips-wrap" style={{ marginTop: 8 }}>
              <span className="chip chip-blue">🌐 {animal.country}</span>
            </div>
          )}
        </div>

        {/* ── FUN FACTS ── */}
        {(funFacts.length > 0 || !detailsLoading) && (
          <div className="detail-section">
            <div className="detail-section-title">💡 Fun Facts</div>
            {funFacts.length > 0 ? (
              <div className="facts-list">
                {funFacts.map((fact, i) => (
                  <div key={i} className="fact-item">
                    <div className="fact-num">{i + 1}</div>
                    <div className="fact-text">{fact}</div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: "var(--text2)", fontStyle: "italic", fontSize: ".88rem" }}>Not available</p>
            )}
          </div>
        )}

        {/* ── AUDIO ── */}
        <div className="detail-section">
          <div className="detail-section-title">🔊 Animal Sound</div>
          {d.soundUrl ? (
            <div className="audio-player-wrap">
              <div className="audio-player-icon">🎵</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="audio-player-label">{displayName} — natural call</div>
                <audio controls src={d.soundUrl} className="audio-player-wrap audio" style={{ display: "block", width: "100%", marginTop: 0, padding: 0, background: "none", border: "none" }}>
                  Your browser does not support audio.
                </audio>
              </div>
            </div>
          ) : (
            <p className="audio-na">No audio recording available for this species yet.</p>
          )}
        </div>

        {/* ── SPECIAL ABILITY ── */}
        <AbilityCard ability={ability} />

        {/* ── QUIZ ── */}
        {quiz && quiz.length > 0 && (
          <QuizSection key={numId} quiz={quiz} animalName={displayName} />
        )}

        {/* ── ADMIN PANEL ── */}
        {adminOpen && isSuperAdmin && adminMode && (
          <AdminAnimalPanel
            animal={animal}
            override={override}
            ability={ability}
            quiz={quiz}
            activeTab={adminTab}
            setActiveTab={setAdminTab}
            uploading={uploading}
            uploadMsg={uploadMsg}
            onPhotoFile={handlePhotoFile}
            onDeletePhoto={deletePhoto}
            onSaveField={saveField}
            onSaveQuiz={(newQuiz) => saveField("quiz", newQuiz)}
            onClose={() => setAdminOpen(false)}
          />
        )}

        {/* ── RELATED ANIMALS ── */}
        {related.length > 0 && (
          <div className="related-section">
            <h3>More {animal.category}s</h3>
            <div className="related-grid">
              {related.map((r) => (
                <Link key={r.id} href={`/animals/${r.id}`} className="related-card">
                  <RelatedImage animal={r} />
                  <span>{r.name}</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Sub-components ── */
function StatBlock({ icon, label, value }) {
  return (
    <div className="stat-block">
      <div className="stat-block-icon">{icon}</div>
      <div className="stat-block-label">{label}</div>
      <div className={`stat-block-value${!value ? " na" : ""}`}>
        {value || "Not available"}
      </div>
    </div>
  );
}

function TaxonBlock({ label, value }) {
  return (
    <div className="taxon-block">
      <div className="taxon-label">{label}</div>
      <div className={`taxon-value${!value ? " na" : ""}`}>
        {value || "Not available"}
      </div>
    </div>
  );
}

function AbilityCard({ ability }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="ability-card" onClick={() => setExpanded((v) => !v)}>
      <div className="ability-header">
        <span className="ability-icon">⚡</span>
        <div className="ability-title-wrap">
          <div className="ability-label">Special Ability</div>
          <div className="ability-title">{ability.title}</div>
        </div>
        <span className="ability-chevron">{expanded ? "▲" : "▼"}</span>
      </div>
      {expanded && <div className="ability-desc">{ability.desc}</div>}
    </div>
  );
}

function QuizSection({ quiz, animalName }) {
  const [answers, setAnswers] = useState({});
  const [score, setScore]     = useState(null);

  function pickAnswer(qIdx, option) {
    if (score !== null) return;
    setAnswers((prev) => ({ ...prev, [qIdx]: option }));
  }
  function submit() {
    if (Object.keys(answers).length < quiz.length) { alert("Please answer all questions first!"); return; }
    let correct = 0;
    quiz.forEach((q, i) => { if (answers[i] === q.answer) correct++; });
    setScore(correct);
  }
  function reset() { setAnswers({}); setScore(null); }

  return (
    <div className="quiz-section">
      <div className="quiz-header">
        <span className="quiz-icon">🧠</span>
        <div>
          <div className="quiz-label">Wildlife Quiz</div>
          <div className="quiz-subtitle">{animalName} — {quiz.length} questions</div>
        </div>
      </div>

      {score !== null && (
        <div className={`quiz-result ${score === quiz.length ? "perfect" : score > 0 ? "partial" : "zero"}`}>
          {score === quiz.length ? "🎉 Perfect!" : score > 0 ? "👍 Good try!" : "😅 Keep learning!"}
          <span> {score}/{quiz.length} correct</span>
          <button className="quiz-retry" onClick={reset}>Try Again</button>
        </div>
      )}

      {quiz.map((q, qi) => (
        <div key={qi} className="quiz-question-block">
          <div className="quiz-q-num">Q{qi + 1}</div>
          <div className="quiz-question">{q.question}</div>
          <div className="quiz-options">
            {q.options.map((opt, oi) => {
              const picked   = answers[qi] === opt;
              const revealed = score !== null;
              const isCorrect = opt === q.answer;
              let cls = "quiz-option";
              if (picked && !revealed) cls += " selected";
              if (revealed && isCorrect) cls += " correct";
              if (revealed && picked && !isCorrect) cls += " wrong";
              return (
                <button key={oi} className={cls} onClick={() => pickAnswer(qi, opt)} disabled={score !== null}>
                  {revealed && isCorrect ? "✅ " : revealed && picked && !isCorrect ? "❌ " : ""}
                  {opt}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {score === null && (
        <button className="quiz-submit" onClick={submit}>Submit Answers →</button>
      )}
    </div>
  );
}

function RelatedImage({ animal }) {
  const [err, setErr] = useState(false);
  if (err) return <div className="related-emoji">{getEmoji(animal.category)}</div>;
  return (
    <img
      key={animal.id}
      src={animal.imageUrl || getAnimalImage(animal)}
      alt={animal.name}
      className="related-img"
      loading="lazy"
      onError={() => setErr(true)}
    />
  );
}

/* ─── Admin Panel (unchanged from original) ──────────────────────────────── */
function AdminAnimalPanel({ animal, override, ability, quiz, activeTab, setActiveTab, uploading, uploadMsg, onPhotoFile, onDeletePhoto, onSaveField, onSaveQuiz, onClose }) {
  const fileRef = useRef(null);
  const [abilityTitle, setAbilityTitle] = useState(ability.title || "");
  const [abilityDesc, setAbilityDesc]   = useState(ability.desc  || "");
  const [abilitySaving, setAbilitySaving] = useState(false);
  const [quizItems, setQuizItems] = useState(() => quiz.map((q) => ({ ...q, options: [...q.options] })));
  const [quizSaving, setQuizSaving] = useState(false);
  const [quizMsg, setQuizMsg]       = useState("");

  async function saveAbility() {
    setAbilitySaving(true);
    await onSaveField("ability", { title: abilityTitle, desc: abilityDesc });
    setAbilitySaving(false);
  }
  async function saveQuiz() {
    setQuizSaving(true);
    await onSaveQuiz(quizItems);
    setQuizMsg("✅ Quiz saved!");
    setQuizSaving(false);
    setTimeout(() => setQuizMsg(""), 2000);
  }
  function addQuestion() { setQuizItems((prev) => [...prev, { question: "", options: ["", "", "", ""], answer: "" }]); }
  function deleteQuestion(idx) { setQuizItems((prev) => prev.filter((_, i) => i !== idx)); }
  function moveQuestion(idx, dir) {
    setQuizItems((prev) => {
      const arr = [...prev]; const target = idx + dir;
      if (target < 0 || target >= arr.length) return arr;
      [arr[idx], arr[target]] = [arr[target], arr[idx]]; return arr;
    });
  }
  function updateQuestion(idx, field, value) { setQuizItems((prev) => prev.map((q, i) => i === idx ? { ...q, [field]: value } : q)); }
  function updateOption(qIdx, optIdx, value) {
    setQuizItems((prev) => prev.map((q, i) => {
      if (i !== qIdx) return q;
      const opts = [...q.options]; opts[optIdx] = value; return { ...q, options: opts };
    }));
  }

  return (
    <div className="admin-panel-backdrop" onClick={onClose}>
      <div className="admin-panel-modal" onClick={(e) => e.stopPropagation()}>
        <div className="admin-panel-header">
          <span>👑 Admin — {animal.name}</span>
          <button className="admin-panel-close" onClick={onClose}>✕</button>
        </div>
        <div className="admin-panel-tabs">
          {[["photo","📷 Photo"],["ability","⚡ Ability"],["quiz","🧠 Quiz"]].map(([key, label]) => (
            <button key={key} className={`admin-panel-tab ${activeTab === key ? "active" : ""}`} onClick={() => setActiveTab(key)}>{label}</button>
          ))}
        </div>

        {activeTab === "photo" && (
          <div className="admin-panel-body">
            <div className="admin-section-title">Change Animal Photo</div>
            <div className="admin-current-photo"><CurrentPhoto override={override} animal={animal} /></div>
            {uploadMsg && <div className={`admin-upload-msg ${uploadMsg.includes("✅") ? "ok" : "err"}`}>{uploadMsg}</div>}
            <div className="admin-photo-actions">
              <button className="admin-action-btn primary" onClick={() => fileRef.current?.click()} disabled={uploading}>
                {uploading ? "⏳ Uploading…" : "📁 Choose New Photo"}
              </button>
              <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={onPhotoFile} />
              {override.image && <button className="admin-action-btn danger" onClick={onDeletePhoto}>🗑️ Delete Custom Photo</button>}
            </div>
            <div className="admin-section-title" style={{ marginTop: 8 }}>Quick Info Edit</div>
            <div className="aef-row"><label>Habits</label><textarea rows={2} defaultValue={override.habits || ""} onBlur={(e) => onSaveField("habits", e.target.value)} /></div>
            <div className="aef-row"><label>Lifespan</label><input type="text" defaultValue={override.lifespan || ""} onBlur={(e) => onSaveField("lifespan", e.target.value)} /></div>
          </div>
        )}

        {activeTab === "ability" && (
          <div className="admin-panel-body">
            <div className="admin-section-title">Edit Special Ability</div>
            <div className="aef-row"><label>⚡ Title</label><input type="text" value={abilityTitle} onChange={(e) => setAbilityTitle(e.target.value)} /></div>
            <div className="aef-row"><label>📝 Description</label><textarea rows={4} value={abilityDesc} onChange={(e) => setAbilityDesc(e.target.value)} /></div>
            <button className="admin-action-btn primary" onClick={saveAbility} disabled={abilitySaving}>
              {abilitySaving ? "⏳ Saving…" : "💾 Save Ability"}
            </button>
          </div>
        )}

        {activeTab === "quiz" && (
          <div className="admin-panel-body">
            <div className="admin-quiz-header">
              <div className="admin-section-title">Edit Quiz ({quizItems.length} questions)</div>
              <button className="admin-add-q-btn" onClick={addQuestion}>➕ Add Question</button>
            </div>
            {quizMsg && <div className="admin-upload-msg ok">{quizMsg}</div>}
            {quizItems.map((q, qi) => (
              <div key={qi} className="admin-quiz-card">
                <div className="admin-quiz-card-header">
                  <span className="admin-q-num">Q{qi + 1}</span>
                  <div className="admin-q-controls">
                    <button onClick={() => moveQuestion(qi, -1)} disabled={qi === 0}>↑</button>
                    <button onClick={() => moveQuestion(qi, 1)} disabled={qi === quizItems.length - 1}>↓</button>
                    <button className="danger-btn" onClick={() => deleteQuestion(qi)}>🗑️</button>
                  </div>
                </div>
                <input className="admin-q-input" type="text" placeholder="Question text…" value={q.question} onChange={(e) => updateQuestion(qi, "question", e.target.value)} />
                <div className="admin-q-opts-label">Options (radio = correct answer):</div>
                {q.options.map((opt, oi) => (
                  <div key={oi} className="admin-q-opt-row">
                    <input type="radio" name={`q${qi}-answer`} checked={q.answer === opt} onChange={() => updateQuestion(qi, "answer", opt)} />
                    <input className="admin-q-opt-input" type="text" placeholder={`Option ${oi + 1}`} value={opt}
                      onChange={(e) => { const wasAnswer = q.answer === opt; updateOption(qi, oi, e.target.value); if (wasAnswer) updateQuestion(qi, "answer", e.target.value); }} />
                    <span className={`opt-badge ${q.answer === opt ? "correct" : ""}`}>{q.answer === opt ? "✅" : "○"}</span>
                  </div>
                ))}
              </div>
            ))}
            <div className="admin-quiz-footer">
              <button className="admin-action-btn primary" onClick={saveQuiz} disabled={quizSaving}>{quizSaving ? "⏳ Saving…" : "💾 Save All"}</button>
              <button className="admin-action-btn" onClick={() => { if (window.confirm("Reset quiz?")) setQuizItems(getDefaultQuiz(animal).map((q) => ({ ...q, options: [...q.options] }))); }}>🔄 Reset</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function CurrentPhoto({ override, animal }) {
  const [err, setErr] = useState(false);
  const overrideImg   = isPermanentImageUrl(override.image) ? override.image : null;
  const src           = overrideImg || getAnimalImage(animal);
  const emoji         = getAnimalEmoji(animal.baseName || animal.name, animal.category);
  if (err) return <div className="admin-photo-preview-emoji">{emoji}</div>;
  return <img src={src} alt={animal.name} className="admin-photo-preview" onError={() => setErr(true)} />;
}
