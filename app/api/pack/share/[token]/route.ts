import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/pack/share/[token]
 *
 * Public endpoint — no authentication required.
 * Security model: the share_token is a cryptographically random UUID that
 * acts as a bearer credential. Knowing the token is sufficient to read the
 * pack. Revoking access means setting share_token to NULL in the cases table.
 *
 * This route uses the Supabase anon key, so it only works when a matching
 * RLS policy allows anonymous SELECT on rows where share_token IS NOT NULL.
 * Required SQL (run once in Supabase):
 *   CREATE POLICY "Public: read shared cases"
 *   ON cases FOR SELECT TO anon
 *   USING (share_token IS NOT NULL);
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  /* Basic token sanity check */
  if (!token || token.length < 8) {
    return NextResponse.json({ error: "Invalid share token." }, { status: 400 });
  }

  /* Use the anon Supabase client — no user session required */
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data, error } = await supabase
    .from("cases")
    .select("solicitor_pack, summary_title, pack_generated_at, share_token")
    .eq("share_token", token)
    .not("share_token", "is", null)
    .single();

  if (error || !data) {
    return NextResponse.json(
      { error: "Pack not found. The link may have been disabled by the owner." },
      { status: 404 }
    );
  }

  if (!data.solicitor_pack) {
    return NextResponse.json(
      { error: "Pack data is not yet available for this case." },
      { status: 404 }
    );
  }

  /* Return only the fields needed for the public view — nothing sensitive */
  return NextResponse.json({
    pack:            data.solicitor_pack,
    title:           data.summary_title   ?? "Legal Matter",
    packGeneratedAt: data.pack_generated_at,
  });
}
