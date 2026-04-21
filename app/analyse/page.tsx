"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

const EXAMPLE_CHIPS = [
  "My landlord hasn't fixed the heating for 3 weeks",
  "I received a Section 21 notice to leave",
  "My employer hasn't paid me for 2 months",
  "I got a county court judgment (CCJ) in the post",
  "A debt collector is threatening to visit my home",
  "My employer fired me without any warning",
];

const JURISDICTIONS = [
  "England and Wales",
  "Scotland",
  "Northern Ireland",
];

const RESOURCE_LINKS = [
  { label: "Citizens Advice", href: "https://www.citizensadvice.org.uk" },
  { label: "Shelter", href: "https://www.shelter.org.uk" },
  { label: "ACAS", href: "https://www.acas.org.uk" },
  { label: "MoneyHelper", href: "https://www.moneyhelper.org.uk" },
  { label: "Law Society", href: "https://www.lawsociety.org.uk" },
];

type UrgencyLevel = "high" | "medium" | "low";

interface AnalysisResult {
  lawType: string;
  urgencyLevel: UrgencyLevel;
  urgencyReason: string;
  summaryTitle: string;
  explanation: string;
  rights: string[];
  steps: { title: string; detail: string }[];
  letter: string;
}

function LoadingDots() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          style={{
            width: "10px",
            height: "10px",
            borderRadius: "50%",
            backgroundColor: "#0f6e56",
            display: "inline-block",
            animation: "bounce 1.2s infinite ease-in-out",
            animationDelay: `${i * 0.2}s`,
          }}
        />
      ))}
      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
          40% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

function UrgencyBadge({ level }: { level: UrgencyLevel }) {
  const config = {
    high: { bg: "#fef2f2", color: "#dc2626", border: "#fecaca", label: "High Urgency" },
    medium: { bg: "#fffbeb", color: "#d97706", border: "#fde68a", label: "Medium Urgency" },
    low: { bg: "#f0fdf4", color: "#16a34a", border: "#bbf7d0", label: "Low Urgency" },
  };
  const c = config[level];
  return (
    <span
      style={{
        display: "inline-block",
        padding: "4px 12px",
        borderRadius: "20px",
        fontSize: "13px",
        fontWeight: 600,
        backgroundColor: c.bg,
        color: c.color,
        border: `1px solid ${c.border}`,
      }}
    >
      {c.label}
    </span>
  );
}

export default function AnalysePage() {
  const [inputTab, setInputTab] = useState<"describe" | "upload">("describe");
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [jurisdiction, setJurisdiction] = useState("England and Wales");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [resultTab, setResultTab] = useState<"summary" | "steps" | "letter">("summary");
  const [copied, setCopied] = useState(false);
  const [user, setUser] = useState<{ id: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<"up" | "down" | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Check auth state on mount
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, []);

  async function handleSubmit() {
    setError(null);
    setResult(null);

    if (inputTab === "describe" && !text.trim()) {
      setError("Please describe your situation or click an example above.");
      return;
    }
    if (inputTab === "upload" && !file) {
      setError("Please upload a file to continue.");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("jurisdiction", jurisdiction);
      if (inputTab === "describe") {
        formData.append("text", text.trim());
      } else if (file) {
        formData.append("file", file);
      }

      const res = await fetch("/api/analyse", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok || data.error) {
        setError(data.error || "Something went wrong. Please try again.");
        return;
      }

      setResult(data);
      setResultTab("summary");
      setSaved(false);
      setSaveError(null);
      setFeedback(null);
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleChipClick(chip: string) {
    setInputTab("describe");
    setText(chip);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    setFile(f);
    setError(null);
  }

  async function handleSave() {
    if (!result) return;
    setSaving(true);
    setSaveError(null);
    try {
      const res = await fetch("/api/cases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          law_type: result.lawType,
          urgency_level: result.urgencyLevel,
          summary_title: result.summaryTitle,
          input_text: inputTab === "describe" ? text.trim() : file?.name ?? "",
          full_result: result,
        }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setSaveError(data.error || "Could not save. Please try again.");
      } else {
        setSaved(true);
      }
    } catch {
      setSaveError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleCopy() {
    if (!result?.letter) return;
    await navigator.clipboard.writeText(result.letter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f8f7f3", fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif" }}>
      {/* Navbar */}
      <nav
        className="lc-nav"
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          backgroundColor: "rgba(248,247,243,0.96)",
          backdropFilter: "blur(10px)",
          borderBottom: "1px solid #e5e0d8",
          padding: "0 48px",
          height: "64px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
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
          {user && (
            <Link href="/dashboard" style={{ color: "#0f6e56", textDecoration: "none", fontSize: "14px", fontWeight: 600 }}>
              My Cases
            </Link>
          )}
          {!user && (
            <Link href="/login" style={{ color: "#555", textDecoration: "none", fontSize: "14px", fontWeight: 500 }}>
              Sign in
            </Link>
          )}
          <Link
            href="/"
            style={{ color: "#555", textDecoration: "none", fontSize: "14px", fontWeight: 500 }}
          >
            ← Home
          </Link>
        </div>
      </nav>

      {/* Page content */}
      <main className="lc-page-content" style={{ maxWidth: "860px", margin: "0 auto", padding: "56px 24px 80px" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "48px" }}>
          <h1
            style={{
              fontFamily: "var(--font-playfair), 'Playfair Display', serif",
              fontSize: "42px",
              fontWeight: 700,
              color: "#1c1c1c",
              lineHeight: 1.2,
              marginBottom: "16px",
            }}
          >
            Understand Your Legal Situation
          </h1>
          <p style={{ fontSize: "18px", color: "#555", maxWidth: "560px", margin: "0 auto", lineHeight: 1.6 }}>
            Describe what happened or upload a legal notice. We&apos;ll explain your rights and next steps in plain English.
          </p>
        </div>

        {/* Input Card */}
        <div
          className="lc-card"
          style={{
            backgroundColor: "#fff",
            borderRadius: "16px",
            border: "1px solid #e5e0d8",
            padding: "36px 40px",
            boxShadow: "0 2px 16px rgba(0,0,0,0.06)",
            marginBottom: "40px",
          }}
        >
          {/* Input Tabs */}
          <div style={{ display: "flex", gap: "0", marginBottom: "28px", borderRadius: "10px", overflow: "hidden", border: "1px solid #e5e0d8", width: "fit-content" }}>
            {(["describe", "upload"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => { setInputTab(tab); setError(null); }}
                style={{
                  padding: "10px 28px",
                  fontSize: "14px",
                  fontWeight: 600,
                  cursor: "pointer",
                  border: "none",
                  backgroundColor: inputTab === tab ? "#0f6e56" : "#fff",
                  color: inputTab === tab ? "#fff" : "#666",
                  transition: "all 0.15s",
                  fontFamily: "inherit",
                }}
              >
                {tab === "describe" ? "✏️  Describe it" : "📄  Upload notice"}
              </button>
            ))}
          </div>

          {/* Example chips (only on describe tab) */}
          {inputTab === "describe" && (
            <div style={{ marginBottom: "20px" }}>
              <p style={{ fontSize: "13px", color: "#888", marginBottom: "10px", fontWeight: 500 }}>Try an example:</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {EXAMPLE_CHIPS.map((chip) => (
                  <button
                    key={chip}
                    onClick={() => handleChipClick(chip)}
                    style={{
                      padding: "7px 14px",
                      borderRadius: "20px",
                      border: "1px solid #c8e6dd",
                      backgroundColor: text === chip ? "#0f6e56" : "#e8f4f0",
                      color: text === chip ? "#fff" : "#0f6e56",
                      fontSize: "13px",
                      fontWeight: 500,
                      cursor: "pointer",
                      fontFamily: "inherit",
                      transition: "all 0.15s",
                    }}
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Describe textarea */}
          {inputTab === "describe" && (
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="e.g. I received a letter from my landlord saying I need to leave within 2 months. I've lived here for 3 years and always paid rent on time..."
              rows={5}
              style={{
                width: "100%",
                padding: "14px 16px",
                borderRadius: "10px",
                border: "1px solid #ddd",
                fontSize: "15px",
                lineHeight: 1.6,
                color: "#1c1c1c",
                backgroundColor: "#fafafa",
                fontFamily: "inherit",
                resize: "vertical",
                outline: "none",
                transition: "border-color 0.15s",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#0f6e56")}
              onBlur={(e) => (e.target.style.borderColor = "#ddd")}
            />
          )}

          {/* Upload area */}
          {inputTab === "upload" && (
            <div
              onClick={() => fileInputRef.current?.click()}
              style={{
                border: `2px dashed ${file ? "#0f6e56" : "#ccc"}`,
                borderRadius: "12px",
                padding: "40px 24px",
                textAlign: "center",
                cursor: "pointer",
                backgroundColor: file ? "#e8f4f0" : "#fafafa",
                transition: "all 0.15s",
              }}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.txt"
                onChange={handleFileChange}
                style={{ display: "none" }}
              />
              {file ? (
                <>
                  <div style={{ fontSize: "32px", marginBottom: "8px" }}>✅</div>
                  <p style={{ fontWeight: 600, color: "#0f6e56", marginBottom: "4px" }}>{file.name}</p>
                  <p style={{ fontSize: "13px", color: "#888" }}>{(file.size / 1024).toFixed(1)} KB — click to change</p>
                </>
              ) : (
                <>
                  <div style={{ fontSize: "40px", marginBottom: "12px" }}>📎</div>
                  <p style={{ fontWeight: 600, color: "#444", marginBottom: "6px" }}>Click to upload your document</p>
                  <p style={{ fontSize: "13px", color: "#888" }}>Supports PDF, JPG, PNG, TXT — up to 10 MB</p>
                </>
              )}
            </div>
          )}

          {/* Jurisdiction + Submit row */}
          <div style={{ display: "flex", alignItems: "center", gap: "16px", marginTop: "20px" }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: "13px", fontWeight: 600, color: "#666", display: "block", marginBottom: "6px" }}>
                Jurisdiction
              </label>
              <select
                value={jurisdiction}
                onChange={(e) => setJurisdiction(e.target.value)}
                style={{
                  width: "100%",
                  padding: "11px 14px",
                  borderRadius: "8px",
                  border: "1px solid #ddd",
                  fontSize: "14px",
                  color: "#1c1c1c",
                  backgroundColor: "#fff",
                  fontFamily: "inherit",
                  cursor: "pointer",
                  outline: "none",
                }}
              >
                {JURISDICTIONS.map((j) => (
                  <option key={j} value={j}>{j}</option>
                ))}
              </select>
            </div>

            <div style={{ paddingTop: "22px" }}>
              <button
                onClick={handleSubmit}
                disabled={loading}
                style={{
                  padding: "12px 36px",
                  borderRadius: "10px",
                  border: "none",
                  backgroundColor: loading ? "#a0c4b8" : "#0f6e56",
                  color: "#fff",
                  fontSize: "15px",
                  fontWeight: 700,
                  cursor: loading ? "not-allowed" : "pointer",
                  fontFamily: "inherit",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  whiteSpace: "nowrap",
                  transition: "background-color 0.15s",
                }}
              >
                {loading ? (
                  <>
                    Analysing <LoadingDots />
                  </>
                ) : (
                  "Analyse →"
                )}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div
              style={{
                marginTop: "16px",
                padding: "12px 16px",
                borderRadius: "8px",
                backgroundColor: "#fef2f2",
                border: "1px solid #fecaca",
                color: "#dc2626",
                fontSize: "14px",
              }}
            >
              ⚠️ {error}
            </div>
          )}
        </div>

        {/* Results */}
        {result && (
          <div ref={resultsRef}>
            {/* Result tabs */}
            <div className="lc-tabs" style={{ display: "flex", gap: "0", marginBottom: "0", borderRadius: "12px 12px 0 0", overflow: "hidden", border: "1px solid #e5e0d8", borderBottom: "none" }}>
              {(["summary", "steps", "letter"] as const).map((tab) => {
                const labels = { summary: "Summary & Rights", steps: "What To Do", letter: "Response Letter" };
                return (
                  <button
                    key={tab}
                    onClick={() => setResultTab(tab)}
                    style={{
                      flex: 1,
                      padding: "14px 20px",
                      fontSize: "14px",
                      fontWeight: 600,
                      cursor: "pointer",
                      border: "none",
                      borderBottom: resultTab === tab ? "3px solid #0f6e56" : "3px solid transparent",
                      backgroundColor: resultTab === tab ? "#fff" : "#f8f7f3",
                      color: resultTab === tab ? "#0f6e56" : "#666",
                      transition: "all 0.15s",
                      fontFamily: "inherit",
                    }}
                  >
                    {labels[tab]}
                  </button>
                );
              })}
            </div>

            {/* Tab content */}
            <div
              className="lc-result-content"
              style={{
                backgroundColor: "#fff",
                border: "1px solid #e5e0d8",
                borderTop: "none",
                borderRadius: "0 0 16px 16px",
                padding: "36px 40px",
                boxShadow: "0 2px 16px rgba(0,0,0,0.06)",
              }}
            >
              {/* Summary & Rights */}
              {resultTab === "summary" && (
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px", flexWrap: "wrap" }}>
                    <span
                      style={{
                        display: "inline-block",
                        padding: "4px 14px",
                        borderRadius: "20px",
                        fontSize: "13px",
                        fontWeight: 600,
                        backgroundColor: "#e8f4f0",
                        color: "#0f6e56",
                        border: "1px solid #c8e6dd",
                      }}
                    >
                      {result.lawType}
                    </span>
                    <UrgencyBadge level={result.urgencyLevel} />
                  </div>

                  {result.urgencyReason && (
                    <p style={{ fontSize: "14px", color: "#666", marginBottom: "20px", fontStyle: "italic" }}>
                      {result.urgencyReason}
                    </p>
                  )}

                  <h2
                    style={{
                      fontFamily: "var(--font-playfair), 'Playfair Display', serif",
                      fontSize: "26px",
                      fontWeight: 700,
                      color: "#1c1c1c",
                      marginBottom: "20px",
                      lineHeight: 1.3,
                    }}
                  >
                    {result.summaryTitle}
                  </h2>

                  <div style={{ marginBottom: "28px" }}>
                    {result.explanation.split("\n\n").filter(Boolean).map((para, i) => (
                      <p key={i} style={{ fontSize: "15px", lineHeight: 1.75, color: "#333", marginBottom: "14px" }}>
                        {para}
                      </p>
                    ))}
                  </div>

                  {result.rights.length > 0 && (
                    <div>
                      <h3
                        style={{
                          fontFamily: "var(--font-playfair), 'Playfair Display', serif",
                          fontSize: "18px",
                          fontWeight: 700,
                          color: "#1c1c1c",
                          marginBottom: "14px",
                        }}
                      >
                        Your Rights
                      </h3>
                      <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
                        {result.rights.map((right, i) => (
                          <li key={i} style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                            <span
                              style={{
                                flexShrink: 0,
                                width: "22px",
                                height: "22px",
                                borderRadius: "50%",
                                backgroundColor: "#e8f4f0",
                                color: "#0f6e56",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "13px",
                                fontWeight: 700,
                                marginTop: "1px",
                              }}
                            >
                              ✓
                            </span>
                            <span style={{ fontSize: "15px", lineHeight: 1.6, color: "#333" }}>{right}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* What To Do */}
              {resultTab === "steps" && (
                <div>
                  <h2
                    style={{
                      fontFamily: "var(--font-playfair), 'Playfair Display', serif",
                      fontSize: "24px",
                      fontWeight: 700,
                      color: "#1c1c1c",
                      marginBottom: "28px",
                    }}
                  >
                    Steps to Take
                  </h2>
                  <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                    {result.steps.map((step, i) => (
                      <div key={i} style={{ display: "flex", gap: "20px", alignItems: "flex-start" }}>
                        <div
                          style={{
                            flexShrink: 0,
                            width: "36px",
                            height: "36px",
                            borderRadius: "50%",
                            backgroundColor: "#0f6e56",
                            color: "#fff",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "15px",
                            fontWeight: 700,
                          }}
                        >
                          {i + 1}
                        </div>
                        <div style={{ flex: 1 }}>
                          <h4 style={{ fontSize: "16px", fontWeight: 700, color: "#1c1c1c", marginBottom: "6px" }}>
                            {step.title}
                          </h4>
                          <p style={{ fontSize: "14px", lineHeight: 1.7, color: "#555" }}>{step.detail}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Response Letter */}
              {resultTab === "letter" && (
                <div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
                    <h2
                      style={{
                        fontFamily: "var(--font-playfair), 'Playfair Display', serif",
                        fontSize: "24px",
                        fontWeight: 700,
                        color: "#1c1c1c",
                      }}
                    >
                      Draft Response Letter
                    </h2>
                    <button
                      onClick={handleCopy}
                      style={{
                        padding: "9px 20px",
                        borderRadius: "8px",
                        border: "1px solid #0f6e56",
                        backgroundColor: copied ? "#0f6e56" : "#fff",
                        color: copied ? "#fff" : "#0f6e56",
                        fontSize: "13px",
                        fontWeight: 600,
                        cursor: "pointer",
                        fontFamily: "inherit",
                        transition: "all 0.2s",
                      }}
                    >
                      {copied ? "✓ Copied!" : "Copy to clipboard"}
                    </button>
                  </div>
                  <p style={{ fontSize: "13px", color: "#888", marginBottom: "16px" }}>
                    Review and personalise this letter before sending. Fill in any [brackets] with your own details.
                  </p>
                  <pre
                    style={{
                      backgroundColor: "#f8f7f3",
                      border: "1px solid #e5e0d8",
                      borderRadius: "10px",
                      padding: "24px",
                      fontSize: "14px",
                      lineHeight: 1.8,
                      color: "#333",
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-word",
                      fontFamily: "'Georgia', serif",
                    }}
                  >
                    {result.letter}
                  </pre>
                </div>
              )}
            </div>

            {/* Save button — only for logged-in users */}
            {user && (
              <div style={{ marginTop: "20px", display: "flex", alignItems: "center", gap: "12px" }}>
                <button
                  onClick={handleSave}
                  disabled={saving || saved}
                  style={{
                    padding: "11px 28px",
                    borderRadius: "10px",
                    border: "none",
                    backgroundColor: saved ? "#e8f4f0" : saving ? "#a0c4b8" : "#0f6e56",
                    color: saved ? "#0f6e56" : "#fff",
                    fontSize: "14px",
                    fontWeight: 700,
                    cursor: saving || saved ? "default" : "pointer",
                    fontFamily: "inherit",
                    transition: "all 0.2s",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  {saved ? "✓ Saved to your account" : saving ? "Saving…" : "💾  Save this analysis"}
                </button>
                {saved && (
                  <Link href="/dashboard" style={{ fontSize: "13px", color: "#0f6e56", fontWeight: 600, textDecoration: "none" }}>
                    View in dashboard →
                  </Link>
                )}
                {saveError && (
                  <span style={{ fontSize: "13px", color: "#dc2626" }}>⚠️ {saveError}</span>
                )}
              </div>
            )}

            {/* Disclaimer */}
            <div
              style={{
                marginTop: "24px",
                padding: "16px 20px",
                borderRadius: "10px",
                backgroundColor: "#fffbeb",
                border: "1px solid #fde68a",
                fontSize: "13px",
                color: "#92400e",
                lineHeight: 1.6,
              }}
            >
              <strong>⚠️ Important:</strong> This information is for general guidance only and does not constitute legal advice. LegalClear UK is not a law firm and cannot represent you. For regulated legal advice specific to your situation, please consult a qualified solicitor.
            </div>

            {/* Feedback */}
            <div
              style={{
                marginTop: "16px",
                padding: "16px 20px",
                borderRadius: "10px",
                backgroundColor: "#fff",
                border: "1px solid #e5e0d8",
                display: "flex",
                alignItems: "center",
                gap: "14px",
                flexWrap: "wrap",
              }}
            >
              {feedback ? (
                <p style={{ fontSize: "14px", color: "#0f6e56", fontWeight: 600, margin: 0 }}>
                  {feedback === "up"
                    ? "🙏 Thank you! Glad this was helpful."
                    : "🙏 Thanks for the feedback — we'll keep improving."}
                </p>
              ) : (
                <>
                  <p style={{ fontSize: "14px", color: "#555", fontWeight: 500, margin: 0 }}>
                    Was this analysis helpful?
                  </p>
                  <button
                    onClick={() => setFeedback("up")}
                    style={{
                      padding: "8px 18px",
                      borderRadius: "8px",
                      border: "1px solid #e5e0d8",
                      backgroundColor: "#fff",
                      cursor: "pointer",
                      fontSize: "15px",
                      fontFamily: "inherit",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      transition: "all 0.15s",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#e8f4f0"; e.currentTarget.style.borderColor = "#0f6e56"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#fff"; e.currentTarget.style.borderColor = "#e5e0d8"; }}
                  >
                    👍 <span style={{ fontSize: "13px", fontWeight: 600, color: "#333" }}>Helpful</span>
                  </button>
                  <button
                    onClick={() => setFeedback("down")}
                    style={{
                      padding: "8px 18px",
                      borderRadius: "8px",
                      border: "1px solid #e5e0d8",
                      backgroundColor: "#fff",
                      cursor: "pointer",
                      fontSize: "15px",
                      fontFamily: "inherit",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      transition: "all 0.15s",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#fef2f2"; e.currentTarget.style.borderColor = "#fecaca"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#fff"; e.currentTarget.style.borderColor = "#e5e0d8"; }}
                  >
                    👎 <span style={{ fontSize: "13px", fontWeight: 600, color: "#333" }}>Not helpful</span>
                  </button>
                </>
              )}
            </div>

            {/* Resource links */}
            <div style={{ marginTop: "28px" }}>
              <p style={{ fontSize: "13px", fontWeight: 600, color: "#888", marginBottom: "12px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Free UK Resources
              </p>
              <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                {RESOURCE_LINKS.map((r) => (
                  <a
                    key={r.label}
                    href={r.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      padding: "8px 18px",
                      borderRadius: "8px",
                      border: "1px solid #e5e0d8",
                      backgroundColor: "#fff",
                      color: "#0f6e56",
                      fontSize: "13px",
                      fontWeight: 600,
                      textDecoration: "none",
                      transition: "border-color 0.15s",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#0f6e56")}
                    onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#e5e0d8")}
                  >
                    {r.label} ↗
                  </a>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer
        style={{
          borderTop: "1px solid #e5e0d8",
          padding: "24px 48px",
          textAlign: "center",
          fontSize: "13px",
          color: "#999",
        }}
      >
        © {new Date().getFullYear()} LegalClear UK · Not a law firm · For informational purposes only
      </footer>
    </div>
  );
}
