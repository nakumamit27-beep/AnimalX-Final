export default function TripBanner() {
  return (
    <div className="trip-banner">
      <div className="trip-banner-bg" />
      <div className="trip-banner-content">
        <div className="trip-banner-icon">🦁</div>
        <div className="trip-banner-text">
          <h2>Visit Gir National Park</h2>
          <p>Home to the last wild Asiatic Lions. Book your wildlife adventure today.</p>
        </div>
        <div className="trip-buttons">
          <button className="trip-btn ride" onClick={() => window.open("https://getrentacar.tpx.lt/ePAm675D", "_blank")}>
            🚖 Book Ride
          </button>
          <button className="trip-btn flight" onClick={() => window.open("https://aviasales.tpx.lt/AAcj6Sau", "_blank")}>
            ✈️ Book Flight
          </button>
          <button className="trip-btn location" onClick={() => window.open("https://www.google.com/maps?q=Gir+National+Park+Gujarat+India", "_blank")}>
            📍 View Location
          </button>
        </div>
      </div>
    </div>
  );
}
