import { useState, useEffect } from "react";
import { Link } from "wouter";
import { getAnimalImage, getAnimalEmoji } from "../utils/image";

export default function AnimalCard({ animal }) {
  const [imgError, setImgError] = useState(false);
  const [imgSrc, setImgSrc] = useState(() => getAnimalImage(animal));
  const isRare = animal.id % 10 === 0;
  const emoji = getAnimalEmoji(animal.baseName || animal.name, animal.category);

  useEffect(() => {
    function refresh() {
      setImgError(false);
      setImgSrc(getAnimalImage(animal));
    }
    window.addEventListener("ax-overrides-changed", refresh);
    return () => window.removeEventListener("ax-overrides-changed", refresh);
  }, [animal]);

  return (
    <Link href={`/animals/${animal.id}`} className="animal-card">
      <div className="image-card">
        {isRare && <div className="rare-tag">⭐ Rare</div>}
        {imgError ? (
          <div className="emoji">{emoji}</div>
        ) : (
          <img
            src={imgSrc}
            alt={animal.name}
            loading="lazy"
            onError={() => setImgError(true)}
          />
        )}
      </div>
      <div className="card-body">
        <span className="card-category">{animal.category}</span>
        <h3 className="card-name">
          <span className="card-emoji">{emoji}</span> {animal.name}
        </h3>
        <p className="card-desc">{animal.description.slice(0, 80)}...</p>
        <div className="card-meta">
          <span>🏠 {animal.habitat.split(",")[0]}</span>
          {isRare && <span className="rare-meta">⭐ Rare</span>}
        </div>
      </div>
    </Link>
  );
}
