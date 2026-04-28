import { useState, useEffect, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, LayerGroup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import zoos from "../data/zoos";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const zooIcon = L.divIcon({
  className: "zoo-emoji-marker",
  html: '<div class="zem-bubble">🏛️</div>',
  iconSize: [38, 38],
  iconAnchor: [19, 38],
  popupAnchor: [0, -34],
});

function animalIcon(emoji) {
  return L.divIcon({
    className: "animal-emoji-marker",
    html: `<div class="aem-bubble">${emoji}</div>`,
    iconSize: [42, 42],
    iconAnchor: [21, 21],
    popupAnchor: [0, -22],
  });
}

const baseTrackingData = [
  { name: "Lion", category: "Mammals", country: "Kenya", lat: -1.286, lng: 36.817, emoji: "🦁" },
  { name: "Tiger", category: "Mammals", country: "India", lat: 26.847, lng: 80.946, emoji: "🐯" },
  { name: "Elephant", category: "Mammals", country: "Thailand", lat: 15.870, lng: 100.992, emoji: "🐘" },
  { name: "Wolf", category: "Mammals", country: "USA", lat: 44.500, lng: -110.500, emoji: "🐺" },
  { name: "Bear", category: "Mammals", country: "Canada", lat: 56.130, lng: -106.347, emoji: "🐻" },
  { name: "Panda", category: "Mammals", country: "China", lat: 30.732, lng: 104.149, emoji: "🐼" },
  { name: "Gorilla", category: "Mammals", country: "Uganda", lat: -1.050, lng: 29.630, emoji: "🦍" },
  { name: "Leopard", category: "Mammals", country: "South Africa", lat: -23.990, lng: 31.554, emoji: "🐆" },
  { name: "Cheetah", category: "Mammals", country: "Namibia", lat: -22.957, lng: 18.490, emoji: "🐆" },
  { name: "Polar Bear", category: "Mammals", country: "Greenland", lat: 71.706, lng: -42.604, emoji: "🐻‍❄️" },
  { name: "Kangaroo", category: "Mammals", country: "Australia", lat: -25.274, lng: 133.775, emoji: "🦘" },
  { name: "Koala", category: "Mammals", country: "Australia", lat: -33.868, lng: 151.209, emoji: "🐨" },
  { name: "Giraffe", category: "Mammals", country: "Tanzania", lat: -2.330, lng: 34.830, emoji: "🦒" },
  { name: "Zebra", category: "Mammals", country: "Botswana", lat: -22.328, lng: 24.685, emoji: "🦓" },
  { name: "Cobra", category: "Reptiles", country: "India", lat: 23.594, lng: 78.963, emoji: "🐍" },
  { name: "Python", category: "Reptiles", country: "Indonesia", lat: -0.789, lng: 113.921, emoji: "🐍" },
  { name: "Crocodile", category: "Reptiles", country: "Australia", lat: -12.462, lng: 130.842, emoji: "🐊" },
  { name: "Iguana", category: "Reptiles", country: "Brazil", lat: -14.235, lng: -51.925, emoji: "🦎" },
  { name: "Komodo Dragon", category: "Reptiles", country: "Indonesia", lat: -8.341, lng: 115.092, emoji: "🦎" },
  { name: "Sea Turtle", category: "Reptiles", country: "Costa Rica", lat: 9.748, lng: -83.753, emoji: "🐢" },
  { name: "Eagle", category: "Birds", country: "USA", lat: 37.090, lng: -95.713, emoji: "🦅" },
  { name: "Peacock", category: "Birds", country: "India", lat: 20.594, lng: 78.963, emoji: "🦚" },
  { name: "Penguin", category: "Birds", country: "Antarctica", lat: -75.251, lng: -0.071, emoji: "🐧" },
  { name: "Owl", category: "Birds", country: "UK", lat: 55.378, lng: -3.436, emoji: "🦉" },
  { name: "Flamingo", category: "Birds", country: "Kenya", lat: -1.292, lng: 36.822, emoji: "🦩" },
  { name: "Parrot", category: "Birds", country: "Brazil", lat: -3.465, lng: -62.216, emoji: "🦜" },
  { name: "Hummingbird", category: "Birds", country: "Ecuador", lat: -1.831, lng: -78.183, emoji: "🐦" },
  { name: "Toucan", category: "Birds", country: "Costa Rica", lat: 10.000, lng: -84.000, emoji: "🦜" },
  { name: "Shark", category: "Aquatic", country: "Australia", lat: -25.000, lng: 152.000, emoji: "🦈" },
  { name: "Dolphin", category: "Aquatic", country: "Bahamas", lat: 25.034, lng: -77.396, emoji: "🐬" },
  { name: "Whale", category: "Aquatic", country: "Iceland", lat: 64.963, lng: -19.021, emoji: "🐋" },
  { name: "Octopus", category: "Aquatic", country: "Japan", lat: 36.205, lng: 138.253, emoji: "🐙" },
  { name: "Orca", category: "Aquatic", country: "Norway", lat: 60.472, lng: 8.469, emoji: "🐋" },
  { name: "Sea Lion", category: "Aquatic", country: "Galápagos", lat: -0.953, lng: -90.965, emoji: "🦭" },
  { name: "Bee", category: "Small Creatures", country: "France", lat: 46.227, lng: 2.213, emoji: "🐝" },
  { name: "Butterfly", category: "Small Creatures", country: "Mexico", lat: 19.704, lng: -101.193, emoji: "🦋" },
  { name: "Frog", category: "Small Creatures", country: "Peru", lat: -3.465, lng: -75.000, emoji: "🐸" },
  { name: "Spider", category: "Small Creatures", country: "Australia", lat: -27.470, lng: 153.022, emoji: "🕷️" },
];

export default function Map() {
  const [trackData, setTrackData] = useState([]);
  const [showZoos, setShowZoos] = useState(true);
  const [showAnimals, setShowAnimals] = useState(true);
  const [filterCategory, setFilterCategory] = useState("All");
  const [filterCountry, setFilterCountry] = useState("All");
  const [search, setSearch] = useState("");
  const [mapReady, setMapReady] = useState(false);
  const [lastUpdated, setLastUpdated] = useState("");

  useEffect(() => {
    setMapReady(true);
    const today = new Date().toDateString();
    const savedDate = localStorage.getItem("trackDate");
    let updated = [];

    if (savedDate !== today) {
      updated = baseTrackingData.map((a) => ({
        ...a,
        distance: Math.floor(Math.random() * 45) + 5,
        lat: a.lat + (Math.random() - 0.5) * 0.8,
        lng: a.lng + (Math.random() - 0.5) * 0.8,
      }));
      localStorage.setItem("trackData", JSON.stringify(updated));
      localStorage.setItem("trackDate", today);
    } else {
      const saved = localStorage.getItem("trackData");
      updated = saved ? JSON.parse(saved) : baseTrackingData.map((a) => ({ ...a, distance: 15 }));
    }

    setTrackData(updated);
    setLastUpdated(new Date().toLocaleTimeString());
  }, []);

  const allCountries = useMemo(() => {
    const set = new Set([...zoos.map((z) => z.country), ...baseTrackingData.map((a) => a.country)]);
    return ["All", ...Array.from(set).sort()];
  }, []);

  const allCategories = useMemo(() => {
    return ["All", ...Array.from(new Set(baseTrackingData.map((a) => a.category)))];
  }, []);

  const filteredZoos = useMemo(() => {
    return zoos.filter((z) => {
      if (filterCountry !== "All" && z.country !== filterCountry) return false;
      if (search && !(z.name.toLowerCase().includes(search.toLowerCase()) || z.country.toLowerCase().includes(search.toLowerCase()))) return false;
      return true;
    });
  }, [filterCountry, search]);

  const filteredAnimals = useMemo(() => {
    return trackData.filter((a) => {
      if (filterCategory !== "All" && a.category !== filterCategory) return false;
      if (filterCountry !== "All" && a.country !== filterCountry) return false;
      if (search && !(a.name.toLowerCase().includes(search.toLowerCase()) || a.country.toLowerCase().includes(search.toLowerCase()))) return false;
      return true;
    });
  }, [trackData, filterCategory, filterCountry, search]);

  const totalCountries = useMemo(() => {
    return new Set([...zoos.map((z) => z.country), ...baseTrackingData.map((a) => a.country)]).size;
  }, []);

  function openInGoogleMaps(lat, lng) {
    window.open(`https://www.google.com/maps?q=${lat},${lng}`, "_blank");
  }

  return (
    <div className="map-page">
      <div className="map-header">
        <h1 className="page-title">🗺️ Global Wildlife Map</h1>
        <p className="page-subtitle">
          {zoos.length}+ zoos and {trackData.length} live-tracked animals across {totalCountries} countries
          {lastUpdated && <span className="tracking-updated"> · Updated {lastUpdated}</span>}
        </p>
      </div>

      <div className="map-toggle-row">
        <label className="layer-toggle">
          <input type="checkbox" checked={showZoos} onChange={(e) => setShowZoos(e.target.checked)} />
          <span>🏛️ Zoos ({filteredZoos.length})</span>
        </label>
        <label className="layer-toggle">
          <input type="checkbox" checked={showAnimals} onChange={(e) => setShowAnimals(e.target.checked)} />
          <span>🦁 Live Tracking ({filteredAnimals.length})</span>
        </label>
      </div>

      <div className="map-controls">
        <input
          type="search"
          className="search-input"
          placeholder="Search zoos or animals..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ flex: 1, minWidth: 160 }}
        />
        <select className="country-select" value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
          {allCategories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select className="country-select" value={filterCountry} onChange={(e) => setFilterCountry(e.target.value)}>
          {allCountries.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {mapReady && (
        <div className="leaflet-map-wrap">
          <MapContainer
            center={[20, 0]}
            zoom={2}
            style={{ height: "520px", width: "100%", borderRadius: "12px" }}
            scrollWheelZoom={false}
            worldCopyJump
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {showZoos && (
              <LayerGroup>
                {filteredZoos.map((zoo, i) => (
                  <Marker key={`z${i}`} position={[zoo.lat, zoo.lng]} icon={zooIcon}>
                    <Popup>
                      <div className="map-popup-leaflet">
                        {zoo.image && (
                          <img
                            src={zoo.image}
                            alt={zoo.name}
                            style={{ width: "100%", height: "90px", objectFit: "cover", borderRadius: "6px", marginBottom: "8px" }}
                            onError={(e) => { e.target.style.display = "none"; }}
                          />
                        )}
                        <div style={{ fontWeight: 700, fontSize: "0.95rem", marginBottom: "4px" }}>🏛️ {zoo.name}</div>
                        <div style={{ color: "#555", fontSize: "0.82rem" }}>📍 {zoo.country}</div>
                        <div style={{ color: "#555", fontSize: "0.82rem" }}>🐾 {zoo.animals} animals · ⭐ {zoo.rating}</div>
                        <button
                          onClick={() => openInGoogleMaps(zoo.lat, zoo.lng)}
                          className="popup-btn"
                        >📍 Open in Maps</button>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </LayerGroup>
            )}

            {showAnimals && (
              <LayerGroup>
                {filteredAnimals.map((a, i) => (
                  <Marker key={`a${i}`} position={[a.lat, a.lng]} icon={animalIcon(a.emoji)}>
                    <Popup>
                      <div className="map-popup-leaflet">
                        <div style={{ fontSize: "2.4rem", textAlign: "center", marginBottom: "4px" }}>{a.emoji}</div>
                        <div style={{ fontWeight: 800, fontSize: "1rem", marginBottom: "4px" }}>{a.name}</div>
                        <div style={{ color: "#555", fontSize: "0.82rem" }}>🏷️ {a.category} · 📍 {a.country}</div>
                        <div style={{ color: "#16a34a", fontWeight: 700, fontSize: "0.9rem", marginTop: "6px", padding: "4px 8px", background: "#f0fdf4", borderRadius: "6px", textAlign: "center" }}>
                          🚶 {a.distance ?? 15} km today
                        </div>
                        <button onClick={() => openInGoogleMaps(a.lat, a.lng)} className="popup-btn" style={{ marginTop: 6 }}>
                          📍 Open in Maps
                        </button>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </LayerGroup>
            )}
          </MapContainer>
        </div>
      )}

      {showAnimals && filteredAnimals.length > 0 && (
        <div className="tracking-list">
          <h3>🦁 Live Animal Tracking — {new Date().toDateString()}</h3>
          <div className="tracking-grid">
            {filteredAnimals.map((animal, i) => (
              <div key={i} className="tracking-card" onClick={() => openInGoogleMaps(animal.lat, animal.lng)} style={{ cursor: "pointer" }}>
                <div className="tracking-card-emoji">{animal.emoji}</div>
                <div className="tracking-card-info">
                  <div className="tracking-card-name">{animal.name}</div>
                  <div className="tracking-card-cat">{animal.category} · {animal.country}</div>
                  <div className="tracking-card-coords">{animal.lat.toFixed(3)}°, {animal.lng.toFixed(3)}°</div>
                </div>
                <div className="tracking-card-distance">
                  <span className="distance-num">{animal.distance ?? 15}</span>
                  <span className="distance-unit">km/day</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {showZoos && filteredZoos.length > 0 && (
        <div className="zoo-list">
          <h3>🏛️ Zoo Directory ({filteredZoos.length})</h3>
          <div className="zoo-grid">
            {filteredZoos.slice(0, 60).map((zoo, idx) => (
              <div
                key={idx}
                className="zoo-card zoo-card-clickable"
                onClick={() => openInGoogleMaps(zoo.lat, zoo.lng)}
              >
                {zoo.image && (
                  <img
                    src={zoo.image}
                    alt={zoo.name}
                    className="zoo-card-img"
                    loading="lazy"
                    onError={(e) => { e.target.style.display = "none"; }}
                  />
                )}
                <div className="zoo-card-name">🏛️ {zoo.name}</div>
                <div className="zoo-card-country">📍 {zoo.country}</div>
                <div className="zoo-card-meta">
                  <span>🐾 {zoo.animals}</span>
                  <span>⭐ {zoo.rating}</span>
                  <span className="zoo-map-hint">🗺️ Maps</span>
                </div>
              </div>
            ))}
          </div>
          {filteredZoos.length > 60 && (
            <p className="more-zoos">+{filteredZoos.length - 60} more zoos — refine filters above</p>
          )}
        </div>
      )}
    </div>
  );
}
