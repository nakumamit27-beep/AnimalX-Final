import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { MapContainer, TileLayer, Marker, Popup, LayerGroup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import zoos from "../data/zoos";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const zooIcon = L.divIcon({ className:"zoo-emoji-marker", html:'<div class="zem-bubble">🏛️</div>', iconSize:[38,38], iconAnchor:[19,38], popupAnchor:[0,-34] });
const myLocationIcon = L.divIcon({ className:"my-location-marker", html:'<div class="mlm-outer"><div class="mlm-inner">📍</div></div>', iconSize:[40,40], iconAnchor:[20,40], popupAnchor:[0,-36] });

function animalIcon(emoji) {
  return L.divIcon({ className:"animal-emoji-marker", html:`<div class="aem-bubble">${emoji}</div>`, iconSize:[42,42], iconAnchor:[21,21], popupAnchor:[0,-22] });
}
function migrationIcon(emoji) {
  return L.divIcon({ className:"migration-marker", html:`<div class="migm-bubble">${emoji}</div>`, iconSize:[48,48], iconAnchor:[24,24], popupAnchor:[0,-24] });
}

/* ─── Tracking data — 50 GPS-tracked animals with rich metadata ─── */
const TRACKING_DATA = [
  /* === DEMO DATA — GPS positions are representative, not real-time === */
  { id:"KE-LN-001", name:"Simba (Lion)", species:"Panthera leo", cat:"Mammals", country:"Kenya", lat:-1.286,lng:36.817, emoji:"🦁", status:"Resting", battery:78, speed:0, lastSeen:"2 min ago" },
  { id:"IN-TG-007", name:"Roya (Tiger)", species:"Panthera tigris", cat:"Mammals", country:"India", lat:26.847,lng:80.946, emoji:"🐯", status:"Moving", battery:91, speed:8, lastSeen:"1 min ago" },
  { id:"TH-EL-003", name:"Nong (Elephant)", species:"Elephas maximus", cat:"Mammals", country:"Thailand", lat:15.870,lng:100.992, emoji:"🐘", status:"Feeding", battery:65, speed:2, lastSeen:"5 min ago" },
  { id:"US-WL-012", name:"Ghost (Wolf)", species:"Canis lupus", cat:"Mammals", country:"USA", lat:44.500,lng:-110.500, emoji:"🐺", status:"Moving", battery:83, speed:22, lastSeen:"3 min ago" },
  { id:"CA-BR-005", name:"Kodiak (Bear)", species:"Ursus arctos", cat:"Mammals", country:"Canada", lat:56.130,lng:-106.347, emoji:"🐻", status:"Feeding", battery:72, speed:3, lastSeen:"8 min ago" },
  { id:"CN-PD-002", name:"Xiao Bao (Panda)", species:"Ailuropoda melanoleuca", cat:"Mammals", country:"China", lat:30.732,lng:104.149, emoji:"🐼", status:"Resting", battery:89, speed:0, lastSeen:"12 min ago" },
  { id:"UG-GR-009", name:"Silverback (Gorilla)", species:"Gorilla beringei", cat:"Mammals", country:"Uganda", lat:-1.050,lng:29.630, emoji:"🦍", status:"Feeding", battery:55, speed:1, lastSeen:"4 min ago" },
  { id:"ZA-LP-008", name:"Storm (Leopard)", species:"Panthera pardus", cat:"Mammals", country:"South Africa", lat:-23.990,lng:31.554, emoji:"🐆", status:"Moving", battery:67, speed:15, lastSeen:"2 min ago" },
  { id:"NA-CH-004", name:"Blaze (Cheetah)", species:"Acinonyx jubatus", cat:"Mammals", country:"Namibia", lat:-22.957,lng:18.490, emoji:"🐆", status:"Resting", battery:94, speed:0, lastSeen:"6 min ago" },
  { id:"GL-PB-011", name:"Aurora (Polar Bear)", species:"Ursus maritimus", cat:"Mammals", country:"Greenland", lat:71.706,lng:-42.604, emoji:"🐻‍❄️", status:"Moving", battery:41, speed:6, lastSeen:"9 min ago" },
  { id:"AU-KR-014", name:"Skippy (Kangaroo)", species:"Macropus rufus", cat:"Mammals", country:"Australia", lat:-25.274,lng:133.775, emoji:"🦘", status:"Feeding", battery:88, speed:0, lastSeen:"15 min ago" },
  { id:"AU-KO-015", name:"Gumleaf (Koala)", species:"Phascolarctos cinereus", cat:"Mammals", country:"Australia", lat:-33.868,lng:151.209, emoji:"🐨", status:"Resting", battery:76, speed:0, lastSeen:"20 min ago" },
  { id:"TZ-GR-016", name:"Twiga (Giraffe)", species:"Giraffa camelopardalis", cat:"Mammals", country:"Tanzania", lat:-2.330,lng:34.830, emoji:"🦒", status:"Feeding", battery:82, speed:1, lastSeen:"3 min ago" },
  { id:"BW-ZB-017", name:"Stripe (Zebra)", species:"Equus quagga", cat:"Mammals", country:"Botswana", lat:-22.328,lng:24.685, emoji:"🦓", status:"Moving", battery:90, speed:18, lastSeen:"1 min ago" },
  { id:"SN-HP-025", name:"Red (Hippopotamus)", species:"Hippopotamus amphibius", cat:"Mammals", country:"Senegal", lat:14.500,lng:-14.450, emoji:"🦛", status:"Resting", battery:63, speed:0, lastSeen:"7 min ago" },
  { id:"IN-CO-018", name:"Kaalu (King Cobra)", species:"Ophiophagus hannah", cat:"Reptiles", country:"India", lat:23.594,lng:78.963, emoji:"🐍", status:"Moving", battery:71, speed:4, lastSeen:"5 min ago" },
  { id:"ID-PY-019", name:"Python-7 (Reticulated Python)", species:"Malayopython reticulatus", cat:"Reptiles", country:"Indonesia", lat:-0.789,lng:113.921, emoji:"🐍", status:"Resting", battery:58, speed:0, lastSeen:"22 min ago" },
  { id:"AU-CR-020", name:"Croc-Alpha (Saltwater Crocodile)", species:"Crocodylus porosus", cat:"Reptiles", country:"Australia", lat:-12.462,lng:130.842, emoji:"🐊", status:"Resting", battery:49, speed:0, lastSeen:"11 min ago" },
  { id:"ID-KD-021", name:"Ora (Komodo Dragon)", species:"Varanus komodoensis", cat:"Reptiles", country:"Indonesia", lat:-8.341,lng:115.092, emoji:"🦎", status:"Moving", battery:77, speed:6, lastSeen:"4 min ago" },
  { id:"CR-ST-022", name:"Lucia (Sea Turtle)", species:"Dermochelys coriacea", cat:"Reptiles", country:"Costa Rica", lat:9.748,lng:-83.753, emoji:"🐢", status:"Moving", battery:85, speed:12, lastSeen:"2 min ago" },
  { id:"US-EA-023", name:"Liberty (Bald Eagle)", species:"Haliaeetus leucocephalus", cat:"Birds", country:"USA", lat:37.090,lng:-95.713, emoji:"🦅", status:"Moving", battery:92, speed:60, lastSeen:"1 min ago" },
  { id:"IN-PC-024", name:"Raja (Peacock)", species:"Pavo cristatus", cat:"Birds", country:"India", lat:20.594,lng:78.963, emoji:"🦚", status:"Resting", battery:68, speed:0, lastSeen:"18 min ago" },
  { id:"AQ-PG-026", name:"Emperor-3 (Penguin)", species:"Aptenodytes forsteri", cat:"Birds", country:"Antarctica", lat:-75.251,lng:-0.071, emoji:"🐧", status:"Moving", battery:74, speed:7, lastSeen:"6 min ago" },
  { id:"UK-OW-027", name:"Athena (Barn Owl)", species:"Tyto alba", cat:"Birds", country:"UK", lat:55.378,lng:-3.436, emoji:"🦉", status:"Resting", battery:81, speed:0, lastSeen:"30 min ago" },
  { id:"KE-FL-028", name:"Flamingo-Lake (Flamingo)", species:"Phoenicopterus roseus", cat:"Birds", country:"Kenya", lat:-1.292,lng:36.822, emoji:"🦩", status:"Feeding", battery:87, speed:0, lastSeen:"4 min ago" },
  { id:"BR-PA-029", name:"Macaw-7 (Scarlet Macaw)", species:"Ara macao", cat:"Birds", country:"Brazil", lat:-3.465,lng:-62.216, emoji:"🦜", status:"Moving", battery:93, speed:45, lastSeen:"2 min ago" },
  { id:"EC-HB-030", name:"Colibri (Hummingbird)", species:"Calypte anna", cat:"Birds", country:"Ecuador", lat:-1.831,lng:-78.183, emoji:"🐦", status:"Feeding", battery:69, speed:0, lastSeen:"8 min ago" },
  { id:"AU-SH-031", name:"White (Great White Shark)", species:"Carcharodon carcharias", cat:"Aquatic", country:"Australia", lat:-25.000,lng:152.000, emoji:"🦈", status:"Moving", battery:54, speed:35, lastSeen:"3 min ago" },
  { id:"BS-DP-032", name:"Flipper (Bottlenose Dolphin)", species:"Tursiops truncatus", cat:"Aquatic", country:"Bahamas", lat:25.034,lng:-77.396, emoji:"🐬", status:"Moving", battery:88, speed:28, lastSeen:"1 min ago" },
  { id:"IS-HW-033", name:"Moby (Humpback Whale)", species:"Megaptera novaeangliae", cat:"Aquatic", country:"Iceland", lat:64.963,lng:-19.021, emoji:"🐋", status:"Moving", battery:61, speed:18, lastSeen:"5 min ago" },
  { id:"JP-OC-034", name:"Tako (Giant Pacific Octopus)", species:"Enteroctopus dofleini", cat:"Aquatic", country:"Japan", lat:36.205,lng:138.253, emoji:"🐙", status:"Resting", battery:79, speed:0, lastSeen:"14 min ago" },
  { id:"NO-OR-035", name:"Grampus (Orca)", species:"Orcinus orca", cat:"Aquatic", country:"Norway", lat:60.472,lng:8.469, emoji:"🐋", status:"Moving", battery:86, speed:40, lastSeen:"2 min ago" },
  { id:"EC-SL-036", name:"Leo (Galápagos Sea Lion)", species:"Zalophus wollebaeki", cat:"Aquatic", country:"Galápagos", lat:-0.953,lng:-90.965, emoji:"🦭", status:"Resting", battery:73, speed:0, lastSeen:"10 min ago" },
  { id:"NO-OR-045", name:"Narwhal-F3 (Narwhal)", species:"Monodon monoceros", cat:"Aquatic", country:"Norway", lat:70.920,lng:-23.860, emoji:"🦄", status:"Moving", battery:62, speed:8, lastSeen:"4 min ago" },
  { id:"FR-BE-037", name:"Apis (Honey Bee)", species:"Apis mellifera", cat:"Small Creatures", country:"France", lat:46.227,lng:2.213, emoji:"🐝", status:"Moving", battery:null, speed:25, lastSeen:"N/A" },
  { id:"MX-MB-038", name:"Monarch-Colony (Monarch Butterfly)", species:"Danaus plexippus", cat:"Small Creatures", country:"Mexico", lat:19.704,lng:-101.193, emoji:"🦋", status:"Moving", battery:null, speed:20, lastSeen:"N/A" },
  { id:"PE-PF-039", name:"Ranitomeya (Poison Frog)", species:"Ranitomeya amazonica", cat:"Small Creatures", country:"Peru", lat:-3.465,lng:-75.000, emoji:"🐸", status:"Resting", battery:null, speed:0, lastSeen:"N/A" },
  { id:"AU-SP-040", name:"Goldie (Huntsman Spider)", species:"Isopeda vasta", cat:"Small Creatures", country:"Australia", lat:-27.470,lng:153.022, emoji:"🕷️", status:"Resting", battery:null, speed:0, lastSeen:"N/A" },
  { id:"KE-WD-041", name:"Painted Wolf (African Wild Dog)", species:"Lycaon pictus", cat:"Mammals", country:"Kenya", lat:-1.940,lng:34.180, emoji:"🐕", status:"Moving", battery:70, speed:12, lastSeen:"3 min ago" },
  { id:"ID-OR-042", name:"Borneo (Orangutan)", species:"Pongo pygmaeus", cat:"Mammals", country:"Indonesia", lat:0.961,lng:114.559, emoji:"🦧", status:"Resting", battery:55, speed:0, lastSeen:"25 min ago" },
  { id:"AR-CG-043", name:"Condor-7 (Andean Condor)", species:"Vultur gryphus", cat:"Birds", country:"Argentina", lat:-32.500,lng:-70.100, emoji:"🦅", status:"Moving", battery:84, speed:55, lastSeen:"2 min ago" },
  { id:"ET-WB-044", name:"Abyssinian (Wild Ass)", species:"Equus africanus", cat:"Mammals", country:"Ethiopia", lat:9.150,lng:40.490, emoji:"🫏", status:"Moving", battery:66, speed:14, lastSeen:"6 min ago" },
  { id:"IN-RH-046", name:"Genda (Indian Rhino)", species:"Rhinoceros unicornis", cat:"Mammals", country:"India", lat:26.583,lng:93.170, emoji:"🦏", status:"Feeding", battery:77, speed:0, lastSeen:"7 min ago" },
  { id:"AU-DT-047", name:"Platypus-M7 (Platypus)", species:"Ornithorhynchus anatinus", cat:"Mammals", country:"Australia", lat:-37.800,lng:145.000, emoji:"🦆", status:"Moving", battery:82, speed:5, lastSeen:"3 min ago" },
  { id:"CL-PG-048", name:"Magellanic (Penguin colony)", species:"Spheniscus magellanicus", cat:"Birds", country:"Chile", lat:-53.100,lng:-70.900, emoji:"🐧", status:"Resting", battery:null, speed:0, lastSeen:"N/A" },
  { id:"TZ-WL-049", name:"Wildebeest-Herd7K (Wildebeest)", species:"Connochaetes taurinus", cat:"Mammals", country:"Tanzania", lat:-2.180,lng:34.650, emoji:"🐃", status:"Moving", battery:null, speed:25, lastSeen:"N/A" },
  { id:"GR-LY-050", name:"Greenland Lynx (Canada Lynx)", species:"Lynx canadensis", cat:"Mammals", country:"Canada", lat:61.00,lng:-98.50, emoji:"🐈", status:"Moving", battery:75, speed:11, lastSeen:"4 min ago" },
];

/* ─── Wildlife Migration Routes ─── */
const MIGRATION_ROUTES = [
  {
    id:"wildebeest", name:"Wildebeest", emoji:"🐃",
    herdSize:"1.5 million", season:"Jun–Oct", status:"LIVE",
    origin:"Serengeti, Tanzania", dest:"Maasai Mara, Kenya",
    color:"#f59e0b",
    route:[[-3.0,34.5],[-2.2,34.0],[-1.5,33.8],[-1.0,34.2],[-0.5,34.8],[-1.2,35.5],[-2.0,35.0]],
    currentPos:[-1.0,34.2], speed:"25 km/day", dist:"3,000 km", info:"The world's greatest land migration — 1.5 million wildebeest cross the Mara River risking crocodile attacks."
  },
  {
    id:"caribou", name:"Caribou", emoji:"🦌",
    herdSize:"500,000", season:"May–Sep", status:"SEASONAL",
    origin:"Boreal Forest, Canada", dest:"Arctic Tundra, Nunavut",
    color:"#8b5cf6",
    route:[[60,-95],[64,-90],[67,-85],[69,-80],[70,-75],[71,-70]],
    currentPos:[67,-85], speed:"19 km/day", dist:"5,000 km", info:"Caribou undertake the longest land migration of any terrestrial mammal — following ancient routes for thousands of years."
  },
  {
    id:"humpback", name:"Humpback Whale", emoji:"🐋",
    herdSize:"80,000 world pop", season:"Nov–Apr", status:"SEASONAL",
    origin:"Antarctic feeding grounds", dest:"Tropical breeding grounds",
    color:"#0ea5e9",
    route:[[-60,-40],[-40,-20],[-20,-10],[0,-10],[10,-15],[20,-20],[10,-25]],
    currentPos:[0,-10], speed:"80 km/day", dist:"20,000 km", info:"Humpback whales sing the longest and most complex songs in the animal kingdom during breeding season."
  },
  {
    id:"monarch", name:"Monarch Butterfly", emoji:"🦋",
    herdSize:"300 million", season:"Sep–Nov", status:"SEASONAL",
    origin:"Canada & N. USA", dest:"Mexico (Michoacán forests)",
    color:"#f97316",
    route:[[45,-80],[40,-85],[35,-90],[30,-95],[25,-100],[20,-100],[19.7,-101.2]],
    currentPos:[30,-95], speed:"150 km/day", dist:"4,800 km", info:"Monarchs navigate 4,800 km using a time-compensated sun compass — their great-grandchildren make the same journey the following year."
  },
  {
    id:"arctic_tern", name:"Arctic Tern", emoji:"🕊️",
    herdSize:"2 million", season:"Year-round", status:"LIVE",
    origin:"Arctic (breeding)", dest:"Antarctic (feeding)",
    color:"#10b981",
    route:[[75,-20],[60,-20],[40,-20],[20,-20],[0,-20],[-20,-15],[-40,-10],[-60,-5],[-70,-15]],
    currentPos:[20,-20], speed:"330 km/day", dist:"70,000 km", info:"Arctic terns see more daylight than any other creature on Earth, flying pole-to-pole and back every year."
  },
  {
    id:"gray_whale", name:"Gray Whale", emoji:"🐋",
    herdSize:"27,000", season:"Dec–Mar", status:"SEASONAL",
    origin:"Bering Sea, Alaska", dest:"Baja California, Mexico",
    color:"#64748b",
    route:[[60,-170],[55,-160],[50,-140],[45,-130],[40,-125],[35,-120],[30,-115],[25,-110]],
    currentPos:[45,-130], speed:"185 km/day", dist:"20,000 km", info:"Gray whales make one of the longest known migrations of any mammal, from Arctic feeding grounds to Mexican lagoons to breed."
  },
];

/* ─── Map Controller (centers on user location) ─── */
function MapController({ userLocation, shouldCenter }) {
  const map = useMap();
  const centered = useRef(false);
  useEffect(() => {
    if (userLocation && !centered.current && shouldCenter) {
      map.setView([userLocation.lat, userLocation.lng], 14, { animate: true });
      centered.current = true;
    }
  }, [userLocation, map, shouldCenter]);
  return null;
}

function RecenterButton({ userLocation }) {
  const map = useMap();
  if (!userLocation) return null;
  return (
    <button
      className="map-recenter-btn"
      onClick={() => map.setView([userLocation.lat, userLocation.lng], 14, { animate: true })}
      title="Go to My Location"
    >
      📍
    </button>
  );
}

export default function Map() {
  const [trackData] = useState(TRACKING_DATA);
  const [showZoos, setShowZoos] = useState(true);
  const [showAnimals, setShowAnimals] = useState(true);
  const [showMigration, setShowMigration] = useState(false);
  const [filterCategory, setFilterCategory] = useState("All");
  const [filterCountry, setFilterCountry] = useState("All");
  const [search, setSearch] = useState("");
  const [mapReady, setMapReady] = useState(false);
  const [lastUpdated, setLastUpdated] = useState("");
  const [userLocation, setUserLocation] = useState(null);
  const [locationStatus, setLocationStatus] = useState("idle"); // idle|loading|granted|denied|error
  const watchId = useRef(null);
  const [shouldCenter, setShouldCenter] = useState(false);

  useEffect(() => {
    setMapReady(true);
    setLastUpdated(new Date().toLocaleTimeString());
    // Auto-request location on page load
    requestUserLocation();
    return () => {
      if (watchId.current) navigator.geolocation.clearWatch(watchId.current);
    };
  }, []);

  function requestUserLocation() {
    if (!navigator.geolocation) {
      setLocationStatus("error");
      return;
    }
    setLocationStatus("loading");
    watchId.current = navigator.geolocation.watchPosition(
      (pos) => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude, accuracy: pos.coords.accuracy });
        setLocationStatus("granted");
        setShouldCenter(true);
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) setLocationStatus("denied");
        else setLocationStatus("error");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 8000 }
    );
  }

  const allCountries = useMemo(() => {
    const set = new Set([...zoos.map(z => z.country), ...trackData.map(a => a.country)]);
    return ["All", ...Array.from(set).sort()];
  }, [trackData]);

  const allCategories = useMemo(() => ["All", ...Array.from(new Set(trackData.map(a => a.cat)))], [trackData]);

  const filteredZoos = useMemo(() => {
    const s = search.toLowerCase();
    return zoos.filter(z => {
      if (filterCountry !== "All" && z.country !== filterCountry) return false;
      if (s && !z.name.toLowerCase().includes(s) && !z.country.toLowerCase().includes(s) && !(z.city||"").toLowerCase().includes(s)) return false;
      return true;
    });
  }, [filterCountry, search]);

  const filteredAnimals = useMemo(() => {
    const s = search.toLowerCase();
    return trackData.filter(a => {
      if (filterCategory !== "All" && a.cat !== filterCategory) return false;
      if (filterCountry !== "All" && a.country !== filterCountry) return false;
      if (s && !a.name.toLowerCase().includes(s) && !a.species.toLowerCase().includes(s) && !a.country.toLowerCase().includes(s)) return false;
      return true;
    });
  }, [trackData, filterCategory, filterCountry, search]);

  const totalCountries = useMemo(() => new Set([...zoos.map(z => z.country), ...trackData.map(a => a.country)]).size, [trackData]);

  function openInGoogleMaps(lat, lng, name) {
    window.open(`https://www.google.com/maps/search/${encodeURIComponent(name || "")}/@${lat},${lng},14z`, "_blank");
  }

  const statusColor = { Moving:"#10b981", Resting:"#6b7280", Feeding:"#f59e0b" };

  return (
    <div className="map-page">
      <div className="map-header">
        <h1 className="page-title">🗺️ Global Wildlife Map</h1>
        <p className="page-subtitle">
          {zoos.length}+ zoos · {trackData.length} tracked animals · {totalCountries} countries
          {lastUpdated && <span className="tracking-updated"> · Updated {lastUpdated}</span>}
        </p>
      </div>

      {/* Layer toggles */}
      <div className="map-toggle-row">
        <label className="layer-toggle">
          <input type="checkbox" checked={showZoos} onChange={e => setShowZoos(e.target.checked)} />
          <span>🏛️ Zoos ({filteredZoos.length})</span>
        </label>
        <label className="layer-toggle">
          <input type="checkbox" checked={showAnimals} onChange={e => setShowAnimals(e.target.checked)} />
          <span>🦁 Tracking ({filteredAnimals.length})</span>
        </label>
        <label className="layer-toggle">
          <input type="checkbox" checked={showMigration} onChange={e => setShowMigration(e.target.checked)} />
          <span>🦋 Migration</span>
        </label>
      </div>

      {/* Location status */}
      {locationStatus === "loading" && <div className="loc-status loading">📡 Detecting your location…</div>}
      {locationStatus === "denied" && <div className="loc-status denied">⚠️ Location permission is required to show your current position. Please enable it in your browser settings.</div>}
      {locationStatus === "granted" && userLocation && <div className="loc-status granted">📍 Showing your live location · Accuracy: {Math.round(userLocation.accuracy || 0)}m</div>}

      {/* Search + filters */}
      <div className="map-controls">
        <input type="search" className="search-input" placeholder="Search zoo, animal or country…" value={search} onChange={e => setSearch(e.target.value)} style={{ flex:1, minWidth:160 }} />
        <select className="country-select" value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
          {allCategories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select className="country-select" value={filterCountry} onChange={e => setFilterCountry(e.target.value)}>
          {allCountries.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Map */}
      {mapReady && (
        <div className="leaflet-map-wrap" style={{ position:"relative" }}>
          <MapContainer center={[20,0]} zoom={2} style={{ height:"520px", width:"100%", borderRadius:"12px" }} scrollWheelZoom={true} worldCopyJump>
            <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <MapController userLocation={userLocation} shouldCenter={shouldCenter} />
            <RecenterButton userLocation={userLocation} />

            {/* My Location */}
            {userLocation && (
              <Marker position={[userLocation.lat, userLocation.lng]} icon={myLocationIcon} zIndexOffset={1000}>
                <Popup>
                  <div className="map-popup-leaflet">
                    <div style={{ fontWeight:700, fontSize:"1rem" }}>📍 You are Here</div>
                    <div style={{ fontSize:"0.82rem", color:"#555" }}>Accuracy: ~{Math.round(userLocation.accuracy || 0)}m</div>
                    <div style={{ fontSize:"0.78rem", color:"#888" }}>Lat: {userLocation.lat.toFixed(5)}, Lng: {userLocation.lng.toFixed(5)}</div>
                  </div>
                </Popup>
              </Marker>
            )}

            {/* Zoo markers */}
            {showZoos && (
              <LayerGroup>
                {filteredZoos.slice(0, 200).map((zoo, i) => (
                  <Marker key={`z${i}`} position={[zoo.lat, zoo.lng]} icon={zooIcon}>
                    <Popup>
                      <div className="map-popup-leaflet">
                        {zoo.image && <img src={zoo.image} alt={zoo.name} style={{ width:"100%", height:"80px", objectFit:"cover", borderRadius:"6px", marginBottom:"6px" }} onError={e => e.target.style.display="none"} />}
                        <div style={{ fontWeight:700, fontSize:"0.92rem" }}>🏛️ {zoo.name}</div>
                        <div style={{ color:"#555", fontSize:"0.8rem" }}>📍 {zoo.city ? `${zoo.city}, ` : ""}{zoo.country}</div>
                        <div style={{ color:"#555", fontSize:"0.8rem" }}>🐾 {zoo.animals} animals · ⭐ {zoo.rating}</div>
                        <button onClick={() => openInGoogleMaps(zoo.lat, zoo.lng, zoo.name)} className="popup-btn">📍 Open in Maps</button>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </LayerGroup>
            )}

            {/* Live tracking markers */}
            {showAnimals && (
              <LayerGroup>
                {filteredAnimals.map((a, i) => (
                  <Marker key={`a${i}`} position={[a.lat, a.lng]} icon={animalIcon(a.emoji)}>
                    <Popup>
                      <div className="map-popup-leaflet">
                        <div style={{ fontSize:"2rem", textAlign:"center" }}>{a.emoji}</div>
                        <div style={{ fontWeight:800, fontSize:"0.95rem" }}>{a.name}</div>
                        <div style={{ fontStyle:"italic", fontSize:"0.76rem", color:"#666" }}>{a.species}</div>
                        <div style={{ fontSize:"0.8rem", color:"#555", marginTop:4 }}>🏷️ {a.cat} · 📍 {a.country}</div>
                        <div style={{ fontSize:"0.78rem", color:"#888" }}>🆔 {a.id}</div>
                        <div style={{ display:"flex", gap:6, marginTop:6, flexWrap:"wrap" }}>
                          <span style={{ background:statusColor[a.status]+"22", color:statusColor[a.status], borderRadius:6, padding:"2px 7px", fontSize:"0.75rem", fontWeight:700 }}>● {a.status}</span>
                          {a.speed > 0 && <span style={{ fontSize:"0.75rem", color:"#888" }}>💨 {a.speed} km/h</span>}
                          {a.battery != null && <span style={{ fontSize:"0.75rem", color:"#888" }}>🔋 {a.battery}%</span>}
                        </div>
                        <div style={{ fontSize:"0.72rem", color:"#aaa", marginTop:4 }}>🕐 Last seen: {a.lastSeen}</div>
                        <div style={{ fontSize:"0.68rem", color:"#f59e0b", marginTop:4, textAlign:"center" }}>📡 DEMO DATA — not real-time GPS</div>
                        <button onClick={() => openInGoogleMaps(a.lat, a.lng, a.name)} className="popup-btn" style={{ marginTop:6 }}>📍 View in Maps</button>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </LayerGroup>
            )}

            {/* Migration routes */}
            {showMigration && (
              <LayerGroup>
                {MIGRATION_ROUTES.map(m => (
                  <React.Fragment key={m.id}>
                    <Polyline positions={m.route} color={m.color} weight={3} opacity={0.7} dashArray="8 4" />
                    <Marker position={m.currentPos} icon={migrationIcon(m.emoji)}>
                      <Popup>
                        <div className="map-popup-leaflet">
                          <div style={{ fontSize:"2rem", textAlign:"center" }}>{m.emoji}</div>
                          <div style={{ fontWeight:800, fontSize:"0.95rem" }}>{m.name} Migration</div>
                          <div style={{ fontSize:"0.78rem", color:m.status==="LIVE"?"#10b981":"#f59e0b", fontWeight:700 }}>
                            {m.status === "LIVE" ? "🔴 LIVE" : "📅 SEASONAL (Historical Route)"}
                          </div>
                          <div style={{ fontSize:"0.8rem", color:"#555", marginTop:4 }}>👥 {m.herdSize} animals</div>
                          <div style={{ fontSize:"0.8rem", color:"#555" }}>📍 {m.origin} → {m.dest}</div>
                          <div style={{ fontSize:"0.8rem", color:"#555" }}>📏 {m.dist} · ⚡ {m.speed}</div>
                          <div style={{ fontSize:"0.8rem", color:"#555" }}>🗓️ Season: {m.season}</div>
                          <div style={{ fontSize:"0.75rem", marginTop:6, color:"#444" }}>{m.info}</div>
                        </div>
                      </Popup>
                    </Marker>
                  </React.Fragment>
                ))}
              </LayerGroup>
            )}
          </MapContainer>
        </div>
      )}

      {/* Migration layer info */}
      {showMigration && (
        <div className="migration-legend">
          <h3>🦋 Wildlife Migration Routes</h3>
          <div className="migration-grid">
            {MIGRATION_ROUTES.map(m => (
              <div key={m.id} className="migration-card" style={{ borderLeft:`3px solid ${m.color}` }}>
                <div className="migration-card-header">
                  <span style={{ fontSize:"1.4rem" }}>{m.emoji}</span>
                  <div>
                    <div style={{ fontWeight:700, fontSize:"0.88rem" }}>{m.name}</div>
                    <div style={{ fontSize:"0.72rem", color:m.status==="LIVE"?"#10b981":"#f59e0b", fontWeight:600 }}>
                      {m.status === "LIVE" ? "🔴 LIVE" : "📅 Historical"}
                    </div>
                  </div>
                </div>
                <div style={{ fontSize:"0.75rem", color:"#6b7280" }}>
                  👥 {m.herdSize} · 📏 {m.dist} · 🗓️ {m.season}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tracking cards */}
      {showAnimals && filteredAnimals.length > 0 && (
        <div className="tracking-list">
          <h3>📡 Live Animal Tracking — {new Date().toDateString()} <span style={{ fontSize:"0.72rem", color:"#f59e0b" }}>(Demo Data)</span></h3>
          <div className="tracking-grid">
            {filteredAnimals.map((animal, i) => (
              <div key={i} className="tracking-card" onClick={() => openInGoogleMaps(animal.lat, animal.lng, animal.name)}>
                <div className="tracking-card-emoji">{animal.emoji}</div>
                <div className="tracking-card-info">
                  <div className="tracking-card-name">{animal.name}</div>
                  <div className="tracking-card-cat" style={{ fontStyle:"italic", fontSize:"0.72rem" }}>{animal.species}</div>
                  <div className="tracking-card-cat">{animal.cat} · {animal.country}</div>
                  <div className="tracking-card-coords">{animal.lat.toFixed(3)}°, {animal.lng.toFixed(3)}°</div>
                  <div style={{ display:"flex", gap:6, marginTop:4, flexWrap:"wrap" }}>
                    <span style={{ background:statusColor[animal.status]+"22", color:statusColor[animal.status], borderRadius:5, padding:"1px 6px", fontSize:"0.68rem", fontWeight:700 }}>● {animal.status}</span>
                    {animal.battery != null && <span style={{ fontSize:"0.68rem", color:"#888" }}>🔋{animal.battery}%</span>}
                    {animal.speed > 0 && <span style={{ fontSize:"0.68rem", color:"#888" }}>💨{animal.speed}km/h</span>}
                  </div>
                </div>
                <div className="tracking-card-time">
                  <span style={{ fontSize:"0.68rem", color:"#888" }}>🆔 {animal.id}</span>
                  <span style={{ fontSize:"0.68rem", color:"#888", display:"block" }}>🕐 {animal.lastSeen}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Zoo directory */}
      {showZoos && filteredZoos.length > 0 && (
        <div className="zoo-list">
          <h3>🏛️ Zoo Directory ({filteredZoos.length})</h3>
          <div className="zoo-grid">
            {filteredZoos.slice(0, 80).map((zoo, idx) => (
              <div key={idx} className="zoo-card zoo-card-clickable" onClick={() => openInGoogleMaps(zoo.lat, zoo.lng, zoo.name)}>
                {zoo.image && <img src={zoo.image} alt={zoo.name} className="zoo-card-img" loading="lazy" onError={e => e.target.style.display="none"} />}
                <div className="zoo-card-name">🏛️ {zoo.name}</div>
                <div className="zoo-card-country">📍 {zoo.city ? `${zoo.city}, ` : ""}{zoo.country}</div>
                <div className="zoo-card-meta">
                  <span>🐾 {zoo.animals}</span>
                  <span>⭐ {zoo.rating}</span>
                  <span className="zoo-map-hint">🗺️ Maps</span>
                </div>
              </div>
            ))}
          </div>
          {filteredZoos.length > 80 && <p className="more-zoos">+{filteredZoos.length - 80} more zoos — use the search/filter above</p>}
        </div>
      )}
    </div>
  );
}
