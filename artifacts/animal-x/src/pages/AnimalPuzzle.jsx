import React, { useState, useEffect, useRef } from "react";

export default function AnimalPuzzle() {

  const [image, setImage] = useState(null);
  const [difficulty, setDifficulty] = useState(3);
  const [pieces, setPieces] = useState([]);
  const [moves, setMoves] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);
  const [won, setWon] = useState(false);
  const [preview, setPreview] = useState(false);
  const [sound, setSound] = useState(true);
  const [coins, setCoins] = useState(0);
  const [stars, setStars] = useState(0);

  const timerRef = useRef(null);

  useEffect(() => {
    if (!running) return;

    timerRef.current = setInterval(() => {
      setSeconds((t) => t + 1);
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [running]);

  function formatTime() {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return (
      String(m).padStart(2, "0") +
      ":" +
      String(s).padStart(2, "0")
    );
  }

  function resetGame() {
    setMoves(0);
    setSeconds(0);
    setWon(false);
    setRunning(false);
    setPieces([]);
  }

  function handleImage(e) {
    const file = e.target.files[0];

    if (!file) return;

    const url = URL.createObjectURL(file);

    setImage(url);

    resetGame();

    setRunning(true);
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#07111f",
        color: "#fff",
        padding: 20,
        fontFamily: "sans-serif",
      }}
    >

      <h1
        style={{
          textAlign: "center",
          fontSize: 34,
          marginBottom: 20,
        }}
      >
        🧩 Animal Puzzle
      </h1>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          background: "#132238",
          padding: 15,
          borderRadius: 15,
          marginBottom: 20,
        }}
      >

        <div>
          <b>Moves</b>
          <br />
          {moves}
        </div>

        <div>
          <b>Time</b>
          <br />
          {formatTime()}
        </div>

        <div>
          <b>Coins</b>
          <br />
          {coins}
        </div>

      </div>
      <div
  style={{
    display: "flex",
    flexWrap: "wrap",
    gap: 10,
    justifyContent: "center",
    marginBottom: 20,
  }}
>
  <label
    style={{
      background: "#22c55e",
      color: "#fff",
      padding: "12px 18px",
      borderRadius: 10,
      cursor: "pointer",
      fontWeight: "bold",
    }}
  >
    📷 Upload Image
    <input
      type="file"
      accept="image/*"
      hidden
      onChange={handleImage}
    />
  </label>

  <button
    onClick={resetGame}
    style={{
      background: "#ef4444",
      color: "#fff",
      border: "none",
      padding: "12px 18px",
      borderRadius: 10,
      cursor: "pointer",
      fontWeight: "bold",
    }}
  >
    🔄 Restart
  </button>

  <button
    onClick={() => setPreview(!preview)}
    style={{
      background: "#2563eb",
      color: "#fff",
      border: "none",
      padding: "12px 18px",
      borderRadius: 10,
      cursor: "pointer",
      fontWeight: "bold",
    }}
  >
    👁 {preview ? "Hide" : "Preview"}
  </button>

  <button
    onClick={() => setSound(!sound)}
    style={{
      background: sound ? "#16a34a" : "#dc2626",
      color: "#fff",
      border: "none",
      padding: "12px 18px",
      borderRadius: 10,
      cursor: "pointer",
      fontWeight: "bold",
    }}
  >
    {sound ? "🔊 Sound" : "🔇 Mute"}
  </button>
</div>

<div
  style={{
    display: "flex",
    justifyContent: "center",
    gap: 10,
    marginBottom: 20,
  }}
>
  {[3, 4, 5].map((size) => (
    <button
      key={size}
      onClick={() => {
        setDifficulty(size);
        resetGame();
      }}
      style={{
        background:
          difficulty === size ? "#22c55e" : "#1e293b",
        color: "#fff",
        border: "none",
        padding: "10px 18px",
        borderRadius: 10,
        cursor: "pointer",
        fontWeight: "bold",
      }}
    >
      {size} × {size}
    </button>
  ))}
</div>

{preview && image && (
  <div
    style={{
      display: "flex",
      justifyContent: "center",
      marginBottom: 20,
    }}
  >
    <img
      src={image}
      alt="Preview"
      style={{
        width: 220,
        height: 220,
        objectFit: "cover",
        borderRadius: 15,
        border: "3px solid #22c55e",
      }}
    />
  </div>
)}