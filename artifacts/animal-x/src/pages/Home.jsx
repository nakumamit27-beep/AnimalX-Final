import { useState } from "react";
import { Link } from "wouter";
import animals, { categories } from "../data/animals";
import { getAnimalImage, getEmoji, getAnimalEmoji } from "../utils/image";

function FeaturedCard({ animal }) {
  const [imgErr, setImgErr] = useState(false);
  const emoji = getAnimalEmoji(animal.baseName || animal.name, animal.category);
  return (
    <Link href={`/animals/${animal.id}`} className="featured-card">
      <div className="featured-img-wrap">
        {imgErr ? (
          <div className="featured-emoji">{emoji}</div>
        ) : (
          <img
            src={getAnimalImage(animal)}
            alt={animal.name}
            loading="lazy"
            onError={() => setImgErr(true)}
            className="featured-img"
          />
        )}
      </div>
      <div className="featured-info">
        <span className="cat-badge">{animal.category}</span>
        <h3>{emoji} {animal.name}</h3>
      </div>
    </Link>
  );
}

export default function Home() {
  const featured = [
    animals.find((a) => a.baseName === "Lion"),
    animals.find((a) => a.baseName === "Shark"),
    animals.find((a) => a.baseName === "Eagle"),
    animals.find((a) => a.baseName === "Elephant"),
    animals.find((a) => a.baseName === "Dolphin"),
    animals.find((a) => a.baseName === "Cobra"),
  ].filter(Boolean);

  const statItems = [
    { icon: "🐾", value: `${animals.length}`, label: "Animals & Wonders" },
    { icon: "🏛️", value: "200+", label: "Zoos Worldwide" },
    { icon: "🌍", value: "20+", label: "Countries Covered" },
    { icon: "📚", value: `${categories.length}`, label: "Categories" },
  ];

  return (
    <div className="home-page">
      <section className="hero">
        <div className="hero-content">
          <div className="hero-badge">🌿 Wildlife Explorer</div>
          <h1 className="hero-title">Discover the<br /><span className="hero-accent">Animal Kingdom</span></h1>
          <p className="hero-subtitle">
            Explore {animals.length}+ animals, reptiles, birds, trees and natural wonders.
            All free — no premium, no locks.
          </p>
          <div className="hero-actions">
            <Link href="/animals" className="btn-primary">Explore Animals 🐾</Link>
            <Link href="/map" className="btn-secondary">View Zoo Map 🗺️</Link>
          </div>
        </div>
        <div className="hero-emojis">
          {["🦁", "🐘", "🦅", "🐬", "🐍", "🌲"].map((e, i) => (
            <span key={i} className="hero-float-emoji" style={{ animationDelay: `${i * 0.4}s` }}>{e}</span>
          ))}
        </div>
      </section>

      <section className="stats-section">
        {statItems.map((s) => (
          <div key={s.label} className="stat-card">
            <div className="stat-icon">{s.icon}</div>
            <div className="stat-number">{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </section>

      <section className="categories-section">
        <h2 className="section-heading">Browse by Category</h2>
        <div className="categories-grid">
          {categories.map((cat) => {
            const count = animals.filter((a) => a.category === cat).length;
            return (
              <Link key={cat} href={`/animals?category=${encodeURIComponent(cat)}`} className="category-card">
                <div className="cat-emoji">{getEmoji(cat)}</div>
                <div className="cat-name">{cat}</div>
                <div className="cat-count">{count} items</div>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="gir-section">
        <div className="gir-banner">
          <div className="gir-banner-bg" />
          <div className="gir-banner-inner">
            <div className="gir-banner-left">
              <div className="gir-icon">🦁</div>
              <div>
                <h2 className="gir-title">Visit Gir National Park</h2>
                <p className="gir-desc">See Asiatic Lions in their real jungle safari — last wild habitat on Earth.</p>
              </div>
            </div>
            <div className="gir-buttons">
              <button className="gir-btn location" onClick={() => window.open("https://www.google.com/maps?q=21.124,70.824", "_blank")}>📍 View Location</button>
              <button className="gir-btn ride" onClick={() => { window.location.href = "uber://"; setTimeout(() => window.open("https://m.uber.com", "_blank"), 1500); }}>🚖 Book Ride</button>
              <button className="gir-btn flight" onClick={() => { window.location.href = "skyscanner://"; setTimeout(() => window.open("https://www.skyscanner.com", "_blank"), 1500); }}>✈️ Book Flight</button>
            </div>
          </div>
        </div>
      </section>

      <section className="featured-section">
        <h2 className="section-heading">Featured Wildlife</h2>
        <div className="featured-grid">
          {featured.map((a) => <FeaturedCard key={a.id} animal={a} />)}
        </div>
        <div className="see-all-wrap">
          <Link href="/animals" className="see-all-btn">See All {animals.length}+ Animals →</Link>
        </div>
      </section>

      <section className="features-section">
        <h2 className="section-heading">What You Can Do</h2>
        <div className="features-grid">
          <Link href="/animals" className="feature-card">
            <div className="feature-icon">🔍</div>
            <h3>Explore Animals</h3>
            <p>Browse and search {animals.length}+ animals across {categories.length} categories — free & unlimited</p>
          </Link>
          <Link href="/map" className="feature-card">
            <div className="feature-icon">🗺️</div>
            <h3>Zoo World Map</h3>
            <p>200+ zoos worldwide. Tap any zoo to open its exact location in Google Maps</p>
          </Link>
          <Link href="/live-tracking" className="feature-card">
            <div className="feature-icon">📍</div>
            <h3>Live Tracking</h3>
            <p>See real animal movement reports — daily distance covered by 50 species across the globe</p>
          </Link>
          <Link href="/reels" className="feature-card">
            <div className="feature-icon">🎬</div>
            <h3>Reels · Posts · Stories</h3>
            <p>Swipe through wildlife stories, upload your own — instant publishing, no approval queue</p>
          </Link>
          <Link href="/travel" className="feature-card">
            <div className="feature-icon">✈️</div>
            <h3>Travel Planning</h3>
            <p>Tap Book → opens Uber, Ola, Skyscanner directly on your phone via deep links</p>
          </Link>
          <Link href="/chat" className="feature-card">
            <div className="feature-icon">🤖</div>
            <h3>Smart Wildlife Chat</h3>
            <p>Ask anything about animals — typing indicator, quick chips, autocorrect for animal names</p>
          </Link>
        </div>
      </section>
    </div>
  );
}
