"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export type UserActionState =
  | { success: true; user: { id: string; username: string | null } }
  | { success: false; error: string }
  | null;

export async function addAllowedUserAction(
  _prevState: UserActionState,
  formData: FormData
): Promise<UserActionState> {
  const username = String(formData.get("username") ?? "").trim();
  if (!username) return { success: false, error: "Username is required" };

  try {
    const user = await prisma.user.create({
      data: { username },
      select: { id: true, username: true }, // ← Prisma returns string | null
    });

    revalidatePath("/admin/users");
    return { success: true, user };
  } catch (e: unknown) {
    const err = e as { code?: string };

    if (err?.code === "P2002") {
      return { success: false, error: "User already allowed" };
    }

    return { success: false, error: "Failed to add user" };
  }
}
