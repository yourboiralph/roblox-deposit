"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

type BotActionState =
  | { success: true; bot: { id: string; name: string } }
  | { success: false; error: string; botId?: string };

function toBotId(name: string) {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s_-]/g, "") // ✅ fixed: '-' safe in char class
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export async function createBotAction(
  _prevState: BotActionState | null,
  formData: FormData
): Promise<BotActionState> {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { success: false, error: "Bot name is required" };

  const id = toBotId(name);
  if (!id) return { success: false, error: "Invalid bot name" };

  try {
    const bot = await prisma.bot.create({
      data: { id, name },
      select: { id: true, name: true },
    });

    revalidatePath("/admin/bots");
    return { success: true, bot };
  } catch (e: unknown) {
    const err = e as { code?: string };

    if (err?.code === "P2002") {
      return { success: false, error: "Bot already exists", botId: id };
    }

    return { success: false, error: "Failed to create bot" };
  }
}
