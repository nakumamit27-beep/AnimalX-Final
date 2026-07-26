import React from "react";

export default function AnimalPuzzle() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#000",
        color: "#fff",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
        textAlign: "center",
      }}
    >
      <div
        style={{
          fontSize: 90,
          marginBottom: 20,
        }}
      >
        🦁
      </div>

      <h1
        style={{
          fontSize: 32,
          marginBottom: 15,
        }}
      >
        Wildlife Puzzle
      </h1>

      <p
        style={{
          color: "#bdbdbd",
          fontSize: 18,
          maxWidth: 380,
          lineHeight: 1.7,
        }}
      >
        Welcome to Animal X Puzzle.
        <br />
        HD Wildlife Puzzle Game is coming soon.
      </p>
    </div>
  );
}