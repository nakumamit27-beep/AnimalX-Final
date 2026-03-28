import { useState } from "react";
import { useParams, Link } from "wouter";
import animals from "../data/animals";
import { getImage, getEmoji } from "../utils/image";

export default function AnimalDetail() {
  const { id } = useParams();
  const animal = animals.find(a => a.id === parseInt(id));
  const [imgError, setImgError] = useState(false);

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
    .filter(a => a.category === animal.category && a.id !== animal.id)
    .slice(0, 6);

  return (
    <div className="detail-page">
      <div className="detail-container">
        <Link href="/animals" className="back-link">← Back to Animals</Link>

        <div className="detail-card">
          <div className="detail-image-wrap">
            {imgError ? (
              <div className="detail-emoji">{getEmoji(animal.category)}</div>
            ) : (
              <img
                src={getImage(animal.baseName, animal.id)}
                alt={animal.name}
                className="detail-img"
                onError={() => setImgError(true)}
              />
            )}
          </div>

          <div className="detail-info">
            <span className="category-badge">{animal.category}</span>
            <h1 className="detail-name">{animal.name}</h1>
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
                <span className="stat-value">{animal.lifespan}</span>
              </div>
            </div>
          </div>
        </div>

        {related.length > 0 && (
          <div className="related-section">
            <h3>More from {animal.category}</h3>
            <div className="related-grid">
              {related.map(r => (
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
      src={getImage(animal.baseName, animal.id)}
      alt={animal.name}
      className="related-img"
      loading="lazy"
      onError={() => setErr(true)}
    />
  );
}
