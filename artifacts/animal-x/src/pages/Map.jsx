import { useState } from "react";
import zoos from "../data/zoos";

export default function Map() {
  const [selectedZoo, setSelectedZoo] = useState(null);
  const [filterCountry, setFilterCountry] = useState("All");

  const countries = ["All", ...new Set(zoos.map(z => z.country))].sort();
  const filteredZoos = filterCountry === "All" ? zoos : zoos.filter(z => z.country === filterCountry);

  const minLat = -50, maxLat = 75, minLng = -140, maxLng = 155;
  const toX = lng => ((lng - minLng) / (maxLng - minLng)) * 100;
  const toY = lat => ((maxLat - lat) / (maxLat - minLat)) * 100;

  return (
    <div className="map-page">
      <div className="map-header">
        <h1 className="page-title">Zoo World Map</h1>
        <p className="page-subtitle">Explore {zoos.length} zoos across {new Set(zoos.map(z => z.country)).size} countries</p>
      </div>

      <div className="map-controls">
        <label className="filter-label">Filter by Country</label>
        <select
          className="country-select"
          value={filterCountry}
          onChange={e => setFilterCountry(e.target.value)}
        >
          {countries.map(c => (
            <option key={c} value={c}>{c} {c !== "All" ? `(${zoos.filter(z => z.country === c).length})` : ""}</option>
          ))}
        </select>
        <span className="zoo-count">{filteredZoos.length} zoos shown</span>
      </div>

      <div className="map-container">
        <div className="world-map">
          <svg viewBox="0 0 100 60" className="map-svg" preserveAspectRatio="xMidYMid meet">
            <rect width="100" height="60" fill="#0a1628" />
            <text x="2" y="5" fontSize="2" fill="#1e3a5f">🌍 World Map</text>
            {filteredZoos.map(zoo => (
              <g key={zoo.id} onClick={() => setSelectedZoo(selectedZoo?.id === zoo.id ? null : zoo)}>
                <circle
                  cx={toX(zoo.lng)}
                  cy={toY(zoo.lat)}
                  r={selectedZoo?.id === zoo.id ? 1.2 : 0.7}
                  fill={selectedZoo?.id === zoo.id ? "#22c55e" : "#f59e0b"}
                  opacity={0.85}
                  className="zoo-marker"
                  style={{ cursor: "pointer" }}
                />
              </g>
            ))}
          </svg>

          {selectedZoo && (
            <div className="map-popup">
              <button className="popup-close" onClick={() => setSelectedZoo(null)}>✕</button>
              <div className="popup-name">🦁 {selectedZoo.name}</div>
              <div className="popup-country">📍 {selectedZoo.country}</div>
              <div className="popup-animals">🐾 {selectedZoo.animals} animals</div>
              <div className="popup-rating">⭐ {selectedZoo.rating}/5.0</div>
              <div className="popup-coords">
                {selectedZoo.lat.toFixed(2)}°, {selectedZoo.lng.toFixed(2)}°
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="zoo-list">
        <h3>Zoo Directory ({filteredZoos.length})</h3>
        <div className="zoo-grid">
          {filteredZoos.slice(0, 50).map(zoo => (
            <div
              key={zoo.id}
              className={`zoo-card ${selectedZoo?.id === zoo.id ? "selected" : ""}`}
              onClick={() => setSelectedZoo(selectedZoo?.id === zoo.id ? null : zoo)}
            >
              <div className="zoo-card-name">🦁 {zoo.name}</div>
              <div className="zoo-card-country">📍 {zoo.country}</div>
              <div className="zoo-card-meta">
                <span>🐾 {zoo.animals} animals</span>
                <span>⭐ {zoo.rating}</span>
              </div>
            </div>
          ))}
        </div>
        {filteredZoos.length > 50 && (
          <p className="more-zoos">+{filteredZoos.length - 50} more zoos available — filter by country to narrow down</p>
        )}
      </div>
    </div>
  );
}
