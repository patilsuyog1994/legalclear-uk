import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: cases } = await supabase
    .from("cases")
    .select("id, created_at, law_type, urgency_level, summary_title, input_text, pack_generated_at, share_token")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const userName = user.user_metadata?.full_name || user.email?.split("@")[0] || "there";

  return <DashboardClient initialCases={cases ?? []} userName={userName} />;
}
