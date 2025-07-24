"use client";
import { useEffect, useState, useRef } from "react";

export default function Home() {
  const [remaining, setRemaining] = useState<number | null>(null);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  async function fetchTime() {
    const res = await fetch("/api/timer");
    if (res.ok) {
      const data = await res.json();
      setRemaining(data.remaining);
      setRunning(data.running);
    }
  }

  // Polling effect
  useEffect(() => {
    // Start polling if running
    if (running) {
      fetchTime();
      if (!intervalRef.current) {
        intervalRef.current = setInterval(fetchTime, 1000);
      }
    } else {
      // Stop polling if not running
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      // Always fetch once to get the stopped state
      fetchTime();
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [running]);

  // On mount, fetch initial state
  useEffect(() => {
    fetchTime();
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
