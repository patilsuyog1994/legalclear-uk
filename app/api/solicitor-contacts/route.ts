import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { Resend } from "resend";
import { getSolicitorById } from "@/lib/solicitorData";
import { createAdminClient } from "@/lib/supabase/admin";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function resolveSolicitor(id: string) {
  if (UUID_RE.test(id)) {
    const admin = createAdminClient();
    const { data } = await admin.from("solicitors").select("solicitor_name,firm_name,email,phone,address,postcode").eq("id", id).single();
    if (!data) return null;
    return { solicitorName: data.solicitor_name, firmName: data.firm_name, email: data.email, phone: data.phone ?? "", address: data.address, postcode: data.postcode };
  }
  const s = getSolicitorById(id);
  if (!s) return null;
  return { solicitorName: s.solicitorName, firmName: s.firmName, email: s.email, phone: s.phone ?? "", address: s.address, postcode: s.postcode };
}

/* Lazy — only instantiate when RESEND_API_KEY is present, avoiding a
   module-level throw in dev environments where the key isn't set yet. */
function getResend(): Resend | null {
  if (!process.env.RESEND_API_KEY) return null;
  return new Resend(process.env.RESEND_API_KEY);
}

/* ─── Email helpers ───────────────────────────────────────────── */

const FROM = process.env.RESEND_FROM_EMAIL ?? "LegalClear UK <onboarding@resend.dev>";
const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

function urgencyColour(level: string): string {
  if (level === "High") return "#dc2626";
  if (level === "Medium") return "#d97706";
  return "#16a34a";
}

/** Email to solicitor — HTML */
function solicitorEmail(opts: {
  userName:      string;
  userEmail:     string;
  summaryTitle:  string;
  lawType:       string;
  urgencyLevel:  string;
  urgencyReason: string;
  packUrl:       string;
  solicitorName: string;
  firmName:      string;
}): string {
  const { userName, userEmail, summaryTitle, lawType, urgencyLevel, urgencyReason, packUrl, solicitorName, firmName } = opts;
  const urg = urgencyColour(urgencyLevel);
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f8f7f3;font-family:'Helvetica Neue',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f7f3;padding:40px 0;">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

      <!-- Header -->
      <tr><td style="background:#0f6e56;border-radius:12px 12px 0 0;padding:32px 40px;text-align:center;">
        <div style="font-size:11px;font-weight:700;color:rgba(255,255,255,0.6);letter-spacing:0.12em;text-transform:uppercase;margin-bottom:8px;">LegalClear UK</div>
        <div style="font-size:22px;font-weight:700;color:#fff;">New Client Enquiry</div>
        <div style="font-size:14px;color:rgba(255,255,255,0.75);margin-top:6px;">via LegalClear UK Solicitor Directory</div>
      </td></tr>

      <!-- Body -->
      <tr><td style="background:#fff;padding:36px 40px;">

        <p style="font-size:16px;color:#1c1c1c;margin:0 0 20px;">Dear ${solicitorName},</p>

        <p style="font-size:14px;color:#444;line-height:1.7;margin:0 0 20px;">
          A potential client has found your profile on <strong>LegalClear UK</strong> and has chosen to share their pre-solicitor briefing pack with <strong>${firmName}</strong>. Their details are below.
        </p>

        <!-- Client details box -->
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f7f3;border-radius:10px;border:1px solid #e5e0d8;margin-bottom:24px;">
          <tr><td style="padding:24px 28px;">
            <div style="font-size:11px;font-weight:700;color:#aaa;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:16px;">Client Details</div>
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="font-size:13px;color:#888;width:120px;padding-bottom:10px;">Name</td>
                <td style="font-size:14px;font-weight:600;color:#1c1c1c;padding-bottom:10px;">${userName}</td>
              </tr>
              <tr>
                <td style="font-size:13px;color:#888;padding-bottom:10px;">Email</td>
                <td style="font-size:14px;font-weight:600;color:#0f6e56;padding-bottom:10px;">
                  <a href="mailto:${userEmail}" style="color:#0f6e56;text-decoration:none;">${userEmail}</a>
                </td>
              </tr>
            </table>
          </td></tr>
        </table>

        <!-- Case summary box -->
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f7f3;border-radius:10px;border:1px solid #e5e0d8;margin-bottom:24px;">
          <tr><td style="padding:24px 28px;">
            <div style="font-size:11px;font-weight:700;color:#aaa;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:16px;">Legal Situation Summary</div>
            <div style="font-size:18px;font-weight:700;color:#1c1c1c;margin-bottom:12px;">${summaryTitle}</div>
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="font-size:13px;color:#888;width:120px;padding-bottom:8px;">Law area</td>
                <td style="padding-bottom:8px;"><span style="background:#e8f4f0;color:#0f6e56;font-size:12px;font-weight:600;padding:3px 10px;border-radius:999px;">${lawType}</span></td>
              </tr>
              <tr>
                <td style="font-size:13px;color:#888;padding-bottom:8px;">Urgency</td>
                <td style="padding-bottom:8px;"><span style="color:${urg};font-size:13px;font-weight:700;">${urgencyLevel}${urgencyReason ? ` — ${urgencyReason}` : ""}</span></td>
              </tr>
            </table>
          </td></tr>
        </table>

        <!-- View pack CTA -->
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
          <tr><td align="center">
            <a href="${packUrl}" style="display:inline-block;padding:14px 32px;background:#0f6e56;color:#fff;font-size:15px;font-weight:700;text-decoration:none;border-radius:10px;">
              View Full Solicitor Pack →
            </a>
          </td></tr>
        </table>

        <p style="font-size:13px;color:#888;line-height:1.6;margin:0 0 8px;">
          The pack includes a detailed client summary, timeline of events, relevant UK law context, key facts, suggested questions, and documents to gather.
        </p>
        <p style="font-size:13px;color:#888;line-height:1.6;margin:0;">
          Please contact the client directly at <a href="mailto:${userEmail}" style="color:#0f6e56;">${userEmail}</a> to arrange a consultation.
        </p>

      </td></tr>

      <!-- Footer -->
      <tr><td style="background:#f0ece6;border-radius:0 0 12px 12px;padding:20px 40px;">
        <p style="font-size:11px;color:#aaa;line-height:1.7;margin:0;text-align:center;">
          This enquiry was generated by <strong style="color:#888;">LegalClear UK</strong>. LegalClear UK provides legal information only and does not represent this client.<br/>
          LegalClear UK does not accept referral fees and has not verified this client's details independently.
        </p>
      </td></tr>

    </table>
  </td></tr>
</table>
</body>
</html>`;
}

/** Confirmation email to user — HTML */
function userConfirmationEmail(opts: {
  userName:      string;
  solicitorName: string;
  firmName:      string;
  firmAddress:   string;
  firmPhone:     string;
  firmEmail:     string;
  summaryTitle:  string;
  packUrl:       string;
}): string {
  const { userName, solicitorName, firmName, firmAddress, firmPhone, firmEmail, summaryTitle, packUrl } = opts;
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f8f7f3;font-family:'Helvetica Neue',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f7f3;padding:40px 0;">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

      <!-- Header -->
      <tr><td style="background:#0f6e56;border-radius:12px 12px 0 0;padding:32px 40px;text-align:center;">
        <div style="font-size:11px;font-weight:700;color:rgba(255,255,255,0.6);letter-spacing:0.12em;text-transform:uppercase;margin-bottom:8px;">LegalClear UK</div>
        <div style="font-size:40px;margin-bottom:8px;">✓</div>
        <div style="font-size:22px;font-weight:700;color:#fff;">Your case pack has been sent</div>
      </td></tr>

      <!-- Body -->
      <tr><td style="background:#fff;padding:36px 40px;">

        <p style="font-size:16px;color:#1c1c1c;margin:0 0 20px;">Hi ${userName},</p>

        <p style="font-size:14px;color:#444;line-height:1.7;margin:0 0 24px;">
          Your pre-solicitor briefing pack for <strong>${summaryTitle}</strong> has been successfully sent to:
        </p>

        <!-- Solicitor details box -->
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0faf6;border-radius:10px;border:2px solid #0f6e56;margin-bottom:28px;">
          <tr><td style="padding:24px 28px;">
            <div style="font-size:18px;font-weight:700;color:#1c1c1c;margin-bottom:4px;">${firmName}</div>
            <div style="font-size:14px;color:#555;margin-bottom:16px;">${solicitorName}</div>
            <table cellpadding="0" cellspacing="0">
              <tr>
                <td style="font-size:13px;color:#888;width:80px;padding-bottom:6px;">Address</td>
                <td style="font-size:13px;color:#333;padding-bottom:6px;">${firmAddress}</td>
              </tr>
              <tr>
                <td style="font-size:13px;color:#888;padding-bottom:6px;">Phone</td>
                <td style="font-size:13px;color:#333;padding-bottom:6px;">${firmPhone}</td>
              </tr>
              <tr>
                <td style="font-size:13px;color:#888;">Email</td>
                <td style="font-size:13px;color:#0f6e56;">${firmEmail}</td>
              </tr>
            </table>
          </td></tr>
        </table>

        <p style="font-size:14px;color:#444;line-height:1.7;margin:0 0 8px;">
          <strong>${solicitorName}</strong> will contact you directly using your registered email address to arrange a consultation.
        </p>
        <p style="font-size:14px;color:#444;line-height:1.7;margin:0 0 24px;">
          In the meantime, you can view your solicitor pack at any time using the link below.
        </p>

        <!-- View pack CTA -->
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
          <tr><td align="center">
            <a href="${packUrl}" style="display:inline-block;padding:13px 28px;background:#0f6e56;color:#fff;font-size:14px;font-weight:700;text-decoration:none;border-radius:10px;">
              View your solicitor pack →
            </a>
          </td></tr>
        </table>

        <p style="font-size:13px;color:#aaa;line-height:1.6;margin:0;">
          Once you have attended your consultation, you will be able to leave a verified review for ${firmName} on LegalClear UK.
        </p>

      </td></tr>

      <!-- Footer -->
      <tr><td style="background:#f0ece6;border-radius:0 0 12px 12px;padding:20px 40px;">
        <p style="font-size:11px;color:#aaa;line-height:1.7;margin:0;text-align:center;">
          LegalClear UK · Free legal information for people in England, Wales, Scotland &amp; Northern Ireland<br/>
          We do not endorse any solicitor and do not accept referral fees. Always verify solicitor credentials on the SRA register.
        </p>
      </td></tr>

    </table>
  </td></tr>
</table>
</body>
</html>`;
}

/* ─── Route ───────────────────────────────────────────────────── */

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();

    /* ── Auth ── */
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

    /* ── Parse body ── */
    const { solicitorId, caseId } = await req.json() as { solicitorId: string; caseId: string };
    if (!solicitorId || !caseId) {
      return NextResponse.json({ error: "solicitorId and caseId are required." }, { status: 400 });
    }

    /* ── Resolve solicitor (mock or Supabase) ── */
    const solicitor = await resolveSolicitor(solicitorId);
    if (!solicitor) return NextResponse.json({ error: "Solicitor not found." }, { status: 404 });

    /* ── Fetch case ── */
    const { data: caseRow, error: caseErr } = await supabase
      .from("cases")
      .select("id, summary_title, law_type, urgency_level, full_result, solicitor_pack, share_token")
      .eq("id", caseId)
      .eq("user_id", user.id)
      .single();

    if (caseErr || !caseRow) {
      return NextResponse.json({ error: "Case not found." }, { status: 404 });
    }
    if (!caseRow.solicitor_pack) {
      return NextResponse.json({ error: "This case does not have a solicitor pack yet." }, { status: 400 });
    }

    /* ── Ensure share_token exists (generate if needed) ── */
    let shareToken: string = caseRow.share_token ?? "";
    if (!shareToken) {
      shareToken = crypto.randomUUID();
      await supabase.from("cases").update({ share_token: shareToken }).eq("id", caseId);
    }
    const packUrl = `${SITE}/pack/view/${shareToken}`;

    /* ── User display name ── */
    const userName: string = user.user_metadata?.full_name || user.email?.split("@")[0] || "A LegalClear UK user";
    const userEmail = user.email ?? "";

    const fullResult = caseRow.full_result as Record<string, unknown> | null;
    const urgencyReason = (fullResult?.urgencyReason as string | undefined) ?? "";

    /* ── Send emails via Resend (skipped gracefully in dev if key not set) ── */
    const resend = getResend();
    if (resend) {
      await resend.emails.send({
        from:    FROM,
        to:      solicitor.email,
        subject: `New client enquiry via LegalClear UK — ${caseRow.summary_title}`,
        html:    solicitorEmail({
          userName,
          userEmail,
          summaryTitle:  caseRow.summary_title,
          lawType:       caseRow.law_type,
          urgencyLevel:  caseRow.urgency_level,
          urgencyReason,
          packUrl,
          solicitorName: solicitor.solicitorName,
          firmName:      solicitor.firmName,
        }),
      });

      await resend.emails.send({
        from:    FROM,
        to:      userEmail,
        subject: `Your case pack has been sent to ${solicitor.firmName} — LegalClear UK`,
        html:    userConfirmationEmail({
          userName,
          solicitorName: solicitor.solicitorName,
          firmName:      solicitor.firmName,
          firmAddress:   `${solicitor.address}, ${solicitor.postcode}`,
          firmPhone:     solicitor.phone,
          firmEmail:     solicitor.email,
          summaryTitle:  caseRow.summary_title,
          packUrl,
        }),
      });
    } else {
      console.warn("[solicitor-contacts] RESEND_API_KEY not set — skipping emails (dev mode)");
    }

    /* ── Save contact record ── */
    const { error: insertErr } = await supabase
      .from("solicitor_contacts")
      .insert({
        user_id:      user.id,
        solicitor_id: solicitorId,
        case_id:      caseId,
        sent_at:      new Date().toISOString(),
      });

    if (insertErr) {
      /* Don't fail the whole request if saving fails — emails already sent */
      console.error("[solicitor-contacts] DB insert failed:", insertErr.message);
    }

    return NextResponse.json({
      success:     true,
      packUrl,
      solicitorName: solicitor.solicitorName,
      firmName:    solicitor.firmName,
    });

  } catch (err) {
    console.error("[/api/solicitor-contacts] Error:", err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}

/* ─── GET — check if user has already sent a pack to a solicitor ── */
export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ hasSent: false });

  const solicitorId = req.nextUrl.searchParams.get("solicitorId");
  if (!solicitorId) return NextResponse.json({ hasSent: false });

  const { count } = await supabase
    .from("solicitor_contacts")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("solicitor_id", solicitorId);

  return NextResponse.json({ hasSent: (count ?? 0) > 0 });
}
