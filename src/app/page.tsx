"use client";
import { useEffect, useState } from "react";

export default function Home() {
  const [remaining, setRemaining] = useState<number | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    async function fetchTime() {
      const res = await fetch("/api/timer");
      if (res.ok) {
        const data = await res.json();
        setRemaining(data.remaining);
      }
    }
    fetchTime();
    interval = setInterval(fetchTime, 1000);
    return () => clearInterval(interval);
  }, []);

  function formatTime(sec: number) {
    const h = String(Math.floor(sec / 3600)).padStart(2, "0");
    const m = String(Math.floor((sec % 3600) / 60)).padStart(2, "0");
    const s = String(sec % 60).padStart(2, "0");
    return `${h}:${m}:${s}`;
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        minWidth: "100vw",
        background: "#111",
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "monospace",
      }}
    >
      <div
        style={{
          fontSize: "15vw",
          letterSpacing: "0.1em",
          userSelect: "none",
        }}
      >
        {remaining !== null ? formatTime(remaining) : "--:--:--"}
      </div>
    </main>
  );
}
