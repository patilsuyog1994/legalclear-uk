import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { Resend } from "resend";

function getResend(): Resend | null {
  if (!process.env.RESEND_API_KEY) return null;
  return new Resend(process.env.RESEND_API_KEY);
}

const FROM = process.env.RESEND_FROM_EMAIL ?? "LegalClear UK <onboarding@resend.dev>";

async function verifyAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single();
  return data?.is_admin ? user : null;
}

function approvalEmail(name: string, firmName: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f8f7f3;font-family:'Helvetica Neue',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f7f3;padding:40px 0;">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
      <tr><td style="background:#0f6e56;border-radius:12px 12px 0 0;padding:32px 40px;text-align:center;">
        <div style="font-size:11px;font-weight:700;color:rgba(255,255,255,0.6);letter-spacing:0.12em;text-transform:uppercase;margin-bottom:8px;">LegalClear UK</div>
        <div style="font-size:40px;margin-bottom:10px;">🎉</div>
        <div style="font-size:22px;font-weight:700;color:#fff;">Your listing is now live!</div>
        <div style="font-size:14px;color:rgba(255,255,255,0.75);margin-top:6px;">Your firm is now visible to people searching for legal help</div>
      </td></tr>
      <tr><td style="background:#fff;padding:36px 40px;">
        <p style="font-size:16px;color:#1c1c1c;margin:0 0 20px;">Dear ${name},</p>
        <p style="font-size:14px;color:#444;line-height:1.8;margin:0 0 24px;">
          Great news — we have verified your SRA registration and <strong>${firmName}</strong> is now live on the LegalClear UK solicitor directory.
          People searching for legal help in your area and practice areas can now find and contact you.
        </p>
        <div style="background:#f0faf6;border-radius:12px;border:2px solid #0f6e56;padding:24px 28px;margin-bottom:24px;">
          <p style="font-size:15px;font-weight:700;color:#1c1c1c;margin:0 0 8px;">What happens now?</p>
          <ul style="font-size:14px;color:#444;line-height:1.8;margin:0;padding-left:20px;">
            <li>Prospective clients can find your profile through our directory</li>
            <li>Clients can send you their pre-prepared case pack with key facts about their situation</li>
            <li>You receive case packs by email — no account or subscription needed</li>
            <li>All listings are free, forever. We do not charge referral fees.</li>
          </ul>
        </div>
        <p style="font-size:14px;color:#444;line-height:1.8;margin:0 0 8px;">
          If you need to update your listing at any time, reply to this email and we will make the changes for you.
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

function rejectionEmail(name: string, firmName: string, reason: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f8f7f3;font-family:'Helvetica Neue',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f7f3;padding:40px 0;">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
      <tr><td style="background:#1c1c1c;border-radius:12px 12px 0 0;padding:32px 40px;text-align:center;">
        <div style="font-size:11px;font-weight:700;color:rgba(255,255,255,0.6);letter-spacing:0.12em;text-transform:uppercase;margin-bottom:8px;">LegalClear UK</div>
        <div style="font-size:22px;font-weight:700;color:#fff;">Update on your listing application</div>
        <div style="font-size:14px;color:rgba(255,255,255,0.6);margin-top:6px;">${firmName}</div>
      </td></tr>
      <tr><td style="background:#fff;padding:36px 40px;">
        <p style="font-size:16px;color:#1c1c1c;margin:0 0 20px;">Dear ${name},</p>
        <p style="font-size:14px;color:#444;line-height:1.8;margin:0 0 24px;">
          Thank you for submitting <strong>${firmName}</strong> to the LegalClear UK directory. Unfortunately, we were unable to approve your listing at this time.
        </p>
        <div style="background:#fef2f2;border-radius:12px;border:1px solid #fecaca;padding:24px 28px;margin-bottom:24px;">
          <p style="font-size:13px;font-weight:700;color:#991b1b;margin:0 0 8px;text-transform:uppercase;letter-spacing:0.05em;">Reason</p>
          <p style="font-size:14px;color:#7f1d1d;line-height:1.7;margin:0;">${reason}</p>
        </div>
        <p style="font-size:14px;color:#444;line-height:1.8;margin:0 0 16px;">
          If you believe this is an error, or if you would like to reapply with updated information, please reply to this email and we will be happy to help.
        </p>
        <p style="font-size:13px;color:#888;margin:0;">
          To verify your SRA registration independently, visit <a href="https://www.sra.org.uk/consumers/register/" style="color:#0f6e56;">sra.org.uk</a>.
        </p>
      </td></tr>
      <tr><td style="background:#f0ece6;border-radius:0 0 12px 12px;padding:20px 40px;">
        <p style="font-size:11px;color:#aaa;line-height:1.7;margin:0;text-align:center;">
          LegalClear UK · Free legal information for people in England, Wales, Scotland &amp; Northern Ireland
        </p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>`;
}

interface RouteParams { params: Promise<{ id: string }> }

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  const user = await verifyAdmin();
  if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const body = await req.json();
  const { action, reason, data: updateData } = body as {
    action: "approve" | "reject" | "toggle_featured" | "update";
    reason?: string;
    data?: Record<string, unknown>;
  };

  const admin = createAdminClient();

  if (action === "approve") {
    const { data: row, error: fetchErr } = await admin
      .from("solicitors").select("solicitor_name,firm_name,email").eq("id", id).single();
    if (fetchErr) return NextResponse.json({ error: fetchErr.message }, { status: 500 });

    const { error } = await admin.from("solicitors").update({ verified: true }).eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const resend = getResend();
    if (resend) {
      await resend.emails.send({
        from: FROM,
        to: row.email,
        subject: "Your LegalClear UK listing is now live!",
        html: approvalEmail(row.solicitor_name, row.firm_name),
      });
    }
    return NextResponse.json({ success: true });
  }

  if (action === "reject") {
    const { data: row, error: fetchErr } = await admin
      .from("solicitors").select("solicitor_name,firm_name,email").eq("id", id).single();
    if (fetchErr) return NextResponse.json({ error: fetchErr.message }, { status: 500 });

    const resend = getResend();
    if (resend) {
      await resend.emails.send({
        from: FROM,
        to: row.email,
        subject: "Update on your LegalClear UK listing application",
        html: rejectionEmail(row.solicitor_name, row.firm_name, reason ?? "We were unable to verify your SRA registration number against the public register."),
      });
    }

    const { error } = await admin.from("solicitors").delete().eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  if (action === "toggle_featured") {
    const { data: row, error: fetchErr } = await admin
      .from("solicitors").select("featured").eq("id", id).single();
    if (fetchErr) return NextResponse.json({ error: fetchErr.message }, { status: 500 });

    const { error } = await admin.from("solicitors").update({ featured: !row.featured }).eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, featured: !row.featured });
  }

  if (action === "update" && updateData) {
    const allowed = ["firm_name","solicitor_name","job_title","email","phone","website","address","postcode","legal_areas","jurisdictions","description"];
    const safe = Object.fromEntries(Object.entries(updateData).filter(([k]) => allowed.includes(k)));
    const { error } = await admin.from("solicitors").update(safe).eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  const user = await verifyAdmin();
  if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const admin = createAdminClient();
  const { error } = await admin.from("solicitors").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
