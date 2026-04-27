"use client";

import Link from "next/link";
import { useState } from "react";
import type { Solicitor, Review } from "@/lib/solicitorData";
import SendPackModal from "@/app/components/SendPackModal";

/* ─── Helpers ─────────────────────────────────────────────────── */

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

/* ─── Sub-components ─────────────────────────────────────────── */

function Stars({ rating, size = 16 }: { rating: number; size?: number }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: "2px" }}>
      {[1, 2, 3, 4, 5].map((n) => {
        const pct = Math.min(1, Math.max(0, rating - (n - 1)));
        const id  = `grad-${n}-${rating}`;
        return (
          <svg key={n} width={size} height={size} viewBox="0 0 24 24">
            <defs>
              <linearGradient id={id}>
                <stop offset={`${pct * 100}%`} stopColor="#f59e0b" />
                <stop offset={`${pct * 100}%`} stopColor="#d1d5db" />
              </linearGradient>
            </defs>
            <path
              fill={`url(#${id})`}
              d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
            />
          </svg>
        );
      })}
    </span>
  );
}

function AreaPill({ label }: { label: string }) {
  return (
    <span style={{
      display: "inline-block", padding: "4px 14px", borderRadius: "999px",
      backgroundColor: "#e8f4f0", color: "#0f6e56", fontSize: "13px", fontWeight: 600,
    }}>
      {label}
    </span>
  );
}

function ReviewCard({ review }: { review: Review }) {
  return (
    <div style={{
      padding: "20px 24px", borderRadius: "12px",
      border: "1px solid #e5e0d8", backgroundColor: "#fff",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px", gap: "12px", flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{
            width: "36px", height: "36px", borderRadius: "50%",
            backgroundColor: "#0f6e56", color: "#fff",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "14px", fontWeight: 700, flexShrink: 0,
          }}>
            {review.reviewerName.charAt(0)}
          </div>
          <div>
            <p style={{ fontSize: "14px", fontWeight: 700, color: "#1c1c1c", margin: 0 }}>{review.reviewerName}</p>
            <Stars rating={review.rating} size={13} />
          </div>
        </div>
        <span style={{ fontSize: "12px", color: "#aaa" }}>{fmtDate(review.date)}</span>
      </div>
      <p style={{ fontSize: "14px", lineHeight: 1.7, color: "#444", margin: 0 }}>{review.comment}</p>
    </div>
  );
}

/* ─── Section wrapper ─────────────────────────────────────────── */
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: "40px" }}>
      <h2 style={{
        fontFamily: "var(--font-playfair,'Playfair Display',serif)",
        fontSize: "20px", fontWeight: 700, color: "#1c1c1c",
        margin: "0 0 20px", paddingBottom: "12px",
        borderBottom: "2px solid #0f6e56",
      }}>{title}</h2>
      {children}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════════ */

export default function SolicitorProfileClient({
  solicitor: s,
  isLoggedIn,
  hasSentPack,
}: {
  solicitor:   Solicitor;
  isLoggedIn:  boolean;
  hasSentPack: boolean;
}) {
  const [reviewOpen,  setReviewOpen]  = useState(false);
  const [modalOpen,   setModalOpen]   = useState(false);

  const verifiedReviews = s.reviews.filter((r) => r.verified_contact);
  const avgRating = verifiedReviews.length > 0
    ? verifiedReviews.reduce((sum, r) => sum + r.rating, 0) / verifiedReviews.length
    : s.rating;

  function handleSendPack() {
    setModalOpen(true);
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f8f7f3", fontFamily: "var(--font-dm-sans,'DM Sans',sans-serif)" }}>

      {/* ── Navbar ── */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 100,
        backgroundColor: "rgba(248,247,243,0.96)", backdropFilter: "blur(10px)",
        borderBottom: "1px solid #e5e0d8", padding: "0 48px", height: "64px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "10px" }}>
          <svg width="32" height="32" viewBox="0 0 40 40" fill="none">
            <rect width="40" height="40" rx="8" fill="#0f6e56" />
            <path d="M20 8L28 13V20C28 25.5 24 30.2 20 32C16 30.2 12 25.5 12 20V13L20 8Z" fill="white" fillOpacity="0.9" />
            <path d="M17 20L19 22L23 18" stroke="#0f6e56" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span style={{ fontFamily: "var(--font-playfair,'Playfair Display',serif)", fontSize: "20px", fontWeight: 700, color: "#1c1c1c" }}>
            LegalClear <span style={{ color: "#0f6e56" }}>UK</span>
          </span>
        </Link>
        <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
          <Link href="/solicitors" style={{ fontSize: "14px", fontWeight: 600, color: "#555", textDecoration: "none" }}>
            ← Back to directory
          </Link>
          {isLoggedIn
            ? <Link href="/dashboard" style={{ fontSize: "14px", fontWeight: 600, color: "#555", textDecoration: "none" }}>Dashboard</Link>
            : <Link href="/login" style={{ padding: "8px 18px", borderRadius: "8px", backgroundColor: "#0f6e56", color: "#fff", fontSize: "14px", fontWeight: 600, textDecoration: "none" }}>Sign in</Link>
          }
        </div>
      </nav>

      {/* ── Hero header ── */}
      <div style={{ backgroundColor: "#0f6e56", padding: "48px 24px 56px" }}>
        <div style={{ maxWidth: "860px", margin: "0 auto" }}>

          {/* Breadcrumb */}
          <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.55)", margin: "0 0 20px" }}>
            <Link href="/solicitors" style={{ color: "rgba(255,255,255,0.7)", textDecoration: "none" }}>Find a Solicitor</Link>
            <span style={{ margin: "0 8px" }}>›</span>
            {s.city}
            <span style={{ margin: "0 8px" }}>›</span>
            {s.firmName}
          </p>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "24px", flexWrap: "wrap" }}>
            <div>
              {/* Verified badge */}
              {s.verified && (
                <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", backgroundColor: "rgba(255,255,255,0.15)", borderRadius: "999px", padding: "4px 12px", marginBottom: "14px" }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#86efac" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                  <span style={{ fontSize: "12px", fontWeight: 700, color: "#86efac", letterSpacing: "0.04em" }}>SRA VERIFIED</span>
                </div>
              )}

              {/* Firm name */}
              <h1 style={{
                fontFamily: "var(--font-playfair,'Playfair Display',serif)",
                fontSize: "clamp(24px,4vw,36px)", fontWeight: 700, color: "#fff",
                margin: "0 0 8px", lineHeight: 1.25,
              }}>
                {s.firmName}
              </h1>

              {/* Solicitor name & title */}
              <p style={{ fontSize: "17px", color: "rgba(255,255,255,0.85)", margin: "0 0 20px" }}>
                {s.solicitorName} — <span style={{ fontStyle: "italic" }}>{s.title}</span>
              </p>

              {/* Legal area pills */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {s.legalAreas.map((a) => (
                  <span key={a} style={{
                    padding: "4px 14px", borderRadius: "999px",
                    backgroundColor: "rgba(255,255,255,0.18)", color: "#fff",
                    fontSize: "12px", fontWeight: 600,
                  }}>{a}</span>
                ))}
              </div>
            </div>

            {/* Rating pill */}
            <div style={{
              backgroundColor: "rgba(255,255,255,0.12)", borderRadius: "16px",
              padding: "20px 28px", textAlign: "center", flexShrink: 0,
            }}>
              <p style={{ fontSize: "42px", fontWeight: 800, color: "#fff", margin: "0 0 4px", lineHeight: 1 }}>
                {avgRating.toFixed(1)}
              </p>
              <Stars rating={avgRating} size={18} />
              <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.65)", margin: "8px 0 0" }}>
                {verifiedReviews.length} verified review{verifiedReviews.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Page body ── */}
      <div style={{ maxWidth: "860px", margin: "0 auto", padding: "40px 24px 80px" }}>
        <div style={{ display: "flex", gap: "32px", alignItems: "flex-start", flexWrap: "wrap" }}>

          {/* ════ Left column — main content ════ */}
          <div style={{ flex: "1 1 520px", minWidth: 0 }}>

            {/* ── About ── */}
            <Section title="About the Firm">
              <div style={{ padding: "22px 26px", backgroundColor: "#fff", borderRadius: "12px", border: "1px solid #e5e0d8" }}>
                <p style={{ fontSize: "15px", lineHeight: 1.8, color: "#333", margin: 0 }}>{s.description}</p>
              </div>
            </Section>

            {/* ── Reviews ── */}
            <Section title="Client Reviews">
              {/* Verified-only note */}
              <div style={{ display: "flex", gap: "10px", alignItems: "flex-start", padding: "12px 16px", backgroundColor: "#fffbeb", borderRadius: "10px", border: "1px solid #fde68a", marginBottom: "20px" }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#92400e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: "2px" }}>
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <p style={{ fontSize: "12px", color: "#92400e", margin: 0, lineHeight: 1.6 }}>
                  Only reviews from users who contacted this solicitor through LegalClear UK are shown. This ensures all reviews are independently verified.
                </p>
              </div>

              {verifiedReviews.length === 0 ? (
                <p style={{ fontSize: "14px", color: "#888", textAlign: "center", padding: "32px" }}>No verified reviews yet.</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  {verifiedReviews.map((r) => <ReviewCard key={r.id} review={r} />)}
                </div>
              )}

              {/* Leave a review — logged-in users who have sent a pack */}
              {isLoggedIn && hasSentPack && !reviewOpen && (
                <button
                  onClick={() => setReviewOpen(true)}
                  style={{
                    marginTop: "20px", width: "100%", padding: "12px",
                    borderRadius: "10px", border: "1px dashed #0f6e56",
                    backgroundColor: "#f0faf6", color: "#0f6e56",
                    fontSize: "14px", fontWeight: 600, cursor: "pointer",
                    fontFamily: "inherit", display: "flex", alignItems: "center",
                    justifyContent: "center", gap: "8px",
                  }}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                  Leave a review
                </button>
              )}

              {/* Review form */}
              {reviewOpen && (
                <div style={{ marginTop: "20px", padding: "22px", borderRadius: "12px", border: "1px solid #e5e0d8", backgroundColor: "#fff" }}>
                  <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#1c1c1c", margin: "0 0 16px" }}>Leave a review</h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                    <div>
                      <label style={{ fontSize: "12px", fontWeight: 700, color: "#555", display: "block", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.06em" }}>Your rating</label>
                      <div style={{ display: "flex", gap: "6px" }}>
                        {[1, 2, 3, 4, 5].map(n => (
                          <button key={n} style={{ width: "36px", height: "36px", borderRadius: "6px", border: "1px solid #e5e0d8", backgroundColor: "#fff", cursor: "pointer", fontSize: "18px" }}>★</button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label style={{ fontSize: "12px", fontWeight: 700, color: "#555", display: "block", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.06em" }}>Your review</label>
                      <textarea rows={4} placeholder="Describe your experience..." style={{ width: "100%", padding: "12px 14px", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "14px", fontFamily: "inherit", resize: "vertical", boxSizing: "border-box", outline: "none" }} />
                    </div>
                    <div style={{ display: "flex", gap: "10px" }}>
                      <button
                        style={{ padding: "10px 22px", borderRadius: "8px", border: "none", backgroundColor: "#0f6e56", color: "#fff", fontSize: "14px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}
                        onClick={() => { alert("Review submitted — thank you!"); setReviewOpen(false); }}
                      >Submit review</button>
                      <button
                        style={{ padding: "10px 22px", borderRadius: "8px", border: "1px solid #e5e0d8", backgroundColor: "#fff", color: "#555", fontSize: "14px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}
                        onClick={() => setReviewOpen(false)}
                      >Cancel</button>
                    </div>
                  </div>
                </div>
              )}
            </Section>

          </div>

          {/* ════ Right sidebar — contact + actions ════ */}
          <div style={{ width: "280px", flexShrink: 0, position: "sticky", top: "84px" }}>

            {/* Actions card */}
            <div style={{ backgroundColor: "#fff", borderRadius: "16px", border: "1px solid #e5e0d8", overflow: "hidden", marginBottom: "20px" }}>

              {/* Primary CTA */}
              <div style={{ padding: "20px", borderBottom: "1px solid #f0ece6" }}>
                <button
                  onClick={handleSendPack}
                  style={{
                    width: "100%", padding: "14px", borderRadius: "10px", border: "none",
                    backgroundColor: "#0f6e56", color: "#fff",
                    fontSize: "15px", fontWeight: 700, cursor: "pointer",
                    fontFamily: "inherit", display: "flex", alignItems: "center",
                    justifyContent: "center", gap: "8px", marginBottom: "10px",
                    transition: "background-color 0.15s",
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#0a5242"}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#0f6e56"}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 2L11 13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                  </svg>
                  Send my case pack
                </button>

                <a
                  href={s.website}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                    width: "100%", padding: "12px", borderRadius: "10px",
                    border: "1px solid #0f6e56", backgroundColor: "#fff", color: "#0f6e56",
                    fontSize: "14px", fontWeight: 600, textDecoration: "none", boxSizing: "border-box",
                    transition: "background-color 0.15s",
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f0faf6"}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#fff"}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
                  </svg>
                  Visit website
                </a>
              </div>

              {/* Contact details */}
              <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>

                {/* Phone */}
                <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                  <div style={{ width: "32px", height: "32px", borderRadius: "8px", backgroundColor: "#e8f4f0", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0f6e56" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.6 3.39a2 2 0 0 1 2-2.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 8.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
                    </svg>
                  </div>
                  <div>
                    <p style={{ fontSize: "11px", fontWeight: 700, color: "#aaa", margin: "0 0 2px", textTransform: "uppercase", letterSpacing: "0.06em" }}>Phone</p>
                    <a href={`tel:${s.phone.replace(/\s/g, "")}`} style={{ fontSize: "14px", fontWeight: 600, color: "#0f6e56", textDecoration: "none" }}>
                      {s.phone}
                    </a>
                    <p style={{ fontSize: "11px", color: "#bbb", margin: "2px 0 0" }}>Tap to call on mobile</p>
                  </div>
                </div>

                {/* Address */}
                <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                  <div style={{ width: "32px", height: "32px", borderRadius: "8px", backgroundColor: "#e8f4f0", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0f6e56" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                    </svg>
                  </div>
                  <div>
                    <p style={{ fontSize: "11px", fontWeight: 700, color: "#aaa", margin: "0 0 2px", textTransform: "uppercase", letterSpacing: "0.06em" }}>Address</p>
                    <p style={{ fontSize: "14px", color: "#333", margin: 0, lineHeight: 1.5 }}>
                      {s.address}<br />{s.postcode}
                    </p>
                  </div>
                </div>

                {/* Jurisdiction */}
                <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                  <div style={{ width: "32px", height: "32px", borderRadius: "8px", backgroundColor: "#e8f4f0", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0f6e56" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                    </svg>
                  </div>
                  <div>
                    <p style={{ fontSize: "11px", fontWeight: 700, color: "#aaa", margin: "0 0 2px", textTransform: "uppercase", letterSpacing: "0.06em" }}>Jurisdiction</p>
                    <p style={{ fontSize: "14px", color: "#333", margin: 0 }}>{s.jurisdiction}</p>
                  </div>
                </div>

                {/* SRA number */}
                <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                  <div style={{ width: "32px", height: "32px", borderRadius: "8px", backgroundColor: "#e8f4f0", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0f6e56" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                  </div>
                  <div>
                    <p style={{ fontSize: "11px", fontWeight: 700, color: "#aaa", margin: "0 0 2px", textTransform: "uppercase", letterSpacing: "0.06em" }}>SRA Number</p>
                    <p style={{ fontSize: "14px", fontWeight: 600, color: "#333", margin: "0 0 2px" }}>{s.sraNumber}</p>
                    <a
                      href={`https://www.sra.org.uk/consumers/register/organisation/?sraNumber=${s.sraNumber}`}
                      target="_blank"
                      rel="noreferrer"
                      style={{ fontSize: "11px", color: "#0f6e56", textDecoration: "underline", textDecorationStyle: "dotted", textUnderlineOffset: "3px" }}
                    >
                      Verify on the SRA register ↗
                    </a>
                  </div>
                </div>

              </div>
            </div>

            {/* Legal areas card */}
            <div style={{ backgroundColor: "#fff", borderRadius: "12px", border: "1px solid #e5e0d8", padding: "18px 20px" }}>
              <p style={{ fontSize: "12px", fontWeight: 700, color: "#aaa", margin: "0 0 12px", textTransform: "uppercase", letterSpacing: "0.06em" }}>Legal areas</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {s.legalAreas.map((a) => <AreaPill key={a} label={a} />)}
              </div>
            </div>

          </div>
        </div>

        {/* ── Disclaimer ── */}
        <div style={{
          marginTop: "48px", padding: "18px 22px", borderRadius: "12px",
          backgroundColor: "#f0ece6", border: "1px solid #e5e0d8",
          fontSize: "12px", color: "#888", lineHeight: 1.7,
        }}>
          ⚖️ <strong style={{ color: "#555" }}>Disclaimer:</strong> LegalClear UK provides this directory as a free public resource. We do not endorse any individual solicitor and do not accept referral fees. Always verify a solicitor&apos;s credentials on the{" "}
          <a href="https://www.sra.org.uk/consumers/register/" target="_blank" rel="noreferrer" style={{ color: "#0f6e56", textDecoration: "underline", textDecorationStyle: "dotted" }}>
            SRA register
          </a>{" "}
          before instructing them.
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          /* Sidebar goes below on mobile */
          div[style*="width: 280px"] { width: 100% !important; position: static !important; }
        }
      `}</style>

      {/* Send Pack Modal */}
      {modalOpen && (
        <SendPackModal
          solicitor={s}
          isLoggedIn={isLoggedIn}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  );
}
