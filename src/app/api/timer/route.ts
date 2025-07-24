import { NextRequest, NextResponse } from "next/server";

let timerState: {
  start: number | null;
  duration: number;
  running: boolean;
  remaining: number;
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
  const elapsed = Math.floor((Date.now() - (timerState.start ?? 0)) / 1000);
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
    const duration = parseTime(time);
    timerState = {
      start: Date.now(),
      duration,
      running: true,
      remaining: duration,
    };
  } else if (action === "stop") {
    timerState = {
      ...timerState,
      running: false,
      remaining: getRemaining(),
    };
  } else if (action === "reset") {
    timerState = {
      ...timerState,
      running: false,
      remaining: timerState.duration,
      start: null,
    };
  }
  return NextResponse.json({
    running: timerState.running,
    remaining: getRemaining(),
  });
}
