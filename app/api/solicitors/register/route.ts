import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { Resend } from "resend";

function getResend(): Resend | null {
  if (!process.env.RESEND_API_KEY) return null;
  return new Resend(process.env.RESEND_API_KEY);
}

const FROM       = process.env.RESEND_FROM_EMAIL ?? "LegalClear UK <onboarding@resend.dev>";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "admin@legalclear-uk.com";

/* ─── Types ──────────────────────────────────────────────────── */

interface RegistrationBody {
  firmName:     string;
  solicitorName: string;
  jobTitle:     string;
  sraNumber:    string;
  email:        string;
  phone:        string;
  website:      string;
  address:      string;
  postcode:     string;
  legalAreas:   string[];
  jurisdictions: string[];
  description:  string;
  howHeard:     string;
}

/* ─── Email templates ────────────────────────────────────────── */

function solicitorConfirmationEmail(name: string, firmName: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f8f7f3;font-family:'Helvetica Neue',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f7f3;padding:40px 0;">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
      <tr><td style="background:#0f6e56;border-radius:12px 12px 0 0;padding:32px 40px;text-align:center;">
        <div style="font-size:11px;font-weight:700;color:rgba(255,255,255,0.6);letter-spacing:0.12em;text-transform:uppercase;margin-bottom:8px;">LegalClear UK</div>
        <div style="font-size:36px;margin-bottom:10px;">✓</div>
        <div style="font-size:22px;font-weight:700;color:#fff;">Listing received</div>
        <div style="font-size:14px;color:rgba(255,255,255,0.75);margin-top:6px;">We'll be in touch within 2 working days</div>
      </td></tr>
      <tr><td style="background:#fff;padding:36px 40px;">
        <p style="font-size:16px;color:#1c1c1c;margin:0 0 20px;">Dear ${name},</p>
        <p style="font-size:14px;color:#444;line-height:1.8;margin:0 0 24px;">
          Thank you for submitting <strong>${firmName}</strong> to the LegalClear UK solicitor directory.
          We have received your details and will now verify your SRA registration.
        </p>
        <div style="background:#f0faf6;border-radius:12px;border:2px solid #0f6e56;padding:24px 28px;margin-bottom:24px;">
          <p style="font-size:15px;font-weight:700;color:#1c1c1c;margin:0 0 8px;">What happens next?</p>
          <ul style="font-size:14px;color:#444;line-height:1.8;margin:0;padding-left:20px;">
            <li>We verify your SRA number against the public register</li>
            <li>Your profile is reviewed and approved by our team</li>
            <li>You receive a confirmation email once your listing is live</li>
            <li>Clients can then find and contact you through the directory</li>
          </ul>
        </div>
        <p style="font-size:14px;color:#444;line-height:1.8;margin:0 0 8px;">
          This process takes up to <strong>2 working days</strong>. If we need any further information, we will contact you at this email address.
        </p>
        <p style="font-size:13px;color:#888;margin:0;">
          If you have any questions in the meantime, please reply to this email.
        </p>
      </td></tr>
      <tr><td style="background:#f0ece6;border-radius:0 0 12px 12px;padding:20px 40px;">
        <p style="font-size:11px;color:#aaa;line-height:1.7;margin:0;text-align:center;">
          LegalClear UK · Free legal information for people in England, Wales, Scotland &amp; Northern Ireland<br/>
          We do not charge for directory listings and do not accept referral fees.
        </p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>`;
}

function adminNotificationEmail(body: RegistrationBody): string {
  const row = (label: string, value: string) =>
    `<tr><td style="font-size:13px;color:#888;width:160px;padding:8px 0;vertical-align:top;">${label}</td><td style="font-size:14px;color:#1c1c1c;padding:8px 0;">${value || "—"}</td></tr>`;
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f8f7f3;font-family:'Helvetica Neue',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f7f3;padding:40px 0;">
  <tr><td align="center">
    <table width="640" cellpadding="0" cellspacing="0" style="max-width:640px;width:100%;">
      <tr><td style="background:#1c1c1c;border-radius:12px 12px 0 0;padding:24px 36px;">
        <div style="font-size:11px;font-weight:700;color:#aaa;letter-spacing:0.12em;text-transform:uppercase;margin-bottom:6px;">LegalClear UK Admin</div>
        <div style="font-size:20px;font-weight:700;color:#fff;">New Solicitor Registration</div>
        <div style="font-size:13px;color:#888;margin-top:4px;">Requires manual SRA verification</div>
      </td></tr>
      <tr><td style="background:#fff;padding:32px 36px;">
        <table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #f0ece6;">
          ${row("Firm name",     body.firmName)}
          ${row("Solicitor",     `${body.solicitorName} — ${body.jobTitle}`)}
          ${row("SRA number",    body.sraNumber)}
          ${row("Email",         body.email)}
          ${row("Phone",         body.phone)}
          ${row("Website",       body.website)}
          ${row("Address",       `${body.address}, ${body.postcode}`)}
          ${row("Legal areas",   body.legalAreas.join(", "))}
          ${row("Jurisdictions", body.jurisdictions.join(", "))}
          ${row("How heard",     body.howHeard)}
        </table>
        <div style="margin-top:24px;padding:16px 20px;background:#f8f7f3;border-radius:10px;border:1px solid #e5e0d8;">
          <p style="font-size:12px;font-weight:700;color:#aaa;margin:0 0 8px;text-transform:uppercase;letter-spacing:0.06em;">Firm description</p>
          <p style="font-size:14px;color:#333;line-height:1.7;margin:0;">${body.description}</p>
        </div>
        <div style="margin-top:24px;padding:16px 20px;background:#fffbeb;border-radius:10px;border:1px solid #fde68a;">
          <p style="font-size:13px;color:#92400e;margin:0;line-height:1.6;">
            <strong>Action required:</strong> Verify SRA number <strong>${body.sraNumber}</strong> at
            <a href="https://www.sra.org.uk/consumers/register/organisation/?sraNumber=${body.sraNumber}" style="color:#0f6e56;">sra.org.uk</a>,
            then update <code>verified = true</code> in the Supabase <code>solicitors</code> table to activate the listing.
          </p>
        </div>
      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>`;
}

/* ─── Route ──────────────────────────────────────────────────── */

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as RegistrationBody;

    /* ── Validate required fields ── */
    const missing = (["firmName","solicitorName","jobTitle","sraNumber","email","phone","address","postcode"] as const)
      .filter((k) => !body[k]?.trim());
    if (missing.length > 0) {
      return NextResponse.json({ error: `Missing required fields: ${missing.join(", ")}.` }, { status: 400 });
    }
    if (!body.legalAreas?.length) {
      return NextResponse.json({ error: "Please select at least one legal area." }, { status: 400 });
    }
    if (!body.jurisdictions?.length) {
      return NextResponse.json({ error: "Please select at least one jurisdiction." }, { status: 400 });
    }

    /* ── Save to Supabase (no auth required — public form) ── */
    const supabase = await createClient();
    const { error: dbErr } = await supabase.from("solicitors").insert({
      firm_name:      body.firmName.trim(),
      solicitor_name: body.solicitorName.trim(),
      job_title:      body.jobTitle.trim(),
      sra_number:     body.sraNumber.trim(),
      email:          body.email.trim().toLowerCase(),
      phone:          body.phone.trim(),
      website:        body.website.trim(),
      address:        body.address.trim(),
      postcode:       body.postcode.trim().toUpperCase(),
      legal_areas:    body.legalAreas,
      jurisdictions:  body.jurisdictions,
      description:    body.description.trim(),
      how_heard:      body.howHeard.trim(),
      verified:       false,
    });

    if (dbErr) {
      console.error("[/api/solicitors/register] DB error:", dbErr.message);
      /* Don't block — still send emails even if DB save fails */
    }

    /* ── Send emails ── */
    const resend = getResend();
    if (resend) {
      await Promise.allSettled([
        /* Confirmation to solicitor */
        resend.emails.send({
          from:    FROM,
          to:      body.email,
          subject: "Your LegalClear UK listing is under review",
          html:    solicitorConfirmationEmail(body.solicitorName, body.firmName),
        }),
        /* Notification to admin */
        resend.emails.send({
          from:    FROM,
          to:      ADMIN_EMAIL,
          subject: `New solicitor registration — ${body.firmName} (SRA ${body.sraNumber})`,
          html:    adminNotificationEmail(body),
        }),
      ]);
    } else {
      console.warn("[/api/solicitors/register] RESEND_API_KEY not set — skipping emails");
    }

    return NextResponse.json({ success: true });

  } catch (err) {
    console.error("[/api/solicitors/register] Error:", err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
