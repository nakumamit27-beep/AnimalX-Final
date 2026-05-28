import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "wouter";
import animals from "../data/animals";
import { getAnimalImage, getEmoji, getAnimalEmoji } from "../utils/image";
import { getOverride, setOverride, compressImageFile, objectPathToUrl } from "../utils/animalOverrides";
import { getAbility, getDefaultQuiz } from "../utils/animalAbility";
import { useAuth } from "../context/AuthContext";

export default function AnimalDetail() {
  const { id } = useParams();
  const animal = animals.find((a) => a.id === parseInt(id));
  const [imgError, setImgError] = useState(false);
  const [override, setOverrideState] = useState(() => (animal ? getOverride(animal.id) : {}));
  const [tapCount, setTapCount] = useState(0);
  const tapTimer = useRef(null);
  const [adminOpen, setAdminOpen] = useState(false);
  const [adminTab, setAdminTab] = useState("photo");
  const { isSuperAdmin, adminMode } = useAuth();

  // Uploading state
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState("");

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

  const related = animals.filter((a) => a.category === animal.category && a.id !== animal.id).slice(0, 6);
  const emoji = getAnimalEmoji(animal.baseName || animal.name, animal.category);

  // Determine display image — prefer admin-uploaded override
  const overrideImg = override.image || (override.imageObjectPath ? objectPathToUrl(override.imageObjectPath) : null);
  const imgSrc = overrideImg || animal.imageUrl || getAnimalImage(animal);

  const ability = override.ability || getAbility(animal);
  const quiz = override.quiz || getDefaultQuiz(animal);
  const habits = override.habits || "";
  const lifespan = override.lifespan || animal.lifespan;
  const displayName = override.name || animal.name;
  const displayDesc = override.description || animal.description;

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
      const dataUrl = await compressImageFile(file);
      await setOverride(animal.id, { image: dataUrl });
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
    if (!window.confirm("Delete custom photo for this animal?")) return;
    await setOverride(animal.id, { image: null, imageObjectPath: null });
    setOverrideState(getOverride(animal.id));
    setImgError(false);
    setUploadMsg("🗑️ Photo deleted");
    setTimeout(() => setUploadMsg(""), 2000);
  }

  async function saveField(field, value) {
    await setOverride(animal.id, { [field]: value });
    setOverrideState(getOverride(animal.id));
  }

  return (
    <div className="detail-page">
      <div className="detail-container">
        <Link href="/animals" className="back-link">← Back to Animals</Link>

        <div className="detail-card">
          <div className="detail-image-wrap" onClick={handleBannerTap}>
            {imgError ? (
              <div className="detail-emoji">{emoji}</div>
            ) : (
              <img src={imgSrc} alt={animal.name} className="detail-img" onError={() => setImgError(true)} />
            )}
            {isSuperAdmin && adminMode && (
              <div className="detail-edit-actions" onClick={e => e.stopPropagation()}>
                <button className="detail-edit-btn" onClick={() => { setAdminOpen(true); setAdminTab("photo"); }}>
                  📷 Change Photo
                </button>
                <button className="detail-edit-btn" onClick={() => { setAdminOpen(true); setAdminTab("ability"); }}>
                  ⚡ Edit Ability
                </button>
                <button className="detail-edit-btn" onClick={() => { setAdminOpen(true); setAdminTab("quiz"); }}>
                  🧠 Edit Quiz
                </button>
              </div>
            )}
          </div>

          <div className="detail-info">
            <span className="category-badge">{animal.category}</span>
            <h1 className="detail-name">
              <span style={{ marginRight: 8 }}>{emoji}</span>
              {displayName}
            </h1>
            <p className="detail-description">{displayDesc}</p>

            <div className="detail-stats">
              <div className="stat-item"><span className="stat-label">🏠 Habitat</span><span className="stat-value">{animal.habitat}</span></div>
              <div className="stat-item"><span className="stat-label">🌍 Region</span><span className="stat-value">{animal.country}</span></div>
              <div className="stat-item"><span className="stat-label">🍽️ Diet</span><span className="stat-value">{animal.diet}</span></div>
              <div className="stat-item"><span className="stat-label">⏳ Lifespan</span><span className="stat-value">{lifespan || "Unknown"}</span></div>
              {habits && (
                <div className="stat-item" style={{ gridColumn: "1 / -1" }}>
                  <span className="stat-label">🐾 Habits</span>
                  <span className="stat-value">{habits}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ⚡ ABILITY CARD */}
        <AbilityCard ability={ability} />

        {/* 🧠 QUIZ SECTION */}
        <QuizSection quiz={quiz} animalName={displayName} />

        {/* 👑 ADMIN MANAGEMENT POPUP */}
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

        {related.length > 0 && (
          <div className="related-section">
            <h3>More from {animal.category}</h3>
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

// ─── Admin Animal Management Panel ─────────────────────────────────────────────

function AdminAnimalPanel({ animal, override, ability, quiz, activeTab, setActiveTab, uploading, uploadMsg, onPhotoFile, onDeletePhoto, onSaveField, onSaveQuiz, onClose }) {
  const fileRef = useRef(null);

  // Local ability state
  const [abilityTitle, setAbilityTitle] = useState(ability.title || "");
  const [abilityDesc, setAbilityDesc] = useState(ability.desc || "");
  const [abilitySaving, setAbilitySaving] = useState(false);

  // Local quiz state
  const [quizItems, setQuizItems] = useState(() => quiz.map(q => ({ ...q, options: [...q.options] })));
  const [quizSaving, setQuizSaving] = useState(false);
  const [quizMsg, setQuizMsg] = useState("");

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

  function addQuestion() {
    setQuizItems(prev => [...prev, { question: "", options: ["", "", "", ""], answer: "" }]);
  }

  function deleteQuestion(idx) {
    setQuizItems(prev => prev.filter((_, i) => i !== idx));
  }

  function moveQuestion(idx, dir) {
    setQuizItems(prev => {
      const arr = [...prev];
      const target = idx + dir;
      if (target < 0 || target >= arr.length) return arr;
      [arr[idx], arr[target]] = [arr[target], arr[idx]];
      return arr;
    });
  }

  function updateQuestion(idx, field, value) {
    setQuizItems(prev => prev.map((q, i) => i === idx ? { ...q, [field]: value } : q));
  }

  function updateOption(qIdx, optIdx, value) {
    setQuizItems(prev => prev.map((q, i) => {
      if (i !== qIdx) return q;
      const opts = [...q.options];
      opts[optIdx] = value;
      return { ...q, options: opts };
    }));
  }

  return (
    <div className="admin-panel-backdrop" onClick={onClose}>
      <div className="admin-panel-modal" onClick={e => e.stopPropagation()}>
        <div className="admin-panel-header">
          <span>👑 Admin — {animal.name}</span>
          <button className="admin-panel-close" onClick={onClose}>✕</button>
        </div>

        <div className="admin-panel-tabs">
          {[["photo","📷 Photo"],["ability","⚡ Ability"],["quiz","🧠 Quiz"]].map(([key,label]) => (
            <button key={key} className={`admin-panel-tab ${activeTab === key ? "active" : ""}`} onClick={() => setActiveTab(key)}>
              {label}
            </button>
          ))}
        </div>

        {/* ── PHOTO TAB ── */}
        {activeTab === "photo" && (
          <div className="admin-panel-body">
            <div className="admin-section-title">Change Animal Photo</div>

            <div className="admin-current-photo">
              <CurrentPhoto override={override} animal={animal} />
            </div>

            {uploadMsg && <div className={`admin-upload-msg ${uploadMsg.includes("✅") ? "ok" : uploadMsg.includes("❌") ? "err" : ""}`}>{uploadMsg}</div>}

            <div className="admin-photo-actions">
              <button className="admin-action-btn primary" onClick={() => fileRef.current?.click()} disabled={uploading}>
                {uploading ? "⏳ Uploading…" : "📁 Choose New Photo"}
              </button>
              <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={onPhotoFile} />

              {override.image && (
                <button className="admin-action-btn danger" onClick={onDeletePhoto}>
                  🗑️ Delete Custom Photo
                </button>
              )}
            </div>

            <div className="admin-photo-hint">
              Image is auto-compressed to 1080px WebP and stored in Replit Object Storage. Old photos are replaced automatically.
            </div>

            <div className="admin-section-title" style={{ marginTop: 16 }}>Quick Info Edit</div>
            <div className="aef-row">
              <label>Habits</label>
              <textarea rows={2} placeholder="e.g. Nocturnal hunter, lives in prides…" defaultValue={override.habits || ""} onBlur={e => onSaveField("habits", e.target.value)} />
            </div>
            <div className="aef-row">
              <label>Lifespan</label>
              <input type="text" placeholder="e.g. 12–16 years" defaultValue={override.lifespan || ""} onBlur={e => onSaveField("lifespan", e.target.value)} />
            </div>
          </div>
        )}

        {/* ── ABILITY TAB ── */}
        {activeTab === "ability" && (
          <div className="admin-panel-body">
            <div className="admin-section-title">Edit Special Ability</div>

            <div className="aef-row">
              <label>⚡ Ability Title</label>
              <input
                type="text"
                value={abilityTitle}
                onChange={e => setAbilityTitle(e.target.value)}
                placeholder="e.g. Power Roar"
              />
            </div>
            <div className="aef-row">
              <label>📝 Description</label>
              <textarea
                rows={4}
                value={abilityDesc}
                onChange={e => setAbilityDesc(e.target.value)}
                placeholder="Describe the special ability in detail…"
              />
            </div>

            <button className="admin-action-btn primary" onClick={saveAbility} disabled={abilitySaving}>
              {abilitySaving ? "⏳ Saving…" : "💾 Save Ability"}
            </button>

            <div className="admin-photo-hint">Changes save to Firestore and update all pages instantly.</div>
          </div>
        )}

        {/* ── QUIZ TAB ── */}
        {activeTab === "quiz" && (
          <div className="admin-panel-body">
            <div className="admin-quiz-header">
              <div className="admin-section-title">Edit Wildlife Quiz ({quizItems.length} questions)</div>
              <button className="admin-add-q-btn" onClick={addQuestion}>➕ Add Question</button>
            </div>

            {quizMsg && <div className="admin-upload-msg ok">{quizMsg}</div>}

            {quizItems.map((q, qi) => (
              <div key={qi} className="admin-quiz-card">
                <div className="admin-quiz-card-header">
                  <span className="admin-q-num">Q{qi + 1}</span>
                  <div className="admin-q-controls">
                    <button onClick={() => moveQuestion(qi, -1)} disabled={qi === 0} title="Move up">↑</button>
                    <button onClick={() => moveQuestion(qi, 1)} disabled={qi === quizItems.length - 1} title="Move down">↓</button>
                    <button className="danger-btn" onClick={() => deleteQuestion(qi)} title="Delete">🗑️</button>
                  </div>
                </div>

                <input
                  className="admin-q-input"
                  type="text"
                  placeholder="Question text…"
                  value={q.question}
                  onChange={e => updateQuestion(qi, "question", e.target.value)}
                />

                <div className="admin-q-opts-label">Options (click radio to set correct answer):</div>
                {q.options.map((opt, oi) => (
                  <div key={oi} className="admin-q-opt-row">
                    <input
                      type="radio"
                      name={`q${qi}-answer`}
                      checked={q.answer === opt}
                      onChange={() => updateQuestion(qi, "answer", opt)}
                      title="Mark as correct answer"
                    />
                    <input
                      className="admin-q-opt-input"
                      type="text"
                      placeholder={`Option ${oi + 1}`}
                      value={opt}
                      onChange={e => {
                        const wasAnswer = q.answer === opt;
                        updateOption(qi, oi, e.target.value);
                        if (wasAnswer) updateQuestion(qi, "answer", e.target.value);
                      }}
                    />
                    <span className={`opt-badge ${q.answer === opt ? "correct" : ""}`}>
                      {q.answer === opt ? "✅" : "○"}
                    </span>
                  </div>
                ))}
              </div>
            ))}

            <div className="admin-quiz-footer">
              <button className="admin-action-btn primary" onClick={saveQuiz} disabled={quizSaving}>
                {quizSaving ? "⏳ Saving…" : "💾 Save All Quiz Questions"}
              </button>
              <button className="admin-action-btn" onClick={() => {
                if (window.confirm("Reset to auto-generated quiz?")) {
                  setQuizItems(getDefaultQuiz(animal).map(q => ({ ...q, options: [...q.options] })));
                }
              }}>
                🔄 Reset to Auto
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function CurrentPhoto({ override, animal }) {
  const [err, setErr] = useState(false);
  const overrideImg = override.image || (override.imageObjectPath ? objectPathToUrl(override.imageObjectPath) : null);
  const src = overrideImg || animal.imageUrl || getAnimalImage(animal);
  const emoji = getAnimalEmoji(animal.baseName || animal.name, animal.category);
  if (err) return <div className="admin-photo-preview-emoji">{emoji}</div>;
  return <img src={src} alt={animal.name} className="admin-photo-preview" onError={() => setErr(true)} />;
}

// ─── Ability Card ──────────────────────────────────────────────────────────────

function AbilityCard({ ability }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="ability-card" onClick={() => setExpanded(v => !v)}>
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

// ─── Quiz Section (4 questions) ───────────────────────────────────────────────

function QuizSection({ quiz, animalName }) {
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(null);

  function pickAnswer(qIdx, option) {
    if (score !== null) return;
    setAnswers(prev => ({ ...prev, [qIdx]: option }));
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
              const picked = answers[qi] === opt;
              const revealed = score !== null;
              const isCorrect = opt === q.answer;
              let cls = "quiz-option";
              if (picked && !revealed) cls += " selected";
              if (revealed && isCorrect) cls += " correct";
              if (revealed && picked && !isCorrect) cls += " wrong";
              return (
                <button key={oi} className={cls} onClick={() => pickAnswer(qi, opt)} disabled={score !== null}>
                  {revealed && isCorrect ? "✅ " : revealed && picked && !isCorrect ? "❌ " : ""}{opt}
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
    <img src={animal.imageUrl || getAnimalImage(animal)} alt={animal.name} className="related-img" loading="lazy" onError={() => setErr(true)} />
  );
}
