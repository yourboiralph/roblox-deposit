import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

type IncomingBody = {
  username?: unknown;
  botId?: unknown;
  ghibli?: unknown;
  sanrio?: unknown;
};

function isNonEmptyString(v: unknown): v is string {
  return typeof v === "string" && v.trim().length > 0;
}

function toNonNegativeInt(v: unknown): number | null {
  if (typeof v !== "number") return null;
  if (!Number.isInteger(v)) return null;
  if (v < 0) return null;
  return v;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as IncomingBody;

    const username = isNonEmptyString(body.username) ? body.username.trim() : "";
    const botId = isNonEmptyString(body.botId) ? body.botId.trim().toLowerCase() : "";

    const ghibli = toNonNegativeInt(body.ghibli);
    const sanrio = toNonNegativeInt(body.sanrio);

    if (!username || !botId) {
      return NextResponse.json(
        { success: false, error: "username and botId are required" },
        { status: 400 }
      );
    }

    if (ghibli === null || sanrio === null) {
      return NextResponse.json(
        { success: false, error: "ghibli and sanrio must be non-negative integers" },
        { status: 400 }
      );
    }

    // optional rule: limit priority to max 3
    if (ghibli + sanrio > 3) {
      return NextResponse.json(
        { success: false, error: "priority total must be <= 3" },
        { status: 400 }
      );
    }

    // bot must exist
    const bot = await prisma.bot.findUnique({
      where: { id: botId },
      select: { id: true },
    });

    if (!bot) {
      return NextResponse.json(
        { success: false, reason: "BOT_NOT_FOUND" },
        { status: 404 }
      );
    }

    // user must exist (allowed list)
    const user = await prisma.user.findUnique({
      where: { username },
      select: { id: true, username: true },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, reason: "USERNAME_NOT_ALLOWED" },
        { status: 403 }
      );
    }

    // interpret 0/0 as "no priority"
    const shouldClear = ghibli === 0 && sanrio === 0;

    // ensure state exists and update priority
    const state = await prisma.botUserState.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        botId,
        creditsRemaining: 3,
        windowStartedAt: null,
        priorityGhibli: shouldClear ? null : ghibli,
        prioritySanrio: shouldClear ? null : sanrio,
      },
      update: {
        botId,
        priorityGhibli: shouldClear ? null : ghibli,
        prioritySanrio: shouldClear ? null : sanrio,
      },
      select: { priorityGhibli: true, prioritySanrio: true },
    });

    return NextResponse.json({
      success: true,
      priority:
        state.priorityGhibli == null && state.prioritySanrio == null
          ? null
          : {
              ghibli: state.priorityGhibli ?? 0,
              sanrio: state.prioritySanrio ?? 0,
            },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("❌ /api/houses/priority error:", err);

    return NextResponse.json(
      { success: false, error: "Internal Server Error", details: message },
      { status: 500 }
    );
  }
}
