import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

interface SupabaseSolicitor {
  id: string;
  firm_name: string;
  solicitor_name: string;
  job_title: string;
  sra_number: string;
  email: string;
  phone: string;
  website: string;
  address: string;
  postcode: string;
  legal_areas: string[];
  jurisdictions: string[];
  description: string;
  verified: boolean;
  featured: boolean;
  created_at: string;
}

interface GeocodeResult {
  postcode: string;
  latitude: number | null;
  longitude: number | null;
  admin_district: string | null;
}

async function geocodePostcodes(postcodes: string[]): Promise<Map<string, GeocodeResult>> {
  const map = new Map<string, GeocodeResult>();
  if (!postcodes.length) return map;

  try {
    const res = await fetch("https://api.postcodes.io/postcodes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postcodes }),
    });
    const json = await res.json();
    if (json.status === 200 && Array.isArray(json.result)) {
      for (const item of json.result) {
        const pc = item.query as string;
        if (item.result) {
          map.set(pc, {
            postcode: pc,
            latitude: item.result.latitude,
            longitude: item.result.longitude,
            admin_district: item.result.admin_district ?? null,
          });
        } else {
          map.set(pc, { postcode: pc, latitude: null, longitude: null, admin_district: null });
        }
      }
    }
  } catch { /* silent — return empty map */ }

  return map;
}

export async function GET() {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("solicitors")
    .select("*")
    .eq("verified", true)
    .order("featured", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const rows = (data ?? []) as SupabaseSolicitor[];
  if (!rows.length) return NextResponse.json({ solicitors: [] });

  /* Geocode all postcodes in one batch request */
  const postcodes = rows.map(r => r.postcode);
  const geoMap = await geocodePostcodes(postcodes);

  const solicitors = rows.map(row => {
    const geo = geoMap.get(row.postcode);
    /* Extract city from admin_district or last part of address */
    const city = geo?.admin_district ?? row.address.split(",").pop()?.trim() ?? row.postcode;

    return {
      id:            row.id,          /* UUID — distinguishes from mock slug IDs */
      firmName:      row.firm_name,
      solicitorName: row.solicitor_name,
      title:         "",
      jobTitle:      row.job_title,
      sraNumber:     row.sra_number,
      email:         row.email,
      phone:         row.phone,
      website:       row.website,
      address:       row.address,
      city,
      postcode:      row.postcode,
      lat:           geo?.latitude  ?? 0,
      lng:           geo?.longitude ?? 0,
      legalAreas:    row.legal_areas,
      jurisdictions: row.jurisdictions,
      description:   row.description ?? "",
      verified:      row.verified,
      featured:      row.featured,
      rating:        0,
      reviews:       [],
      source:        "supabase" as const,
    };
  });

  return NextResponse.json({ solicitors });
}
