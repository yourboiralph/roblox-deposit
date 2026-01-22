import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

const WINDOW_MS = 3 * 60 * 60 * 1000;

type Priority = { ghibli: number; sanrio: number } | null;

function getPriority(state: {
  priorityGhibli: number | null;
  prioritySanrio: number | null;
}): Priority {
  const g = state.priorityGhibli;
  const s = state.prioritySanrio;

  // if both null => no priority
  if (g == null && s == null) return null;

  // normalize invalid values to 0
  const gg = typeof g === "number" && Number.isInteger(g) && g > 0 ? g : 0;
  const ss = typeof s === "number" && Number.isInteger(s) && s > 0 ? s : 0;

  // if both ended up 0 => treat as no priority
  if (gg === 0 && ss === 0) return null;

  return { ghibli: gg, sanrio: ss };
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const username = searchParams.get("username")?.trim() ?? "";
  const botId = searchParams.get("botId")?.trim().toLowerCase() ?? "";

  if (!username || !botId) {
    return NextResponse.json(
      { success: false, error: "Missing username or botId" },
      { status: 400 }
    );
  }

  // ✅ bot must exist
  const bot = await prisma.bot.findUnique({
    where: { id: botId },
    select: { id: true },
  });

  if (!bot) {
    return NextResponse.json(
      { success: false, allowed: false, reason: "BOT_NOT_FOUND" },
      { status: 404 }
    );
  }

  // ✅ user must exist in allowed users table
  const user = await prisma.user.findUnique({
    where: { username },
    select: { id: true, username: true },
  });

  if (!user) {
    return NextResponse.json(
      { success: false, allowed: false, reason: "USERNAME_NOT_ALLOWED" },
      { status: 403 }
    );
  }

  const state = await prisma.botUserState.findUnique({
    where: { userId: user.id },
    select: {
      creditsRemaining: true,
      windowStartedAt: true,
      priorityGhibli: true,
      prioritySanrio: true,
    },
  });

  // No state => has full credits (3) and no priority by default
  if (!state) {
    return NextResponse.json({
      success: true,
      allowed: true,
      username: user.username,
      creditsRemaining: 3,
      windowStartedAt: null,
      resetAt: null,
      priority: null as Priority,
    });
  }

  const priority = getPriority(state);

  // If window started, compute resetAt + expiry
  if (state.windowStartedAt) {
    const resetAt = new Date(state.windowStartedAt.getTime() + WINDOW_MS);
    const expired = Date.now() >= resetAt.getTime();

    if (expired) {
      return NextResponse.json({
        success: true,
        allowed: true,
        username: user.username,
        creditsRemaining: 3,
        windowStartedAt: null,
        resetAt: null,
        priority,
        note: "Window expired; credits effectively reset.",
      });
    }

    return NextResponse.json({
      success: true,
      allowed: state.creditsRemaining > 0,
      username: user.username,
      creditsRemaining: state.creditsRemaining,
      windowStartedAt: state.windowStartedAt,
      resetAt,
      priority,
    });
  }

  // window not started => effectively full credits
  return NextResponse.json({
    success: true,
    allowed: true,
    username: user.username,
    creditsRemaining: 3,
    windowStartedAt: null,
    resetAt: null,
    priority,
  });
}
