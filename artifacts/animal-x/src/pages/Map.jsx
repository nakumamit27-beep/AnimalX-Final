import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import zoos from "../data/zoos";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const greenIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
});

export default function Map() {
  const [filterCountry, setFilterCountry] = useState("All");
  const [searchZoo, setSearchZoo] = useState("");
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => { setMapReady(true); }, []);

  const countries = ["All", ...new Set(zoos.map(z => z.country))].sort();
  const filteredZoos = zoos.filter(z => {
    const matchCountry = filterCountry === "All" || z.country === filterCountry;
    const matchSearch = z.name.toLowerCase().includes(searchZoo.toLowerCase()) ||
      z.country.toLowerCase().includes(searchZoo.toLowerCase());
    return matchCountry && matchSearch;
  });

  return (
    <div className="map-page">
      <div className="map-header">
        <h1 className="page-title">Zoo World Map</h1>
        <p className="page-subtitle">Explore {zoos.length}+ zoos across {new Set(zoos.map(z => z.country)).size} countries</p>
      </div>

      <div className="map-controls">
        <input
          type="search"
          className="search-input"
          placeholder="Search zoos..."
          value={searchZoo}
          onChange={e => setSearchZoo(e.target.value)}
          style={{ maxWidth: "220px" }}
        />
        <select className="country-select" value={filterCountry} onChange={e => setFilterCountry(e.target.value)}>
          {countries.map(c => (
            <option key={c} value={c}>{c}{c !== "All" ? ` (${zoos.filter(z => z.country === c).length})` : ""}</option>
          ))}
        </select>
        <span className="zoo-count">🗺️ {filteredZoos.length} zoos</span>
      </div>

      {mapReady && (
        <div className="leaflet-map-wrap">
          <MapContainer
            center={[20, 0]}
            zoom={2}
            style={{ height: "500px", width: "100%", borderRadius: "12px" }}
            scrollWheelZoom={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {filteredZoos.map(zoo => (
              <Marker key={zoo.id} position={[zoo.lat, zoo.lng]} icon={greenIcon}>
                <Popup>
                  <div className="map-popup-leaflet">
                    {zoo.image && (
                      <img src={zoo.image} alt={zoo.name} style={{ width: "100%", height: "100px", objectFit: "cover", borderRadius: "6px", marginBottom: "8px" }} onError={e => { e.target.style.display = "none"; }} />
                    )}
                    <div style={{ fontWeight: 700, fontSize: "0.95rem", marginBottom: "4px" }}>🦁 {zoo.name}</div>
                    <div style={{ color: "#555", fontSize: "0.82rem" }}>📍 {zoo.country}</div>
                    <div style={{ color: "#555", fontSize: "0.82rem" }}>🐾 {zoo.animals} animals</div>
                    <div style={{ color: "#555", fontSize: "0.82rem" }}>⭐ {zoo.rating}/5.0</div>
                    <div style={{ color: "#888", fontSize: "0.75rem", marginTop: "4px" }}>{zoo.lat.toFixed(3)}°, {zoo.lng.toFixed(3)}°</div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      )}

      <div className="zoo-list">
        <h3>Zoo Directory ({filteredZoos.length})</h3>
        <div className="zoo-grid">
          {filteredZoos.slice(0, 50).map(zoo => (
            <div key={zoo.id} className="zoo-card">
              {zoo.image && (
                <img
                  src={zoo.image}
                  alt={zoo.name}
                  className="zoo-card-img"
                  loading="lazy"
                  onError={e => { e.target.style.display = "none"; }}
                />
              )}
              <div className="zoo-card-name">🦁 {zoo.name}</div>
              <div className="zoo-card-country">📍 {zoo.country}</div>
              <div className="zoo-card-meta">
                <span>🐾 {zoo.animals}</span>
                <span>⭐ {zoo.rating}</span>
              </div>
            </div>
          ))}
        </div>
        {filteredZoos.length > 50 && (
          <p className="more-zoos">+{filteredZoos.length - 50} more zoos — filter or search to narrow down</p>
        )}
      </div>
    </div>
  );
}
