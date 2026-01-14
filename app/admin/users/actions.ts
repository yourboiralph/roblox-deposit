"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export type UserActionState =
  | { success: true; user: { id: string; username: string } }
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
      select: { id: true, username: true },
    });

    revalidatePath("/admin/users");
    return { success: true, user };
  } catch (e: any) {
    if (e?.code === "P2002") {
      return { success: false, error: "User already allowed" };
    }
    return { success: false, error: "Failed to add user" };
  }
}
