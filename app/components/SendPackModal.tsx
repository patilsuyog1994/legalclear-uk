"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { Solicitor } from "@/lib/solicitorData";

/* ─── Types ──────────────────────────────────────────────────── */

interface CaseSummary {
  id:                string;
  created_at:        string;
  law_type:          string;
  urgency_level:     string;
  summary_title:     string;
  pack_generated_at: string | null;
  share_token:       string | null;
}

type Step = "loading" | "select" | "preview" | "sending" | "done" | "error";

/* ─── Helpers ────────────────────────────────────────────────── */

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

const PACK_SECTIONS = [
  "Client summary", "Timeline of events", "Relevant UK law",
  "Key facts", "Questions for solicitor", "Documents to bring", "Urgent actions",
];

const URGENCY_COLOUR: Record<string, string> = {
  High: "#dc2626", Medium: "#d97706", Low: "#16a34a",
};

/* ─── Step dot indicator ─────────────────────────────────────── */
function StepDots({ step }: { step: Step }) {
  const order: Step[] = ["select", "preview", "sending", "done"];
  const idx = order.indexOf(step);
  if (idx < 0) return null;
  return (
    <div style={{ display: "flex", gap: "6px", justifyContent: "center", marginBottom: "24px" }}>
      {[0, 1].map((i) => (
        <div key={i} style={{
          width: "8px", height: "8px", borderRadius: "50%",
          backgroundColor: i <= idx ? "#0f6e56" : "#e5e0d8",
          transition: "background-color 0.2s",
        }} />
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════════ */

export default function SendPackModal({
  solicitor,
  isLoggedIn,
  onClose,
}: {
  solicitor:  Solicitor;
  isLoggedIn: boolean;
  onClose:    () => void;
}) {
  const [step,         setStep]         = useState<Step>("loading");
  const [cases,        setCases]        = useState<CaseSummary[]>([]);
  const [selectedCase, setSelectedCase] = useState<CaseSummary | null>(null);
  const [confirmed,    setConfirmed]    = useState(false);
  const [errorMsg,     setErrorMsg]     = useState("");
  const backdropRef = useRef<HTMLDivElement>(null);

  /* ── Fetch user's cases on mount ── */
  useEffect(() => {
    if (!isLoggedIn) { setStep("select"); return; }
    fetch("/api/cases")
      .then((r) => r.json())
      .then((data: CaseSummary[]) => {
        setCases(Array.isArray(data) ? data : []);
        setStep("select");
      })
      .catch(() => { setCases([]); setStep("select"); });
  }, [isLoggedIn]);

  /* ── Close on backdrop click ── */
  function handleBackdropClick(e: React.MouseEvent) {
    if (e.target === backdropRef.current) onClose();
  }

  /* ── Close on Escape ── */
  useEffect(() => {
    function handleKey(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  /* ── Send the pack ── */
  async function handleSend() {
    if (!selectedCase || !confirmed) return;
    setStep("sending");
    try {
      const res  = await fetch("/api/solicitor-contacts", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ solicitorId: solicitor.id, caseId: selectedCase.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to send.");
      setStep("done");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong.");
      setStep("error");
    }
  }

  /* ── Shared styles ── */
  const btn = (primary: boolean, disabled = false): React.CSSProperties => ({
    flex: 1, padding: "12px 20px", borderRadius: "10px",
    border: primary ? "none" : "1px solid #e5e0d8",
    backgroundColor: disabled ? (primary ? "#7fb8a8" : "#f8f7f3") : (primary ? "#0f6e56" : "#fff"),
    color: disabled ? (primary ? "#fff" : "#bbb") : (primary ? "#fff" : "#555"),
    fontSize: "14px", fontWeight: 600, cursor: disabled ? "not-allowed" : "pointer",
    fontFamily: "inherit", transition: "all 0.15s",
  });

  /* ─── Modal shell ── */
  return (
    <div
      ref={backdropRef}
      onClick={handleBackdropClick}
      style={{
        position: "fixed", inset: 0, zIndex: 200,
        backgroundColor: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "20px",
      }}
    >
      <div style={{
        backgroundColor: "#fff", borderRadius: "20px",
        width: "100%", maxWidth: "520px", maxHeight: "90vh",
        overflow: "hidden", display: "flex", flexDirection: "column",
        boxShadow: "0 25px 60px rgba(0,0,0,0.25)",
        animation: "lc-modal-in 0.2s ease",
      }}>

        {/* ── Modal header ── */}
        <div style={{
          padding: "22px 24px 0", display: "flex",
          alignItems: "flex-start", justifyContent: "space-between",
        }}>
          <div>
            <p style={{ fontSize: "11px", fontWeight: 700, color: "#aaa", letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 4px" }}>
              Send Case Pack
            </p>
            <h2 style={{ fontFamily: "var(--font-playfair,'Playfair Display',serif)", fontSize: "20px", fontWeight: 700, color: "#1c1c1c", margin: 0 }}>
              {solicitor.firmName}
            </h2>
            <p style={{ fontSize: "13px", color: "#777", margin: "3px 0 0" }}>
              {solicitor.solicitorName} · {solicitor.city}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", cursor: "pointer", padding: "4px", color: "#aaa", flexShrink: 0, marginLeft: "16px" }}
            aria-label="Close"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* ── Scrollable body ── */}
        <div style={{ padding: "20px 24px 24px", overflowY: "auto", flex: 1 }}>

          {/* ═══ LOADING ═══ */}
          {step === "loading" && (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <div style={{ width: "36px", height: "36px", border: "3px solid #e5e0d8", borderTopColor: "#0f6e56", borderRadius: "50%", animation: "lc-spin 0.7s linear infinite", margin: "0 auto 16px" }} />
              <p style={{ fontSize: "14px", color: "#888", margin: 0 }}>Loading your cases…</p>
            </div>
          )}

          {/* ═══ STEP 1 — CASE SELECTION ═══ */}
          {step === "select" && (
            <>
              <StepDots step="select" />

              {/* Not logged in */}
              {!isLoggedIn ? (
                <div style={{ textAlign: "center", padding: "32px 0" }}>
                  <div style={{ fontSize: "36px", marginBottom: "16px" }}>🔒</div>
                  <p style={{ fontSize: "16px", fontWeight: 700, color: "#1c1c1c", margin: "0 0 8px" }}>Sign in to send a case pack</p>
                  <p style={{ fontSize: "14px", color: "#777", margin: "0 0 24px", lineHeight: 1.6 }}>You need to be signed in to share your case with a solicitor.</p>
                  <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
                    <Link href="/login" style={{ padding: "10px 22px", borderRadius: "8px", backgroundColor: "#0f6e56", color: "#fff", fontSize: "14px", fontWeight: 600, textDecoration: "none" }}>Sign in</Link>
                    <Link href="/register" style={{ padding: "10px 22px", borderRadius: "8px", border: "1px solid #e5e0d8", backgroundColor: "#fff", color: "#555", fontSize: "14px", fontWeight: 600, textDecoration: "none" }}>Create account</Link>
                  </div>
                </div>
              ) : cases.length === 0 ? (
                /* No cases at all */
                <div style={{ textAlign: "center", padding: "32px 0" }}>
                  <div style={{ fontSize: "36px", marginBottom: "16px" }}>📂</div>
                  <p style={{ fontSize: "16px", fontWeight: 700, color: "#1c1c1c", margin: "0 0 8px" }}>No saved cases yet</p>
                  <p style={{ fontSize: "14px", color: "#777", margin: "0 0 24px", lineHeight: 1.6 }}>
                    Analyse your situation first and save it to your dashboard, then come back to send your pack to a solicitor.
                  </p>
                  <Link href="/analyse" style={{ padding: "10px 22px", borderRadius: "8px", backgroundColor: "#0f6e56", color: "#fff", fontSize: "14px", fontWeight: 600, textDecoration: "none" }}>
                    Analyse my situation →
                  </Link>
                </div>
              ) : (
                /* Case list */
                <>
                  <p style={{ fontSize: "13px", color: "#777", margin: "0 0 16px" }}>
                    Select the case you want to share with this solicitor:
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "20px" }}>
                    {cases.map((c) => {
                      const hasPack   = !!c.pack_generated_at;
                      const isSelected = selectedCase?.id === c.id;
                      return (
                        <div
                          key={c.id}
                          onClick={() => hasPack && setSelectedCase(c)}
                          style={{
                            padding: "16px 18px", borderRadius: "12px",
                            border: `2px solid ${isSelected ? "#0f6e56" : hasPack ? "#e5e0d8" : "#f0ece6"}`,
                            backgroundColor: isSelected ? "#f0faf6" : hasPack ? "#fff" : "#fafaf8",
                            cursor: hasPack ? "pointer" : "default",
                            transition: "all 0.15s",
                            opacity: hasPack ? 1 : 0.7,
                          }}
                        >
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "10px", marginBottom: "8px" }}>
                            <p style={{ fontSize: "14px", fontWeight: 700, color: "#1c1c1c", margin: 0, lineHeight: 1.3 }}>
                              {c.summary_title}
                            </p>
                            {isSelected && (
                              <div style={{ width: "20px", height: "20px", borderRadius: "50%", backgroundColor: "#0f6e56", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><polyline points="2 6 5 9 10 3" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                              </div>
                            )}
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                            <span style={{ padding: "2px 10px", borderRadius: "999px", backgroundColor: "#e8f4f0", color: "#0f6e56", fontSize: "11px", fontWeight: 600 }}>
                              {c.law_type}
                            </span>
                            <span style={{ fontSize: "11px", color: URGENCY_COLOUR[c.urgency_level] ?? "#888", fontWeight: 600 }}>
                              {c.urgency_level} urgency
                            </span>
                            <span style={{ fontSize: "11px", color: "#aaa" }}>{fmtDate(c.created_at)}</span>
                          </div>

                          {/* No pack warning */}
                          {!hasPack && (
                            <div style={{ marginTop: "10px", padding: "8px 12px", borderRadius: "8px", backgroundColor: "#fffbeb", border: "1px solid #fde68a", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px" }}>
                              <p style={{ fontSize: "12px", color: "#92400e", margin: 0, lineHeight: 1.5 }}>
                                This case doesn't have a solicitor pack yet. Generate one first.
                              </p>
                              <Link
                                href={`/pack/${c.id}`}
                                style={{ fontSize: "12px", fontWeight: 700, color: "#0f6e56", textDecoration: "none", whiteSpace: "nowrap" }}
                                onClick={onClose}
                              >
                                Generate →
                              </Link>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div style={{ display: "flex", gap: "10px" }}>
                    <button style={btn(false)} onClick={onClose}>Cancel</button>
                    <button
                      style={btn(true, !selectedCase)}
                      disabled={!selectedCase}
                      onClick={() => selectedCase && setStep("preview")}
                      onMouseEnter={(e) => { if (selectedCase) e.currentTarget.style.backgroundColor = "#0a5242"; }}
                      onMouseLeave={(e) => { if (selectedCase) e.currentTarget.style.backgroundColor = "#0f6e56"; }}
                    >
                      Continue →
                    </button>
                  </div>
                </>
              )}
            </>
          )}

          {/* ═══ STEP 2 — PREVIEW + CONFIRM ═══ */}
          {step === "preview" && selectedCase && (
            <>
              <StepDots step="preview" />

              <p style={{ fontSize: "13px", color: "#777", margin: "0 0 16px" }}>Review what you're about to share:</p>

              {/* Sending to */}
              <div style={{ padding: "16px 18px", borderRadius: "12px", border: "1px solid #e5e0d8", backgroundColor: "#f8f7f3", marginBottom: "16px" }}>
                <p style={{ fontSize: "11px", fontWeight: 700, color: "#aaa", letterSpacing: "0.08em", textTransform: "uppercase", margin: "0 0 6px" }}>Sending to</p>
                <p style={{ fontSize: "15px", fontWeight: 700, color: "#1c1c1c", margin: "0 0 2px" }}>{solicitor.firmName}</p>
                <p style={{ fontSize: "13px", color: "#555", margin: 0 }}>{solicitor.solicitorName} · {solicitor.address}, {solicitor.postcode}</p>
              </div>

              {/* Case being sent */}
              <div style={{ padding: "16px 18px", borderRadius: "12px", border: "1px solid #e5e0d8", backgroundColor: "#f8f7f3", marginBottom: "16px" }}>
                <p style={{ fontSize: "11px", fontWeight: 700, color: "#aaa", letterSpacing: "0.08em", textTransform: "uppercase", margin: "0 0 6px" }}>Case</p>
                <p style={{ fontSize: "15px", fontWeight: 700, color: "#1c1c1c", margin: "0 0 6px" }}>{selectedCase.summary_title}</p>
                <span style={{ padding: "2px 10px", borderRadius: "999px", backgroundColor: "#e8f4f0", color: "#0f6e56", fontSize: "11px", fontWeight: 600 }}>
                  {selectedCase.law_type}
                </span>
              </div>

              {/* Pack contents */}
              <div style={{ padding: "16px 18px", borderRadius: "12px", border: "1px solid #e5e0d8", backgroundColor: "#f8f7f3", marginBottom: "20px" }}>
                <p style={{ fontSize: "11px", fontWeight: 700, color: "#aaa", letterSpacing: "0.08em", textTransform: "uppercase", margin: "0 0 12px" }}>Pack includes</p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
                  {PACK_SECTIONS.map((s) => (
                    <div key={s} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#0f6e56" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                      <span style={{ fontSize: "12px", color: "#444" }}>{s}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Confirm checkbox */}
              <label style={{ display: "flex", gap: "12px", alignItems: "flex-start", cursor: "pointer", marginBottom: "14px" }}>
                <div
                  onClick={() => setConfirmed((v) => !v)}
                  style={{
                    width: "20px", height: "20px", borderRadius: "5px", flexShrink: 0, marginTop: "1px",
                    border: `2px solid ${confirmed ? "#0f6e56" : "#d1d5db"}`,
                    backgroundColor: confirmed ? "#0f6e56" : "#fff",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "all 0.15s",
                  }}
                >
                  {confirmed && (
                    <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                      <polyline points="2 6 5 9 10 3" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </div>
                <span style={{ fontSize: "13px", color: "#444", lineHeight: 1.6 }}>
                  I confirm I want to share this information with <strong>{solicitor.solicitorName}</strong> at <strong>{solicitor.firmName}</strong>.
                </span>
              </label>

              {/* Privacy note */}
              <div style={{ display: "flex", gap: "8px", alignItems: "flex-start", padding: "10px 14px", borderRadius: "8px", backgroundColor: "#f0faf6", border: "1px solid #c3e0d8", marginBottom: "20px" }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#0f6e56" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: "2px" }}>
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
                <p style={{ fontSize: "12px", color: "#0a5242", margin: 0, lineHeight: 1.6 }}>
                  Your contact details will be shared with this solicitor so they can get in touch with you.
                </p>
              </div>

              <div style={{ display: "flex", gap: "10px" }}>
                <button style={btn(false)} onClick={() => { setConfirmed(false); setStep("select"); }}>← Back</button>
                <button
                  style={btn(true, !confirmed)}
                  disabled={!confirmed}
                  onClick={handleSend}
                  onMouseEnter={(e) => { if (confirmed) e.currentTarget.style.backgroundColor = "#0a5242"; }}
                  onMouseLeave={(e) => { if (confirmed) e.currentTarget.style.backgroundColor = "#0f6e56"; }}
                >
                  <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 2L11 13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                    </svg>
                    Send pack
                  </span>
                </button>
              </div>
            </>
          )}

          {/* ═══ STEP 3 — SENDING ═══ */}
          {step === "sending" && (
            <div style={{ textAlign: "center", padding: "48px 0" }}>
              <div style={{ width: "48px", height: "48px", border: "4px solid #e8f4f0", borderTopColor: "#0f6e56", borderRadius: "50%", animation: "lc-spin 0.7s linear infinite", margin: "0 auto 20px" }} />
              <p style={{ fontSize: "16px", fontWeight: 700, color: "#1c1c1c", margin: "0 0 6px" }}>Sending your case pack…</p>
              <p style={{ fontSize: "13px", color: "#888", margin: 0 }}>This will only take a moment</p>
            </div>
          )}

          {/* ═══ STEP 4 — SUCCESS ═══ */}
          {step === "done" && (
            <div style={{ textAlign: "center", padding: "32px 0" }}>
              <div style={{ width: "64px", height: "64px", borderRadius: "50%", backgroundColor: "#0f6e56", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
              <h3 style={{ fontFamily: "var(--font-playfair,'Playfair Display',serif)", fontSize: "22px", fontWeight: 700, color: "#1c1c1c", margin: "0 0 12px" }}>
                Pack sent!
              </h3>
              <p style={{ fontSize: "14px", color: "#555", lineHeight: 1.7, margin: "0 0 6px", maxWidth: "380px", marginLeft: "auto", marginRight: "auto" }}>
                Your case pack has been sent to <strong>{solicitor.solicitorName}</strong> at <strong>{solicitor.firmName}</strong>.
              </p>
              <p style={{ fontSize: "14px", color: "#555", lineHeight: 1.7, margin: "0 0 28px", maxWidth: "380px", marginLeft: "auto", marginRight: "auto" }}>
                They will contact you directly using your registered email address.
              </p>
              <p style={{ fontSize: "12px", color: "#aaa", margin: "0 0 24px" }}>
                A confirmation email has been sent to you.
              </p>
              <button
                style={{ padding: "11px 28px", borderRadius: "10px", border: "none", backgroundColor: "#0f6e56", color: "#fff", fontSize: "14px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}
                onClick={onClose}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#0a5242"}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#0f6e56"}
              >
                Close
              </button>
            </div>
          )}

          {/* ═══ ERROR ═══ */}
          {step === "error" && (
            <div style={{ textAlign: "center", padding: "32px 0" }}>
              <div style={{ fontSize: "40px", marginBottom: "16px" }}>⚠️</div>
              <p style={{ fontSize: "16px", fontWeight: 700, color: "#1c1c1c", margin: "0 0 8px" }}>Something went wrong</p>
              <p style={{ fontSize: "13px", color: "#777", margin: "0 0 24px", lineHeight: 1.6 }}>{errorMsg}</p>
              <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
                <button style={{ ...btn(false), flex: "unset", padding: "10px 20px" }} onClick={onClose}>Close</button>
                <button
                  style={{ ...btn(true, false), flex: "unset", padding: "10px 20px" }}
                  onClick={() => { setStep("preview"); setErrorMsg(""); }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#0a5242"}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#0f6e56"}
                >
                  Try again
                </button>
              </div>
            </div>
          )}

        </div>
      </div>

      <style>{`
        @keyframes lc-spin { to { transform: rotate(360deg); } }
        @keyframes lc-modal-in {
          from { opacity: 0; transform: scale(0.95) translateY(8px); }
          to   { opacity: 1; transform: scale(1)    translateY(0);   }
        }
      `}</style>
    </div>
  );
}
