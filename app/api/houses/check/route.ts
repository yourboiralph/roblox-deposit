import { NextResponse } from "next/server";
import prisma from "@/lib/prisma"

const WINDOW_MS = 3 * 60 * 60 * 1000;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const username = searchParams.get("username");
  const botId = searchParams.get("botId");

  if (!username || !botId) {
    return NextResponse.json(
      { success: false, error: "Missing username or botId" },
      { status: 400 }
    );
  }

  // ✅ must exist in users table
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

  const state = await prisma.botUserState.findUnique({ where: { userId: user.id } });

  // No state => has full credits (3)
  if (!state) {
    return NextResponse.json({
      success: true,
      allowed: true,
      username: user.username,
      creditsRemaining: 3,
      windowStartedAt: null,
      resetAt: null,
    });
  }

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
    });
  }

  return NextResponse.json({
    success: true,
    allowed: true,
    username: user.username,
    creditsRemaining: 3,
    windowStartedAt: null,
    resetAt: null,
  });
}
