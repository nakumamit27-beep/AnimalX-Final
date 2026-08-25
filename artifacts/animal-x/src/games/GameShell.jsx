import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import "./games.css";

export default function GameShell({
  title,
  children,
  score = 0,
  coins = 0,
  stars = 0,
  lives = null,
  paused,
  onPause,
  onResume,
  onRestart,
  onExit,
  settings,
  onSettingsChange
}) {
  const [, setLocation] = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);
  
  // Provide default settings if not passed
  const currentSettings = settings || { music: false, sound: true };
  const toggleSetting = (key) => {
    if (onSettingsChange) {
      onSettingsChange({ ...currentSettings, [key]: !currentSettings[key] });
    }
  };

  const handleExit = () => {
    if (onExit) onExit();
    setLocation("/games");
  };

  return (
    <div className="game-shell">
      {/* Top Bar */}
      <div className="game-topbar">
        <div className="game-topbar-left">
          <button className="exit-btn" onClick={handleExit} title="Exit Game">
            ✕
          </button>
          <div className="game-title">{title}</div>
        </div>
        <div className="game-topbar-right">
          <button className="game-icon-btn" onClick={() => setDrawerOpen(true)} title="Settings">
            ⚙️
          </button>
          <button
            className="game-icon-btn"
            onClick={onPause}
            title={onPause ? "Pause" : "Pause unavailable for this game"}
            disabled={!onPause}
            aria-disabled={!onPause}
          >
            ⏸️
          </button>
        </div>
      </div>

      {/* Score Strip */}
      <div className="game-score-strip">
        <div className="game-score-item">
          <span style={{color: "#fbbf24"}}>⭐</span> {stars}
        </div>
        <div className="game-score-item">
          <span style={{color: "#f59e0b"}}>🪙</span> {coins}
        </div>
        <div className="game-score-item">
          <span style={{color: "#3b82f6"}}>📈</span> {score}
        </div>
        {lives !== null && (
          <div className="game-score-item">
            <span style={{color: "#ef4444"}}>❤️</span> {lives}
          </div>
        )}
      </div>

      {/* Main Game Content */}
      <div className="game-content">
        {children}
      </div>

      {/* Pause Overlay */}
      {paused && (
        <div className="game-pause-overlay">
          <h2 className="pause-title">PAUSED</h2>
          <button className="game-btn" onClick={onResume}>Resume</button>
          <button className="game-btn-secondary" onClick={onRestart}>Restart</button>
          <button className="game-btn-secondary" onClick={handleExit}>Exit Game</button>
        </div>
      )}

      {/* Settings Drawer */}
      <div className={`settings-drawer ${drawerOpen ? "open" : ""}`}>
        <div className="settings-header">
          <h3>Settings</h3>
          <button className="exit-btn" onClick={() => setDrawerOpen(false)}>✕</button>
        </div>
        <div className="settings-body">
          <div className="settings-item">
            <span>Sound Effects</span>
            <button 
              className={`game-btn-secondary ${currentSettings.sound ? "active" : ""}`}
              style={{padding: "8px 16px", minWidth: "auto"}}
              onClick={() => toggleSetting("sound")}
            >
              {currentSettings.sound ? "ON" : "OFF"}
            </button>
          </div>
          <div className="settings-item">
            <span>Music</span>
            <button 
              className={`game-btn-secondary ${currentSettings.music ? "active" : ""}`}
              style={{padding: "8px 16px", minWidth: "auto"}}
              onClick={() => toggleSetting("music")}
            >
              {currentSettings.music ? "ON" : "OFF"}
            </button>
          </div>
          <div className="settings-item" style={{opacity: 0.5}}>
            <span>Dark Mode</span>
            <span>Always ON</span>
          </div>
        </div>
      </div>
      
      {/* Click outside drawer to close */}
      {drawerOpen && (
        <div 
          style={{position: "fixed", inset: 0, zIndex: 2400, background: "rgba(0,0,0,0.5)"}} 
          onClick={() => setDrawerOpen(false)}
        />
      )}
    </div>
  );
}
