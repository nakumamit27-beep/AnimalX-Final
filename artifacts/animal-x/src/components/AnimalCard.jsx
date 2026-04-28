import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import { getAnimalImage, getAnimalEmoji } from "../utils/image";
import { useAuth } from "../context/AuthContext";
import {
  getOverride,
  setOverride,
  fileToDataURL,
} from "../utils/animalOverrides";

export default function AnimalCard({ animal }) {
  const { isSuperAdmin, adminMode } = useAuth();
  const [imgError, setImgError] = useState(false);
  const [override, setOverrideState] = useState(() => getOverride(animal.id));
  const [imgSrc, setImgSrc] = useState(() => getAnimalImage(animal));
  const [editOpen, setEditOpen] = useState(false);

  const isRare = animal.id % 10 === 0;
  const emoji = getAnimalEmoji(animal.baseName || animal.name, animal.category);

  // Form state (initialized when modal opens)
  const [fName, setFName] = useState("");
  const [fHabits, setFHabits] = useState("");
  const [fLifespan, setFLifespan] = useState("");
  const [fDescription, setFDescription] = useState("");
  const [fImage, setFImage] = useState(null);
  const fileRef = useRef(null);

  useEffect(() => {
    function refresh() {
      setImgError(false);
      setOverrideState(getOverride(animal.id));
      setImgSrc(getAnimalImage(animal));
    }
    window.addEventListener("ax-overrides-changed", refresh);
    return () => window.removeEventListener("ax-overrides-changed", refresh);
  }, [animal]);

  const displayName = override.name || animal.name;
  const displayDesc = override.description || animal.description;
  const displayHabits = override.habits || "";
  const displayLifespan = override.lifespan || animal.lifespan;
  const showPencil = isSuperAdmin && adminMode;

  function openEdit(e) {
    e.preventDefault();
    e.stopPropagation();
    setFName(displayName);
    setFHabits(displayHabits);
    setFLifespan(displayLifespan || "");
    setFDescription(displayDesc || "");
    setFImage(null);
    setEditOpen(true);
  }

  function closeEdit(e) {
    if (e) e.stopPropagation();
    setEditOpen(false);
  }

  async function handleFile(e) {
    e.stopPropagation();
    const file = e.target.files?.[0];
    if (!file) return;
    const dataUrl = await fileToDataURL(file);
    setFImage(dataUrl);
  }

  function saveAll(e) {
    e.preventDefault();
    e.stopPropagation();
    const patch = {};
    if (fName.trim() && fName !== animal.name) patch.name = fName.trim();
    else if (fName.trim() === animal.name) patch.name = undefined;
    if (fHabits.trim()) patch.habits = fHabits.trim();
    if (fLifespan.trim()) patch.lifespan = fLifespan.trim();
    if (fDescription.trim() && fDescription !== animal.description)
      patch.description = fDescription.trim();
    if (fImage) patch.image = fImage;
    setOverride(animal.id, patch);
    setEditOpen(false);
  }

  return (
    <>
      <Link href={`/animals/${animal.id}`} className="animal-card">
        <div className="image-card">
          {isRare && <div className="rare-tag">⭐ Rare</div>}
          {showPencil && (
            <button
              type="button"
              className="card-edit-fab"
              onClick={openEdit}
              aria-label="Edit animal"
              title="Edit animal"
            >
              ✏️
            </button>
          )}
          {imgError ? (
            <div className="emoji">{emoji}</div>
          ) : (
            <img
              src={imgSrc}
              alt={displayName}
              loading="lazy"
              onError={() => setImgError(true)}
            />
          )}
        </div>
        <div className="card-body">
          <span className="card-category">{animal.category}</span>
          <h3 className="card-name">
            <span className="card-emoji">{emoji}</span> {displayName}
          </h3>
          <p className="card-desc">{(displayDesc || "").slice(0, 80)}...</p>
          <div className="card-meta">
            <span>🏠 {animal.habitat.split(",")[0]}</span>
            {isRare && <span className="rare-meta">⭐ Rare</span>}
          </div>
        </div>
      </Link>

      {editOpen && (
        <div
          className="edit-modal-backdrop"
          onClick={closeEdit}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="edit-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="edit-modal-head">
              <h3>✏️ Edit {animal.name}</h3>
              <button
                type="button"
                className="edit-modal-close"
                onClick={closeEdit}
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <form onSubmit={saveAll} className="edit-modal-body">
              <div className="aef-row">
                <label>Photo</label>
                <div className="ep-photo-row">
                  <div
                    className="ep-photo-preview"
                    style={{
                      backgroundImage: fImage
                        ? `url(${fImage})`
                        : `url(${imgSrc})`,
                      borderRadius: 12,
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <label className="btn-primary" style={{ cursor: "pointer", display: "inline-block" }}>
                      📷 Upload New Photo
                      <input
                        ref={fileRef}
                        type="file"
                        accept="image/*"
                        style={{ display: "none" }}
                        onChange={handleFile}
                      />
                    </label>
                    {(override.image || fImage) && (
                      <button
                        type="button"
                        className="qs-pill"
                        style={{ marginLeft: 8 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setFImage(null);
                          setOverride(animal.id, { image: undefined });
                        }}
                      >
                        Reset
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="aef-row">
                <label>Name</label>
                <input
                  type="text"
                  value={fName}
                  onChange={(e) => setFName(e.target.value)}
                  placeholder="Animal name"
                />
              </div>

              <div className="aef-row">
                <label>Habits / Habitat</label>
                <textarea
                  rows={3}
                  value={fHabits}
                  onChange={(e) => setFHabits(e.target.value)}
                  placeholder="e.g. Nocturnal apex predator that lives in prides..."
                />
              </div>

              <div className="aef-row">
                <label>Lifespan</label>
                <input
                  type="text"
                  value={fLifespan}
                  onChange={(e) => setFLifespan(e.target.value)}
                  placeholder="e.g. 12–16 years wild"
                />
              </div>

              <div className="aef-row">
                <label>Description</label>
                <textarea
                  rows={3}
                  value={fDescription}
                  onChange={(e) => setFDescription(e.target.value)}
                  placeholder="Short description"
                />
              </div>

              <div className="edit-modal-actions">
                <button type="submit" className="btn-primary">✓ Save Changes</button>
                <button type="button" className="qs-pill" onClick={closeEdit}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
