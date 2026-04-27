"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { buildPDF, type PackData } from "@/lib/buildPDF";

/* ─── Loading screen ─────────────────────────────────────────── */

function LoadingScreen() {
  return (
    <div
      style={{
        minHeight:       "100vh",
        display:         "flex",
        flexDirection:   "column",
        alignItems:      "center",
        justifyContent:  "center",
        backgroundColor: "#f8f7f3",
        fontFamily:      "var(--font-dm-sans, 'DM Sans', sans-serif)",
        gap:             "32px",
        padding:         "40px 20px",
        textAlign:       "center",
      }}
    >
      <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "10px" }}>
        <svg width="36" height="36" viewBox="0 0 40 40" fill="none">
          <rect width="40" height="40" rx="8" fill="#0f6e56" />
          <path d="M20 8L28 13V20C28 25.5 24 30.2 20 32C16 30.2 12 25.5 12 20V13L20 8Z" fill="white" fillOpacity="0.9" />
          <path d="M17 20L19 22L23 18" stroke="#0f6e56" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span style={{ fontFamily: "var(--font-playfair, 'Playfair Display', serif)", fontSize: "20px", fontWeight: 700, color: "#1c1c1c" }}>
          LegalClear <span style={{ color: "#0f6e56" }}>UK</span>
        </span>
      </Link>

      <div>
        <div style={{ display: "flex", justifyContent: "center", gap: "10px", marginBottom: "24px" }}>
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              style={{
                width:           "12px",
                height:          "12px",
                borderRadius:    "50%",
                backgroundColor: "#0f6e56",
                animation:       `lc-dot 1.4s ease-in-out ${i * 0.22}s infinite`,
              }}
            />
          ))}
        </div>
        <p style={{ fontSize: "20px", fontWeight: 700, color: "#1c1c1c", margin: "0 0 10px", lineHeight: 1.4 }}>
          Preparing your solicitor briefing document…
        </p>
        <p style={{ fontSize: "14px", color: "#888", margin: 0 }}>
          This usually takes 15–25 seconds
        </p>
      </div>

      <div style={{ width: "220px", height: "4px", borderRadius: "4px", backgroundColor: "#e5e0d8", overflow: "hidden" }}>
        <div style={{ height: "100%", borderRadius: "4px", backgroundColor: "#0f6e56", animation: "lc-progress 4s ease-in-out infinite" }} />
      </div>

      <style>{`
        @keyframes lc-dot {
          0%, 80%, 100% { opacity: 0.2; transform: scale(0.75); }
          40%            { opacity: 1;   transform: scale(1);    }
        }
        @keyframes lc-progress {
          0%   { width: 0%;   margin-left: 0;    }
          50%  { width: 70%;  margin-left: 15%;  }
          100% { width: 0%;   margin-left: 100%; }
        }
      `}</style>
    </div>
  );
}

/* ─── Error screen ───────────────────────────────────────────── */

function ErrorScreen({ message }: { message: string }) {
  return (
    <div
      style={{
        minHeight:       "100vh",
        display:         "flex",
        flexDirection:   "column",
        alignItems:      "center",
        justifyContent:  "center",
        backgroundColor: "#f8f7f3",
        fontFamily:      "var(--font-dm-sans, 'DM Sans', sans-serif)",
        gap:             "20px",
        padding:         "40px 20px",
        textAlign:       "center",
      }}
    >
      <div style={{ fontSize: "40px" }}>⚠️</div>
      <p style={{ fontSize: "18px", fontWeight: 700, color: "#1c1c1c", margin: 0 }}>Could not generate your pack</p>
      <p style={{ fontSize: "14px", color: "#777", margin: 0, maxWidth: "400px" }}>{message}</p>
      <Link
        href="/dashboard"
        style={{ padding: "10px 24px", borderRadius: "8px", backgroundColor: "#0f6e56", color: "#fff", fontSize: "14px", fontWeight: 600, textDecoration: "none" }}
      >
        ← Back to dashboard
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
        <h2 style={{ fontFamily: "var(--font-playfair, 'Playfair Display', serif)", fontSize: "18px", fontWeight: 700, color: "#1c1c1c", margin: 0 }}>
          {label}
        </h2>
      </div>
      {children}
    </div>
  );
}

/* ─── Action buttons ─────────────────────────────────────────── */

function ActionButtons({
  onDownload,
  onCopy,
  copied,
  downloading,
  sharing,
}: {
  onDownload:  () => void;
  onCopy:      () => void;
  copied:      boolean;
  downloading: boolean;
  sharing:     boolean;
}) {
  return (
    <div className="no-print" style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
      <button
        onClick={onDownload}
        disabled={downloading}
        style={{
          padding:         "10px 22px",
          borderRadius:    "8px",
          border:          "none",
          backgroundColor: downloading ? "#7fb8a8" : "#0f6e56",
          color:           "#fff",
          fontSize:        "14px",
          fontWeight:      600,
          cursor:          downloading ? "not-allowed" : "pointer",
          fontFamily:      "inherit",
          display:         "flex",
          alignItems:      "center",
          gap:             "8px",
          transition:      "background-color 0.15s",
          minWidth:        "190px",
          justifyContent:  "center",
        }}
        onMouseEnter={(e) => { if (!downloading) e.currentTarget.style.backgroundColor = "#0a5242"; }}
        onMouseLeave={(e) => { if (!downloading) e.currentTarget.style.backgroundColor = "#0f6e56"; }}
      >
        {downloading ? (
          <>
            <span style={{ display: "inline-block", width: "14px", height: "14px", border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "#fff", borderRadius: "50%", animation: "lc-spin 0.7s linear infinite" }} />
            Preparing your PDF…
          </>
        ) : (
          <>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 6 2 18 2 18 9" />
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
              <rect x="6" y="14" width="12" height="8" />
            </svg>
            Download as PDF
          </>
        )}
      </button>

      <button
        onClick={onCopy}
        disabled={sharing}
        style={{
          padding:         "10px 22px",
          borderRadius:    "8px",
          border:          "1px solid #0f6e56",
          backgroundColor: "#fff",
          color:           sharing ? "#aaa" : "#0f6e56",
          fontSize:        "14px",
          fontWeight:      600,
          cursor:          sharing ? "not-allowed" : "pointer",
          fontFamily:      "inherit",
          display:         "flex",
          alignItems:      "center",
          gap:             "8px",
          transition:      "all 0.15s",
          minWidth:        "200px",
          justifyContent:  "center",
        }}
        onMouseEnter={(e) => { if (!sharing) e.currentTarget.style.backgroundColor = "#f0faf6"; }}
        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#fff"; }}
      >
        {sharing ? (
          <>
            <span style={{ display: "inline-block", width: "14px", height: "14px", border: "2px solid #c3e0d8", borderTopColor: "#0f6e56", borderRadius: "50%", animation: "lc-spin 0.7s linear infinite" }} />
            Generating link…
          </>
        ) : copied ? (
          <>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0f6e56" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Link copied!
          </>
        ) : (
          <>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
            Copy shareable link
          </>
        )}
      </button>
    </div>
  );
}

/* ─── Main component ─────────────────────────────────────────── */

export default function PackPageClient({ caseId }: { caseId: string }) {
  const [status, setStatus]           = useState<"loading" | "ready" | "error">("loading");
  const [pack, setPack]               = useState<PackData | null>(null);
  const [title, setTitle]             = useState("");
  const [errorMsg, setErrorMsg]       = useState("");
  const [copied, setCopied]           = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [packDate, setPackDate]       = useState<string>("");   /* human-readable date */
  const [regenerating, setRegenerating] = useState(false);
  const [saveError, setSaveError]     = useState<string | null>(null);
  const [shareToken, setShareToken]   = useState<string | null>(null);
  const [sharing, setSharing]         = useState(false);        /* generating token */
  const [disablingShare, setDisablingShare] = useState(false);
  const [lawType, setLawType]         = useState("");

  /* Interactive checklist state */
  const [checkedQs,   setCheckedQs]   = useState<Set<number>>(new Set());
  const [checkedDocs, setCheckedDocs] = useState<Set<number>>(new Set());

  /* Keep a ref to the raw case payload so regenerate can reuse it */
  const caseDataRef = useRef<Record<string, unknown> | null>(null);

  function fmtDate(iso: string): string {
    return new Date(iso).toLocaleDateString("en-GB", {
      day: "numeric", month: "long", year: "numeric",
    });
  }

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
      keyFacts:            Array.isArray(raw.keyFacts)            ? raw.keyFacts.map(flattenItem)            : raw.keyFacts,
      questionsForSolicitor: Array.isArray(raw.questionsForSolicitor) ? raw.questionsForSolicitor.map(flattenItem) : raw.questionsForSolicitor,
      documentsToGather:   Array.isArray(raw.documentsToGather)   ? raw.documentsToGather.map(flattenItem)   : raw.documentsToGather,
      urgentActions:       Array.isArray(raw.urgentActions)       ? raw.urgentActions.map(flattenItem)       : raw.urgentActions,
    };
  }

  /* ── Helper: call the AI and save result back to Supabase ── */
  async function generateAndSave(caseData: Record<string, unknown>): Promise<PackData> {
    const fr = caseData.full_result as Record<string, unknown>;
    const packRes = await fetch("/api/generate-pack", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        summaryTitle:  fr.summaryTitle,
        lawType:       fr.lawType,
        urgencyLevel:  fr.urgencyLevel,
        urgencyReason: fr.urgencyReason,
        inputText:     caseData.input_text ?? "",
        fullResult:    fr,
        chatHistory:   Array.isArray(caseData.chat_history) ? caseData.chat_history : [],
        letter:        fr.letter,
      }),
    });
    const packJson = await packRes.json();
    if (!packRes.ok) throw new Error(packJson.error ?? "Failed to generate pack.");

    const now = new Date().toISOString();

    /* Best-effort save — don't block on failure */
    fetch(`/api/cases/${caseId}`, {
      method:  "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        solicitor_pack:    packJson.pack,
        pack_generated_at: now,
      }),
    }).catch(() => {});

    return packJson.pack as PackData;
  }

  /* ── Fetch case on mount — use cached pack if available ── */
  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const caseRes  = await fetch(`/api/cases/${caseId}`);
        const caseData = await caseRes.json();
        if (!caseRes.ok) throw new Error(caseData.error ?? "Could not load case data.");
        if (cancelled) return;

        caseDataRef.current = caseData;
        setTitle(caseData.full_result?.summaryTitle ?? "Case");
        setLawType(caseData.full_result?.lawType ?? "");

        /* Hydrate share token regardless of which path we take */
        if (caseData.share_token) setShareToken(caseData.share_token as string);

        /* ── Fast path: saved pack already exists ── */
        if (caseData.solicitor_pack && caseData.pack_generated_at) {
          setPackDate(fmtDate(caseData.pack_generated_at as string));
          setPack(normalizePack(caseData.solicitor_pack as PackData));
          setStatus("ready");
          return;
        }

        /* ── Slow path: generate fresh and save ── */
        const newPack = await generateAndSave(caseData);
        if (!cancelled) {
          setPackDate(new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }));
          setPack(normalizePack(newPack));
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [caseId]);

  /* ── Regenerate: re-call the AI and overwrite the saved pack ── */
  async function handleRegenerate() {
    if (!caseDataRef.current || regenerating) return;
    setRegenerating(true);
    setSaveError(null);
    try {
      const newPack = await generateAndSave(caseDataRef.current);
      setPackDate(new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }));
      setPack(normalizePack(newPack));
      /* Reset checklists since content changed */
      setCheckedQs(new Set());
      setCheckedDocs(new Set());
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Could not regenerate pack.");
    } finally {
      setRegenerating(false);
    }
  }

  /* ── Handlers ── */
  async function handleDownload() {
    if (!pack || downloading) return;
    setDownloading(true);
    try {
      await buildPDF(pack, title, packDate);
    } catch (err) {
      console.error("PDF error:", err);
      alert("Could not generate PDF — please try again.");
    } finally {
      setDownloading(false);
    }
  }

  /* ── Share: generate token if needed, then copy the public URL ── */
  async function handleCopy() {
    if (sharing) return;
    try {
      let token = shareToken;

      if (!token) {
        setSharing(true);
        token = crypto.randomUUID();
        const res = await fetch(`/api/cases/${caseId}`, {
          method:  "PATCH",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify({ share_token: token }),
        });
        if (!res.ok) throw new Error("Could not generate share link.");
        setShareToken(token);
      }

      const url = `${window.location.origin}/pack/view/${token}`;
      await navigator.clipboard.writeText(url).catch(() => {});
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error("Share error:", err);
      alert("Could not generate share link. Please try again.");
    } finally {
      setSharing(false);
    }
  }

  /* ── Disable sharing: clear the share token ── */
  async function handleDisableSharing() {
    if (!shareToken || disablingShare) return;
    setDisablingShare(true);
    try {
      const res = await fetch(`/api/cases/${caseId}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ share_token: null }),
      });
      if (!res.ok) throw new Error("Failed to disable sharing.");
      setShareToken(null);
      setCopied(false);
    } catch (err) {
      console.error("Disable share error:", err);
      alert("Could not disable sharing. Please try again.");
    } finally {
      setDisablingShare(false);
    }
  }

  function toggleQ(i: number) {
    setCheckedQs((prev) => { const s = new Set(prev); s.has(i) ? s.delete(i) : s.add(i); return s; });
  }
  function toggleDoc(i: number) {
    setCheckedDocs((prev) => { const s = new Set(prev); s.has(i) ? s.delete(i) : s.add(i); return s; });
  }

  /* ── Early returns ── */
  if (status === "loading") return <LoadingScreen />;
  if (status === "error" || !pack) return <ErrorScreen message={errorMsg} />;

  const hasUrgent = pack.urgentActions && pack.urgentActions.length > 0;

  /* ══════════════════════════════════════════════════════════════
     RENDER
  ══════════════════════════════════════════════════════════════ */
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f8f7f3", fontFamily: "var(--font-dm-sans, 'DM Sans', sans-serif)" }}>
      <style>{`
        @keyframes lc-spin { to { transform: rotate(360deg); } }
        @media print { .no-print { display: none !important; } body { background: #fff !important; } }
      `}</style>

      {/* Navbar */}
      <nav className="no-print" style={{ position: "sticky", top: 0, zIndex: 50, backgroundColor: "rgba(248,247,243,0.96)", backdropFilter: "blur(10px)", borderBottom: "1px solid #e5e0d8", padding: "0 48px", height: "64px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "10px" }}>
          <svg width="32" height="32" viewBox="0 0 40 40" fill="none">
            <rect width="40" height="40" rx="8" fill="#0f6e56" />
            <path d="M20 8L28 13V20C28 25.5 24 30.2 20 32C16 30.2 12 25.5 12 20V13L20 8Z" fill="white" fillOpacity="0.9" />
            <path d="M17 20L19 22L23 18" stroke="#0f6e56" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span style={{ fontFamily: "var(--font-playfair, 'Playfair Display', serif)", fontSize: "20px", fontWeight: 700, color: "#1c1c1c" }}>
            LegalClear <span style={{ color: "#0f6e56" }}>UK</span>
          </span>
        </Link>
        <Link href="/dashboard" style={{ fontSize: "14px", fontWeight: 600, color: "#555", textDecoration: "none" }}>
          ← Back to dashboard
        </Link>
      </nav>

      {/* Content */}
      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "40px 24px 80px" }}>

        {/* Top controls */}
        <div className="no-print" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px", marginBottom: "32px" }}>
          {/* Breadcrumb + date + regenerate */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <p style={{ fontSize: "13px", color: "#888", margin: 0 }}>
              <Link href="/dashboard" style={{ color: "#0f6e56", textDecoration: "none", fontWeight: 600 }}>Dashboard</Link>
              <span style={{ margin: "0 6px" }}>›</span>Pre-Solicitor Pack
            </p>
            {packDate && (
              <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                <span style={{ fontSize: "11px", color: "#aaa" }}>
                  Pack generated on {packDate}
                </span>
                <button
                  onClick={handleRegenerate}
                  disabled={regenerating}
                  style={{
                    background:     "none",
                    border:         "none",
                    padding:        "0",
                    fontSize:       "11px",
                    fontWeight:     600,
                    color:          regenerating ? "#aaa" : "#0f6e56",
                    cursor:         regenerating ? "not-allowed" : "pointer",
                    fontFamily:     "inherit",
                    display:        "flex",
                    alignItems:     "center",
                    gap:            "4px",
                    textDecoration: "underline",
                    textDecorationStyle: "dotted",
                    textUnderlineOffset: "3px",
                  }}
                >
                  {regenerating ? (
                    <>
                      <span style={{ display: "inline-block", width: "10px", height: "10px", border: "1.5px solid #aaa", borderTopColor: "#0f6e56", borderRadius: "50%", animation: "lc-spin 0.7s linear infinite" }} />
                      Regenerating…
                    </>
                  ) : (
                    <>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="1 4 1 10 7 10" />
                        <path d="M3.51 15a9 9 0 1 0 .49-4.95" />
                      </svg>
                      Regenerate pack
                    </>
                  )}
                </button>
              </div>
            )}
            {/* Sharing status row */}
            {shareToken ? (
              <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", marginTop: "2px" }}>
                <span style={{ fontSize: "11px", color: "#0f6e56", display: "flex", alignItems: "center", gap: "4px" }}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                  </svg>
                  Sharing enabled
                </span>
                <button
                  onClick={handleDisableSharing}
                  disabled={disablingShare}
                  style={{
                    background:     "none",
                    border:         "none",
                    padding:        "0",
                    fontSize:       "11px",
                    fontWeight:     600,
                    color:          disablingShare ? "#aaa" : "#dc2626",
                    cursor:         disablingShare ? "not-allowed" : "pointer",
                    fontFamily:     "inherit",
                    display:        "flex",
                    alignItems:     "center",
                    gap:            "4px",
                    textDecoration: "underline",
                    textDecorationStyle: "dotted",
                    textUnderlineOffset: "3px",
                  }}
                >
                  {disablingShare ? (
                    <>
                      <span style={{ display: "inline-block", width: "9px", height: "9px", border: "1.5px solid #aaa", borderTopColor: "#dc2626", borderRadius: "50%", animation: "lc-spin 0.7s linear infinite" }} />
                      Disabling…
                    </>
                  ) : (
                    <>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                      Disable sharing
                    </>
                  )}
                </button>
              </div>
            ) : null}
            {saveError && (
              <p style={{ fontSize: "11px", color: "#dc2626", margin: 0 }}>⚠️ {saveError}</p>
            )}
          </div>
          <ActionButtons onDownload={handleDownload} onCopy={handleCopy} copied={copied} downloading={downloading} sharing={sharing} />
          {lawType && (
            <Link
              href={`/solicitors?area=${encodeURIComponent(lawType)}`}
              style={{ display: "inline-flex", alignItems: "center", gap: "7px", marginTop: "10px", padding: "9px 18px", borderRadius: "8px", border: "1px solid #d4cfc9", background: "#fff", color: "#0f6e56", fontSize: "13px", fontWeight: 600, textDecoration: "none" }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              Find a solicitor to send this pack to
            </Link>
          )}
        </div>

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
            <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.7)", display: "flex", alignItems: "center", gap: "6px" }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
              {packDate ? `Generated ${packDate}` : "LegalClear UK"}
            </span>
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
              ⚠️ Urgent actions required before your appointment
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
          📋 This document is for informational purposes only. Bring it to your first solicitor appointment. Do not rely on it as legal advice.
        </div>

        {/* ── SECTIONS ── */}

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
                      ? <span style={{ fontSize: "12px", fontWeight: 700, color: "#0f6e56", lineHeight: 1.4, display: "inline-block" }}>{event.date}</span>
                      : <span style={{ fontSize: "12px", color: "#bbb" }}>—</span>}
                  </div>
                  <div style={{ flexShrink: 0, width: "20px", display: "flex", justifyContent: "center", paddingTop: "4px" }}>
                    <div style={{ width: "12px", height: "12px", borderRadius: "50%", backgroundColor: "#0f6e56", border: "3px solid #f8f7f3", boxShadow: "0 0 0 2px #0f6e56", flexShrink: 0 }} />
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

        {/* 5 — Questions for Solicitor */}
        {pack.questionsForSolicitor && pack.questionsForSolicitor.length > 0 && (
          <Section label="Questions to Ask Your Solicitor" icon="❓">
            <p className="no-print" style={{ fontSize: "13px", color: "#888", marginBottom: "14px", marginTop: "-4px" }}>
              Tick each question as you cover it during your appointment.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {pack.questionsForSolicitor.map((q, i) => {
                const checked = checkedQs.has(i);
                return (
                  <div key={i} onClick={() => toggleQ(i)} style={{ display: "flex", gap: "14px", alignItems: "flex-start", padding: "14px 18px", backgroundColor: checked ? "#f0faf6" : "#fff", borderRadius: "10px", border: `1px solid ${checked ? "#0f6e56" : "#e5e0d8"}`, cursor: "pointer", transition: "all 0.15s" }}>
                    <div style={{ flexShrink: 0, width: "20px", height: "20px", borderRadius: "5px", border: `2px solid ${checked ? "#0f6e56" : "#d1d5db"}`, backgroundColor: checked ? "#0f6e56" : "#fff", display: "flex", alignItems: "center", justifyContent: "center", marginTop: "2px", transition: "all 0.15s" }}>
                      {checked && <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><polyline points="2 6 5 9 10 3" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                    </div>
                    <span style={{ fontSize: "14px", lineHeight: 1.65, color: checked ? "#555" : "#333", textDecoration: checked ? "line-through" : "none", transition: "all 0.15s" }}>{q}</span>
                  </div>
                );
              })}
            </div>
          </Section>
        )}

        {/* 6 — Documents to Gather */}
        {pack.documentsToGather && pack.documentsToGather.length > 0 && (
          <Section label="Documents to Bring" icon="📁">
            <p className="no-print" style={{ fontSize: "13px", color: "#888", marginBottom: "14px", marginTop: "-4px" }}>
              Tick each item as you collect it before your appointment.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              {pack.documentsToGather.map((doc, i) => {
                const checked = checkedDocs.has(i);
                return (
                  <div key={i} onClick={() => toggleDoc(i)} style={{ display: "flex", gap: "12px", alignItems: "center", padding: "12px 14px", backgroundColor: checked ? "#f0faf6" : "#fff", borderRadius: "10px", border: `1px solid ${checked ? "#0f6e56" : "#e5e0d8"}`, cursor: "pointer", transition: "all 0.15s" }}>
                    <div style={{ flexShrink: 0, width: "18px", height: "18px", borderRadius: "4px", border: `2px solid ${checked ? "#0f6e56" : "#d1d5db"}`, backgroundColor: checked ? "#0f6e56" : "#fff", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s" }}>
                      {checked && <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><polyline points="2 6 5 9 10 3" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                    </div>
                    <span style={{ fontSize: "13px", color: checked ? "#555" : "#333", lineHeight: 1.4, textDecoration: checked ? "line-through" : "none", transition: "all 0.15s" }}>{doc}</span>
                  </div>
                );
              })}
            </div>
          </Section>
        )}

        {/* 7 — Urgent Actions (full section) */}
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

        {/* Bottom action buttons */}
        <div className="no-print" style={{ marginTop: "48px", paddingTop: "32px", borderTop: "1px solid #e5e0d8", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
          <p style={{ fontSize: "12px", color: "#aaa", margin: 0 }}>
            Generated by LegalClear UK · For informational purposes only · Not legal advice
          </p>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "8px" }}>
            <ActionButtons onDownload={handleDownload} onCopy={handleCopy} copied={copied} downloading={downloading} sharing={sharing} />
            {lawType && (
              <Link
                href={`/solicitors?area=${encodeURIComponent(lawType)}`}
                style={{ display: "inline-flex", alignItems: "center", gap: "7px", padding: "9px 18px", borderRadius: "8px", border: "1px solid #d4cfc9", background: "#fff", color: "#0f6e56", fontSize: "13px", fontWeight: 600, textDecoration: "none" }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                Find a solicitor to send this pack to
              </Link>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
