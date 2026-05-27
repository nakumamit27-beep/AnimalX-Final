import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "wouter";
import animals from "../data/animals";
import { getAnimalImage, getEmoji, getAnimalEmoji } from "../utils/image";
import { getOverride, setOverride, fileToDataURL } from "../utils/animalOverrides";
import { getAbility, getDefaultQuiz } from "../utils/animalAbility";
import { useAuth } from "../context/AuthContext";

export default function AnimalDetail() {
  const { id } = useParams();
  const animal = animals.find((a) => a.id === parseInt(id));
  const [imgError, setImgError] = useState(false);
  const [override, setOverrideState] = useState(() => (animal ? getOverride(animal.id) : {}));
  const [tapCount, setTapCount] = useState(0);
  const tapTimer = useRef(null);
  const [editOpen, setEditOpen] = useState(false);
  const fileRef = useRef(null);
  const { isSuperAdmin, adminMode } = useAuth();

  useEffect(() => {
    function refresh() {
      if (animal) setOverrideState(getOverride(animal.id));
      setImgError(false);
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

  const related = animals
    .filter((a) => a.category === animal.category && a.id !== animal.id)
    .slice(0, 6);

  const emoji = getAnimalEmoji(animal.baseName || animal.name, animal.category);
  const imgSrc = getAnimalImage(animal);
  const ability = override.ability || getAbility(animal);
  const quiz = override.quiz || getDefaultQuiz(animal);

  function handleBannerTap() {
    if (!isSuperAdmin || !adminMode) return;
    const next = tapCount + 1;
    setTapCount(next);
    if (tapTimer.current) clearTimeout(tapTimer.current);
    tapTimer.current = setTimeout(() => setTapCount(0), 1500);
    if (next >= 7) {
      setTapCount(0);
      setEditOpen(true);
    }
  }

  async function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const dataUrl = await fileToDataURL(file);
    setOverride(animal.id, { image: dataUrl });
    setOverrideState(getOverride(animal.id));
  }

  function saveField(field, value) {
    setOverride(animal.id, { [field]: value });
    setOverrideState(getOverride(animal.id));
  }

  async function handleQuickPhoto(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const dataUrl = await fileToDataURL(file);
    setOverride(animal.id, { image: dataUrl });
    setOverrideState(getOverride(animal.id));
    setImgError(false);
    e.target.value = "";
  }

  const habits = override.habits || "";
  const lifespan = override.lifespan || animal.lifespan;
  const displayName = override.name || animal.name;
  const displayDesc = override.description || animal.description;

  return (
    <div className="detail-page">
      <div className="detail-container">
        <Link href="/animals" className="back-link">← Back to Animals</Link>

        <div className="detail-card">
          <div className="detail-image-wrap" onClick={handleBannerTap}>
            {imgError ? (
              <div className="detail-emoji">{emoji}</div>
            ) : (
              <img
                src={animal.imageUrl || imgSrc}
                alt={animal.name}
                className="detail-img"
                onError={() => setImgError(true)}
              />
            )}
            <div className="detail-edit-actions" onClick={(e) => e.stopPropagation()}>
              <label className="detail-edit-btn" style={{ cursor: "pointer" }}>
                📷 Update Photo
                <input type="file" accept="image/*" style={{ display: "none" }} onChange={handleQuickPhoto} />
              </label>
              <button className="detail-edit-btn" onClick={() => setEditOpen((v) => !v)}>
                ✏️ {editOpen ? "Close" : "Edit Info"}
              </button>
            </div>
          </div>

          <div className="detail-info">
            <span className="category-badge">{animal.category}</span>
            <h1 className="detail-name">
              <span style={{ marginRight: 8 }}>{emoji}</span>
              {displayName}
            </h1>
            <p className="detail-description">{displayDesc}</p>

            <div className="detail-stats">
              <div className="stat-item">
                <span className="stat-label">🏠 Habitat</span>
                <span className="stat-value">{animal.habitat}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">🌍 Region</span>
                <span className="stat-value">{animal.country}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">🍽️ Diet</span>
                <span className="stat-value">{animal.diet}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">⏳ Lifespan</span>
                <span className="stat-value">{lifespan || "Unknown"}</span>
              </div>
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

        {/* Admin Edit */}
        {editOpen && isSuperAdmin && adminMode && (
          <div className="admin-edit-form">
            <h3>👑 Admin: Edit "{animal.name}"</h3>
            <div className="aef-row">
              <label>Photo</label>
              <input type="file" accept="image/*" ref={fileRef} onChange={handleFileChange} />
              {override.image && <p className="aef-ok">✅ Custom photo set</p>}
            </div>
            <div className="aef-row">
              <label>Habits</label>
              <textarea rows={3} placeholder="e.g. Nocturnal hunter, lives in prides..." defaultValue={override.habits || ""} onBlur={(e) => saveField("habits", e.target.value)} />
            </div>
            <div className="aef-row">
              <label>Lifespan</label>
              <input type="text" placeholder="e.g. 12-16 years" defaultValue={override.lifespan || ""} onBlur={(e) => saveField("lifespan", e.target.value)} />
            </div>
            <div className="aef-row">
              <label>⚡ Ability Title</label>
              <input type="text" placeholder="e.g. Power Roar" defaultValue={override.ability?.title || ""} onBlur={(e) => saveField("ability", { ...ability, title: e.target.value })} />
            </div>
            <div className="aef-row">
              <label>⚡ Ability Description</label>
              <textarea rows={2} placeholder="Describe the special ability..." defaultValue={override.ability?.desc || ""} onBlur={(e) => saveField("ability", { ...ability, desc: e.target.value })} />
            </div>
            <p className="aef-hint">Changes save automatically when you click outside the field.</p>
          </div>
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
      {expanded && (
        <div className="ability-desc">{ability.desc}</div>
      )}
    </div>
  );
}

function QuizSection({ quiz, animalName }) {
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(null);

  function pickAnswer(qIdx, option) {
    if (score !== null) return;
    setAnswers(prev => ({ ...prev, [qIdx]: option }));
  }

  function submit() {
    if (Object.keys(answers).length < quiz.length) {
      alert("Please answer all questions first!");
      return;
    }
    let correct = 0;
    quiz.forEach((q, i) => { if (answers[i] === q.answer) correct++; });
    setScore(correct);
  }

  function reset() {
    setAnswers({});
    setScore(null);
  }

  return (
    <div className="quiz-section">
      <div className="quiz-header">
        <span className="quiz-icon">🧠</span>
        <div>
          <div className="quiz-label">Wildlife Quiz</div>
          <div className="quiz-subtitle">{animalName} — Test your knowledge</div>
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
        <button className="quiz-submit" onClick={submit}>
          Submit Answers →
        </button>
      )}
    </div>
  );
}

function RelatedImage({ animal }) {
  const [err, setErr] = useState(false);
  if (err) return <div className="related-emoji">{getEmoji(animal.category)}</div>;
  return (
    <img
      src={animal.imageUrl || getAnimalImage(animal)}
      alt={animal.name}
      className="related-img"
      loading="lazy"
      onError={() => setErr(true)}
    />
  );
}
