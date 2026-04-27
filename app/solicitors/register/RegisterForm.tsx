"use client";

import { useState } from "react";
import Link from "next/link";
import { LEGAL_AREAS, JURISDICTIONS } from "@/lib/solicitorData";

/* ─── Helpers ─────────────────────────────────────────────────── */

const HOW_HEARD_OPTIONS = [
  "Google search",
  "Social media",
  "Referred by a colleague",
  "Referred by a client",
  "Law Society newsletter",
  "Legal news article",
  "Other",
];

function wordCount(text: string): number {
  return text.trim() === "" ? 0 : text.trim().split(/\s+/).length;
}

/* ─── Field wrapper ───────────────────────────────────────────── */
function Field({ label, hint, required, children }: {
  label: string; hint?: string; required?: boolean; children: React.ReactNode;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      <label style={{ fontSize: "13px", fontWeight: 700, color: "#1c1c1c", display: "flex", gap: "4px" }}>
        {label}
        {required && <span style={{ color: "#dc2626" }}>*</span>}
      </label>
      {hint && <p style={{ fontSize: "12px", color: "#888", margin: 0, lineHeight: 1.5 }}>{hint}</p>}
      {children}
    </div>
  );
}

/* ─── Shared input styles ─────────────────────────────────────── */
const inputStyle: React.CSSProperties = {
  width: "100%", padding: "11px 14px", borderRadius: "8px",
  border: "1px solid #d1d5db", fontSize: "14px", fontFamily: "inherit",
  color: "#1c1c1c", outline: "none", boxSizing: "border-box",
  backgroundColor: "#fff", transition: "border-color 0.15s",
};

/* ═══════════════════════════════════════════════════════════════
   MAIN FORM
═══════════════════════════════════════════════════════════════ */

export default function RegisterForm() {
  const [submitted, setSubmitted]   = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]           = useState<string | null>(null);

  /* Form state */
  const [firmName,      setFirmName]      = useState("");
  const [solicitorName, setSolicitorName] = useState("");
  const [jobTitle,      setJobTitle]      = useState("");
  const [sraNumber,     setSraNumber]     = useState("");
  const [email,         setEmail]         = useState("");
  const [phone,         setPhone]         = useState("");
  const [website,       setWebsite]       = useState("");
  const [address,       setAddress]       = useState("");
  const [postcode,      setPostcode]      = useState("");
  const [description,   setDescription]   = useState("");
  const [howHeard,      setHowHeard]      = useState("");
  const [legalAreas,    setLegalAreas]    = useState<Set<string>>(new Set());
  const [jurisdictions, setJurisdictions] = useState<Set<string>>(new Set());

  function toggleLegalArea(area: string) {
    setLegalAreas(prev => { const s = new Set(prev); s.has(area) ? s.delete(area) : s.add(area); return s; });
  }
  function toggleJurisdiction(j: string) {
    setJurisdictions(prev => { const s = new Set(prev); s.has(j) ? s.delete(j) : s.add(j); return s; });
  }

  const words = wordCount(description);
  const wordsOk = words <= 300;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!wordsOk) { setError("Please keep your description under 300 words."); return; }
    setSubmitting(true);
    try {
      const res = await fetch("/api/solicitors/register", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firmName, solicitorName, jobTitle, sraNumber,
          email, phone, website, address, postcode,
          legalAreas:    Array.from(legalAreas),
          jurisdictions: Array.from(jurisdictions),
          description, howHeard,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Submission failed.");
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  /* ── Thank-you screen ── */
  if (submitted) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#f8f7f3", fontFamily: "var(--font-dm-sans,'DM Sans',sans-serif)", display: "flex", flexDirection: "column" }}>
        <nav style={{ position: "sticky", top: 0, zIndex: 100, backgroundColor: "rgba(248,247,243,0.96)", backdropFilter: "blur(10px)", borderBottom: "1px solid #e5e0d8", padding: "0 48px", height: "64px", display: "flex", alignItems: "center" }}>
          <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "10px" }}>
            <svg width="32" height="32" viewBox="0 0 40 40" fill="none"><rect width="40" height="40" rx="8" fill="#0f6e56"/><path d="M20 8L28 13V20C28 25.5 24 30.2 20 32C16 30.2 12 25.5 12 20V13L20 8Z" fill="white" fillOpacity="0.9"/><path d="M17 20L19 22L23 18" stroke="#0f6e56" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            <span style={{ fontFamily: "var(--font-playfair,'Playfair Display',serif)", fontSize: "20px", fontWeight: 700, color: "#1c1c1c" }}>LegalClear <span style={{ color: "#0f6e56" }}>UK</span></span>
          </Link>
        </nav>
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "60px 24px" }}>
          <div style={{ maxWidth: "520px", width: "100%", textAlign: "center" }}>
            <div style={{ width: "72px", height: "72px", borderRadius: "50%", backgroundColor: "#0f6e56", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 28px" }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <h1 style={{ fontFamily: "var(--font-playfair,'Playfair Display',serif)", fontSize: "30px", fontWeight: 700, color: "#1c1c1c", margin: "0 0 16px", lineHeight: 1.3 }}>
              Thank you for submitting your listing
            </h1>
            <p style={{ fontSize: "16px", color: "#555", lineHeight: 1.8, margin: "0 0 12px" }}>
              We will verify your SRA registration and activate your profile within <strong>2 working days</strong>.
            </p>
            <p style={{ fontSize: "14px", color: "#888", lineHeight: 1.7, margin: "0 0 36px" }}>
              A confirmation email has been sent to <strong>{email}</strong>. If you have any questions, please reply to that email.
            </p>
            <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
              <Link href="/solicitors" style={{ padding: "11px 24px", borderRadius: "8px", backgroundColor: "#0f6e56", color: "#fff", fontSize: "14px", fontWeight: 600, textDecoration: "none" }}>
                Browse the directory
              </Link>
              <Link href="/" style={{ padding: "11px 24px", borderRadius: "8px", border: "1px solid #e5e0d8", backgroundColor: "#fff", color: "#555", fontSize: "14px", fontWeight: 600, textDecoration: "none" }}>
                Back to home
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ── Form ── */
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f8f7f3", fontFamily: "var(--font-dm-sans,'DM Sans',sans-serif)" }}>

      {/* Nav */}
      <nav style={{ position: "sticky", top: 0, zIndex: 100, backgroundColor: "rgba(248,247,243,0.96)", backdropFilter: "blur(10px)", borderBottom: "1px solid #e5e0d8", padding: "0 48px", height: "64px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "10px" }}>
          <svg width="32" height="32" viewBox="0 0 40 40" fill="none"><rect width="40" height="40" rx="8" fill="#0f6e56"/><path d="M20 8L28 13V20C28 25.5 24 30.2 20 32C16 30.2 12 25.5 12 20V13L20 8Z" fill="white" fillOpacity="0.9"/><path d="M17 20L19 22L23 18" stroke="#0f6e56" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          <span style={{ fontFamily: "var(--font-playfair,'Playfair Display',serif)", fontSize: "20px", fontWeight: 700, color: "#1c1c1c" }}>LegalClear <span style={{ color: "#0f6e56" }}>UK</span></span>
        </Link>
        <Link href="/solicitors" style={{ fontSize: "14px", fontWeight: 600, color: "#555", textDecoration: "none" }}>← Back to directory</Link>
      </nav>

      {/* Hero */}
      <div style={{ backgroundColor: "#0f6e56", padding: "48px 24px 56px", textAlign: "center" }}>
        <p style={{ fontSize: "12px", fontWeight: 700, color: "rgba(255,255,255,0.6)", letterSpacing: "0.12em", textTransform: "uppercase", margin: "0 0 12px" }}>
          Free Listing
        </p>
        <h1 style={{ fontFamily: "var(--font-playfair,'Playfair Display',serif)", fontSize: "clamp(26px,4vw,38px)", fontWeight: 700, color: "#fff", margin: "0 0 12px", lineHeight: 1.25 }}>
          List your firm on LegalClear UK
        </h1>
        <p style={{ fontSize: "16px", color: "rgba(255,255,255,0.8)", margin: "0 auto", maxWidth: "560px", lineHeight: 1.7 }}>
          Reach clients who have already analysed their legal situation and are ready to instruct a solicitor. Listings are free and we never charge referral fees.
        </p>
      </div>

      {/* Form card */}
      <div style={{ maxWidth: "720px", margin: "0 auto", padding: "40px 24px 80px" }}>
        <div style={{ backgroundColor: "#fff", borderRadius: "16px", border: "1px solid #e5e0d8", padding: "40px 44px" }}>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "28px" }}>

            {/* ── Firm details ── */}
            <div>
              <h2 style={{ fontFamily: "var(--font-playfair,'Playfair Display',serif)", fontSize: "17px", fontWeight: 700, color: "#1c1c1c", margin: "0 0 20px", paddingBottom: "10px", borderBottom: "2px solid #0f6e56" }}>
                Firm Details
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                <Field label="Firm name" required>
                  <input value={firmName} onChange={e => setFirmName(e.target.value)} style={inputStyle} placeholder="e.g. Adams & Partners LLP" required
                    onFocus={e => e.target.style.borderColor = "#0f6e56"} onBlur={e => e.target.style.borderColor = "#d1d5db"} />
                </Field>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <Field label="Your name" required>
                    <input value={solicitorName} onChange={e => setSolicitorName(e.target.value)} style={inputStyle} placeholder="e.g. Sarah Adams" required
                      onFocus={e => e.target.style.borderColor = "#0f6e56"} onBlur={e => e.target.style.borderColor = "#d1d5db"} />
                  </Field>
                  <Field label="Job title" required>
                    <input value={jobTitle} onChange={e => setJobTitle(e.target.value)} style={inputStyle} placeholder="e.g. Managing Partner" required
                      onFocus={e => e.target.style.borderColor = "#0f6e56"} onBlur={e => e.target.style.borderColor = "#d1d5db"} />
                  </Field>
                </div>

                <Field label="SRA number" required
                  hint="Your firm's SRA number appears on your certificate of registration. Find it at sra.org.uk → 'Check a firm or solicitor'.">
                  <input value={sraNumber} onChange={e => setSraNumber(e.target.value)} style={inputStyle} placeholder="e.g. 123456" required
                    onFocus={e => e.target.style.borderColor = "#0f6e56"} onBlur={e => e.target.style.borderColor = "#d1d5db"} />
                </Field>
              </div>
            </div>

            {/* ── Contact details ── */}
            <div>
              <h2 style={{ fontFamily: "var(--font-playfair,'Playfair Display',serif)", fontSize: "17px", fontWeight: 700, color: "#1c1c1c", margin: "0 0 20px", paddingBottom: "10px", borderBottom: "2px solid #0f6e56" }}>
                Contact Details
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <Field label="Email address" required>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} style={inputStyle} placeholder="enquiries@yourfirm.co.uk" required
                      onFocus={e => e.target.style.borderColor = "#0f6e56"} onBlur={e => e.target.style.borderColor = "#d1d5db"} />
                  </Field>
                  <Field label="Phone number" required>
                    <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} style={inputStyle} placeholder="020 7123 4567" required
                      onFocus={e => e.target.style.borderColor = "#0f6e56"} onBlur={e => e.target.style.borderColor = "#d1d5db"} />
                  </Field>
                </div>

                <Field label="Website" hint="Include https:// — leave blank if you don't have one.">
                  <input type="url" value={website} onChange={e => setWebsite(e.target.value)} style={inputStyle} placeholder="https://www.yourfirm.co.uk"
                    onFocus={e => e.target.style.borderColor = "#0f6e56"} onBlur={e => e.target.style.borderColor = "#d1d5db"} />
                </Field>

                <Field label="Full address" required>
                  <input value={address} onChange={e => setAddress(e.target.value)} style={inputStyle} placeholder="e.g. 12 Clerkenwell Road, Clerkenwell, London" required
                    onFocus={e => e.target.style.borderColor = "#0f6e56"} onBlur={e => e.target.style.borderColor = "#d1d5db"} />
                </Field>

                <Field label="Postcode" required>
                  <input value={postcode} onChange={e => setPostcode(e.target.value)} style={{ ...inputStyle, maxWidth: "180px" }} placeholder="EC1A 1BB" required
                    onFocus={e => e.target.style.borderColor = "#0f6e56"} onBlur={e => e.target.style.borderColor = "#d1d5db"} />
                </Field>
              </div>
            </div>

            {/* ── Legal areas ── */}
            <div>
              <h2 style={{ fontFamily: "var(--font-playfair,'Playfair Display',serif)", fontSize: "17px", fontWeight: 700, color: "#1c1c1c", margin: "0 0 20px", paddingBottom: "10px", borderBottom: "2px solid #0f6e56" }}>
                Practice Areas
              </h2>
              <Field label="Legal areas covered" required hint="Select all that apply.">
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "10px", marginTop: "4px" }}>
                  {LEGAL_AREAS.map(area => {
                    const checked = legalAreas.has(area);
                    return (
                      <label key={area} onClick={() => toggleLegalArea(area)} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 14px", borderRadius: "8px", border: `1px solid ${checked ? "#0f6e56" : "#e5e0d8"}`, backgroundColor: checked ? "#f0faf6" : "#fff", cursor: "pointer", transition: "all 0.15s" }}>
                        <div style={{ width: "18px", height: "18px", borderRadius: "4px", border: `2px solid ${checked ? "#0f6e56" : "#d1d5db"}`, backgroundColor: checked ? "#0f6e56" : "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.15s" }}>
                          {checked && <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><polyline points="2 6 5 9 10 3" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                        </div>
                        <span style={{ fontSize: "13px", fontWeight: 600, color: checked ? "#0f6e56" : "#444" }}>{area}</span>
                      </label>
                    );
                  })}
                </div>
              </Field>

              <div style={{ marginTop: "20px" }}>
                <Field label="Jurisdictions covered" required>
                  <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginTop: "4px" }}>
                    {JURISDICTIONS.map(j => {
                      const checked = jurisdictions.has(j);
                      return (
                        <label key={j} onClick={() => toggleJurisdiction(j)} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 18px", borderRadius: "8px", border: `1px solid ${checked ? "#0f6e56" : "#e5e0d8"}`, backgroundColor: checked ? "#f0faf6" : "#fff", cursor: "pointer", transition: "all 0.15s" }}>
                          <div style={{ width: "18px", height: "18px", borderRadius: "4px", border: `2px solid ${checked ? "#0f6e56" : "#d1d5db"}`, backgroundColor: checked ? "#0f6e56" : "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.15s" }}>
                            {checked && <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><polyline points="2 6 5 9 10 3" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                          </div>
                          <span style={{ fontSize: "13px", fontWeight: 600, color: checked ? "#0f6e56" : "#444" }}>{j}</span>
                        </label>
                      );
                    })}
                  </div>
                </Field>
              </div>
            </div>

            {/* ── About ── */}
            <div>
              <h2 style={{ fontFamily: "var(--font-playfair,'Playfair Display',serif)", fontSize: "17px", fontWeight: 700, color: "#1c1c1c", margin: "0 0 20px", paddingBottom: "10px", borderBottom: "2px solid #0f6e56" }}>
                About Your Firm
              </h2>
              <Field label="Firm description" required hint="Describe your firm, areas of expertise, and what makes you different. Max 300 words. This appears on your public profile.">
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  rows={6}
                  style={{ ...inputStyle, resize: "vertical", lineHeight: 1.65 }}
                  placeholder="Tell potential clients about your firm's experience, approach, and specialisms…"
                  onFocus={e => e.target.style.borderColor = "#0f6e56"}
                  onBlur={e => e.target.style.borderColor = "#d1d5db"}
                />
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <span style={{ fontSize: "12px", color: wordsOk ? "#aaa" : "#dc2626", fontWeight: wordsOk ? 400 : 700 }}>
                    {words} / 300 words
                  </span>
                </div>
              </Field>

              <div style={{ marginTop: "18px" }}>
                <Field label="How did you hear about LegalClear UK?">
                  <div style={{ position: "relative" }}>
                    <select value={howHeard} onChange={e => setHowHeard(e.target.value)}
                      style={{ ...inputStyle, appearance: "none", cursor: "pointer" }}>
                      <option value="">Select an option</option>
                      {HOW_HEARD_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                    <svg style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
                  </div>
                </Field>
              </div>
            </div>

            {/* ── Trust note ── */}
            <div style={{ padding: "16px 20px", borderRadius: "10px", backgroundColor: "#f0faf6", border: "1px solid #c3e0d8", display: "flex", gap: "12px", alignItems: "flex-start" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0f6e56" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: "2px" }}>
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
              <p style={{ fontSize: "13px", color: "#0a5242", margin: 0, lineHeight: 1.7 }}>
                LegalClear UK will verify your SRA registration before your listing goes live. We do not charge for listings and do not accept referral fees. Your details will only be used to create your public directory profile.
              </p>
            </div>

            {/* ── Error ── */}
            {error && (
              <div style={{ padding: "14px 18px", borderRadius: "8px", backgroundColor: "#fef2f2", border: "1px solid #fca5a5" }}>
                <p style={{ fontSize: "13px", color: "#dc2626", margin: 0, fontWeight: 600 }}>⚠️ {error}</p>
              </div>
            )}

            {/* ── Submit ── */}
            <button
              type="submit"
              disabled={submitting}
              style={{
                padding: "14px 32px", borderRadius: "10px", border: "none",
                backgroundColor: submitting ? "#7fb8a8" : "#0f6e56", color: "#fff",
                fontSize: "15px", fontWeight: 700, cursor: submitting ? "not-allowed" : "pointer",
                fontFamily: "inherit", display: "flex", alignItems: "center",
                justifyContent: "center", gap: "10px", transition: "background-color 0.15s",
              }}
              onMouseEnter={e => { if (!submitting) e.currentTarget.style.backgroundColor = "#0a5242"; }}
              onMouseLeave={e => { if (!submitting) e.currentTarget.style.backgroundColor = "#0f6e56"; }}
            >
              {submitting ? (
                <><span style={{ display: "inline-block", width: "16px", height: "16px", border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "#fff", borderRadius: "50%", animation: "lc-spin 0.7s linear infinite" }} /> Submitting…</>
              ) : (
                <><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2L11 13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg> Submit listing</>
              )}
            </button>

            <p style={{ fontSize: "12px", color: "#aaa", textAlign: "center", margin: 0 }}>
              Fields marked <span style={{ color: "#dc2626" }}>*</span> are required
            </p>

          </form>
        </div>
      </div>

      <style>{`@keyframes lc-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
