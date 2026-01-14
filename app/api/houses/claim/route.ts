import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

const WINDOW_MS = 3 * 60 * 60 * 1000;

export async function POST(req: Request) {
  try {
    const body: unknown = await req.json();

    const b = body as { username?: unknown; botId?: unknown; houseKey?: unknown };

    const username = String(b?.username ?? "").trim();
    const botIdRaw = String(b?.botId ?? "").trim();
    const botId = botIdRaw.toLowerCase();
    const houseKey = b?.houseKey != null ? String(b.houseKey) : null;

    if (!username || !botId) {
      return NextResponse.json(
        { success: false, error: "username and botId are required" },
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
        { success: false, allowed: false, reason: "BOT_NOT_FOUND" },
        { status: 404 }
      );
    }

    // user must exist (allowed list)
    const user = await prisma.user.findFirst({
      where: { username },
      select: { id: true, username: true },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, allowed: false, reason: "USERNAME_NOT_ALLOWED" },
        { status: 403 }
      );
    }

    const now = new Date();

    const result = await prisma.$transaction(async (tx) => {
      let state = await tx.botUserState.findUnique({
        where: { userId: user.id }, // userId is unique
      });

      if (!state) {
        state = await tx.botUserState.create({
          data: {
            userId: user.id,
            botId,
            creditsRemaining: 3,
            windowStartedAt: null,
          },
        });
      }

      // If bot changed, update to provided botId
      if (state.botId !== botId) {
        state = await tx.botUserState.update({
          where: { userId: user.id },
          data: { botId },
        });
      }

      // Reset if expired
      if (state.windowStartedAt) {
        const resetAt = new Date(state.windowStartedAt.getTime() + WINDOW_MS);
        if (now.getTime() >= resetAt.getTime()) {
          state = await tx.botUserState.update({
            where: { userId: user.id },
            data: { creditsRemaining: 3, windowStartedAt: null },
          });
        }
      }

      const effectiveCredits = state.windowStartedAt ? state.creditsRemaining : 3;

      if (effectiveCredits <= 0) {
        const resetAt = state.windowStartedAt
          ? new Date(state.windowStartedAt.getTime() + WINDOW_MS)
          : null;

        return {
          ok: false as const,
          reason: "MAX_REACHED" as const,
          creditsRemaining: 0,
          windowStartedAt: state.windowStartedAt,
          resetAt,
        };
      }

      const isFirst = !state.windowStartedAt;

      const updated = await tx.botUserState.update({
        where: { userId: user.id },
        data: {
          windowStartedAt: isFirst ? now : state.windowStartedAt,
          creditsRemaining: isFirst ? 2 : { decrement: 1 },
        },
      });

      const claim = await tx.houseClaim.create({
        data: {
          userId: user.id,
          botId,
          houseKey: houseKey ?? undefined,
          claimedAt: now,
        },
        select: { id: true, claimedAt: true, houseKey: true },
      });

      const resetAt = new Date(updated.windowStartedAt!.getTime() + WINDOW_MS);
      const claimNumber = 3 - updated.creditsRemaining;

      return {
        ok: true as const,
        claimId: claim.id,
        claimNumber,
        creditsRemaining: updated.creditsRemaining,
        windowStartedAt: updated.windowStartedAt,
        resetAt,
      };
    });

    if (!result.ok) {
      return NextResponse.json(
        {
          success: false,
          allowed: false,
          reason: result.reason,
          creditsRemaining: result.creditsRemaining,
          windowStartedAt: result.windowStartedAt,
          resetAt: result.resetAt,
        },
        { status: 429 }
      );
    }

    return NextResponse.json({
      success: true,
      allowed: true,
      username: user.username ?? username, // ✅ avoid string | null leak
      botId,
      claimId: result.claimId,
      claimNumber: result.claimNumber,
      creditsRemaining: result.creditsRemaining,
      windowStartedAt: result.windowStartedAt,
      resetAt: result.resetAt,
    });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : typeof err === "string" ? err : "Unknown error";

    console.error("❌ /api/houses/claim error:", err);

    return NextResponse.json(
      { success: false, error: "Internal Server Error", details: message },
      { status: 500 }
    );
  }
}
