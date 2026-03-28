import TripBanner from "../components/TripBanner";

export default function Travel() {
  const rideServices = [
    { name: "Uber", icon: "🚗", url: "https://www.uber.com", desc: "Rides available in 70+ countries", color: "#000000", tag: "Global" },
    { name: "Ola", icon: "🚕", url: "https://www.olacabs.com", desc: "India's largest ride-hailing service", color: "#f97316", tag: "India" },
    { name: "Lyft", icon: "🚙", url: "https://www.lyft.com", desc: "Ride-sharing across North America", color: "#e879f9", tag: "USA" },
    { name: "Bolt", icon: "⚡", url: "https://bolt.eu", desc: "Affordable rides across Europe & Africa", color: "#22c55e", tag: "Europe/Africa" },
    { name: "Grab", icon: "🛵", url: "https://www.grab.com", desc: "Southeast Asia's super app for transport", color: "#00b14f", tag: "SE Asia" },
  ];

  const flightServices = [
    { name: "Skyscanner", icon: "✈️", url: "https://www.skyscanner.com", desc: "Compare flights from 1,200+ airlines", color: "#0770e3", tag: "Best Deals" },
    { name: "Google Flights", icon: "🔍", url: "https://www.google.com/flights", desc: "Smart search with price tracking alerts", color: "#4285f4", tag: "Price Alerts" },
    { name: "Kayak", icon: "🌐", url: "https://www.kayak.com", desc: "Compare prices across 100s of travel sites", color: "#ff690f", tag: "Compare" },
  ];

  const privateJetServices = [
    { name: "VistaJet", icon: "🛩️", url: "https://www.vistajet.com", desc: "The world's largest private aviation company. Fly to 187 countries in ultimate luxury.", color: "#c0392b", tag: "Premium" },
  ];

  const animalTours = [
    { name: "Safari Bookings", icon: "🦁", url: "https://www.safaribookings.com", desc: "Book wildlife safaris in Africa's best reserves", tag: "Africa", color: "#d97706" },
    { name: "G Adventures", icon: "🐘", url: "https://www.gadventures.com", desc: "Small-group wildlife and nature tours worldwide", tag: "Worldwide", color: "#7c3aed" },
    { name: "Intrepid Travel", icon: "🐆", url: "https://www.intrepidtravel.com", desc: "Responsible wildlife experiences across 100+ countries", tag: "Eco-travel", color: "#0891b2" },
  ];

  const ServiceCard = ({ service }) => (
    <a
      href={service.url}
      target="_blank"
      rel="noopener noreferrer"
      className="service-card"
      style={{ borderLeft: `4px solid ${service.color}` }}
    >
      <div className="service-icon">{service.icon}</div>
      <div className="service-info">
        <div className="service-header">
          <span className="service-name">{service.name}</span>
          <span className="service-tag">{service.tag}</span>
        </div>
        <p className="service-desc">{service.desc}</p>
      </div>
      <div className="service-arrow">→</div>
    </a>
  );

  return (
    <div className="travel-page">
      <div className="travel-header">
        <h1 className="page-title">Travel to Wildlife</h1>
        <p className="page-subtitle">Everything you need to reach the world's most incredible animals and habitats</p>
      </div>

      <TripBanner />

      <div className="travel-section">
        <h2 className="section-title">🚗 Ride-Hailing</h2>
        <p className="section-desc">Get to airports, safari lodges, or zoos with trusted ride services</p>
        <div className="services-list">
          {rideServices.map(s => <ServiceCard key={s.name} service={s} />)}
        </div>
      </div>

      <div className="travel-section">
        <h2 className="section-title">✈️ Book Flights</h2>
        <p className="section-desc">Find the best deals to fly to wildlife destinations worldwide</p>
        <div className="services-list">
          {flightServices.map(s => <ServiceCard key={s.name} service={s} />)}
        </div>
      </div>

      <div className="travel-section">
        <h2 className="section-title">🛩️ Private Aviation</h2>
        <p className="section-desc">Exclusive private jet access to remote wildlife reserves</p>
        <div className="services-list">
          {privateJetServices.map(s => <ServiceCard key={s.name} service={s} />)}
        </div>
      </div>

      <div className="travel-section">
        <h2 className="section-title">🌿 Wildlife Tours</h2>
        <p className="section-desc">Guided tours to experience animals in their natural habitats</p>
        <div className="services-list">
          {animalTours.map(s => <ServiceCard key={s.name} service={s} />)}
        </div>
      </div>
    </div>
  );
}
