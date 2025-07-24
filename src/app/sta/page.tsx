"use client";
import { useEffect, useState } from "react";

export default function Admin() {
  const [input, setInput] = useState("");
  const [remaining, setRemaining] = useState<number | null>(null);
  const [running, setRunning] = useState(false);
  const [loading, setLoading] = useState(false);

  async function fetchTime() {
    const res = await fetch("/api/timer");
    if (res.ok) {
      const data = await res.json();
      setRemaining(data.remaining);
      setRunning(data.running);
    }
  }

  useEffect(() => {
    let interval: NodeJS.Timeout;
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

  async function handleStart() {
    setLoading(true);
    await fetch("/api/timer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "start", time: input }),
    });
    setLoading(false);
    fetchTime();
  }
  async function handleStop() {
    setLoading(true);
    await fetch("/api/timer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "stop" }),
    });
    setLoading(false);
    fetchTime();
  }
  async function handleReset() {
    setLoading(true);
    await fetch("/api/timer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "reset" }),
    });
    setLoading(false);
    fetchTime();
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        minWidth: "100vw",
        background: "#111",
        color: "#fff",
        display: "flex",
        flexDirection: "column",
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
          marginBottom: "5vh",
        }}
      >
        {remaining !== null ? formatTime(remaining) : "--:--:--"}
      </div>
      <div style={{ display: "flex", gap: "2vw" }}>
        <input
          type="text"
          placeholder="hh:mm:ss"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          style={{
            background: "none",
            border: "none",
            color: "#fff",
            fontSize: "2vw",
            textAlign: "center",
            width: "10vw",
            marginRight: "2vw",
            borderBottom: "2px solid #fff",
            outline: "none",
          }}
          maxLength={8}
          autoComplete="off"
        />
        <button
          onClick={handleStart}
          disabled={loading || running}
          style={{ fontSize: "2vw" }}
        >
          Start
        </button>
        <button
          onClick={handleStop}
          disabled={loading || !running}
          style={{ fontSize: "2vw" }}
        >
          Stop
        </button>
        <button
          onClick={handleReset}
          disabled={loading}
          style={{ fontSize: "2vw" }}
        >
          Reset
        </button>
      </div>
    </main>
  );
}
