"use client";

/* ─── Types ──────────────────────────────────────────────────── */

export interface PackData {
  clientSummary:        string;
  timeline:             { date?: string; description: string }[];
  legalContext:         string;
  keyFacts:             string[];
  questionsForSolicitor: string[];
  documentsToGather:    string[];
  urgentActions:        string[];
}

interface Props {
  pack:    PackData;
  title:   string;
  onClose: () => void;
}

/* ─── Section helpers ────────────────────────────────────────── */

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: "32px" }}>
      <h3 style={{
        fontFamily:    "var(--font-playfair, 'Playfair Display', serif)",
        fontSize:      "17px",
        fontWeight:    700,
        color:         "#1c1c1c",
        marginBottom:  "12px",
        paddingBottom: "8px",
        borderBottom:  "2px solid #0f6e56",
        display:       "inline-block",
      }}>
        {label}
      </h3>
      {children}
    </div>
  );
}

/* ─── Component ──────────────────────────────────────────────── */

export default function PackModal({ pack, title, onClose }: Props) {
  function handlePrint() {
    window.print();
  }

  return (
    /* Backdrop */
    <div
      style={{
        position:        "fixed",
        inset:           0,
        zIndex:          200,
        backgroundColor: "rgba(0,0,0,0.55)",
        display:         "flex",
        alignItems:      "flex-start",
        justifyContent:  "center",
        overflowY:       "auto",
        padding:         "40px 16px 60px",
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Modal card */}
      <div style={{
        backgroundColor: "#fff",
        borderRadius:    "16px",
        width:           "100%",
        maxWidth:        "760px",
        boxShadow:       "0 20px 60px rgba(0,0,0,0.25)",
        overflow:        "hidden",
        fontFamily:      "var(--font-dm-sans, 'DM Sans', sans-serif)",
      }}>

        {/* Header */}
        <div style={{ backgroundColor: "#0f6e56", padding: "24px 32px", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px" }}>
          <div>
            <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "12px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 6px" }}>
              Pre-Solicitor Pack
            </p>
            <h2 style={{ color: "#fff", fontSize: "20px", fontWeight: 700, margin: 0, lineHeight: 1.3, fontFamily: "var(--font-playfair, 'Playfair Display', serif)" }}>
              {title}
            </h2>
          </div>
          <div style={{ display: "flex", gap: "10px", flexShrink: 0 }}>
            <button
              onClick={handlePrint}
              style={{ padding: "8px 16px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.35)", backgroundColor: "rgba(255,255,255,0.12)", color: "#fff", fontSize: "13px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: "6px" }}
            >
              🖨️ Print
            </button>
            <button
              onClick={onClose}
              style={{ width: "36px", height: "36px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.35)", backgroundColor: "rgba(255,255,255,0.12)", color: "#fff", fontSize: "18px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "inherit" }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Notice bar */}
        <div style={{ backgroundColor: "#fffbeb", borderBottom: "1px solid #fde68a", padding: "10px 32px", fontSize: "12px", color: "#92400e" }}>
          📋 This document is for informational purposes only. Bring it to your first solicitor appointment. Do not rely on it as legal advice.
        </div>

        {/* Body */}
        <div style={{ padding: "36px 32px" }}>

          {/* Client Summary */}
          <Section label="Client Summary">
            {pack.clientSummary.split("\n\n").filter(Boolean).map((para, i) => (
              <p key={i} style={{ fontSize: "15px", lineHeight: 1.75, color: "#333", marginBottom: "12px" }}>{para}</p>
            ))}
          </Section>

          {/* Urgent Actions — shown prominently if any */}
          {pack.urgentActions && pack.urgentActions.length > 0 && (
            <div style={{ marginBottom: "32px", padding: "16px 20px", borderRadius: "10px", backgroundColor: "#fef2f2", border: "1px solid #fecaca" }}>
              <p style={{ fontSize: "13px", fontWeight: 700, color: "#dc2626", marginBottom: "10px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                ⚠️ Urgent Actions Required
              </p>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "8px" }}>
                {pack.urgentActions.map((action, i) => (
                  <li key={i} style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                    <span style={{ color: "#dc2626", fontWeight: 700, flexShrink: 0 }}>→</span>
                    <span style={{ fontSize: "14px", lineHeight: 1.6, color: "#7f1d1d" }}>{action}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Timeline */}
          {pack.timeline && pack.timeline.length > 0 && (
            <Section label="Timeline of Events">
              <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
                {pack.timeline.map((event, i) => (
                  <div key={i} style={{ display: "flex", gap: "16px", alignItems: "flex-start", paddingBottom: "16px", position: "relative" }}>
                    {/* Line connector */}
                    {i < pack.timeline.length - 1 && (
                      <div style={{ position: "absolute", left: "11px", top: "24px", bottom: 0, width: "2px", backgroundColor: "#e5e0d8" }} />
                    )}
                    <div style={{ flexShrink: 0, width: "24px", height: "24px", borderRadius: "50%", backgroundColor: "#0f6e56", display: "flex", alignItems: "center", justifyContent: "center", marginTop: "1px", zIndex: 1 }}>
                      <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#fff" }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      {event.date && (
                        <p style={{ fontSize: "12px", fontWeight: 700, color: "#0f6e56", marginBottom: "2px", textTransform: "uppercase", letterSpacing: "0.04em" }}>{event.date}</p>
                      )}
                      <p style={{ fontSize: "14px", lineHeight: 1.6, color: "#333", margin: 0 }}>{event.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* Legal Context */}
          <Section label="Relevant UK Law">
            <div style={{ padding: "16px 20px", backgroundColor: "#f8f7f3", borderRadius: "10px", border: "1px solid #e5e0d8" }}>
              <p style={{ fontSize: "14px", lineHeight: 1.75, color: "#333", margin: 0 }}>{pack.legalContext}</p>
            </div>
          </Section>

          {/* Key Facts */}
          {pack.keyFacts && pack.keyFacts.length > 0 && (
            <Section label="Key Facts">
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "8px" }}>
                {pack.keyFacts.map((fact, i) => (
                  <li key={i} style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                    <span style={{ flexShrink: 0, width: "22px", height: "22px", borderRadius: "4px", backgroundColor: "#e8f4f0", color: "#0f6e56", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: 700, marginTop: "1px" }}>{i + 1}</span>
                    <span style={{ fontSize: "14px", lineHeight: 1.6, color: "#333" }}>{fact}</span>
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {/* Questions for Solicitor */}
          {pack.questionsForSolicitor && pack.questionsForSolicitor.length > 0 && (
            <Section label="Questions to Ask Your Solicitor">
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
                {pack.questionsForSolicitor.map((q, i) => (
                  <li key={i} style={{ display: "flex", gap: "12px", alignItems: "flex-start", padding: "12px 14px", backgroundColor: "#f8f7f3", borderRadius: "8px", border: "1px solid #e5e0d8" }}>
                    <span style={{ flexShrink: 0, fontSize: "16px" }}>❓</span>
                    <span style={{ fontSize: "14px", lineHeight: 1.6, color: "#333" }}>{q}</span>
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {/* Documents to Gather */}
          {pack.documentsToGather && pack.documentsToGather.length > 0 && (
            <Section label="Documents to Bring">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                {pack.documentsToGather.map((doc, i) => (
                  <div key={i} style={{ display: "flex", gap: "10px", alignItems: "center", padding: "10px 12px", backgroundColor: "#fff", borderRadius: "8px", border: "1px solid #e5e0d8" }}>
                    <span style={{ fontSize: "16px", flexShrink: 0 }}>📎</span>
                    <span style={{ fontSize: "13px", color: "#333", lineHeight: 1.4 }}>{doc}</span>
                  </div>
                ))}
              </div>
            </Section>
          )}

        </div>

        {/* Footer */}
        <div style={{ padding: "20px 32px", borderTop: "1px solid #e5e0d8", backgroundColor: "#f8f7f3", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px", flexWrap: "wrap" }}>
          <p style={{ fontSize: "12px", color: "#999", margin: 0 }}>
            Generated by LegalClear UK · For informational purposes only · Not legal advice
          </p>
          <div style={{ display: "flex", gap: "10px" }}>
            <button onClick={handlePrint} style={{ padding: "9px 20px", borderRadius: "8px", border: "1px solid #0f6e56", backgroundColor: "#fff", color: "#0f6e56", fontSize: "13px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
              🖨️ Print / Save as PDF
            </button>
            <button onClick={onClose} style={{ padding: "9px 20px", borderRadius: "8px", border: "1px solid #ddd", backgroundColor: "#fff", color: "#555", fontSize: "13px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
              Close
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
