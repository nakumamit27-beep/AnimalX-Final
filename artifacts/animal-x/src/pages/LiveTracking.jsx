import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const categoryColors = {
  Mammals: "#f59e0b",
  Reptiles: "#22c55e",
  Birds: "#3b82f6",
  Aquatic: "#0ea5e9",
  "Small Creatures": "#f97316",
};

function getColorIcon(category) {
  const color = categoryColors[category] || "#6366f1";
  const svg = encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 25 41">
      <path fill="${color}" stroke="#fff" stroke-width="1.5" d="M12.5 0C5.6 0 0 5.6 0 12.5c0 9.4 12.5 28.5 12.5 28.5S25 21.9 25 12.5C25 5.6 19.4 0 12.5 0z"/>
      <circle fill="white" cx="12.5" cy="12.5" r="5"/>
    </svg>`);
  return new L.Icon({
    iconUrl: `data:image/svg+xml,${svg}`,
    iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34],
  });
}

const baseTrackingData = [
  { name: "Lion", category: "Mammals", country: "India", lat: 21.124, lng: 70.824, emoji: "🦁" },
  { name: "Tiger", category: "Mammals", country: "India", lat: 26.8467, lng: 80.9462, emoji: "🐯" },
  { name: "Elephant", category: "Mammals", country: "Thailand", lat: 15.87, lng: 100.9925, emoji: "🐘" },
  { name: "Wolf", category: "Mammals", country: "USA", lat: 44.5, lng: -110.5, emoji: "🐺" },
  { name: "Bear", category: "Mammals", country: "Canada", lat: 56.1304, lng: -106.3468, emoji: "🐻" },
  { name: "Panda", category: "Mammals", country: "China", lat: 30.7325, lng: 104.1494, emoji: "🐼" },
  { name: "Gorilla", category: "Mammals", country: "Uganda", lat: -1.05, lng: 29.63, emoji: "🦍" },
  { name: "Cobra", category: "Reptiles", country: "India", lat: 23.5937, lng: 78.9629, emoji: "🐍" },
  { name: "Python", category: "Reptiles", country: "Kenya", lat: -1.2921, lng: 36.8219, emoji: "🐍" },
  { name: "Crocodile", category: "Reptiles", country: "Australia", lat: -25.2744, lng: 133.7751, emoji: "🐊" },
  { name: "Iguana", category: "Reptiles", country: "Brazil", lat: -14.235, lng: -51.9253, emoji: "🦎" },
  { name: "Komodo Dragon", category: "Reptiles", country: "Indonesia", lat: -8.3405, lng: 115.092, emoji: "🦎" },
  { name: "Eagle", category: "Birds", country: "USA", lat: 37.0902, lng: -95.7129, emoji: "🦅" },
  { name: "Peacock", category: "Birds", country: "India", lat: 20.5937, lng: 78.9629, emoji: "🦚" },
  { name: "Penguin", category: "Birds", country: "Antarctica", lat: -75.2509, lng: -0.0714, emoji: "🐧" },
  { name: "Owl", category: "Birds", country: "UK", lat: 55.3781, lng: -3.436, emoji: "🦉" },
  { name: "Flamingo", category: "Birds", country: "Kenya", lat: -1.2921, lng: 36.8219, emoji: "🦩" },
  { name: "Parrot", category: "Birds", country: "Brazil", lat: -3.4653, lng: -62.2159, emoji: "🦜" },
  { name: "Shark", category: "Aquatic", country: "Pacific Ocean", lat: -15.0, lng: -150.0, emoji: "🦈" },
  { name: "Dolphin", category: "Aquatic", country: "Atlantic Ocean", lat: 0.0, lng: -30.0, emoji: "🐬" },
  { name: "Whale", category: "Aquatic", country: "Indian Ocean", lat: -20.0, lng: 80.0, emoji: "🐋" },
  { name: "Octopus", category: "Aquatic", country: "Japan", lat: 36.2048, lng: 138.2529, emoji: "🐙" },
  { name: "Bee", category: "Small Creatures", country: "India", lat: 22.9734, lng: 78.6569, emoji: "🐝" },
  { name: "Butterfly", category: "Small Creatures", country: "Brazil", lat: -14.235, lng: -51.9253, emoji: "🦋" },
  { name: "Frog", category: "Small Creatures", country: "Amazon", lat: -3.4653, lng: -62.2159, emoji: "🐸" },
];

export default function LiveTracking() {
  const [data, setData] = useState([]);
  const [filter, setFilter] = useState("All");
  const [mapReady, setMapReady] = useState(false);
  const [lastUpdated, setLastUpdated] = useState("");

  useEffect(() => {
    setMapReady(true);
    const today = new Date().toDateString();
    const savedDate = localStorage.getItem("trackDate");
    let updatedData = [];

    if (savedDate !== today) {
      updatedData = baseTrackingData.map(a => ({
        ...a,
        distance: Math.floor(Math.random() * 45) + 5,
        lat: a.lat + (Math.random() - 0.5) * 0.8,
        lng: a.lng + (Math.random() - 0.5) * 0.8,
      }));
      localStorage.setItem("trackData", JSON.stringify(updatedData));
      localStorage.setItem("trackDate", today);
    } else {
      const saved = localStorage.getItem("trackData");
      updatedData = saved ? JSON.parse(saved) : baseTrackingData.map(a => ({ ...a, distance: 15 }));
    }

    setData(updatedData);
    setLastUpdated(new Date().toLocaleTimeString());
  }, []);

  const allCategories = ["All", ...new Set(baseTrackingData.map(a => a.category))];
  const filtered = filter === "All" ? data : data.filter(a => a.category === filter);

  return (
    <div className="tracking-page">
      <div className="tracking-header">
        <h1 className="page-title">📍 Live Animal Tracking</h1>
        <p className="page-subtitle">Real-time location data for {data.length} animals worldwide · Resets daily</p>
        {lastUpdated && <div className="tracking-updated">🕐 Updated: {lastUpdated}</div>}
      </div>

      <div className="tracking-controls">
        <div className="tracking-filter">
          {allCategories.map(cat => (
            <button
              key={cat}
              className={`tracking-filter-btn ${filter === cat ? "active" : ""}`}
              onClick={() => setFilter(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
        <span className="tracking-count">🐾 {filtered.length} animals tracked</span>
      </div>

      {mapReady && (
        <div className="tracking-map-wrap">
          <MapContainer center={[20, 0]} zoom={2} style={{ height: "500px", width: "100%", borderRadius: "12px" }} scrollWheelZoom={false}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {filtered.map((animal, i) => (
              <Marker key={i} position={[animal.lat, animal.lng]} icon={getColorIcon(animal.category)}>
                <Popup>
                  <div style={{ minWidth: "160px", fontFamily: "inherit" }}>
                    <div style={{ fontSize: "2rem", textAlign: "center", marginBottom: "6px" }}>{animal.emoji}</div>
                    <div style={{ fontWeight: 800, fontSize: "1rem", marginBottom: "4px" }}>{animal.name}</div>
                    <div style={{ color: "#555", fontSize: "0.82rem" }}>🏷️ {animal.category}</div>
                    <div style={{ color: "#555", fontSize: "0.82rem" }}>📍 {animal.country}</div>
                    <div style={{ color: "#16a34a", fontWeight: 700, fontSize: "0.9rem", marginTop: "8px", padding: "4px 8px", background: "#f0fdf4", borderRadius: "6px" }}>
                      🚶 Today: {animal.distance} km traveled
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      )}

      <div className="tracking-list">
        <h3>Animal Movement Report — {new Date().toDateString()}</h3>
        <div className="tracking-grid">
          {filtered.map((animal, i) => (
            <div key={i} className="tracking-card">
              <div className="tracking-card-emoji">{animal.emoji}</div>
              <div className="tracking-card-info">
                <div className="tracking-card-name">{animal.name}</div>
                <div className="tracking-card-cat">{animal.category} · {animal.country}</div>
                <div className="tracking-card-coords">{animal.lat.toFixed(3)}°, {animal.lng.toFixed(3)}°</div>
              </div>
              <div className="tracking-card-distance">
                <span className="distance-num">{animal.distance}</span>
                <span className="distance-unit">km/day</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
