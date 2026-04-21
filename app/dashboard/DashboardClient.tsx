"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type UrgencyLevel = "high" | "medium" | "low";

interface CaseSummary {
  id: string;
  created_at: string;
  law_type: string;
  urgency_level: UrgencyLevel;
  summary_title: string;
  input_text: string;
}

interface FullCase extends CaseSummary {
  full_result: {
    lawType: string;
    urgencyLevel: UrgencyLevel;
    urgencyReason: string;
    summaryTitle: string;
    explanation: string;
    rights: string[];
    steps: { title: string; detail: string }[];
    letter: string;
  };
}

interface Props {
  initialCases: CaseSummary[];
  userName: string;
}

const urgencyConfig: Record<UrgencyLevel, { bg: string; color: string; border: string; label: string }> = {
  high: { bg: "#fef2f2", color: "#dc2626", border: "#fecaca", label: "High" },
  medium: { bg: "#fffbeb", color: "#d97706", border: "#fde68a", label: "Medium" },
  low: { bg: "#f0fdf4", color: "#16a34a", border: "#bbf7d0", label: "Low" },
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

export default function DashboardClient({ initialCases, userName }: Props) {
  const router = useRouter();
  const [cases, setCases] = useState<CaseSummary[]>(initialCases);
  const [selectedCase, setSelectedCase] = useState<FullCase | null>(null);
  const [loadingCase, setLoadingCase] = useState<string | null>(null);
  const [deletingCase, setDeletingCase] = useState<string | null>(null);
  const [resultTab, setResultTab] = useState<"summary" | "steps" | "letter">("summary");
  const [copied, setCopied] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [caseFeedback, setCaseFeedback] = useState<Record<string, "up" | "down">>({});

  async function handleOpenCase(id: string) {
    setLoadingCase(id);
    try {
      const res = await fetch(`/api/cases/${id}`);
      const data = await res.json();
      if (res.ok) {
        setSelectedCase(data);
        setResultTab("summary");
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

      <main className="lc-dashboard-layout" style={{ maxWidth: "1100px", margin: "0 auto", padding: "48px 32px 80px", display: "flex", gap: "32px" }}>
        {/* Left: case list */}
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
                const isActive = selectedCase?.id === c.id;
                const isLoading = loadingCase === c.id;
                const isDeleting = deletingCase === c.id;
                return (
                  <div
                    key={c.id}
                    onClick={() => !isLoading && handleOpenCase(c.id)}
                    style={{
                      backgroundColor: isActive ? "#e8f4f0" : "#fff",
                      borderRadius: "12px",
                      border: `1px solid ${isActive ? "#0f6e56" : "#e5e0d8"}`,
                      padding: "16px 18px",
                      cursor: "pointer",
                      transition: "all 0.15s",
                      position: "relative",
                      opacity: isDeleting ? 0.5 : 1,
                    }}
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

        {/* Right: case detail */}
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

              {/* Tabs */}
              <div style={{ display: "flex", borderRadius: "12px 12px 0 0", overflow: "hidden", border: "1px solid #e5e0d8", borderBottom: "none" }}>
                {(["summary", "steps", "letter"] as const).map((tab) => {
                  const labels = { summary: "Summary & Rights", steps: "What To Do", letter: "Response Letter" };
                  return (
                    <button key={tab} onClick={() => setResultTab(tab)} style={{ flex: 1, padding: "13px 16px", fontSize: "13px", fontWeight: 600, cursor: "pointer", border: "none", borderBottom: resultTab === tab ? "3px solid #0f6e56" : "3px solid transparent", backgroundColor: resultTab === tab ? "#fff" : "#f8f7f3", color: resultTab === tab ? "#0f6e56" : "#666", transition: "all 0.15s", fontFamily: "inherit" }}>
                      {labels[tab]}
                    </button>
                  );
                })}
              </div>

              <div style={{ backgroundColor: "#fff", border: "1px solid #e5e0d8", borderTop: "none", borderRadius: "0 0 16px 16px", padding: "32px 36px", boxShadow: "0 2px 16px rgba(0,0,0,0.06)" }}>
                {resultTab === "summary" && (
                  <div>
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

                {resultTab === "steps" && (
                  <div>
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

                {resultTab === "letter" && (
                  <div>
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
              </div>

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
                    <button
                      onClick={() => setCaseFeedback((prev) => ({ ...prev, [selectedCase.id]: "up" }))}
                      style={{ padding: "7px 16px", borderRadius: "8px", border: "1px solid #e5e0d8", backgroundColor: "#fff", cursor: "pointer", fontSize: "14px", fontFamily: "inherit", display: "flex", alignItems: "center", gap: "5px", transition: "all 0.15s" }}
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#e8f4f0"; e.currentTarget.style.borderColor = "#0f6e56"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#fff"; e.currentTarget.style.borderColor = "#e5e0d8"; }}
                    >
                      👍 <span style={{ fontSize: "12px", fontWeight: 600, color: "#333" }}>Helpful</span>
                    </button>
                    <button
                      onClick={() => setCaseFeedback((prev) => ({ ...prev, [selectedCase.id]: "down" }))}
                      style={{ padding: "7px 16px", borderRadius: "8px", border: "1px solid #e5e0d8", backgroundColor: "#fff", cursor: "pointer", fontSize: "14px", fontFamily: "inherit", display: "flex", alignItems: "center", gap: "5px", transition: "all 0.15s" }}
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#fef2f2"; e.currentTarget.style.borderColor = "#fecaca"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#fff"; e.currentTarget.style.borderColor = "#e5e0d8"; }}
                    >
                      👎 <span style={{ fontSize: "12px", fontWeight: 600, color: "#333" }}>Not helpful</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
