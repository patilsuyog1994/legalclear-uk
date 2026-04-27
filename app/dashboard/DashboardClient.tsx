"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { buildPDF, type PackData } from "@/lib/buildPDF";

/* ─── Types ──────────────────────────────────────────────────── */
type UrgencyLevel = "high" | "medium" | "low";

interface DashChatMessage {
  id:        string;
  role:      "user" | "ai";
  text:      string;
  timestamp: string;
}

interface CaseSummary {
  id:                string;
  created_at:        string;
  law_type:          string;
  urgency_level:     UrgencyLevel;
  summary_title:     string;
  input_text:        string;
  pack_generated_at: string | null;
  share_token:       string | null;
}

interface FullCase extends CaseSummary {
  full_result: {
    lawType:       string;
    urgencyLevel:  UrgencyLevel;
    urgencyReason: string;
    summaryTitle:  string;
    explanation:   string;
    rights:        string[];
    steps:         { title: string; detail: string }[];
    letter:        string;
  };
  chat_history?: DashChatMessage[] | null;
}

interface Props {
  initialCases: CaseSummary[];
  userName:     string;
}

/* ─── Helpers ────────────────────────────────────────────────── */
const urgencyConfig: Record<UrgencyLevel, { bg: string; color: string; border: string; label: string }> = {
  high:   { bg: "#fef2f2", color: "#dc2626", border: "#fecaca", label: "High" },
  medium: { bg: "#fffbeb", color: "#d97706", border: "#fde68a", label: "Medium" },
  low:    { bg: "#f0fdf4", color: "#16a34a", border: "#bbf7d0", label: "Low" },
};

function UrgencyBadge({ level }: { level: UrgencyLevel }) {
  const c = urgencyConfig[level] ?? urgencyConfig.low;
  return (
    <span style={{ display: "inline-block", padding: "3px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: 600, backgroundColor: c.bg, color: c.color, border: `1px solid ${c.border}` }}>
      {c.label}
    </span>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

function LoadingDots() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
      {[0, 1, 2].map((i) => (
        <span key={i} style={{ width: "7px", height: "7px", borderRadius: "50%", backgroundColor: "#0f6e56", display: "inline-block", animation: "dbounce 1.2s infinite ease-in-out", animationDelay: `${i * 0.2}s` }} />
      ))}
      <style>{`@keyframes dbounce { 0%,80%,100%{transform:scale(0.6);opacity:0.4} 40%{transform:scale(1);opacity:1} }`}</style>
    </div>
  );
}

function ShieldIcon({ size = 13 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <path d="M20 8L28 13V20C28 25.5 24 30.2 20 32C16 30.2 12 25.5 12 20V13L20 8Z" fill="white" fillOpacity="0.9" />
      <path d="M17 20L19 22L23 18" stroke="#0f6e56" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ─── Component ──────────────────────────────────────────────── */
export default function DashboardClient({ initialCases, userName }: Props) {
  const router = useRouter();

  /* Top-level tab */
  const [dashTab, setDashTab] = useState<"cases" | "packs">("cases");

  /* Case list state */
  const [cases, setCases]               = useState<CaseSummary[]>(initialCases);
  const [selectedCase, setSelectedCase] = useState<FullCase | null>(null);
  const [loadingCase, setLoadingCase]   = useState<string | null>(null);
  const [deletingCase, setDeletingCase] = useState<string | null>(null);
  const [loggingOut, setLoggingOut]     = useState(false);
  const [caseFeedback, setCaseFeedback] = useState<Record<string, "up" | "down">>({});
  const [downloadingPackId, setDownloadingPackId] = useState<string | null>(null);

  /* Result tab (now includes "chat") */
  const [resultTab, setResultTab] = useState<"summary" | "steps" | "letter" | "chat">("summary");
  const [copied, setCopied]       = useState(false);

  /* Chat state */
  const [dashChat, setDashChat]               = useState<DashChatMessage[]>([]);
  const [dashChatInput, setDashChatInput]     = useState("");
  const [dashChatSending, setDashChatSending] = useState(false);
  const [dashSaveStatus, setDashSaveStatus]   = useState<"idle" | "saving" | "saved" | "error">("idle");

  const messagesEndRef = useRef<HTMLDivElement>(null);

  /* Auto-scroll chat */
  useEffect(() => {
    if (resultTab === "chat") {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [dashChat, dashChatSending, resultTab]);

  /* ── Case handlers ── */
  async function handleOpenCase(id: string) {
    setLoadingCase(id);
    try {
      const res  = await fetch(`/api/cases/${id}`);
      const data = await res.json();
      if (res.ok) {
        setSelectedCase(data);
        setResultTab("summary");
        /* Restore chat history */
        setDashChat(Array.isArray(data.chat_history) && data.chat_history.length > 0
          ? data.chat_history
          : []);
        setDashChatInput("");
        setDashSaveStatus("idle");
      }
    } finally {
      setLoadingCase(null);
    }
  }

  async function handleDelete(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    if (!confirm("Delete this case? This cannot be undone.")) return;
    setDeletingCase(id);
    try {
      await fetch(`/api/cases/${id}`, { method: "DELETE" });
      setCases((prev) => prev.filter((c) => c.id !== id));
      if (selectedCase?.id === id) setSelectedCase(null);
    } finally {
      setDeletingCase(null);
    }
  }

  async function handleLogout() {
    setLoggingOut(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  async function handleCopy() {
    if (!selectedCase?.full_result?.letter) return;
    await navigator.clipboard.writeText(selectedCase.full_result.letter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  /* ── Dashboard chat auto-save ── */
  async function autoSaveDashChat(messages: DashChatMessage[]) {
    if (!selectedCase) return;
    setDashSaveStatus("saving");
    try {
      const res = await fetch(`/api/cases/${selectedCase.id}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ chat_history: messages }),
      });
      setDashSaveStatus(res.ok ? "saved" : "error");
    } catch {
      setDashSaveStatus("error");
    } finally {
      setTimeout(() => setDashSaveStatus("idle"), 3000);
    }
  }

  /* ── Dashboard chat send ── */
  async function handleDashChatSend() {
    const trimmed = dashChatInput.trim();
    if (!trimmed || dashChatSending || !selectedCase) return;

    const userMsg: DashChatMessage = {
      id:        Date.now().toString(),
      role:      "user",
      text:      trimmed,
      timestamp: formatTime(new Date()),
    };
    const updatedHistory = [...dashChat, userMsg];
    setDashChat(updatedHistory);
    setDashChatInput("");
    setDashChatSending(true);

    try {
      const res  = await fetch("/api/chat", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          messages:      updatedHistory,
          context:       selectedCase.full_result,
          originalInput: selectedCase.input_text || "saved case",
        }),
      });
      const data = await res.json();
      const aiMsg: DashChatMessage = {
        id:        (Date.now() + 1).toString(),
        role:      "ai",
        text:      res.ok && data.reply ? data.reply : (data.error ?? "Sorry, something went wrong."),
        timestamp: formatTime(new Date()),
      };
      const finalMessages = [...updatedHistory, aiMsg];
      setDashChat(finalMessages);
      if (res.ok) autoSaveDashChat(finalMessages);
    } catch {
      setDashChat((prev) => [
        ...prev,
        { id: (Date.now() + 1).toString(), role: "ai", text: "Network error — please try again.", timestamp: formatTime(new Date()) },
      ]);
    } finally {
      setDashChatSending(false);
    }
  }

  function handleDashChatKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleDashChatSend();
    }
  }

  async function handleDashClearChat() {
    if (!selectedCase) return;
    const confirmed = window.confirm(
      "Are you sure? This will delete your chat history for this case."
    );
    if (!confirmed) return;

    setDashChat([]);

    /* Wipe saved history in Supabase */
    try {
      await fetch(`/api/cases/${selectedCase.id}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ chat_history: [] }),
      });
    } catch {
      /* best-effort */
    }
  }

  /* ── Download PDF from My Packs tab ── */
  async function handleDownloadPackFromDash(c: CaseSummary, e: React.MouseEvent) {
    e.stopPropagation();
    if (downloadingPackId) return;
    setDownloadingPackId(c.id);
    try {
      const res  = await fetch(`/api/cases/${c.id}`);
      const data = await res.json();
      if (!res.ok || !data.solicitor_pack) throw new Error("Pack data not available.");
      const dateStr = c.pack_generated_at
        ? new Date(c.pack_generated_at).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })
        : new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
      await buildPDF(data.solicitor_pack as PackData, c.summary_title, dateStr);
    } catch (err) {
      console.error("PDF download error:", err);
      alert("Could not download PDF. Please try again.");
    } finally {
      setDownloadingPackId(null);
    }
  }

  /* ══════════════════════════════════════════════════════════
     RENDER
  ══════════════════════════════════════════════════════════ */
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f8f7f3", fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif" }}>

      {/* Navbar */}
      <nav className="lc-nav" style={{ position: "sticky", top: 0, zIndex: 50, backgroundColor: "rgba(248,247,243,0.96)", backdropFilter: "blur(10px)", borderBottom: "1px solid #e5e0d8", padding: "0 48px", height: "64px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "10px" }}>
          <svg width="32" height="32" viewBox="0 0 40 40" fill="none">
            <rect width="40" height="40" rx="8" fill="#0f6e56" />
            <path d="M20 8L28 13V20C28 25.5 24 30.2 20 32C16 30.2 12 25.5 12 20V13L20 8Z" fill="white" fillOpacity="0.9" />
            <path d="M17 20L19 22L23 18" stroke="#0f6e56" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span style={{ fontFamily: "var(--font-playfair), 'Playfair Display', serif", fontSize: "20px", fontWeight: 700, color: "#1c1c1c" }}>
            LegalClear <span style={{ color: "#0f6e56" }}>UK</span>
          </span>
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <Link href="/analyse" style={{ padding: "9px 20px", borderRadius: "8px", backgroundColor: "#0f6e56", color: "#fff", fontSize: "14px", fontWeight: 600, textDecoration: "none" }}>
            + New Analysis
          </Link>
          <button onClick={handleLogout} disabled={loggingOut} style={{ padding: "9px 20px", borderRadius: "8px", border: "1px solid #ddd", backgroundColor: "#fff", color: "#555", fontSize: "14px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
            {loggingOut ? "Signing out…" : "Sign out"}
          </button>
        </div>
      </nav>

      {/* ── Top-level tab bar ── */}
      <div style={{ borderBottom: "1px solid #e5e0d8", backgroundColor: "rgba(248,247,243,0.96)" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 32px", display: "flex", gap: "2px" }}>
          {(["cases", "packs"] as const).map((tab) => {
            const packsCount = cases.filter((c) => c.pack_generated_at).length;
            const labels: Record<typeof tab, string> = {
              cases: "My Cases",
              packs: `My Packs${packsCount > 0 ? ` (${packsCount})` : ""}`,
            };
            const isActive = dashTab === tab;
            return (
              <button
                key={tab}
                onClick={() => { setDashTab(tab); if (tab === "cases") setSelectedCase(null); }}
                style={{
                  padding:         "14px 20px",
                  fontSize:        "14px",
                  fontWeight:      600,
                  cursor:          "pointer",
                  border:          "none",
                  borderBottom:    isActive ? "3px solid #0f6e56" : "3px solid transparent",
                  backgroundColor: "transparent",
                  color:           isActive ? "#0f6e56" : "#666",
                  fontFamily:      "inherit",
                  transition:      "all 0.15s",
                  display:         "flex",
                  alignItems:      "center",
                  gap:             "7px",
                }}
                onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.color = "#333"; }}
                onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.color = "#666"; }}
              >
                {tab === "cases" ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                  </svg>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
                  </svg>
                )}
                {labels[tab]}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── My Cases tab ── */}
      {dashTab === "cases" && (
      <main className="lc-dashboard-layout" style={{ maxWidth: "1100px", margin: "0 auto", padding: "48px 32px 80px", display: "flex", gap: "32px" }}>

        {/* ════ LEFT — case list ════ */}
        <div className="lc-sidebar" style={{ width: "380px", flexShrink: 0 }}>
          <div style={{ marginBottom: "28px" }}>
            <h1 style={{ fontFamily: "var(--font-playfair), 'Playfair Display', serif", fontSize: "28px", fontWeight: 700, color: "#1c1c1c", marginBottom: "4px" }}>
              Hello, {userName} 👋
            </h1>
            <p style={{ fontSize: "14px", color: "#888" }}>
              {cases.length === 0 ? "No saved cases yet." : `${cases.length} saved case${cases.length === 1 ? "" : "s"}`}
            </p>
          </div>

          {cases.length === 0 ? (
            <div style={{ backgroundColor: "#fff", borderRadius: "14px", border: "1px solid #e5e0d8", padding: "40px 24px", textAlign: "center" }}>
              <div style={{ fontSize: "40px", marginBottom: "12px" }}>📂</div>
              <p style={{ fontWeight: 600, color: "#444", marginBottom: "8px" }}>No cases saved yet</p>
              <p style={{ fontSize: "13px", color: "#888", marginBottom: "20px" }}>Run an analysis and hit &quot;Save this analysis&quot; to store it here.</p>
              <Link href="/analyse" style={{ padding: "10px 24px", borderRadius: "8px", backgroundColor: "#0f6e56", color: "#fff", fontSize: "14px", fontWeight: 600, textDecoration: "none" }}>
                Start analysing →
              </Link>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {cases.map((c) => {
                const isActive   = selectedCase?.id === c.id;
                const isLoading  = loadingCase === c.id;
                const isDeleting = deletingCase === c.id;
                return (
                  <div
                    key={c.id}
                    onClick={() => !isLoading && handleOpenCase(c.id)}
                    style={{ backgroundColor: isActive ? "#e8f4f0" : "#fff", borderRadius: "12px", border: `1px solid ${isActive ? "#0f6e56" : "#e5e0d8"}`, padding: "16px 18px", cursor: "pointer", transition: "all 0.15s", position: "relative", opacity: isDeleting ? 0.5 : 1 }}
                    onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.borderColor = "#a0c4b8"; }}
                    onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.borderColor = "#e5e0d8"; }}
                  >
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "8px" }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: "13px", color: "#888", marginBottom: "4px" }}>{formatDate(c.created_at)}</p>
                        <p style={{ fontSize: "14px", fontWeight: 600, color: "#1c1c1c", marginBottom: "8px", lineHeight: 1.4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {c.summary_title}
                        </p>
                        <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
                          <span style={{ fontSize: "12px", color: "#0f6e56", backgroundColor: "#e8f4f0", padding: "2px 9px", borderRadius: "12px", fontWeight: 600 }}>
                            {c.law_type}
                          </span>
                          <UrgencyBadge level={c.urgency_level} />
                        </div>
                      </div>
                      <button
                        onClick={(e) => handleDelete(c.id, e)}
                        disabled={isDeleting}
                        title="Delete case"
                        style={{ flexShrink: 0, width: "28px", height: "28px", borderRadius: "6px", border: "1px solid #f5c6c6", backgroundColor: "#fff5f5", color: "#dc2626", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontFamily: "inherit" }}
                      >
                        {isDeleting ? "…" : "✕"}
                      </button>
                    </div>

                    {/* Pack section */}
                    <div style={{ marginTop: "10px", paddingTop: "10px", borderTop: "1px solid #ede8e0" }}>
                      {c.pack_generated_at ? (
                        /* Pack ready — show badge + date + View pack button */
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "6px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <span style={{ display: "inline-flex", alignItems: "center", gap: "3px", fontSize: "11px", fontWeight: 700, color: "#0f6e56", backgroundColor: "#e8f4f0", padding: "2px 8px", borderRadius: "12px", border: "1px solid #c8e6dd" }}>
                              <svg width="9" height="9" viewBox="0 0 12 12" fill="none"><polyline points="2 6 5 9 10 3" stroke="#0f6e56" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                              Pack ready
                            </span>
                            <span style={{ fontSize: "11px", color: "#aaa" }}>
                              {new Date(c.pack_generated_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                            </span>
                          </div>
                          <button
                            onClick={(e) => { e.stopPropagation(); router.push(`/pack/${c.id}`); }}
                            style={{ background: "none", border: "none", padding: "0", color: "#0f6e56", fontSize: "12px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: "4px", transition: "color 0.15s" }}
                            onMouseEnter={(e) => { e.currentTarget.style.color = "#0a5242"; }}
                            onMouseLeave={(e) => { e.currentTarget.style.color = "#0f6e56"; }}
                          >
                            View pack →
                          </button>
                        </div>
                      ) : (
                        /* No pack yet — show generate link */
                        <button
                          onClick={(e) => { e.stopPropagation(); router.push(`/pack/${c.id}`); }}
                          style={{ background: "none", border: "none", padding: "0", color: "#0f6e56", fontSize: "12px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: "5px", transition: "color 0.15s", textDecoration: "none" }}
                          onMouseEnter={(e) => { e.currentTarget.style.color = "#0a5242"; }}
                          onMouseLeave={(e) => { e.currentTarget.style.color = "#0f6e56"; }}
                        >
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                            <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
                          </svg>
                          Generate solicitor pack
                        </button>
                      )}
                    </div>

                    {isLoading && (
                      <div style={{ position: "absolute", inset: 0, backgroundColor: "rgba(255,255,255,0.7)", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", color: "#0f6e56", fontWeight: 600 }}>
                        Loading…
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ════ RIGHT — case detail ════ */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {!selectedCase ? (
            <div style={{ backgroundColor: "#fff", borderRadius: "16px", border: "1px solid #e5e0d8", padding: "60px 40px", textAlign: "center", height: "400px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
              <div style={{ fontSize: "48px", marginBottom: "16px" }}>⚖️</div>
              <p style={{ fontWeight: 600, color: "#888", fontSize: "16px" }}>Select a case to view the full analysis</p>
            </div>
          ) : (
            <div>
              {/* Close button */}
              <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "12px" }}>
                <button onClick={() => setSelectedCase(null)} style={{ padding: "7px 16px", borderRadius: "8px", border: "1px solid #ddd", backgroundColor: "#fff", color: "#666", fontSize: "13px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                  ✕ Close
                </button>
              </div>

              {/* Tabs — now 4: summary / steps / letter / chat */}
              <div style={{ display: "flex", borderRadius: "12px 12px 0 0", overflow: "hidden", border: "1px solid #e5e0d8", borderBottom: "none" }}>
                {(["summary", "steps", "letter", "chat"] as const).map((tab) => {
                  const labels = {
                    summary: "Summary & Rights",
                    steps:   "What To Do",
                    letter:  "Response Letter",
                    chat:    `💬 Chat${dashChat.length > 0 ? ` (${dashChat.length})` : ""}`,
                  };
                  return (
                    <button
                      key={tab}
                      onClick={() => setResultTab(tab)}
                      style={{ flex: 1, padding: "13px 10px", fontSize: "12px", fontWeight: 600, cursor: "pointer", border: "none", borderBottom: resultTab === tab ? "3px solid #0f6e56" : "3px solid transparent", backgroundColor: resultTab === tab ? "#fff" : "#f8f7f3", color: resultTab === tab ? "#0f6e56" : "#666", transition: "all 0.15s", fontFamily: "inherit" }}
                    >
                      {labels[tab]}
                    </button>
                  );
                })}
              </div>

              {/* Tab content */}
              <div style={{ backgroundColor: "#fff", border: "1px solid #e5e0d8", borderTop: "none", borderRadius: "0 0 16px 16px", boxShadow: "0 2px 16px rgba(0,0,0,0.06)", overflow: "hidden" }}>

                {/* ── Summary ── */}
                {resultTab === "summary" && (
                  <div style={{ padding: "32px 36px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px", flexWrap: "wrap" }}>
                      <span style={{ display: "inline-block", padding: "4px 14px", borderRadius: "20px", fontSize: "13px", fontWeight: 600, backgroundColor: "#e8f4f0", color: "#0f6e56", border: "1px solid #c8e6dd" }}>
                        {selectedCase.full_result.lawType}
                      </span>
                      <UrgencyBadge level={selectedCase.full_result.urgencyLevel} />
                    </div>
                    {selectedCase.full_result.urgencyReason && (
                      <p style={{ fontSize: "14px", color: "#666", marginBottom: "16px", fontStyle: "italic" }}>{selectedCase.full_result.urgencyReason}</p>
                    )}
                    <h2 style={{ fontFamily: "var(--font-playfair), 'Playfair Display', serif", fontSize: "22px", fontWeight: 700, color: "#1c1c1c", marginBottom: "16px", lineHeight: 1.3 }}>
                      {selectedCase.full_result.summaryTitle}
                    </h2>
                    <div style={{ marginBottom: "24px" }}>
                      {selectedCase.full_result.explanation.split("\n\n").filter(Boolean).map((para, i) => (
                        <p key={i} style={{ fontSize: "14px", lineHeight: 1.75, color: "#333", marginBottom: "12px" }}>{para}</p>
                      ))}
                    </div>
                    {selectedCase.full_result.rights.length > 0 && (
                      <div>
                        <h3 style={{ fontFamily: "var(--font-playfair), 'Playfair Display', serif", fontSize: "17px", fontWeight: 700, color: "#1c1c1c", marginBottom: "12px" }}>Your Rights</h3>
                        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "8px" }}>
                          {selectedCase.full_result.rights.map((right, i) => (
                            <li key={i} style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                              <span style={{ flexShrink: 0, width: "20px", height: "20px", borderRadius: "50%", backgroundColor: "#e8f4f0", color: "#0f6e56", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: 700, marginTop: "2px" }}>✓</span>
                              <span style={{ fontSize: "14px", lineHeight: 1.6, color: "#333" }}>{right}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {/* ── Steps ── */}
                {resultTab === "steps" && (
                  <div style={{ padding: "32px 36px" }}>
                    <h2 style={{ fontFamily: "var(--font-playfair), 'Playfair Display', serif", fontSize: "22px", fontWeight: 700, color: "#1c1c1c", marginBottom: "24px" }}>Steps to Take</h2>
                    <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                      {selectedCase.full_result.steps.map((step, i) => (
                        <div key={i} style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}>
                          <div style={{ flexShrink: 0, width: "34px", height: "34px", borderRadius: "50%", backgroundColor: "#0f6e56", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: 700 }}>{i + 1}</div>
                          <div style={{ flex: 1 }}>
                            <h4 style={{ fontSize: "15px", fontWeight: 700, color: "#1c1c1c", marginBottom: "4px" }}>{step.title}</h4>
                            <p style={{ fontSize: "13px", lineHeight: 1.7, color: "#555" }}>{step.detail}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ── Letter ── */}
                {resultTab === "letter" && (
                  <div style={{ padding: "32px 36px" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
                      <h2 style={{ fontFamily: "var(--font-playfair), 'Playfair Display', serif", fontSize: "22px", fontWeight: 700, color: "#1c1c1c" }}>Draft Response Letter</h2>
                      <button onClick={handleCopy} style={{ padding: "8px 18px", borderRadius: "8px", border: "1px solid #0f6e56", backgroundColor: copied ? "#0f6e56" : "#fff", color: copied ? "#fff" : "#0f6e56", fontSize: "13px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s" }}>
                        {copied ? "✓ Copied!" : "Copy"}
                      </button>
                    </div>
                    <pre style={{ backgroundColor: "#f8f7f3", border: "1px solid #e5e0d8", borderRadius: "10px", padding: "20px", fontSize: "13px", lineHeight: 1.8, color: "#333", whiteSpace: "pre-wrap", wordBreak: "break-word", fontFamily: "'Georgia', serif" }}>
                      {selectedCase.full_result.letter}
                    </pre>
                  </div>
                )}

                {/* ── Chat tab ── */}
                {resultTab === "chat" && (
                  <div style={{ display: "flex", flexDirection: "column", height: "520px" }}>

                    {/* Chat header bar */}
                    <div style={{ backgroundColor: "#0f6e56", padding: "0 18px", height: "52px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <div style={{ width: "26px", height: "26px", borderRadius: "6px", backgroundColor: "rgba(255,255,255,0.18)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <ShieldIcon size={13} />
                        </div>
                        <div>
                          <p style={{ color: "#fff", fontWeight: 700, fontSize: "14px", margin: 0, fontFamily: "var(--font-playfair), 'Playfair Display', serif" }}>LegalClear AI</p>
                          <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "10px", margin: 0 }}>Ask follow-up questions</p>
                        </div>
                      </div>
                      {/* Save indicator + Clear */}
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        {dashSaveStatus === "saved" && (
                          <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.85)", display: "flex", alignItems: "center", gap: "4px" }}>
                            ✓ Conversation saved
                          </span>
                        )}
                        {dashSaveStatus === "saving" && (
                          <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.55)" }}>Saving…</span>
                        )}
                        {dashChat.length > 0 && (
                          <button
                            onClick={handleDashClearChat}
                            title="Clear conversation"
                            style={{ background: "none", border: "none", color: "rgba(255,255,255,0.65)", fontSize: "11px", fontWeight: 500, cursor: "pointer", fontFamily: "inherit", padding: "0", textDecoration: "underline", textUnderlineOffset: "2px", transition: "color 0.15s" }}
                            onMouseEnter={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.95)"; }}
                            onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.65)"; }}
                          >
                            Clear
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Messages area */}
                    <div style={{ flex: 1, overflowY: "auto", padding: "16px 14px", display: "flex", flexDirection: "column", gap: "12px", backgroundColor: "#f4f6f5" }}>

                      {dashChat.length === 0 && (
                        <div style={{ textAlign: "center", padding: "40px 20px" }}>
                          <div style={{ fontSize: "36px", marginBottom: "10px" }}>💬</div>
                          <p style={{ fontSize: "14px", fontWeight: 600, color: "#555", marginBottom: "6px" }}>No conversation yet</p>
                          <p style={{ fontSize: "13px", color: "#888", lineHeight: 1.5 }}>
                            Ask a follow-up question about this case below.
                          </p>
                        </div>
                      )}

                      {dashChat.map((msg) => {
                        const isAI = msg.role === "ai";
                        return (
                          <div key={msg.id} style={{ display: "flex", justifyContent: isAI ? "flex-start" : "flex-end", alignItems: "flex-end", gap: "7px" }}>
                            {isAI && (
                              <div style={{ width: "24px", height: "24px", borderRadius: "50%", backgroundColor: "#0f6e56", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginBottom: "16px" }}>
                                <ShieldIcon size={11} />
                              </div>
                            )}
                            <div style={{ display: "flex", flexDirection: "column", alignItems: isAI ? "flex-start" : "flex-end", maxWidth: "82%" }}>
                              <div style={{ padding: "10px 13px", borderRadius: isAI ? "4px 14px 14px 14px" : "14px 4px 14px 14px", backgroundColor: isAI ? "#E1F5EE" : "#EAEAEA", color: "#1c1c1c", fontSize: "13px", lineHeight: 1.65, boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
                                {msg.text}
                              </div>
                              <span style={{ fontSize: "10px", color: "#9aab9a", marginTop: "3px", paddingLeft: isAI ? "2px" : 0, paddingRight: isAI ? 0 : "2px" }}>
                                {msg.timestamp}
                              </span>
                            </div>
                          </div>
                        );
                      })}

                      {dashChatSending && (
                        <div style={{ display: "flex", alignItems: "flex-end", gap: "7px" }}>
                          <div style={{ width: "24px", height: "24px", borderRadius: "50%", backgroundColor: "#0f6e56", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            <ShieldIcon size={11} />
                          </div>
                          <div style={{ padding: "11px 14px", borderRadius: "4px 14px 14px 14px", backgroundColor: "#E1F5EE", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
                            <LoadingDots />
                          </div>
                        </div>
                      )}

                      <div ref={messagesEndRef} />
                    </div>

                    {/* Input area */}
                    <div style={{ padding: "10px 12px", borderTop: "1px solid #e5e0d8", backgroundColor: "#fff", display: "flex", gap: "8px", alignItems: "flex-end", flexShrink: 0 }}>
                      <textarea
                        value={dashChatInput}
                        onChange={(e) => setDashChatInput(e.target.value)}
                        onKeyDown={handleDashChatKeyDown}
                        placeholder="Ask a follow-up question… (Enter to send)"
                        rows={1}
                        style={{ flex: 1, padding: "9px 12px", borderRadius: "8px", border: "1px solid #ddd", fontSize: "13px", fontFamily: "inherit", resize: "none", outline: "none", lineHeight: 1.5, maxHeight: "80px", overflowY: "auto", transition: "border-color 0.15s", color: "#1c1c1c", backgroundColor: "#fafafa" }}
                        onFocus={(e) => { e.target.style.borderColor = "#0f6e56"; }}
                        onBlur={(e)  => { e.target.style.borderColor = "#ddd"; }}
                      />
                      <button
                        onClick={handleDashChatSend}
                        disabled={!dashChatInput.trim() || dashChatSending}
                        style={{ width: "36px", height: "36px", borderRadius: "8px", border: "none", backgroundColor: dashChatInput.trim() && !dashChatSending ? "#0f6e56" : "#c8e6dd", color: "#fff", cursor: dashChatInput.trim() && !dashChatSending ? "pointer" : "not-allowed", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: "16px", transition: "background-color 0.15s" }}
                      >
                        ↑
                      </button>
                    </div>

                    {/* Legal disclaimer — always visible, never scrolls */}
                    <div style={{ padding: "7px 12px", backgroundColor: "#f8f7f3", borderTop: "1px solid #ede8e0", flexShrink: 0 }}>
                      <p style={{ fontSize: "10px", color: "#999", margin: 0, lineHeight: 1.5, textAlign: "center" }}>
                        LegalClear AI provides legal information only, not regulated legal advice. For serious matters always consult a qualified solicitor.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Disclaimer (not shown on chat tab) */}
              {resultTab !== "chat" && (
                <>
                  <div style={{ marginTop: "16px", padding: "14px 18px", borderRadius: "10px", backgroundColor: "#fffbeb", border: "1px solid #fde68a", fontSize: "12px", color: "#92400e" }}>
                    <strong>⚠️ Important:</strong> This is general information only, not legal advice. Consult a qualified solicitor for advice specific to your situation.
                  </div>

                  {/* Feedback */}
                  <div style={{ marginTop: "12px", padding: "14px 18px", borderRadius: "10px", backgroundColor: "#fff", border: "1px solid #e5e0d8", display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                    {caseFeedback[selectedCase.id] ? (
                      <p style={{ fontSize: "13px", color: "#0f6e56", fontWeight: 600, margin: 0 }}>
                        {caseFeedback[selectedCase.id] === "up"
                          ? "🙏 Thank you! Glad this was helpful."
                          : "🙏 Thanks for the feedback — we'll keep improving."}
                      </p>
                    ) : (
                      <>
                        <p style={{ fontSize: "13px", color: "#555", fontWeight: 500, margin: 0 }}>Was this analysis helpful?</p>
                        <button onClick={() => setCaseFeedback((prev) => ({ ...prev, [selectedCase.id]: "up" }))} style={{ padding: "7px 16px", borderRadius: "8px", border: "1px solid #e5e0d8", backgroundColor: "#fff", cursor: "pointer", fontSize: "14px", fontFamily: "inherit", display: "flex", alignItems: "center", gap: "5px", transition: "all 0.15s" }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#e8f4f0"; e.currentTarget.style.borderColor = "#0f6e56"; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#fff"; e.currentTarget.style.borderColor = "#e5e0d8"; }}>
                          👍 <span style={{ fontSize: "12px", fontWeight: 600, color: "#333" }}>Helpful</span>
                        </button>
                        <button onClick={() => setCaseFeedback((prev) => ({ ...prev, [selectedCase.id]: "down" }))} style={{ padding: "7px 16px", borderRadius: "8px", border: "1px solid #e5e0d8", backgroundColor: "#fff", cursor: "pointer", fontSize: "14px", fontFamily: "inherit", display: "flex", alignItems: "center", gap: "5px", transition: "all 0.15s" }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#fef2f2"; e.currentTarget.style.borderColor = "#fecaca"; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#fff"; e.currentTarget.style.borderColor = "#e5e0d8"; }}>
                          👎 <span style={{ fontSize: "12px", fontWeight: 600, color: "#333" }}>Not helpful</span>
                        </button>
                      </>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </main>
      )} {/* end dashTab === "cases" */}

      {/* ── My Packs tab ── */}
      {dashTab === "packs" && (
        <main style={{ maxWidth: "1100px", margin: "0 auto", padding: "48px 32px 80px" }}>
          <div style={{ marginBottom: "32px" }}>
            <h1 style={{ fontFamily: "var(--font-playfair), 'Playfair Display', serif", fontSize: "28px", fontWeight: 700, color: "#1c1c1c", marginBottom: "4px" }}>
              My Packs
            </h1>
            <p style={{ fontSize: "14px", color: "#888" }}>
              {cases.filter((c) => c.pack_generated_at).length === 0
                ? "No packs generated yet. Open a case and click 'Generate solicitor pack'."
                : `${cases.filter((c) => c.pack_generated_at).length} solicitor pack${cases.filter((c) => c.pack_generated_at).length === 1 ? "" : "s"} ready`}
            </p>
          </div>

          {cases.filter((c) => c.pack_generated_at).length === 0 ? (
            <div style={{ backgroundColor: "#fff", borderRadius: "16px", border: "1px solid #e5e0d8", padding: "60px 40px", textAlign: "center" }}>
              <div style={{ fontSize: "48px", marginBottom: "16px" }}>📋</div>
              <p style={{ fontWeight: 600, color: "#444", marginBottom: "8px" }}>No packs yet</p>
              <p style={{ fontSize: "13px", color: "#888", marginBottom: "20px" }}>Go to My Cases, open a case, and click &quot;Generate solicitor pack&quot; to create your first pack.</p>
              <button
                onClick={() => setDashTab("cases")}
                style={{ padding: "10px 24px", borderRadius: "8px", backgroundColor: "#0f6e56", color: "#fff", fontSize: "14px", fontWeight: 600, border: "none", cursor: "pointer", fontFamily: "inherit" }}
              >
                Go to My Cases →
              </button>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "16px" }}>
              {cases.filter((c) => c.pack_generated_at).map((c) => {
                const isDownloading = downloadingPackId === c.id;
                return (
                  <div
                    key={c.id}
                    style={{ backgroundColor: "#fff", borderRadius: "14px", border: "1px solid #e5e0d8", padding: "22px 24px", display: "flex", flexDirection: "column", gap: "14px", boxShadow: "0 1px 8px rgba(0,0,0,0.04)" }}
                  >
                    {/* Header row */}
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "10px" }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: "13px", fontWeight: 700, color: "#1c1c1c", lineHeight: 1.4, margin: "0 0 6px", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                          {c.summary_title}
                        </p>
                        <div style={{ display: "flex", gap: "7px", alignItems: "center", flexWrap: "wrap" }}>
                          <span style={{ fontSize: "11px", color: "#0f6e56", backgroundColor: "#e8f4f0", padding: "2px 8px", borderRadius: "10px", fontWeight: 600 }}>
                            {c.law_type}
                          </span>
                          {/* Sharing status dot */}
                          <span title={c.share_token ? "Sharing enabled" : "Not shared"} style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "11px", color: c.share_token ? "#0f6e56" : "#aaa", fontWeight: 500 }}>
                            <span style={{ width: "7px", height: "7px", borderRadius: "50%", backgroundColor: c.share_token ? "#0f6e56" : "#d1d5db", display: "inline-block" }} />
                            {c.share_token ? "Shared" : "Private"}
                          </span>
                        </div>
                      </div>
                      {/* Pack ready badge */}
                      <span style={{ flexShrink: 0, display: "inline-flex", alignItems: "center", gap: "4px", padding: "3px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: 700, backgroundColor: "#e8f4f0", color: "#0f6e56", border: "1px solid #c8e6dd", whiteSpace: "nowrap" }}>
                        <svg width="9" height="9" viewBox="0 0 12 12" fill="none"><polyline points="2 6 5 9 10 3" stroke="#0f6e56" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        Pack ready
                      </span>
                    </div>

                    {/* Date */}
                    <p style={{ fontSize: "12px", color: "#888", margin: 0 }}>
                      Generated {new Date(c.pack_generated_at!).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
                    </p>

                    {/* Action buttons */}
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                      <button
                        onClick={(e) => { e.stopPropagation(); router.push(`/pack/${c.id}`); }}
                        style={{ flex: 1, padding: "9px 14px", borderRadius: "8px", border: "none", backgroundColor: "#0f6e56", color: "#fff", fontSize: "13px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", transition: "background-color 0.15s", minWidth: "90px" }}
                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#0a5242"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#0f6e56"; }}
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
                        </svg>
                        View
                      </button>
                      <button
                        onClick={(e) => handleDownloadPackFromDash(c, e)}
                        disabled={isDownloading}
                        style={{ flex: 1, padding: "9px 14px", borderRadius: "8px", border: "1px solid #0f6e56", backgroundColor: isDownloading ? "#f0faf6" : "#fff", color: isDownloading ? "#aaa" : "#0f6e56", fontSize: "13px", fontWeight: 600, cursor: isDownloading ? "not-allowed" : "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", transition: "all 0.15s", minWidth: "120px" }}
                        onMouseEnter={(e) => { if (!isDownloading) e.currentTarget.style.backgroundColor = "#f0faf6"; }}
                        onMouseLeave={(e) => { if (!isDownloading) e.currentTarget.style.backgroundColor = "#fff"; }}
                      >
                        {isDownloading ? (
                          <>
                            <span style={{ display: "inline-block", width: "12px", height: "12px", border: "2px solid #c3e0d8", borderTopColor: "#0f6e56", borderRadius: "50%", animation: "lc-spin 0.7s linear infinite" }} />
                            Downloading…
                          </>
                        ) : (
                          <>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="6 9 6 2 18 2 18 9" /><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" /><rect x="6" y="14" width="12" height="8" />
                            </svg>
                            Download PDF
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          <style>{`@keyframes lc-spin { to { transform: rotate(360deg); } }`}</style>
        </main>
      )} {/* end dashTab === "packs" */}

    </div>
  );
}
