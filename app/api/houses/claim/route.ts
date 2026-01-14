import { NextResponse } from "next/server";

// IMPORTANT: import PrismaClient from YOUR generated output
import prisma from "@/lib/prisma";


const WINDOW_MS = 3 * 60 * 60 * 1000;

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const username = String(body?.username ?? "").trim();
    const botIdRaw = String(body?.botId ?? "").trim();
    const botId = botIdRaw.toLowerCase();
    const houseKey = body?.houseKey ? String(body.houseKey) : null;
    

    if (!username || !botId) {
      return NextResponse.json(
        { success: false, error: "username and botId are required" },
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

    // ✅ user must exist (allowed user list)
    // NOTE: username is optional in your schema, so use findFirst to avoid type weirdness.
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
        where: { userId: user.id }, // userId is unique in your schema
      });

      if (!state) {
        state = await tx.botUserState.create({
          data: {
            userId: user.id,
            botId: botId,
            creditsRemaining: 3,
            windowStartedAt: null,
          },
        });
      }

      // If bot changed, you can either block or update; here we update to the provided botId.
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
          reason: "MAX_REACHED",
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
      username: user.username,
      botId,
      claimId: result.claimId,
      claimNumber: result.claimNumber,
      creditsRemaining: result.creditsRemaining,
      windowStartedAt: result.windowStartedAt,
      resetAt: result.resetAt,
    });
  } catch (err: any) {
    console.error("❌ /api/houses/claim error:", err);
    return NextResponse.json(
      { success: false, error: "Internal Server Error", details: err?.message ?? String(err) },
      { status: 500 }
    );
  }
}
