"use client";
import { useEffect, useState, useRef } from "react";

const ADMIN_CODE = process.env.NEXT_PUBLIC_ADMIN_CODE || "hackathon";

export default function Admin() {
  const [input, setInput] = useState("");
  const [remaining, setRemaining] = useState<number | null>(null);
  const [running, setRunning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [authCode, setAuthCode] = useState("");
  const [authed, setAuthed] = useState(false);
  const [error, setError] = useState("");
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (authed) {
      if (running) {
        fetchTime();
        if (!intervalRef.current) {
          intervalRef.current = setInterval(fetchTime, 1000);
        }
      } else {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        fetchTime();
      }
      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      };
    }
  }, [authed, running]);

  useEffect(() => {
    if (authed) fetchTime();
  }, [authed]);

  async function fetchTime() {
    const res = await fetch("/api/timer");
    if (res.ok) {
      const data = await res.json();
      setRemaining(data.remaining);
      setRunning(data.running);
    }
  }

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

  function handleAuth(e: React.FormEvent) {
    e.preventDefault();
    if (authCode === ADMIN_CODE) {
      setAuthed(true);
      setError("");
    } else {
      setError("Incorrect code");
    }
  }

  if (!authed) {
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
        <form
          onSubmit={handleAuth}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <input
            type="password"
            placeholder="Enter admin code"
            value={authCode}
            onChange={(e) => setAuthCode(e.target.value)}
            style={{
              background: "none",
              border: "none",
              color: "#fff",
              fontSize: "2vw",
              textAlign: "center",
              width: "15vw",
              marginBottom: "2vw",
              borderBottom: "2px solid #fff",
              outline: "none",
            }}
            autoFocus
          />
          <button type="submit" style={{ fontSize: "2vw" }}>
            Enter
          </button>
          {error && (
            <div style={{ color: "#f55", marginTop: "1vw" }}>{error}</div>
          )}
        </form>
      </main>
    );
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
