import React from "react";
import { Link } from "wouter";

const games = [
  {
    id: 1,
    title: "Wildlife Puzzle",
    emoji: "🧩",
    color: "#16a34a",
    path: "/games/puzzle",
  },
  {
    id: 2,
    title: "Kids Numbers",
    emoji: "🔢",
    color: "#2563eb",
    path: "/games/numbers",
  },
  {
    id: 3,
    title: "Animal Coloring",
    emoji: "🎨",
    color: "#ea580c",
    path: "/games/coloring",
  },
  {
    id: 4,
    title: "ABC Animals",
    emoji: "🔤",
    color: "#9333ea",
    path: "/games/abc",
  },
];

export default function Games() {
  return (
    <div
      style={{
        background: "#000",
        minHeight: "100vh",
        color: "#fff",
        padding: 20,
      }}
    >
      <h1
        style={{
          textAlign: "center",
          fontSize: 30,
          marginBottom: 25,
        }}
      >
        🎮 Animal X Games
      </h1>

      {games.map((game) => (
        <Link key={game.id} href={game.path}>
          <div
            style={{
              background: "#111",
              borderRadius: 20,
              padding: 18,
              marginBottom: 18,
              display: "flex",
              alignItems: "center",
              cursor: "pointer",
              border: `2px solid ${game.color}`,
            }}
          >
            <div
              style={{
                width: 70,
                height: 70,
                borderRadius: "50%",
                background: game.color,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 34,
                marginRight: 18,
              }}
            >
              {game.emoji}
            </div>

            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontSize: 22,
                  fontWeight: "bold",
                }}
              >
                {game.title}
              </div>

              <div
                style={{
                  color: "#bbb",
                  marginTop: 5,
                }}
              >
                Tap to Play
              </div>
            </div>

            <div
              style={{
                fontSize: 30,
              }}
            >
              ▶
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}