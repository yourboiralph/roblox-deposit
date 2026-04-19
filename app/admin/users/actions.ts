"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";


export type UserActionState =
  | {
      success: true;
      user: {
        id: string;
        username: string | null;
        nickname: string | null;
      };
    }
  | {
      success: false;
      error: string;
    }
  | null;

export async function addAllowedUserAction(
  prevState: UserActionState,
  formData: FormData
): Promise<UserActionState> {
  const username = String(formData.get("username") ?? "").trim();
  const nicknameRaw = String(formData.get("nickname") ?? "").trim();
  const nickname = nicknameRaw || null;

  if (!username) {
    return { success: false, error: "Username is required." };
  }

  try {
    const user = await prisma.user.create({
      data: {
        username,
        nickname,
      },
    });

    revalidatePath("/admin/users");

    return {
      success: true,
      user: {
        id: user.id,
        username: user.username,
        nickname: user.nickname,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: "Username already exists or failed to add user.",
    };
  }
}
export type ResetUserActionState = {
  success: boolean;
  username?: string;
  error?: string;
} | null;

export async function resetUserCreditsAction(
  _prev: ResetUserActionState,
  formData: FormData
): Promise<ResetUserActionState> {
  const username = String(formData.get("username") ?? "").trim();

  if (!username) return { success: false, error: "Username is required" };

  const user = await prisma.user.findFirst({ where: { username } });

  if (!user) return { success: false, error: "User not found" };

  await prisma.botUserState.updateMany({
    where: { userId: user.id },
    data: { creditsRemaining: 3, windowStartedAt: null },
  });

  return { success: true, username };
}
export type NicknameActionState =
  | {
      success: true;
      username: string;
      nickname: string | null;
    }
  | {
      success: false;
      username: string;
      error: string;
    }
  | null;
export async function updateUserNicknameAction(
  prevState: NicknameActionState,
  formData: FormData
): Promise<NicknameActionState> {
  const username = String(formData.get("username") ?? "").trim();
  const nicknameRaw = String(formData.get("nickname") ?? "").trim();
  const nickname = nicknameRaw || null;

  if (!username) {
    return {
      success: false,
      username: "",
      error: "Username is required.",
    };
  }

  try {
    const user = await prisma.user.update({
      where: { username },
      data: { nickname },
    });

    revalidatePath("/admin/users");

    return {
      success: true,
      username,
      nickname: user.nickname,
    };
  } catch {
    return {
      success: false,
      username,
      error: "Failed to update nickname.",
    };
  }
}