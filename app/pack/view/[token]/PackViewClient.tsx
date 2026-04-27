"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

/* ─── Types ──────────────────────────────────────────────────── */

interface TimelineEvent {
  date?: string;
  description: string;
}

interface PackData {
  clientSummary:          string;
  timeline:               TimelineEvent[];
  legalContext:           string;
  keyFacts:               string[];
  questionsForSolicitor:  string[];
  documentsToGather:      string[];
  urgentActions:          string[];
}

/* ─── Logo ───────────────────────────────────────────────────── */

function Logo() {
  return (
    <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "10px" }}>
      <svg width="32" height="32" viewBox="0 0 40 40" fill="none">
        <rect width="40" height="40" rx="8" fill="#0f6e56" />
        <path d="M20 8L28 13V20C28 25.5 24 30.2 20 32C16 30.2 12 25.5 12 20V13L20 8Z" fill="white" fillOpacity="0.9" />
        <path d="M17 20L19 22L23 18" stroke="#0f6e56" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span style={{ fontFamily: "var(--font-playfair, 'Playfair Display', serif)", fontSize: "19px", fontWeight: 700, color: "#1c1c1c" }}>
        LegalClear <span style={{ color: "#0f6e56" }}>UK</span>
      </span>
    </Link>
  );
}

/* ─── Loading screen ─────────────────────────────────────────── */

function LoadingScreen() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", backgroundColor: "#f8f7f3", fontFamily: "var(--font-dm-sans, 'DM Sans', sans-serif)", gap: "28px", padding: "40px 20px", textAlign: "center" }}>
      <Logo />
      <div>
        <div style={{ display: "flex", justifyContent: "center", gap: "10px", marginBottom: "20px" }}>
          {[0, 1, 2].map((i) => (
            <div key={i} style={{ width: "11px", height: "11px", borderRadius: "50%", backgroundColor: "#0f6e56", animation: `lc-dot 1.4s ease-in-out ${i * 0.22}s infinite` }} />
          ))}
        </div>
        <p style={{ fontSize: "17px", fontWeight: 600, color: "#1c1c1c", margin: "0 0 8px" }}>Loading shared pack…</p>
        <p style={{ fontSize: "13px", color: "#888", margin: 0 }}>This will only take a moment</p>
      </div>
      <style>{`@keyframes lc-dot { 0%,80%,100%{opacity:.2;transform:scale(.75)} 40%{opacity:1;transform:scale(1)} }`}</style>
    </div>
  );
}

/* ─── Error / not-found screen ───────────────────────────────── */

function NotFoundScreen({ message }: { message: string }) {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", backgroundColor: "#f8f7f3", fontFamily: "var(--font-dm-sans, 'DM Sans', sans-serif)", gap: "20px", padding: "40px 20px", textAlign: "center" }}>
      <Logo />
      <div style={{ fontSize: "40px" }}>🔒</div>
      <p style={{ fontSize: "18px", fontWeight: 700, color: "#1c1c1c", margin: 0 }}>This pack is not available</p>
      <p style={{ fontSize: "14px", color: "#777", margin: 0, maxWidth: "420px", lineHeight: 1.6 }}>{message}</p>
      <Link href="/" style={{ marginTop: "8px", padding: "10px 24px", borderRadius: "8px", backgroundColor: "#0f6e56", color: "#fff", fontSize: "14px", fontWeight: 600, textDecoration: "none" }}>
        Get help with your own legal situation →
      </Link>
    </div>
  );
}

/* ─── Section wrapper ────────────────────────────────────────── */

function Section({ label, icon, children }: { label: string; icon: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: "40px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px", paddingBottom: "12px", borderBottom: "2px solid #0f6e56" }}>
        <span style={{ fontSize: "18px" }}>{icon}</span>
        <h2 style={{ fontFamily: "var(--font-playfair, 'Playfair Display', serif)", fontSize: "18px", fontWeight: 700, color: "#1c1c1c", margin: 0 }}>{label}</h2>
      </div>
      {children}
    </div>
  );
}

/* ─── Main component ─────────────────────────────────────────── */

export default function PackViewClient({ token }: { token: string }) {
  const [status, setStatus]   = useState<"loading" | "ready" | "error">("loading");
  const [pack, setPack]       = useState<PackData | null>(null);
  const [title, setTitle]     = useState("");
  const [packDate, setPackDate] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  /** Flatten any object items in array fields (handles stale cached data) */
  function normalizePack(raw: PackData): PackData {
    function flattenItem(item: unknown): string {
      if (typeof item === "string") return item;
      if (item && typeof item === "object") {
        const obj = item as Record<string, unknown>;
        const val = obj.action ?? obj.question ?? obj.document ?? obj.fact ??
                    obj.text ?? obj.description ?? obj.content ?? obj.item ?? obj.step;
        if (val) return String(val);
        return Object.values(obj).filter(v => typeof v === "string").join(" — ");
      }
      return String(item ?? "");
    }
    return {
      ...raw,
      keyFacts:             Array.isArray(raw.keyFacts)             ? raw.keyFacts.map(flattenItem)             : raw.keyFacts,
      questionsForSolicitor: Array.isArray(raw.questionsForSolicitor) ? raw.questionsForSolicitor.map(flattenItem) : raw.questionsForSolicitor,
      documentsToGather:    Array.isArray(raw.documentsToGather)    ? raw.documentsToGather.map(flattenItem)    : raw.documentsToGather,
      urgentActions:        Array.isArray(raw.urgentActions)        ? raw.urgentActions.map(flattenItem)        : raw.urgentActions,
    };
  }

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res  = await fetch(`/api/pack/share/${token}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Pack not available.");
        if (!cancelled) {
          setPack(normalizePack(data.pack as PackData));
          setTitle(data.title ?? "Legal Matter");
          if (data.packGeneratedAt) {
            setPackDate(new Date(data.packGeneratedAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }));
          }
          setStatus("ready");
        }
      } catch (err) {
        if (!cancelled) {
          setErrorMsg(err instanceof Error ? err.message : "Something went wrong.");
          setStatus("error");
        }
      }
    }
    load();
    return () => { cancelled = true; };
  }, [token]);

  if (status === "loading") return <LoadingScreen />;
  if (status === "error" || !pack) return <NotFoundScreen message={errorMsg} />;

  const hasUrgent = pack.urgentActions && pack.urgentActions.length > 0;

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f8f7f3", fontFamily: "var(--font-dm-sans, 'DM Sans', sans-serif)" }}>

      {/* Navbar */}
      <nav style={{ position: "sticky", top: 0, zIndex: 50, backgroundColor: "rgba(248,247,243,0.96)", backdropFilter: "blur(10px)", borderBottom: "1px solid #e5e0d8", padding: "0 32px", height: "64px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Logo />
        <Link
          href="/"
          style={{ padding: "8px 18px", borderRadius: "8px", backgroundColor: "#0f6e56", color: "#fff", fontSize: "13px", fontWeight: 600, textDecoration: "none", whiteSpace: "nowrap" }}
        >
          Get help with your case →
        </Link>
      </nav>

      {/* Shared-document banner */}
      <div style={{ backgroundColor: "#1c1c1c", padding: "12px 32px", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", flexWrap: "wrap" }}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#e5e0d8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <p style={{ fontSize: "13px", color: "#e5e0d8", margin: 0, textAlign: "center", lineHeight: 1.5 }}>
          This document was prepared using <strong style={{ color: "#fff" }}>LegalClear UK</strong> and is shared for informational purposes only. It does not constitute legal advice.
        </p>
      </div>

      {/* Content */}
      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "40px 24px 80px" }}>

        {/* Document header card */}
        <div style={{ backgroundColor: "#0f6e56", borderRadius: "16px", padding: "36px 40px", color: "#fff", marginBottom: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
            </svg>
            <span style={{ fontSize: "11px", fontWeight: 700, color: "rgba(255,255,255,0.7)", letterSpacing: "0.1em", textTransform: "uppercase" }}>Pre-Solicitor Briefing Pack</span>
          </div>
          <h1 style={{ fontFamily: "var(--font-playfair, 'Playfair Display', serif)", fontSize: "28px", fontWeight: 700, color: "#fff", margin: "0 0 12px", lineHeight: 1.3 }}>
            {title}
          </h1>
          <div style={{ display: "flex", alignItems: "center", gap: "20px", flexWrap: "wrap" }}>
            {packDate && (
              <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.7)", display: "flex", alignItems: "center", gap: "6px" }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                Generated {packDate}
              </span>
            )}
            <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.7)", display: "flex", alignItems: "center", gap: "6px" }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
              LegalClear UK — England &amp; Wales
            </span>
          </div>
        </div>

        {/* Urgent banner */}
        {hasUrgent && (
          <div style={{ marginBottom: "16px", borderRadius: "12px", border: "2px solid #dc2626", backgroundColor: "#fef2f2", padding: "18px 24px" }}>
            <p style={{ fontSize: "13px", fontWeight: 700, color: "#dc2626", margin: "0 0 10px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              ⚠️ Urgent actions required before the appointment
            </p>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "8px" }}>
              {pack.urgentActions.map((action, i) => (
                <li key={i} style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                  <span style={{ color: "#dc2626", fontWeight: 700, flexShrink: 0 }}>→</span>
                  <span style={{ fontSize: "14px", color: "#7f1d1d", lineHeight: 1.6 }}>{action}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Disclaimer */}
        <div style={{ marginBottom: "36px", padding: "10px 16px", borderRadius: "8px", backgroundColor: "#fffbeb", border: "1px solid #fde68a", fontSize: "12px", color: "#92400e" }}>
          📋 This document is for informational purposes only and does not constitute regulated legal advice. Always consult a qualified solicitor before taking action.
        </div>

        {/* ── SECTIONS (read-only) ── */}

        {/* 1 — Client Summary */}
        <Section label="Client Summary" icon="👤">
          <div style={{ padding: "20px 24px", backgroundColor: "#fff", borderRadius: "12px", border: "1px solid #e5e0d8" }}>
            {pack.clientSummary.split("\n\n").filter(Boolean).map((para, i) => (
              <p key={i} style={{ fontSize: "15px", lineHeight: 1.8, color: "#333", margin: i === 0 ? "0 0 14px" : "0" }}>{para}</p>
            ))}
          </div>
        </Section>

        {/* 2 — Timeline */}
        {pack.timeline && pack.timeline.length > 0 && (
          <Section label="Timeline of Events" icon="📅">
            <div style={{ position: "relative" }}>
              <div style={{ position: "absolute", left: "119px", top: "8px", bottom: "8px", width: "2px", backgroundColor: "#e5e0d8" }} />
              {pack.timeline.map((event, i) => (
                <div key={i} style={{ display: "flex", gap: "0", marginBottom: "20px", alignItems: "flex-start" }}>
                  <div style={{ width: "110px", flexShrink: 0, textAlign: "right", paddingRight: "16px", paddingTop: "3px" }}>
                    {event.date
                      ? <span style={{ fontSize: "12px", fontWeight: 700, color: "#0f6e56", display: "inline-block" }}>{event.date}</span>
                      : <span style={{ fontSize: "12px", color: "#bbb" }}>—</span>}
                  </div>
                  <div style={{ flexShrink: 0, width: "20px", display: "flex", justifyContent: "center", paddingTop: "4px" }}>
                    <div style={{ width: "12px", height: "12px", borderRadius: "50%", backgroundColor: "#0f6e56", border: "3px solid #f8f7f3", boxShadow: "0 0 0 2px #0f6e56" }} />
                  </div>
                  <div style={{ flex: 1, paddingLeft: "16px", paddingTop: "1px" }}>
                    <p style={{ fontSize: "14px", lineHeight: 1.65, color: "#333", margin: 0 }}>{event.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* 3 — Legal Context */}
        <Section label="Relevant UK Law" icon="⚖️">
          <div style={{ padding: "20px 24px", backgroundColor: "#e8f4f0", borderRadius: "12px", border: "1px solid #c3e0d8" }}>
            <p style={{ fontSize: "14px", lineHeight: 1.8, color: "#1c3a31", margin: 0 }}>{pack.legalContext}</p>
          </div>
        </Section>

        {/* 4 — Key Facts */}
        {pack.keyFacts && pack.keyFacts.length > 0 && (
          <Section label="Key Facts" icon="📌">
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {pack.keyFacts.map((fact, i) => (
                <div key={i} style={{ display: "flex", gap: "14px", alignItems: "flex-start", padding: "14px 18px", backgroundColor: "#fff", borderRadius: "10px", border: "1px solid #e5e0d8" }}>
                  <span style={{ flexShrink: 0, width: "26px", height: "26px", borderRadius: "6px", backgroundColor: "#0f6e56", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: 700, marginTop: "1px" }}>{i + 1}</span>
                  <span style={{ fontSize: "14px", lineHeight: 1.65, color: "#333" }}>{fact}</span>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* 5 — Questions for Solicitor (read-only — static numbered list) */}
        {pack.questionsForSolicitor && pack.questionsForSolicitor.length > 0 && (
          <Section label="Questions to Ask Your Solicitor" icon="❓">
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {pack.questionsForSolicitor.map((q, i) => (
                <div key={i} style={{ display: "flex", gap: "14px", alignItems: "flex-start", padding: "14px 18px", backgroundColor: "#fff", borderRadius: "10px", border: "1px solid #e5e0d8" }}>
                  <span style={{ flexShrink: 0, width: "22px", height: "22px", borderRadius: "5px", border: "2px solid #d1d5db", backgroundColor: "#fff", display: "flex", alignItems: "center", justifyContent: "center", marginTop: "2px", fontSize: "11px", fontWeight: 700, color: "#9ca3af" }}>{i + 1}</span>
                  <span style={{ fontSize: "14px", lineHeight: 1.65, color: "#333" }}>{q}</span>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* 6 — Documents to Gather (read-only — static list) */}
        {pack.documentsToGather && pack.documentsToGather.length > 0 && (
          <Section label="Documents to Bring" icon="📁">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              {pack.documentsToGather.map((doc, i) => (
                <div key={i} style={{ display: "flex", gap: "12px", alignItems: "center", padding: "12px 14px", backgroundColor: "#fff", borderRadius: "10px", border: "1px solid #e5e0d8" }}>
                  <span style={{ flexShrink: 0, width: "18px", height: "18px", borderRadius: "4px", border: "2px solid #d1d5db", backgroundColor: "#fff" }} />
                  <span style={{ fontSize: "13px", color: "#333", lineHeight: 1.4 }}>{doc}</span>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* 7 — Urgent Actions */}
        {hasUrgent && (
          <Section label="Urgent Actions" icon="⚠️">
            <div style={{ padding: "20px 24px", borderRadius: "12px", border: "2px solid #dc2626", backgroundColor: "#fef2f2" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {pack.urgentActions.map((action, i) => (
                  <div key={i} style={{ display: "flex", gap: "14px", alignItems: "flex-start" }}>
                    <span style={{ flexShrink: 0, width: "24px", height: "24px", borderRadius: "50%", backgroundColor: "#dc2626", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: 700, marginTop: "1px" }}>{i + 1}</span>
                    <span style={{ fontSize: "14px", lineHeight: 1.65, color: "#7f1d1d" }}>{action}</span>
                  </div>
                ))}
              </div>
            </div>
          </Section>
        )}

        {/* Bottom CTA */}
        <div style={{ marginTop: "56px", padding: "32px 36px", borderRadius: "16px", backgroundColor: "#0f6e56", textAlign: "center" }}>
          <p style={{ fontFamily: "var(--font-playfair, 'Playfair Display', serif)", fontSize: "20px", fontWeight: 700, color: "#fff", margin: "0 0 8px" }}>
            Need help with your own legal situation?
          </p>
          <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.75)", margin: "0 0 20px" }}>
            LegalClear UK analyses your situation in plain English and prepares you to meet a solicitor.
          </p>
          <Link
            href="/"
            style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "12px 28px", borderRadius: "10px", backgroundColor: "#fff", color: "#0f6e56", fontSize: "14px", fontWeight: 700, textDecoration: "none" }}
          >
            Get help with your legal situation →
          </Link>
        </div>

        {/* Footer note */}
        <p style={{ fontSize: "11px", color: "#bbb", textAlign: "center", marginTop: "32px" }}>
          Generated by LegalClear UK · Legal information only · Not regulated legal advice
        </p>

      </div>
    </div>
  );
}
