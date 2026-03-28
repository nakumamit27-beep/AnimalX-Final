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
    { icon: "🐾", value: "1,350+", label: "Animals & Wonders" },
    { icon: "🏛️", value: "150+", label: "Zoos Worldwide" },
    { icon: "🌍", value: "16", label: "Countries Covered" },
    { icon: "📚", value: "9", label: "Categories" },
  ];

  return (
    <div className="home-page">
      <section className="hero">
        <div className="hero-content">
          <div className="hero-badge">🌿 Wildlife Explorer</div>
          <h1 className="hero-title">Discover the<br /><span className="hero-accent">Animal Kingdom</span></h1>
          <p className="hero-subtitle">
            Explore 1,350+ animals, reptiles, birds, and natural wonders from around the world.
            Discover their habitats, behaviors, and the zoos that protect them.
          </p>
          <div className="hero-actions">
            <Link href="/animals" className="btn-primary">Explore Animals 🐾</Link>
            <Link href="/map" className="btn-secondary">View Zoo Map 🗺️</Link>
          </div>
        </div>
        <div className="hero-emojis">
          {["🦁", "🐘", "🦅", "🐬", "🐍", "🦋"].map((e, i) => (
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

      <section className="featured-section">
        <h2 className="section-heading">Featured Wildlife</h2>
        <div className="featured-grid">
          {featured.map(a => <FeaturedCard key={a.id} animal={a} />)}
        </div>
        <div className="see-all-wrap">
          <Link href="/animals" className="see-all-btn">See All 1,350+ Animals →</Link>
        </div>
      </section>

      <section className="features-section">
        <h2 className="section-heading">What You Can Do</h2>
        <div className="features-grid">
          <Link href="/animals" className="feature-card">
            <div className="feature-icon">🔍</div>
            <h3>Explore Animals</h3>
            <p>Browse and search 1,350+ animals across 9 categories with lazy-loading and emoji fallbacks</p>
          </Link>
          <Link href="/map" className="feature-card">
            <div className="feature-icon">🗺️</div>
            <h3>Zoo World Map</h3>
            <p>Explore 150+ zoos worldwide with interactive markers and detailed info</p>
          </Link>
          <Link href="/reels" className="feature-card">
            <div className="feature-icon">🎬</div>
            <h3>Wildlife Reels</h3>
            <p>Swipe through visual wildlife stories with auto-play and smooth transitions</p>
          </Link>
          <Link href="/travel" className="feature-card">
            <div className="feature-icon">✈️</div>
            <h3>Travel Planning</h3>
            <p>Book rides, flights, and private jets to reach wildlife destinations</p>
          </Link>
          <Link href="/chat" className="feature-card">
            <div className="feature-icon">🤖</div>
            <h3>Wildlife Chatbot</h3>
            <p>Ask questions about animals and get instant AI-powered answers — wildlife topics only</p>
          </Link>
          <Link href="/help" className="feature-card">
            <div className="feature-icon">💬</div>
            <h3>Help & Support</h3>
            <p>Contact us via email, Instagram, YouTube, or Facebook for assistance</p>
          </Link>
        </div>
      </section>
    </div>
  );
}
