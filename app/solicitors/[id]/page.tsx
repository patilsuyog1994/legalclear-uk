import { notFound } from "next/navigation";
import { getSolicitorById, type Solicitor } from "@/lib/solicitorData";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import SolicitorProfileClient from "./SolicitorProfileClient";

interface Props {
  params: Promise<{ id: string }>;
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function getSupabaseSolicitor(id: string): Promise<Solicitor | null> {
  try {
    const admin = createAdminClient();
    const { data } = await admin
      .from("solicitors")
      .select("*")
      .eq("id", id)
      .eq("verified", true)
      .single();
    if (!data) return null;

    /* Geocode postcode for lat/lng */
    let lat = 0, lng = 0, city = data.postcode;
    try {
      const clean = data.postcode.replace(/\s+/g, "").toUpperCase();
      const gRes = await fetch(`https://api.postcodes.io/postcodes/${encodeURIComponent(clean)}`);
      const gJson = await gRes.json();
      if (gJson.status === 200) {
        lat  = gJson.result.latitude;
        lng  = gJson.result.longitude;
        city = gJson.result.admin_district ?? data.postcode;
      }
    } catch { /* use defaults */ }

    return {
      id:            data.id,
      firmName:      data.firm_name,
      solicitorName: data.solicitor_name,
      title:         "",
      jobTitle:      data.job_title,
      city,
      address:       data.address,
      postcode:      data.postcode,
      lat, lng,
      legalAreas:    data.legal_areas,
      jurisdictions: data.jurisdictions,
      rating:        0,
      reviewCount:   0,
      phone:         data.phone,
      email:         data.email,
      website:       data.website,
      sraNumber:     data.sra_number,
      verified:      data.verified,
      featured:      data.featured,
      description:   data.description ?? "",
      reviews:       [],
      source:        "supabase",
    };
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const solicitor = UUID_RE.test(id)
    ? await getSupabaseSolicitor(id)
    : getSolicitorById(id);
  if (!solicitor) return { title: "Solicitor not found — LegalClear UK" };
  return {
    title: `${solicitor.firmName} — ${solicitor.city} | LegalClear UK`,
    description: `${solicitor.solicitorName} at ${solicitor.firmName} in ${solicitor.city}. Specialising in ${solicitor.legalAreas.join(", ")}.`,
  };
}

export default async function SolicitorProfilePage({ params }: Props) {
  const { id } = await params;

  const solicitor = UUID_RE.test(id)
    ? await getSupabaseSolicitor(id)
    : getSolicitorById(id);

  if (!solicitor) notFound();

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let hasSentPack = false;
  if (user) {
    const { count } = await supabase
      .from("solicitor_contacts")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("solicitor_id", id);
    hasSentPack = (count ?? 0) > 0;
  }

  return (
    <SolicitorProfileClient
      solicitor={solicitor}
      isLoggedIn={!!user}
      hasSentPack={hasSentPack}
    />
  );
}
