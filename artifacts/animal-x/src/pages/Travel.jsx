import TripBanner from "../components/TripBanner";

function openDeepLink(deepUrl, fallbackUrl) {
  // Try the native app via deep link, fall back to the web URL after a short delay.
  const start = Date.now();
  const timer = setTimeout(() => {
    if (Date.now() - start < 1600) {
      window.open(fallbackUrl, "_blank", "noopener");
    }
  }, 1200);
  try {
    window.location.href = deepUrl;
  } catch {
    window.open(fallbackUrl, "_blank", "noopener");
    clearTimeout(timer);
  }
  // Always make sure something opens
  setTimeout(() => {
    if (document.visibilityState === "visible") {
      window.open(fallbackUrl, "_blank", "noopener");
    }
  }, 1800);
}

export default function Travel() {
  const rideServices = [
    { name: "Uber", icon: "🚗", deep: "uber://", url: "https://m.uber.com", desc: "Rides available in 70+ countries", color: "#000000", tag: "Global" },
    { name: "Ola", icon: "🚕", deep: "olacabs://app/launch", url: "https://book.olacabs.com", desc: "India's largest ride-hailing service", color: "#f97316", tag: "India" },
    { name: "Lyft", icon: "🚙", deep: "lyft://", url: "https://www.lyft.com", desc: "Ride-sharing across North America", color: "#e879f9", tag: "USA" },
    { name: "Bolt", icon: "⚡", deep: "bolt://", url: "https://bolt.eu", desc: "Affordable rides across Europe & Africa", color: "#22c55e", tag: "Europe/Africa" },
    { name: "Grab", icon: "🛵", deep: "grab://open", url: "https://www.grab.com", desc: "Southeast Asia's super app for transport", color: "#00b14f", tag: "SE Asia" },
  ];

  const flightServices = [
    { name: "Skyscanner", icon: "✈️", deep: "skyscanner://", url: "https://www.skyscanner.com", desc: "Compare flights from 1,200+ airlines", color: "#0770e3", tag: "Best Deals" },
    { name: "Google Flights", icon: "🔍", deep: "https://www.google.com/flights", url: "https://www.google.com/flights", desc: "Smart search with price tracking alerts", color: "#4285f4", tag: "Price Alerts" },
    { name: "Kayak", icon: "🌐", deep: "kayak://", url: "https://www.kayak.com", desc: "Compare prices across 100s of travel sites", color: "#ff690f", tag: "Compare" },
    { name: "MakeMyTrip", icon: "🧳", deep: "mmyt://", url: "https://www.makemytrip.com", desc: "Top travel app for India and Asia", color: "#eb2026", tag: "India" },
  ];

  const privateJetServices = [
    { name: "VistaJet", icon: "🛩️", deep: "https://www.vistajet.com", url: "https://www.vistajet.com", desc: "The world's largest private aviation company. Fly to 187 countries in ultimate luxury.", color: "#c0392b", tag: "Premium" },
  ];

  const animalTours = [
    { name: "Safari Bookings", icon: "🦁", deep: "https://www.safaribookings.com", url: "https://www.safaribookings.com", desc: "Book wildlife safaris in Africa's best reserves", tag: "Africa", color: "#d97706" },
    { name: "G Adventures", icon: "🐘", deep: "https://www.gadventures.com", url: "https://www.gadventures.com", desc: "Small-group wildlife and nature tours worldwide", tag: "Worldwide", color: "#7c3aed" },
    { name: "Intrepid Travel", icon: "🐆", deep: "https://www.intrepidtravel.com", url: "https://www.intrepidtravel.com", desc: "Responsible wildlife experiences across 100+ countries", tag: "Eco-travel", color: "#0891b2" },
  ];

  const ServiceCard = ({ service }) => (
    <div
      className="service-card"
      style={{ borderLeft: `4px solid ${service.color}`, cursor: "pointer" }}
      onClick={() => openDeepLink(service.deep, service.url)}
    >
      <div className="service-icon">{service.icon}</div>
      <div className="service-info">
        <div className="service-header">
          <span className="service-name">{service.name}</span>
          <span className="service-tag">{service.tag}</span>
        </div>
        <p className="service-desc">{service.desc}</p>
        <p className="service-desc" style={{ fontSize: "0.72rem", opacity: 0.7, marginTop: 4 }}>
          📲 Opens in app · falls back to website
        </p>
      </div>
      <button
        className="service-book-btn"
        onClick={(e) => { e.stopPropagation(); openDeepLink(service.deep, service.url); }}
      >
        Book →
      </button>
    </div>
  );

  return (
    <div className="travel-page">
      <div className="travel-header">
        <h1 className="page-title">Travel to Wildlife</h1>
        <p className="page-subtitle">Tap Book — opens the official app on your phone, or the website if not installed.</p>
      </div>

      <TripBanner />

      <div className="travel-section">
        <h2 className="section-title">🚗 Ride-Hailing</h2>
        <p className="section-desc">Get to airports, safari lodges, or zoos with trusted ride services</p>
        <div className="services-list">
          {rideServices.map((s) => <ServiceCard key={s.name} service={s} />)}
        </div>
      </div>

      <div className="travel-section">
        <h2 className="section-title">✈️ Book Flights</h2>
        <p className="section-desc">Find the best deals to fly to wildlife destinations worldwide</p>
        <div className="services-list">
          {flightServices.map((s) => <ServiceCard key={s.name} service={s} />)}
        </div>
      </div>

      <div className="travel-section">
        <h2 className="section-title">🛩️ Private Aviation</h2>
        <p className="section-desc">Exclusive private jet access to remote wildlife reserves</p>
        <div className="services-list">
          {privateJetServices.map((s) => <ServiceCard key={s.name} service={s} />)}
        </div>
      </div>

      <div className="travel-section">
        <h2 className="section-title">🌿 Wildlife Tours</h2>
        <p className="section-desc">Guided tours to experience animals in their natural habitats</p>
        <div className="services-list">
          {animalTours.map((s) => <ServiceCard key={s.name} service={s} />)}
        </div>
      </div>
    </div>
  );
}
