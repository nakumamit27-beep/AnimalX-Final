import { useState } from "react";
import { Link } from "wouter";
import { getImage, getEmoji } from "../utils/image";

export default function AnimalCard({ animal }) {
  const [imgError, setImgError] = useState(false);
  const isRare = animal.id % 10 === 0;

  return (
    <Link href={`/animals/${animal.id}`} className="animal-card">
      <div className="image-card">
        {isRare && <div className="rare-tag">⭐ Rare</div>}
        {imgError ? (
          <div className="emoji">{getEmoji(animal.category)}</div>
        ) : (
          <img
            src={getImage(animal.baseName, animal.id)}
            alt={animal.name}
            loading="lazy"
            onError={() => setImgError(true)}
          />
        )}
      </div>
      <div className="card-body">
        <span className="card-category">{animal.category}</span>
        <h3 className="card-name">{animal.name}</h3>
        <p className="card-desc">{animal.description.slice(0, 80)}...</p>
        <div className="card-meta">
          <span>🏠 {animal.habitat.split(",")[0]}</span>
          {isRare && <span className="rare-meta">⭐ Rare</span>}
        </div>
      </div>
    </Link>
  );
}
