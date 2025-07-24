import { NextRequest, NextResponse } from "next/server";

let timerState: {
  start: number | null;
  duration: number; // total duration in seconds
  running: boolean;
  remaining: number; // only used when stopped
} = {
  start: null,
  duration: 0,
  running: false,
  remaining: 0,
};

function parseTime(str: string): number {
  const parts = str.split(":").map(Number);
  if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  } else if (parts.length === 2) {
    return parts[0] * 60 + parts[1];
  } else if (parts.length === 1) {
    return parts[0];
  }
  return 0;
}

function getRemaining() {
  if (!timerState.running) return timerState.remaining;
  if (timerState.start === null) return timerState.remaining;
  const elapsed = Math.floor((Date.now() - timerState.start) / 1000);
  return Math.max(timerState.duration - elapsed, 0);
}

export async function GET() {
  return NextResponse.json({
    running: timerState.running,
    remaining: getRemaining(),
  });
}

export async function POST(req: NextRequest) {
  const { action, time } = await req.json();
  if (action === "start") {
    let duration = timerState.duration;
    // If a new time is provided, use it; otherwise, resume from remaining
    if (typeof time === "string" && time.trim() !== "") {
      duration = parseTime(time);
    } else if (!timerState.running && timerState.remaining > 0) {
      duration = timerState.remaining;
    }
    timerState = {
      start: Date.now(),
      duration,
      running: true,
      remaining: duration, // for consistency, but not used while running
    };
  } else if (action === "stop") {
    // Only update remaining if running
    if (timerState.running && timerState.start !== null) {
      const elapsed = Math.floor((Date.now() - timerState.start) / 1000);
      const remaining = Math.max(timerState.duration - elapsed, 0);
      timerState = {
        ...timerState,
        running: false,
        remaining,
        start: null,
      };
    }
    // else: already stopped, do nothing
  } else if (action === "reset") {
    timerState = {
      start: null,
      duration: timerState.duration,
      running: false,
      remaining: timerState.duration,
    };
  }
  return NextResponse.json({
    running: timerState.running,
    remaining: getRemaining(),
  });
}
