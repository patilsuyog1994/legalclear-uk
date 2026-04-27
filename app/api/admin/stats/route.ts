import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

async function verifyAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single();
  return data?.is_admin ? user : null;
}

export async function GET() {
  const user = await verifyAdmin();
  if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const admin = createAdminClient();
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();

  const [totalRes, packsRes, searchesRes] = await Promise.all([
    admin.from("solicitors").select("id", { count: "exact", head: true }),
    admin.from("solicitor_contacts").select("id", { count: "exact", head: true }).gte("created_at", monthStart),
    admin.from("search_events").select("id", { count: "exact", head: true }).gte("searched_at", monthStart),
  ]);

  return NextResponse.json({
    totalSolicitors: totalRes.count ?? 0,
    packsThisMonth:  packsRes.count  ?? 0,
    searchesThisMonth: searchesRes.count ?? 0,
  });
}
