import TripBanner from "../components/TripBanner";

function openDeepLink(deepUrl, fallbackUrl) {
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
  setTimeout(() => {
    if (document.visibilityState === "visible") {
      window.open(fallbackUrl, "_blank", "noopener");
    }
  }, 1800);
}

const RIDE_BOOKING = [
  { name: "Get Rent A Car", icon: "🚗", deep: "https://getrentacar.tpx.lt/ePAm675D", url: "https://getrentacar.tpx.lt/ePAm675D", countries: "Global car rentals", color: "#000000" },
  { name: "Get Transfer", icon: "🚕", deep: "https://gettransfer.tpx.lt/OtVn4OQA", url: "https://gettransfer.tpx.lt/OtVn4OQA", countries: "Global transfers & private rides", color: "#00b14f" },
  { name: "EconomyBookings", icon: "🚙", deep: "https://economybookings.tpx.lt/Ib2teILz", url: "https://economybookings.tpx.lt/Ib2teILz", countries: "Worldwide budget rentals", color: "#f97316" }
];

const WILDLIFE_BOOKING = [
  { name: "Klook", icon: "🦁", deep: "https://klook.tpx.lt/CxX7xkG7", url: "https://klook.tpx.lt/CxX7xkG7", countries: "Nature & wildlife tours", color: "#d97706" },
  { name: "Tiqets", icon: "🎟️", deep: "https://tiqets.tpx.lt/Cyr9F1LU", url: "https://tiqets.tpx.lt/Cyr9F1LU", countries: "Zoos & nature reserves", color: "#7c3aed" }
];

const FLIGHT_BOOKING = [
  { name: "Aviasales", icon: "✈️", deep: "https://aviasales.tpx.lt/AAcj6Sau", url: "https://aviasales.tpx.lt/AAcj6Sau", countries: "Global cheap flights", color: "#4285f4" },
  { name: "Compensair", icon: "💼", deep: "https://compensair.tpx.lt/xckzWwDX", url: "https://compensair.tpx.lt/xckzWwDX", countries: "Flight delay claims", color: "#0770e3" }
];

const PRIVATE_JET = [
  { name: "Get Transfer VIP", icon: "🚁", deep: "https://gettransfer.tpx.lt/OtVn4OQA", url: "https://gettransfer.tpx.lt/OtVn4OQA", countries: "Luxury VIP transfers", color: "#1e293b" }
];


function ServiceCard({ service }) {
  return (
    <div
      className="service-card"
      style={{ borderLeft: `4px solid ${service.color}`, cursor: "pointer" }}
      onClick={() => openDeepLink(service.deep, service.url)}
    >
      <div className="service-icon" aria-hidden>{service.icon}</div>
      <div className="service-info">
        <div className="service-header">
          <span className="service-name">{service.name}</span>
        </div>
        <p className="service-countries">🌍 {service.countries}</p>
        <p className="service-fallback">📲 Opens app if installed · falls back to mobile site</p>
      </div>
      <button
        className="service-book-btn"
        onClick={(e) => { e.stopPropagation(); openDeepLink(service.deep, service.url); }}
      >
        Book Now →
      </button>
    </div>
  );
}

function Section({ icon, title, desc, items }) {
  return (
    <div className="travel-section">
      <h2 className="section-title">{icon} {title}</h2>
      <p className="section-desc">{desc}</p>
      <div className="services-list">
        {items.map((s) => <ServiceCard key={s.name} service={s} />)}
      </div>
    </div>
  );
}

export default function Travel() {
  return (
    <div className="travel-page">
      <div className="travel-header">
        <h1 className="page-title">Travel to Wildlife</h1>
        <p className="page-subtitle">
          Tap <b>Book Now</b> — opens the official app on your phone, or the mobile site if not installed.
        </p>
      </div>

      <TripBanner />

      <Section
        icon="🚗"
        title="Ride Booking"
        desc="Get to airports, safari lodges, or zoos with the world's top ride-hailing apps."
        items={RIDE_BOOKING}
      />

      <Section
        icon="🦁"
        title="Wildlife Booking"
        desc="Book guided wildlife safaris, expeditions, and nature tours with trusted operators."
        items={WILDLIFE_BOOKING}
      />

      <Section
        icon="✈️"
        title="Flight Booking"
        desc="Compare and book flights to wildlife destinations across the globe."
        items={FLIGHT_BOOKING}
      />

      <Section
        icon="🛩️"
        title="Private Jet (VIP)"
        desc="Charter or fractional private jet access to remote reserves and exclusive lodges."
        items={PRIVATE_JET}
      />
    </div>
  );
}
