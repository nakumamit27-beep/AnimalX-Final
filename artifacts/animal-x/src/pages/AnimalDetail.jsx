import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "wouter";
import animals from "../data/animals";
import { getAnimalImage, getEmoji, getAnimalEmoji } from "../utils/image";
import { getOverride, setOverride, fileToDataURL } from "../utils/animalOverrides";
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

  // Display values (override OR original)
  const habits = override.habits || "";
  const lifespan = override.lifespan || animal.lifespan;

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
                src={imgSrc}
                alt={animal.name}
                className="detail-img"
                onError={() => setImgError(true)}
              />
            )}
            {isSuperAdmin && adminMode && (
              <div className="detail-edit-actions" onClick={(e) => e.stopPropagation()}>
                <label className="detail-edit-btn" style={{ cursor: "pointer" }}>
                  📷 Update Photo
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={handleQuickPhoto}
                  />
                </label>
                <button
                  className="detail-edit-btn"
                  onClick={() => setEditOpen((v) => !v)}
                >
                  ✏️ {editOpen ? "Close" : "Edit Info"}
                </button>
              </div>
            )}
          </div>

          <div className="detail-info">
            <span className="category-badge">{animal.category}</span>
            <h1 className="detail-name">
              <span style={{ marginRight: 8 }}>{emoji}</span>
              {animal.name}
            </h1>
            <p className="detail-description">{animal.description}</p>

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
                <span className="stat-value">{lifespan || "Loading..."}</span>
              </div>
              <div className="stat-item" style={{ gridColumn: "1 / -1" }}>
                <span className="stat-label">🐾 Habits</span>
                <span className="stat-value">{habits || "Loading..."}</span>
              </div>
            </div>
          </div>
        </div>

        {editOpen && isSuperAdmin && adminMode && (
          <div className="admin-edit-form">
            <h3>👑 Admin: Edit "{animal.name}"</h3>
            <div className="aef-row">
              <label>Photo</label>
              <input type="file" accept="image/*" ref={fileRef} onChange={handleFileChange} />
              {override.image && <p className="aef-ok">✓ Custom photo set (synced everywhere)</p>}
            </div>
            <div className="aef-row">
              <label>Habits</label>
              <textarea
                rows={3}
                placeholder="e.g. Nocturnal hunter, lives in prides..."
                defaultValue={override.habits || ""}
                onBlur={(e) => saveField("habits", e.target.value)}
              />
            </div>
            <div className="aef-row">
              <label>Lifespan</label>
              <input
                type="text"
                placeholder="e.g. 12–16 years wild"
                defaultValue={override.lifespan || ""}
                onBlur={(e) => saveField("lifespan", e.target.value)}
              />
            </div>
            <p className="aef-hint">Changes save automatically when you click outside the field. They appear on cards, banner, and detail page.</p>
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

function RelatedImage({ animal }) {
  const [err, setErr] = useState(false);
  if (err) return <div className="related-emoji">{getEmoji(animal.category)}</div>;
  return (
    <img
      src={getAnimalImage(animal)}
      alt={animal.name}
      className="related-img"
      loading="lazy"
      onError={() => setErr(true)}
    />
  );
}
