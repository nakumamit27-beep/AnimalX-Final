import { Link } from "wouter";
import animals, { categories } from "../data/animals";
import { getImage, getEmoji } from "../utils/image";
import { useState } from "react";

function FeaturedCard({ animal }) {
  const [imgErr, setImgErr] = useState(false);
  return (
    <Link href={`/animals/${animal.id}`} className="featured-card">
      <div className="featured-img-wrap">
        {imgErr ? (
          <div className="featured-emoji">{getEmoji(animal.category)}</div>
        ) : (
          <img
            src={getImage(animal.baseName, animal.id)}
            alt={animal.name}
            loading="lazy"
            onError={() => setImgErr(true)}
            className="featured-img"
          />
        )}
      </div>
      <div className="featured-info">
        <span className="cat-badge">{animal.category}</span>
        <h3>{animal.name}</h3>
      </div>
    </Link>
  );
}

export default function Home() {
  const featured = [
    animals.find(a => a.baseName === "Lion"),
    animals.find(a => a.baseName === "Shark"),
    animals.find(a => a.baseName === "Eagle"),
    animals.find(a => a.baseName === "Elephant"),
    animals.find(a => a.baseName === "Dolphin"),
    animals.find(a => a.baseName === "Cobra"),
  ].filter(Boolean);

  const statItems = [
    { icon: "🐾", value: "1,500+", label: "Animals & Wonders" },
    { icon: "🏛️", value: "200+", label: "Zoos Worldwide" },
    { icon: "🌍", value: "16", label: "Countries Covered" },
    { icon: "📚", value: "10", label: "Categories" },
  ];

  return (
    <div className="home-page">
      <section className="hero">
        <div className="hero-content">
          <div className="hero-badge">🌿 Wildlife Explorer</div>
          <h1 className="hero-title">Discover the<br /><span className="hero-accent">Animal Kingdom</span></h1>
          <p className="hero-subtitle">
            Explore 1,500+ animals, reptiles, birds, trees and natural wonders from around the world.
            Discover their habitats, behaviors, and the zoos that protect them.
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
        {statItems.map(s => (
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
          {categories.map(cat => {
            const count = animals.filter(a => a.category === cat).length;
            const emoji = getEmoji(cat);
            return (
              <Link key={cat} href={`/animals?category=${encodeURIComponent(cat)}`} className="category-card">
                <div className="cat-emoji">{emoji}</div>
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
              <button
                className="gir-btn location"
                onClick={() => window.open("https://www.google.com/maps?q=21.124,70.824", "_blank")}
              >
                📍 View Location
              </button>
              <button
                className="gir-btn ride"
                onClick={() => window.open("https://m.uber.com", "_blank")}
              >
                🚖 Book Ride
              </button>
              <button
                className="gir-btn flight"
                onClick={() => window.open("https://www.skyscanner.com", "_blank")}
              >
                ✈️ Book Flight
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="featured-section">
        <h2 className="section-heading">Featured Wildlife</h2>
        <div className="featured-grid">
          {featured.map(a => <FeaturedCard key={a.id} animal={a} />)}
        </div>
        <div className="see-all-wrap">
          <Link href="/animals" className="see-all-btn">See All 1,500+ Animals →</Link>
        </div>
      </section>

      <section className="features-section">
        <h2 className="section-heading">What You Can Do</h2>
        <div className="features-grid">
          <Link href="/animals" className="feature-card">
            <div className="feature-icon">🔍</div>
            <h3>Explore Animals</h3>
            <p>Browse and search 1,500+ animals across 10 categories with lazy-loading and emoji fallbacks</p>
          </Link>
          <Link href="/map" className="feature-card">
            <div className="feature-icon">🗺️</div>
            <h3>Zoo World Map</h3>
            <p>Explore 200+ zoos worldwide. Click any zoo card to open its exact location in Google Maps</p>
          </Link>
          <Link href="/reels" className="feature-card">
            <div className="feature-icon">🎬</div>
            <h3>Wildlife Reels</h3>
            <p>Swipe through visual wildlife stories. Upload your own MP4 videos and share with others</p>
          </Link>
          <Link href="/travel" className="feature-card">
            <div className="feature-icon">✈️</div>
            <h3>Travel Planning</h3>
            <p>Book rides, flights, and private jets to reach wildlife destinations like Gir and Serengeti</p>
          </Link>
          <Link href="/chat" className="feature-card">
            <div className="feature-icon">🤖</div>
            <h3>Wildlife Chatbot</h3>
            <p>Ask questions about animals and get instant AI-powered answers — wildlife topics only</p>
          </Link>
          <Link href="/premium" className="feature-card">
            <div className="feature-icon">👑</div>
            <h3>Premium Access</h3>
            <p>Unlock all 1,500+ animals for ₹99 or complete 3 free tasks — puzzle, visit, and share</p>
          </Link>
        </div>
      </section>
    </div>
  );
}
