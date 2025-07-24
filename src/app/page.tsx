"use client";
import { useEffect, useState, useRef } from "react";

export default function Home() {
  const [remaining, setRemaining] = useState<number | null>(null);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    async function fetchTime() {
      const res = await fetch("/api/timer");
      if (res.ok) {
        const data = await res.json();
        setRemaining(data.remaining);
        setRunning(data.running);
        // If timer is not running and remaining is 0, stop polling
        if (!data.running && data.remaining === 0 && intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      }
    }
    fetchTime();
    if (!intervalRef.current) {
      intervalRef.current = setInterval(fetchTime, 1000);
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
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
        {remaining !== null ? formatTime(remaining) : "00:00:00"}
      </div>
    </main>
  );
}
