import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST() {
  try {
    const admin = createAdminClient();
    await admin.from("search_events").insert({});
  } catch {
    /* Non-critical — silently ignore */
  }
  return NextResponse.json({ ok: true });
}
