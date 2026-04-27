import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import SolicitorsClient from "./SolicitorsClient";

export const metadata = {
  title: "Find a Solicitor — LegalClear UK",
  description:
    "Search for SRA-registered solicitors near you by postcode and legal area. Filter by housing, employment, family, immigration, and more.",
};

export default async function SolicitorsPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  let hasCases = false;
  if (user) {
    const { count } = await supabase
      .from("cases")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .not("solicitor_pack", "is", null);
    hasCases = (count ?? 0) > 0;
  }

  return (
    <Suspense>
      <SolicitorsClient isLoggedIn={!!user} hasCases={hasCases} />
    </Suspense>
  );
}
