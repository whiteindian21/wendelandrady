"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { markNotificationRead, markAllNotificationsRead } from "@/lib/notifications";

export async function markReadAction(id: string) {
  const user = await requireUser();
  try {
    await markNotificationRead(id, user.id);
    revalidatePath("/dashboard", "layout");
    return { ok: true };
  } catch (e) {
    const message = e instanceof Error ? e.message : "An unknown error occurred.";
    return { ok: false, error: message };
  }
}

export async function markAllReadAction() {
  const user = await requireUser();
  try {
    await markAllNotificationsRead(user.id);
    revalidatePath("/dashboard", "layout");
    return { ok: true };
  } catch (e) {
    const message = e instanceof Error ? e.message : "An unknown error occurred.";
    return { ok: false, error: message };
  }
}