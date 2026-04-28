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
  { name: "Uber",  icon: "🚗", deep: "uber://",                url: "https://m.uber.com",       countries: "70+ countries worldwide", color: "#000000" },
  { name: "Lyft",  icon: "🚙", deep: "lyft://",                url: "https://www.lyft.com",     countries: "USA, Canada",            color: "#ff00bf" },
  { name: "Grab",  icon: "🛵", deep: "grab://open",            url: "https://www.grab.com",     countries: "Southeast Asia",         color: "#00b14f" },
  { name: "Ola",   icon: "🚕", deep: "olacabs://app/launch",   url: "https://book.olacabs.com", countries: "India, UK, Australia, NZ", color: "#f97316" },
  { name: "Bolt",  icon: "⚡", deep: "bolt://",                url: "https://bolt.eu",          countries: "Europe, Africa",         color: "#22c55e" },
];

const WILDLIFE_BOOKING = [
  { name: "SafariBookings",            icon: "🦁", deep: "https://www.safaribookings.com",       url: "https://www.safaribookings.com",       countries: "Africa-wide safaris",                 color: "#d97706" },
  { name: "G Adventures",              icon: "🐘", deep: "https://www.gadventures.com",          url: "https://www.gadventures.com",          countries: "Worldwide small-group tours",         color: "#7c3aed" },
  { name: "Intrepid Travel",           icon: "🐆", deep: "https://www.intrepidtravel.com",       url: "https://www.intrepidtravel.com",       countries: "100+ countries, eco-friendly",        color: "#0891b2" },
  { name: "Natural Habitat Adventures",icon: "🐻", deep: "https://www.nathab.com",               url: "https://www.nathab.com",               countries: "Worldwide nature & wildlife",         color: "#16a34a" },
  { name: "Wildlife Worldwide",        icon: "🐅", deep: "https://www.wildlifeworldwide.com",    url: "https://www.wildlifeworldwide.com",    countries: "All seven continents",                color: "#9333ea" },
];

const FLIGHT_BOOKING = [
  { name: "Google Flights", icon: "🔍", deep: "https://www.google.com/travel/flights", url: "https://www.google.com/travel/flights", countries: "Global price tracking",   color: "#4285f4" },
  { name: "Skyscanner",     icon: "✈️", deep: "skyscanner://",                          url: "https://www.skyscanner.com",            countries: "1,200+ airlines worldwide", color: "#0770e3" },
  { name: "Kayak",          icon: "🌐", deep: "kayak://",                               url: "https://www.kayak.com",                 countries: "100s of sites compared",  color: "#ff690f" },
  { name: "Trip.com",       icon: "🧳", deep: "ctrip://",                               url: "https://www.trip.com",                  countries: "Global, strong in Asia",  color: "#287dfa" },
  { name: "Expedia",        icon: "🏨", deep: "expda://",                               url: "https://www.expedia.com",               countries: "Worldwide flights & hotels", color: "#ffc439" },
  { name: "Hopper",         icon: "🐰", deep: "hopper://",                              url: "https://www.hopper.com",                countries: "USA, Canada price predictions", color: "#a855f7" },
  { name: "Wego",           icon: "🌍", deep: "wego://",                                url: "https://www.wego.com",                  countries: "Middle East, Asia & global", color: "#16a34a" },
  { name: "Agoda",          icon: "🏝️", deep: "agoda://",                              url: "https://www.agoda.com",                 countries: "Asia-Pacific & worldwide", color: "#ed3325" },
];

const PRIVATE_JET = [
  { name: "VistaJet",            icon: "🛩️", deep: "https://www.vistajet.com",         url: "https://www.vistajet.com",         countries: "Flies to 187 countries",       color: "#c0392b" },
  { name: "NetJets",             icon: "🛫", deep: "https://www.netjets.com",          url: "https://www.netjets.com",          countries: "World's largest private fleet",color: "#0c2a4d" },
  { name: "XO",                  icon: "✈️", deep: "https://www.flyxo.com",            url: "https://www.flyxo.com",            countries: "On-demand jets, USA & Europe", color: "#f59e0b" },
  { name: "Flexjet",             icon: "🛬", deep: "https://www.flexjet.com",          url: "https://www.flexjet.com",          countries: "Fractional jet ownership",     color: "#1e3a8a" },
  { name: "Jetex",               icon: "🛩️", deep: "https://www.jetex.com",            url: "https://www.jetex.com",            countries: "Premium FBOs in 90+ countries",color: "#7c3aed" },
  { name: "PrivateFly",          icon: "🛪", deep: "https://www.privatefly.com",       url: "https://www.privatefly.com",       countries: "Charter to 8,000+ airports",   color: "#0891b2" },
  { name: "Wheels Up",           icon: "🚀", deep: "https://wheelsup.com",             url: "https://wheelsup.com",             countries: "USA membership-based jets",    color: "#fbbf24" },
  { name: "Air Charter Service", icon: "🛫", deep: "https://www.aircharterservice.com", url: "https://www.aircharterservice.com", countries: "Global on-demand charters",    color: "#dc2626" },
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
