"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

/* ─── Constants ──────────────────────────────────────────────── */
const DEFAULT_EXAMPLES = [
  "My landlord hasn't fixed the heating for 3 weeks",
  "I received a Section 21 notice to leave",
  "My employer hasn't paid me for 2 months",
  "I got a county court judgment (CCJ) in the post",
  "A debt collector is threatening to visit my home",
  "My employer fired me without any warning",
];

const AREA_EXAMPLES: Record<string, string[]> = {
  "Housing": [
    "I received a Section 21 notice to leave my flat",
    "My landlord hasn't fixed the heating for 3 weeks",
    "My landlord is withholding my deposit without reason",
    "My landlord entered my property without permission",
    "I've been locked out of my flat by my landlord",
    "I received an eviction notice but I'm on a fixed-term tenancy",
  ],
  "Employment": [
    "My employer fired me without any warning",
    "My employer hasn't paid me for 2 months",
    "I was made redundant without being given any notice",
    "My employer changed my contract without my agreement",
    "I'm being bullied at work and HR isn't helping",
    "I was passed over for promotion due to my age",
  ],
  "Debt & Bailiffs": [
    "I got a county court judgment (CCJ) in the post",
    "A debt collector is threatening to visit my home",
    "Bailiffs came to my door for a debt I don't recognise",
    "I received a statutory demand through the post",
    "A debt collector is calling me multiple times a day",
    "I have multiple debts and don't know what to pay first",
  ],
  "Consumer Rights": [
    "A retailer is refusing to refund a faulty product",
    "I paid for a service that was never delivered",
    "A company charged me twice for the same order",
    "I bought a second-hand car that had hidden faults",
    "An online seller won't honour their return policy",
    "I was scammed by a fake online shop",
  ],
  "Fines": [
    "I received a parking charge notice from a private company",
    "I got a council tax summons in the post",
    "I received a fixed penalty notice I disagree with",
    "I got a speeding fine but wasn't driving the car",
    "I received a demand from HMRC for unpaid tax",
    "A TV licensing letter is demanding payment",
  ],
  "Neighbour Disputes": [
    "My neighbour's tree is damaging my property",
    "My neighbour plays loud music every night",
    "My neighbour built a fence on my land",
    "My neighbour is blocking my right of way",
    "My neighbour's CCTV is pointing at my garden",
    "I received a noise complaint letter from my council",
  ],
  "Benefits & Council Tax": [
    "My Universal Credit payment has been reduced with no explanation",
    "My benefits have been stopped without explanation",
    "I received a council tax bill I can't afford",
    "I've been told I was overpaid benefits and must repay",
    "I want to appeal a PIP decision",
    "My housing benefit claim has been refused",
  ],
  "Small Claims": [
    "A builder did poor work and won't refund my deposit",
    "Someone owes me money and is refusing to pay",
    "I want to take a company to small claims court",
    "A tradesperson damaged my property during work",
    "A landlord owes me money after I moved out",
    "I won a small claims case but haven't been paid",
  ],
  "Family Law": [
    "My ex-partner won't let me see my children",
    "I want to understand my rights in a divorce",
    "I received a court order from my ex-partner",
    "My ex is taking me back to court over maintenance",
    "I need help understanding a child arrangements order",
    "I've been served with a non-molestation order",
  ],
  "Immigration": [
    "My visa application has been refused",
    "I received a letter from the Home Office about my status",
    "My leave to remain is running out soon",
    "My employer is questioning my right to work documents",
    "I was refused entry at the border",
    "I want to apply for settled status",
  ],
  "Business & Contracts": [
    "A client refuses to pay an invoice",
    "I signed a contract but want to get out of it",
    "A supplier didn't deliver what was agreed",
    "I received a cease and desist letter",
    "A customer is threatening legal action against my business",
    "My business partner wants to dissolve our partnership",
  ],
  "Criminal Rights": [
    "I was arrested and want to know my rights",
    "Police searched my home — was this legal?",
    "I received a caution and want to know its implications",
    "Police are investigating me but I haven't been charged",
    "I've been given a community order I don't understand",
    "I received a court summons for a criminal matter",
  ],
};

const JURISDICTIONS = ["England and Wales", "Scotland", "Northern Ireland"];

const RESOURCE_LINKS = [
  { label: "Citizens Advice", href: "https://www.citizensadvice.org.uk" },
  { label: "Shelter", href: "https://www.shelter.org.uk" },
  { label: "ACAS", href: "https://www.acas.org.uk" },
  { label: "MoneyHelper", href: "https://www.moneyhelper.org.uk" },
  { label: "Law Society", href: "https://www.lawsociety.org.uk" },
];

/* ─── Types ──────────────────────────────────────────────────── */
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

interface ChatMessage {
  id:        string;
  role:      "user" | "ai";
  text:      string;
  timestamp: string;  /* e.g. "14:35" */
}

/* ─── Helpers ────────────────────────────────────────────────── */
function formatTime(date: Date): string {
  return date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

/* ─── Suggested questions per law type ──────────────────────── */
const SUGGESTED_QUESTIONS: Record<string, string[]> = {
  Housing: [
    "What happens if I ignore this notice?",
    "Is this notice legally valid?",
    "What are my rights as a tenant?",
    "How long do I have to respond?",
  ],
  Employment: [
    "Can I challenge this decision?",
    "What is the process for unfair dismissal?",
    "Am I entitled to redundancy pay?",
    "What should I do before responding?",
  ],
  "Debt & Bailiffs": [
    "Do I have to pay this debt?",
    "What happens if I ignore this letter?",
    "Could this debt be statute barred?",
    "What are my rights with debt collectors?",
  ],
  "Consumer Rights": [
    "Can I get a full refund?",
    "What is the retailer legally required to do?",
    "How do I escalate this complaint?",
    "Can I take this to small claims court?",
  ],
};

const DEFAULT_QUESTIONS = [
  "What does this mean for me?",
  "What should I do first?",
  "What happens if I do nothing?",
  "Do I need a solicitor for this?",
];

function getSuggestedQuestions(lawType: string): string[] {
  /* Try exact match first, then partial match, then fall back to defaults */
  if (SUGGESTED_QUESTIONS[lawType]) return SUGGESTED_QUESTIONS[lawType];
  const key = Object.keys(SUGGESTED_QUESTIONS).find((k) =>
    lawType.toLowerCase().includes(k.toLowerCase()) ||
    k.toLowerCase().includes(lawType.toLowerCase())
  );
  return key ? SUGGESTED_QUESTIONS[key] : DEFAULT_QUESTIONS;
}

function buildWelcomeMessage(result: AnalysisResult): ChatMessage {
  const urgencyPart = result.urgencyReason
    ? ` I can see that ${result.urgencyReason.charAt(0).toLowerCase()}${result.urgencyReason.slice(1)}.`
    : "";
  return {
    id:        "welcome",
    role:      "ai",
    text:      `Hi! I've already read your situation regarding "${result.summaryTitle}". This involves ${result.lawType} law.${urgencyPart} Feel free to ask me anything about your results — I'm here to help you understand what this means and what your options are.`,
    timestamp: formatTime(new Date()),
  };
}

/* ─── Small components ───────────────────────────────────────── */
function LoadingDots() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          style={{
            width: "8px",
            height: "8px",
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
    high:   { bg: "#fef2f2", color: "#dc2626", border: "#fecaca", label: "High Urgency" },
    medium: { bg: "#fffbeb", color: "#d97706", border: "#fde68a", label: "Medium Urgency" },
    low:    { bg: "#f0fdf4", color: "#16a34a", border: "#bbf7d0", label: "Low Urgency" },
  };
  const c = config[level];
  return (
    <span style={{ display: "inline-block", padding: "4px 12px", borderRadius: "20px", fontSize: "13px", fontWeight: 600, backgroundColor: c.bg, color: c.color, border: `1px solid ${c.border}` }}>
      {c.label}
    </span>
  );
}

/* ─── Shield icon for chat avatar ───────────────────────────── */
function ShieldIcon({ size = 14, color = "white" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <path d="M20 8L28 13V20C28 25.5 24 30.2 20 32C16 30.2 12 25.5 12 20V13L20 8Z" fill={color} fillOpacity="0.9" />
      <path d="M17 20L19 22L23 18" stroke="#0f6e56" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ─── Main page component ────────────────────────────────────── */
export default function AnalysePage() {
  const router = useRouter();

  /* Analysis state */
  const [inputTab, setInputTab]     = useState<"describe" | "upload">("describe");
  const [text, setText]             = useState("");
  const [file, setFile]             = useState<File | null>(null);
  const [jurisdiction, setJurisdiction] = useState("England and Wales");
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState<string | null>(null);
  const [result, setResult]         = useState<AnalysisResult | null>(null);
  const [letterOpen, setLetterOpen] = useState(false);
  const [copied, setCopied]         = useState(false);
  const [user, setUser]             = useState<{ id: string } | null>(null);
  const [saving, setSaving]         = useState(false);
  const [saved, setSaved]           = useState(false);
  const [saveError, setSaveError]   = useState<string | null>(null);
  const [feedback, setFeedback]     = useState<"up" | "down" | null>(null);

  /* Chat state */
  const [chatOpen, setChatOpen]             = useState(false);
  const [chatMessages, setChatMessages]     = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput]           = useState("");
  const [chatSending, setChatSending]       = useState(false);
  const [isMobile, setIsMobile]             = useState(false);
  const [savedCaseId, setSavedCaseId]       = useState<string | null>(null);
  const [chatSaveStatus, setChatSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [bannerDismissed, setBannerDismissed] = useState(false);

  /* Refs */
  const fileInputRef  = useRef<HTMLInputElement>(null);
  const resultsRef    = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [activeArea, setActiveArea] = useState<string | null>(null);

  /* Auth check */
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, []);

  /* Read ?area= query param and pre-select area examples */
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const area = params.get("area");
    if (area && AREA_EXAMPLES[area]) setActiveArea(area);
  }, []);

  /* Mobile detection */
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  /* Auto-scroll chat to bottom */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, chatSending]);

  /* ── Handlers ── */
  async function handleSubmit() {
    setError(null);
    setResult(null);
    setChatOpen(false);
    setChatMessages([]);
    setSavedCaseId(null);
    setChatSaveStatus("idle");
    setBannerDismissed(false);

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
      if (inputTab === "describe") formData.append("text", text.trim());
      else if (file)               formData.append("file", file);

      const res  = await fetch("/api/analyse", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok || data.error) {
        setError(data.error || "Something went wrong. Please try again.");
        return;
      }

      setResult(data);
      setLetterOpen(false);
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
    setFile(e.target.files?.[0] ?? null);
    setError(null);
  }

  async function handleSave() {
    if (!result) return;
    setSaving(true);
    setSaveError(null);
    try {
      const res  = await fetch("/api/cases", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          law_type:      result.lawType,
          urgency_level: result.urgencyLevel,
          summary_title: result.summaryTitle,
          input_text:    inputTab === "describe" ? text.trim() : file?.name ?? "",
          full_result:   result,
        }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setSaveError(data.error || "Could not save. Please try again.");
      } else {
        setSaved(true);
        setSavedCaseId(data.id ?? null);  /* capture ID for chat auto-save */
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

  /* Auto-save chat after every AI reply (only when case is saved) */
  async function autoSaveChat(messages: ChatMessage[]) {
    if (!savedCaseId || !user) return;
    setChatSaveStatus("saving");
    try {
      const res = await fetch(`/api/cases/${savedCaseId}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ chat_history: messages }),
      });
      setChatSaveStatus(res.ok ? "saved" : "error");
    } catch {
      setChatSaveStatus("error");
    } finally {
      setTimeout(() => setChatSaveStatus("idle"), 3000);
    }
  }

  function handleOpenChat() {
    if (!result) return;
    setChatMessages([buildWelcomeMessage(result)]);
    setChatOpen(true);
  }

  function handleCloseChat() {
    setChatOpen(false);
  }

  async function handleClearChat() {
    if (!result) return;
    const confirmed = window.confirm(
      "Are you sure? This will delete your chat history for this case."
    );
    if (!confirmed) return;

    /* Reset to the welcome message */
    const welcome = buildWelcomeMessage(result);
    setChatMessages([welcome]);

    /* Also wipe the saved history in Supabase */
    if (savedCaseId && user) {
      try {
        await fetch(`/api/cases/${savedCaseId}`, {
          method:  "PATCH",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify({ chat_history: [] }),
        });
      } catch {
        /* best-effort — no UI feedback needed for clear */
      }
    }
  }

  async function handleSendMessage() {
    const trimmed = chatInput.trim();
    if (!trimmed || chatSending || !result) return;

    /* 1. Add user message immediately */
    const now     = new Date();
    const userMsg: ChatMessage = {
      id:        Date.now().toString(),
      role:      "user",
      text:      trimmed,
      timestamp: formatTime(now),
    };
    const updatedHistory = [...chatMessages, userMsg];
    setChatMessages(updatedHistory);
    setChatInput("");
    setChatSending(true);

    try {
      /* 2. Call /api/chat with full conversation history + context */
      const res = await fetch("/api/chat", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          messages:      updatedHistory,
          context:       result,
          originalInput: inputTab === "describe"
            ? text.trim()
            : file?.name ?? "uploaded document",
        }),
      });

      const data = await res.json();

      /* 3. Build AI reply message and update state */
      const aiMsg: ChatMessage = {
        id:        (Date.now() + 1).toString(),
        role:      "ai",
        text:      res.ok && data.reply
          ? data.reply
          : (data.error ?? "Sorry, something went wrong. Please try again."),
        timestamp: formatTime(new Date()),
      };
      const finalMessages = [...updatedHistory, aiMsg];
      setChatMessages(finalMessages);
      if (res.ok) autoSaveChat(finalMessages);

    } catch {
      const errMsg: ChatMessage = {
        id:        (Date.now() + 1).toString(),
        role:      "ai",
        text:      "Network error — please check your connection and try again.",
        timestamp: formatTime(new Date()),
      };
      setChatMessages((prev) => [...prev, errMsg]);
    } finally {
      setChatSending(false);
    }
  }

  function handleChatKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }

  /* Chip click: treat as if user typed the question and hit send */
  async function handleChipSend(question: string) {
    if (chatSending || !result) return;
    const now     = new Date();
    const userMsg: ChatMessage = {
      id:        Date.now().toString(),
      role:      "user",
      text:      question,
      timestamp: formatTime(now),
    };
    const updatedHistory = [...chatMessages, userMsg];
    setChatMessages(updatedHistory);
    setChatSending(true);

    try {
      const res = await fetch("/api/chat", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          messages:      updatedHistory,
          context:       result,
          originalInput: inputTab === "describe"
            ? text.trim()
            : file?.name ?? "uploaded document",
        }),
      });
      const data = await res.json();
      const aiMsg: ChatMessage = {
        id:        (Date.now() + 1).toString(),
        role:      "ai",
        text:      res.ok && data.reply ? data.reply : (data.error ?? "Sorry, something went wrong."),
        timestamp: formatTime(new Date()),
      };
      const finalMessages = [...updatedHistory, aiMsg];
      setChatMessages(finalMessages);
      if (res.ok) autoSaveChat(finalMessages);
    } catch {
      setChatMessages((prev) => [
        ...prev,
        {
          id:        (Date.now() + 1).toString(),
          role:      "ai" as const,
          text:      "Network error — please check your connection and try again.",
          timestamp: formatTime(new Date()),
        },
      ]);
    } finally {
      setChatSending(false);
    }
  }

  /* ── Chat panel (reused on desktop + mobile overlay) ── */
  const ChatPanel = (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", backgroundColor: "#fff" }}>

      {/* Header */}
      <div style={{ backgroundColor: "#0f6e56", padding: "0 20px", height: "60px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ width: "32px", height: "32px", borderRadius: "8px", backgroundColor: "rgba(255,255,255,0.18)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <ShieldIcon size={16} color="white" />
          </div>
          <div>
            <p style={{ color: "#fff", fontWeight: 700, fontSize: "15px", margin: 0, fontFamily: "var(--font-playfair), 'Playfair Display', serif" }}>LegalClear AI</p>
            <p style={{ color: "rgba(255,255,255,0.65)", fontSize: "11px", margin: 0 }}>Based on your analysis</p>
          </div>
        </div>
        {/* Save status + Clear + Close */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {chatSaveStatus === "saved" && (
            <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.85)", display: "flex", alignItems: "center", gap: "4px", animation: "fadeIn 0.3s ease" }}>
              <style>{`@keyframes fadeIn { from { opacity:0; transform:translateY(4px); } to { opacity:1; transform:translateY(0); } }`}</style>
              ✓ Conversation saved
            </span>
          )}
          {chatSaveStatus === "saving" && (
            <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.55)" }}>Saving…</span>
          )}
          {/* Clear conversation link */}
          <button
            onClick={handleClearChat}
            title="Clear conversation"
            style={{ background: "none", border: "none", color: "rgba(255,255,255,0.65)", fontSize: "12px", fontWeight: 500, cursor: "pointer", fontFamily: "inherit", padding: "0", textDecoration: "underline", textUnderlineOffset: "2px", transition: "color 0.15s" }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.95)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.65)"; }}
          >
            Clear
          </button>
          <button
            onClick={handleCloseChat}
            title={isMobile ? "Back to results" : "Close chat"}
            style={{ width: "34px", height: "34px", borderRadius: "8px", border: "none", backgroundColor: "rgba(255,255,255,0.15)", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", fontFamily: "inherit", transition: "background-color 0.15s" }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.28)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.15)"; }}
          >
            {isMobile ? "←" : "✕"}
          </button>
        </div>
      </div>

      {/* Messages area */}
      <div style={{ flex: 1, overflowY: "auto", padding: "20px 14px", display: "flex", flexDirection: "column", gap: "16px", backgroundColor: "#f4f6f5" }}>

        {chatMessages.map((msg) => {
          const isAI = msg.role === "ai";
          return (
            <div
              key={msg.id}
              style={{
                display:        "flex",
                justifyContent: isAI ? "flex-start" : "flex-end",
                alignItems:     "flex-end",
                gap:            "8px",
              }}
            >
              {/* AI avatar */}
              {isAI && (
                <div style={{ width: "28px", height: "28px", borderRadius: "50%", backgroundColor: "#0f6e56", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginBottom: "18px" }}>
                  <ShieldIcon size={13} color="white" />
                </div>
              )}

              {/* Bubble + timestamp column */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: isAI ? "flex-start" : "flex-end", maxWidth: "82%" }}>
                <div
                  style={{
                    padding:         "11px 14px",
                    borderRadius:    isAI ? "4px 16px 16px 16px" : "16px 4px 16px 16px",
                    backgroundColor: isAI ? "#E1F5EE" : "#EAEAEA",
                    color:           "#1c1c1c",
                    fontSize:        "14px",
                    lineHeight:      1.65,
                    boxShadow:       "0 1px 3px rgba(0,0,0,0.07)",
                  }}
                >
                  {msg.text}
                </div>
                {/* Timestamp */}
                <span style={{ fontSize: "11px", color: "#9aab9a", marginTop: "4px", paddingLeft: isAI ? "2px" : "0", paddingRight: isAI ? "0" : "2px" }}>
                  {msg.timestamp}
                </span>
              </div>
            </div>
          );
        })}

        {/* ── Unauthenticated save banner ──
            Shown after 3rd message for guests, once, dismissable ── */}
        {!user && chatMessages.length >= 4 && !bannerDismissed && (
          <div
            style={{
              margin:          "4px 0",
              padding:         "12px 14px",
              borderRadius:    "12px",
              backgroundColor: "#fff",
              border:          "1px solid #b2d8c8",
              display:         "flex",
              alignItems:      "flex-start",
              gap:             "10px",
              boxShadow:       "0 1px 4px rgba(0,0,0,0.06)",
            }}
          >
            <span style={{ fontSize: "18px", flexShrink: 0 }}>💾</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: "13px", color: "#1c1c1c", fontWeight: 600, margin: "0 0 4px" }}>
                Save this conversation
              </p>
              <p style={{ fontSize: "12px", color: "#555", margin: "0 0 8px", lineHeight: 1.5 }}>
                Create a free account to save this conversation and continue it later.
              </p>
              <Link
                href="/register"
                style={{ fontSize: "12px", fontWeight: 700, color: "#0f6e56", textDecoration: "none" }}
              >
                Create free account →
              </Link>
            </div>
            <button
              onClick={() => setBannerDismissed(true)}
              title="Dismiss"
              style={{ flexShrink: 0, width: "24px", height: "24px", borderRadius: "6px", border: "none", backgroundColor: "#f0f0f0", color: "#888", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontFamily: "inherit" }}
            >
              ✕
            </button>
          </div>
        )}

        {/* ── Suggested question chips ──
            Only shown when only the welcome message exists
            (user hasn't sent anything yet) ── */}
        {chatMessages.length === 1 && chatMessages[0].id === "welcome" && !chatSending && result && (
          <div style={{ paddingLeft: "36px" }}>
            <p style={{ fontSize: "12px", color: "#7a9a7a", fontWeight: 600, marginBottom: "10px", textTransform: "uppercase", letterSpacing: "0.04em" }}>
              Suggested questions
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {getSuggestedQuestions(result.lawType).map((q) => (
                <button
                  key={q}
                  onClick={() => handleChipSend(q)}
                  style={{
                    padding:         "9px 14px",
                    borderRadius:    "20px",
                    border:          "1px solid #b2d8c8",
                    backgroundColor: "#fff",
                    color:           "#0f6e56",
                    fontSize:        "13px",
                    fontWeight:      500,
                    cursor:          "pointer",
                    fontFamily:      "inherit",
                    textAlign:       "left",
                    lineHeight:      1.4,
                    transition:      "all 0.15s",
                    boxShadow:       "0 1px 3px rgba(0,0,0,0.05)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#E1F5EE";
                    e.currentTarget.style.borderColor     = "#0f6e56";
                    e.currentTarget.style.boxShadow       = "0 2px 6px rgba(15,110,86,0.15)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "#fff";
                    e.currentTarget.style.borderColor     = "#b2d8c8";
                    e.currentTarget.style.boxShadow       = "0 1px 3px rgba(0,0,0,0.05)";
                  }}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Typing indicator */}
        {chatSending && (
          <div style={{ display: "flex", alignItems: "flex-end", gap: "8px" }}>
            <div style={{ width: "28px", height: "28px", borderRadius: "50%", backgroundColor: "#0f6e56", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <ShieldIcon size={13} color="white" />
            </div>
            <div style={{ padding: "12px 16px", borderRadius: "4px 16px 16px 16px", backgroundColor: "#E1F5EE", boxShadow: "0 1px 3px rgba(0,0,0,0.07)" }}>
              <LoadingDots />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div style={{ padding: "12px 14px", borderTop: "1px solid #e5e0d8", backgroundColor: "#fff", display: "flex", gap: "10px", alignItems: "flex-end", flexShrink: 0 }}>
        <textarea
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          onKeyDown={handleChatKeyDown}
          placeholder="Ask a follow-up question… (Enter to send)"
          rows={1}
          style={{
            flex: 1,
            padding: "10px 14px",
            borderRadius: "10px",
            border: "1px solid #ddd",
            fontSize: "14px",
            fontFamily: "inherit",
            resize: "none",
            outline: "none",
            lineHeight: 1.5,
            maxHeight: "96px",
            overflowY: "auto",
            transition: "border-color 0.15s",
            color: "#1c1c1c",
            backgroundColor: "#fafafa",
          }}
          onFocus={(e)  => { e.target.style.borderColor = "#0f6e56"; }}
          onBlur={(e)   => { e.target.style.borderColor = "#ddd"; }}
        />
        <button
          onClick={handleSendMessage}
          disabled={!chatInput.trim() || chatSending}
          title="Send message"
          style={{
            width: "40px",
            height: "40px",
            borderRadius: "10px",
            border: "none",
            backgroundColor: chatInput.trim() && !chatSending ? "#0f6e56" : "#c8e6dd",
            color: "#fff",
            cursor: chatInput.trim() && !chatSending ? "pointer" : "not-allowed",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            transition: "background-color 0.15s",
            fontSize: "18px",
          }}
        >
          ↑
        </button>
      </div>

      {/* Legal disclaimer — always visible, never scrolls */}
      <div style={{ padding: "8px 14px", backgroundColor: "#f8f7f3", borderTop: "1px solid #ede8e0", flexShrink: 0 }}>
        <p style={{ fontSize: "11px", color: "#999", margin: 0, lineHeight: 1.5, textAlign: "center" }}>
          LegalClear AI provides legal information only, not regulated legal advice. For serious matters always consult a qualified solicitor.
        </p>
      </div>
    </div>
  );

  /* ── Determine layout mode ── */
  const desktopChatOpen = chatOpen && !isMobile;
  const mobileChatOpen  = chatOpen && isMobile;

  /* ══════════════════════════════════════════════════════════════
     RENDER
  ══════════════════════════════════════════════════════════════ */
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f8f7f3", fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif" }}>

      {/* ── Navbar ── */}
      <nav
        className="lc-nav"
        style={{ position: "sticky", top: 0, zIndex: 50, backgroundColor: "rgba(248,247,243,0.96)", backdropFilter: "blur(10px)", borderBottom: "1px solid #e5e0d8", padding: "0 48px", height: "64px", display: "flex", alignItems: "center", justifyContent: "space-between" }}
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
            <Link href="/dashboard" style={{ color: "#0f6e56", textDecoration: "none", fontSize: "14px", fontWeight: 600 }}>My Cases</Link>
          )}
          {!user && (
            <Link href="/login" style={{ color: "#555", textDecoration: "none", fontSize: "14px", fontWeight: 500 }}>Sign in</Link>
          )}
          <Link href="/" style={{ color: "#555", textDecoration: "none", fontSize: "14px", fontWeight: 500 }}>← Home</Link>
        </div>
      </nav>

      {/* ── Mobile chat overlay ── */}
      {mobileChatOpen && (
        <div style={{ position: "fixed", inset: 0, top: "64px", zIndex: 100, display: "flex", flexDirection: "column" }}>
          {ChatPanel}
        </div>
      )}

      {/* ── Two-column wrapper (desktop) / single column (mobile) ── */}
      <div style={{
        display: "flex",
        alignItems: "stretch",
        height: desktopChatOpen ? "calc(100vh - 64px)" : "auto",
        overflow: desktopChatOpen ? "hidden" : "visible",
      }}>

        {/* ════ LEFT COLUMN — main content ════ */}
        <div style={{
          flex: 1,
          minWidth: 0,
          overflowY:  desktopChatOpen ? "auto"    : "visible",
          borderRight: desktopChatOpen ? "1px solid #e5e0d8" : "none",
        }}>
          <main
            className="lc-page-content"
            style={{ maxWidth: "860px", margin: "0 auto", padding: "56px 24px 80px" }}
          >
            {/* Page header */}
            <div style={{ textAlign: "center", marginBottom: "48px" }}>
              <h1 style={{ fontFamily: "var(--font-playfair), 'Playfair Display', serif", fontSize: "42px", fontWeight: 700, color: "#1c1c1c", lineHeight: 1.2, marginBottom: "16px" }}>
                Understand Your Legal Situation
              </h1>
              <p style={{ fontSize: "18px", color: "#555", maxWidth: "560px", margin: "0 auto", lineHeight: 1.6 }}>
                Describe what happened or upload a legal notice. We&apos;ll explain your rights and next steps in plain English.
              </p>
            </div>

            {/* ── Input Card ── */}
            <div
              className="lc-card"
              style={{ backgroundColor: "#fff", borderRadius: "16px", border: "1px solid #e5e0d8", padding: "36px 40px", boxShadow: "0 2px 16px rgba(0,0,0,0.06)", marginBottom: "40px" }}
            >
              {/* Input tabs */}
              <div style={{ display: "flex", marginBottom: "28px", borderRadius: "10px", overflow: "hidden", border: "1px solid #e5e0d8", width: "fit-content" }}>
                {(["describe", "upload"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => { setInputTab(tab); setError(null); }}
                    style={{ padding: "10px 28px", fontSize: "14px", fontWeight: 600, cursor: "pointer", border: "none", backgroundColor: inputTab === tab ? "#0f6e56" : "#fff", color: inputTab === tab ? "#fff" : "#666", transition: "all 0.15s", fontFamily: "inherit" }}
                  >
                    {tab === "describe" ? "✏️  Describe it" : "📄  Upload notice"}
                  </button>
                ))}
              </div>

              {/* Example chips */}
              {inputTab === "describe" && (() => {
                const chips = activeArea ? AREA_EXAMPLES[activeArea] : DEFAULT_EXAMPLES;
                return (
                  <div style={{ marginBottom: "20px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px", flexWrap: "wrap" }}>
                      <p style={{ fontSize: "13px", color: "#888", fontWeight: 500, margin: 0 }}>Try an example:</p>
                      {activeArea && (
                        <span style={{ fontSize: "12px", fontWeight: 600, padding: "2px 10px", borderRadius: "20px", backgroundColor: "#e8f4f0", color: "#0f6e56" }}>
                          {activeArea}
                        </span>
                      )}
                      {activeArea && (
                        <button
                          onClick={() => setActiveArea(null)}
                          style={{ fontSize: "11px", color: "#aaa", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", padding: 0, textDecoration: "underline" }}
                        >
                          show all
                        </button>
                      )}
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                      {chips.map((chip) => (
                        <button
                          key={chip}
                          onClick={() => handleChipClick(chip)}
                          style={{ padding: "7px 14px", borderRadius: "20px", border: "1px solid #c8e6dd", backgroundColor: text === chip ? "#0f6e56" : "#e8f4f0", color: text === chip ? "#fff" : "#0f6e56", fontSize: "13px", fontWeight: 500, cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s" }}
                        >
                          {chip}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* Textarea */}
              {inputTab === "describe" && (
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="e.g. I received a letter from my landlord saying I need to leave within 2 months. I've lived here for 3 years and always paid rent on time..."
                  rows={5}
                  style={{ width: "100%", padding: "14px 16px", borderRadius: "10px", border: "1px solid #ddd", fontSize: "15px", lineHeight: 1.6, color: "#1c1c1c", backgroundColor: "#fafafa", fontFamily: "inherit", resize: "vertical", outline: "none", transition: "border-color 0.15s" }}
                  onFocus={(e) => (e.target.style.borderColor = "#0f6e56")}
                  onBlur={(e)  => (e.target.style.borderColor = "#ddd")}
                />
              )}

              {/* File upload */}
              {inputTab === "upload" && (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  style={{ border: `2px dashed ${file ? "#0f6e56" : "#ccc"}`, borderRadius: "12px", padding: "40px 24px", textAlign: "center", cursor: "pointer", backgroundColor: file ? "#e8f4f0" : "#fafafa", transition: "all 0.15s" }}
                >
                  <input ref={fileInputRef} type="file" accept=".pdf,.jpg,.jpeg,.png,.txt" onChange={handleFileChange} style={{ display: "none" }} />
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

              {/* Jurisdiction + Submit */}
              <div style={{ display: "flex", alignItems: "center", gap: "16px", marginTop: "20px" }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: "13px", fontWeight: 600, color: "#666", display: "block", marginBottom: "6px" }}>Jurisdiction</label>
                  <select
                    value={jurisdiction}
                    onChange={(e) => setJurisdiction(e.target.value)}
                    style={{ width: "100%", padding: "11px 14px", borderRadius: "8px", border: "1px solid #ddd", fontSize: "14px", color: "#1c1c1c", backgroundColor: "#fff", fontFamily: "inherit", cursor: "pointer", outline: "none" }}
                  >
                    {JURISDICTIONS.map((j) => <option key={j} value={j}>{j}</option>)}
                  </select>
                </div>
                <div style={{ paddingTop: "22px" }}>
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    style={{ padding: "12px 36px", borderRadius: "10px", border: "none", backgroundColor: loading ? "#a0c4b8" : "#0f6e56", color: "#fff", fontSize: "15px", fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: "10px", whiteSpace: "nowrap", transition: "background-color 0.15s" }}
                  >
                    {loading ? <><span>Analysing</span><LoadingDots /></> : "Analyse →"}
                  </button>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div style={{ marginTop: "16px", padding: "12px 16px", borderRadius: "8px", backgroundColor: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", fontSize: "14px" }}>
                  ⚠️ {error}
                </div>
              )}
            </div>

            {/* ── Results ── */}
            {result && (
              <div ref={resultsRef}>

                {/* ── Single-page results ── */}
                <div
                  className="lc-result-content"
                  style={{ backgroundColor: "#fff", border: "1px solid #e5e0d8", borderRadius: "16px", padding: "36px 40px", boxShadow: "0 2px 16px rgba(0,0,0,0.06)" }}
                >
                  {/* Badges */}
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px", flexWrap: "wrap" }}>
                    <span style={{ display: "inline-block", padding: "4px 14px", borderRadius: "20px", fontSize: "13px", fontWeight: 600, backgroundColor: "#e8f4f0", color: "#0f6e56", border: "1px solid #c8e6dd" }}>
                      {result.lawType}
                    </span>
                    <UrgencyBadge level={result.urgencyLevel} />
                  </div>

                  {result.urgencyReason && (
                    <p style={{ fontSize: "14px", color: "#666", marginBottom: "20px", fontStyle: "italic" }}>{result.urgencyReason}</p>
                  )}

                  {/* Title */}
                  <h2 style={{ fontFamily: "var(--font-playfair), 'Playfair Display', serif", fontSize: "26px", fontWeight: 700, color: "#1c1c1c", marginBottom: "20px", lineHeight: 1.3 }}>
                    {result.summaryTitle}
                  </h2>

                  {/* Explanation */}
                  <div style={{ marginBottom: "32px" }}>
                    {result.explanation.split("\n\n").filter(Boolean).map((para, i) => (
                      <p key={i} style={{ fontSize: "15px", lineHeight: 1.75, color: "#333", marginBottom: "14px" }}>{para}</p>
                    ))}
                  </div>

                  {/* Your Rights */}
                  {result.rights.length > 0 && (
                    <div style={{ marginBottom: "36px" }}>
                      <h3 style={{ fontFamily: "var(--font-playfair), 'Playfair Display', serif", fontSize: "20px", fontWeight: 700, color: "#1c1c1c", marginBottom: "16px" }}>
                        Your Rights
                      </h3>
                      <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
                        {result.rights.map((right, i) => (
                          <li key={i} style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                            <span style={{ flexShrink: 0, width: "22px", height: "22px", borderRadius: "50%", backgroundColor: "#e8f4f0", color: "#0f6e56", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: 700, marginTop: "1px" }}>✓</span>
                            <span style={{ fontSize: "15px", lineHeight: 1.6, color: "#333" }}>{right}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Divider */}
                  <div style={{ height: "1px", backgroundColor: "#f0ede6", margin: "0 0 36px" }} />

                  {/* What To Do */}
                  <div style={{ marginBottom: "36px" }}>
                    <h3 style={{ fontFamily: "var(--font-playfair), 'Playfair Display', serif", fontSize: "20px", fontWeight: 700, color: "#1c1c1c", marginBottom: "20px" }}>
                      What To Do
                    </h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                      {result.steps.map((step, i) => (
                        <div key={i} style={{ display: "flex", gap: "20px", alignItems: "flex-start" }}>
                          <div style={{ flexShrink: 0, width: "36px", height: "36px", borderRadius: "50%", backgroundColor: "#0f6e56", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "15px", fontWeight: 700 }}>{i + 1}</div>
                          <div style={{ flex: 1 }}>
                            <h4 style={{ fontSize: "16px", fontWeight: 700, color: "#1c1c1c", marginBottom: "6px" }}>{step.title}</h4>
                            <p style={{ fontSize: "14px", lineHeight: 1.7, color: "#555" }}>{step.detail}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Divider */}
                  <div style={{ height: "1px", backgroundColor: "#f0ede6", margin: "0 0 28px" }} />

                  {/* Response Letter — button + expandable */}
                  <div>
                    <button
                      onClick={() => setLetterOpen(v => !v)}
                      style={{
                        width: "100%",
                        padding: "14px 24px",
                        borderRadius: "10px",
                        border: "1px solid #0f6e56",
                        backgroundColor: letterOpen ? "#0f6e56" : "#fff",
                        color: letterOpen ? "#fff" : "#0f6e56",
                        fontSize: "15px",
                        fontWeight: 700,
                        cursor: "pointer",
                        fontFamily: "inherit",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "10px",
                        transition: "all 0.2s",
                      }}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                        <line x1="16" y1="13" x2="8" y2="13" />
                        <line x1="16" y1="17" x2="8" y2="17" />
                        <polyline points="10 9 9 9 8 9" />
                      </svg>
                      {letterOpen ? "Hide Response Letter" : "View Draft Response Letter"}
                      <span style={{ marginLeft: "auto", fontSize: "18px", lineHeight: 1 }}>{letterOpen ? "▲" : "▼"}</span>
                    </button>

                    {letterOpen && (
                      <div style={{ marginTop: "16px" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
                          <p style={{ fontSize: "13px", color: "#888", margin: 0 }}>
                            Review and personalise before sending. Fill in any [brackets] with your own details.
                          </p>
                          <button
                            onClick={handleCopy}
                            style={{ flexShrink: 0, marginLeft: "16px", padding: "8px 18px", borderRadius: "8px", border: "1px solid #0f6e56", backgroundColor: copied ? "#0f6e56" : "#fff", color: copied ? "#fff" : "#0f6e56", fontSize: "13px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s", whiteSpace: "nowrap" }}
                          >
                            {copied ? "✓ Copied!" : "Copy"}
                          </button>
                        </div>
                        <pre style={{ backgroundColor: "#f8f7f3", border: "1px solid #e5e0d8", borderRadius: "10px", padding: "24px", fontSize: "14px", lineHeight: 1.8, color: "#333", whiteSpace: "pre-wrap", wordBreak: "break-word", fontFamily: "'Georgia', serif" }}>
                          {result.letter}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>

                {/* Save button */}
                {user && (
                  <div style={{ marginTop: "20px", display: "flex", alignItems: "center", gap: "12px" }}>
                    <button
                      onClick={handleSave}
                      disabled={saving || saved}
                      style={{ padding: "11px 28px", borderRadius: "10px", border: "none", backgroundColor: saved ? "#e8f4f0" : saving ? "#a0c4b8" : "#0f6e56", color: saved ? "#0f6e56" : "#fff", fontSize: "14px", fontWeight: 700, cursor: saving || saved ? "default" : "pointer", fontFamily: "inherit", transition: "all 0.2s", display: "flex", alignItems: "center", gap: "8px" }}
                    >
                      {saved ? "✓ Saved to your account" : saving ? "Saving…" : "💾  Save this analysis"}
                    </button>
                    {saved && (
                      <Link href="/dashboard" style={{ fontSize: "13px", color: "#0f6e56", fontWeight: 600, textDecoration: "none" }}>View in dashboard →</Link>
                    )}
                    {saveError && <span style={{ fontSize: "13px", color: "#dc2626" }}>⚠️ {saveError}</span>}
                  </div>
                )}

                {/* Disclaimer */}
                <div style={{ marginTop: "24px", padding: "16px 20px", borderRadius: "10px", backgroundColor: "#fffbeb", border: "1px solid #fde68a", fontSize: "13px", color: "#92400e", lineHeight: 1.6 }}>
                  <strong>⚠️ Important:</strong> This information is for general guidance only and does not constitute legal advice. LegalClear UK is not a law firm and cannot represent you. For regulated legal advice specific to your situation, please consult a qualified solicitor.
                </div>

                {/* Feedback */}
                <div style={{ marginTop: "16px", padding: "16px 20px", borderRadius: "10px", backgroundColor: "#fff", border: "1px solid #e5e0d8", display: "flex", alignItems: "center", gap: "14px", flexWrap: "wrap" }}>
                  {feedback ? (
                    <p style={{ fontSize: "14px", color: "#0f6e56", fontWeight: 600, margin: 0 }}>
                      {feedback === "up" ? "🙏 Thank you! Glad this was helpful." : "🙏 Thanks for the feedback — we'll keep improving."}
                    </p>
                  ) : (
                    <>
                      <p style={{ fontSize: "14px", color: "#555", fontWeight: 500, margin: 0 }}>Was this analysis helpful?</p>
                      <button onClick={() => setFeedback("up")} style={{ padding: "8px 18px", borderRadius: "8px", border: "1px solid #e5e0d8", backgroundColor: "#fff", cursor: "pointer", fontSize: "15px", fontFamily: "inherit", display: "flex", alignItems: "center", gap: "6px", transition: "all 0.15s" }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#e8f4f0"; e.currentTarget.style.borderColor = "#0f6e56"; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#fff"; e.currentTarget.style.borderColor = "#e5e0d8"; }}>
                        👍 <span style={{ fontSize: "13px", fontWeight: 600, color: "#333" }}>Helpful</span>
                      </button>
                      <button onClick={() => setFeedback("down")} style={{ padding: "8px 18px", borderRadius: "8px", border: "1px solid #e5e0d8", backgroundColor: "#fff", cursor: "pointer", fontSize: "15px", fontFamily: "inherit", display: "flex", alignItems: "center", gap: "6px", transition: "all 0.15s" }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#fef2f2"; e.currentTarget.style.borderColor = "#fecaca"; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#fff"; e.currentTarget.style.borderColor = "#e5e0d8"; }}>
                        👎 <span style={{ fontSize: "13px", fontWeight: 600, color: "#333" }}>Not helpful</span>
                      </button>
                    </>
                  )}
                </div>

                {/* ── Chat trigger button ── */}
                {!chatOpen && (
                  <button
                    onClick={handleOpenChat}
                    style={{
                      marginTop: "16px",
                      width: "100%",
                      padding: "16px 24px",
                      borderRadius: "12px",
                      border: "none",
                      backgroundColor: "#0f6e56",
                      color: "#fff",
                      fontSize: "16px",
                      fontWeight: 700,
                      cursor: "pointer",
                      fontFamily: "inherit",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "10px",
                      transition: "background-color 0.15s, transform 0.1s",
                      boxShadow: "0 4px 14px rgba(15,110,86,0.3)",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#0a5242"; e.currentTarget.style.transform = "translateY(-1px)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#0f6e56"; e.currentTarget.style.transform = "translateY(0)"; }}
                  >
                    {/* Chat bubble icon */}
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                    Chat with LegalClear AI
                  </button>
                )}

                {/* ── Pre-Solicitor Pack button ── */}
                {result && (
                  <div style={{ marginTop: "12px" }}>
                    {user && saved ? (
                      /* Logged-in + case saved → fully active */
                      <button
                        onClick={() => router.push(`/pack/${savedCaseId}`)}
                        style={{
                          width:           "100%",
                          padding:         "15px 24px",
                          borderRadius:    "12px",
                          border:          "2px solid #0f6e56",
                          backgroundColor: "#fff",
                          color:           "#0f6e56",
                          fontSize:        "15px",
                          fontWeight:      700,
                          cursor:          "pointer",
                          fontFamily:      "inherit",
                          display:         "flex",
                          alignItems:      "center",
                          justifyContent:  "center",
                          gap:             "10px",
                          transition:      "all 0.15s",
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#f0faf6"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#fff"; }}
                      >
                        {/* Briefcase icon */}
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                          <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
                          <line x1="12" y1="12" x2="12" y2="12.01" />
                        </svg>
                        Prepare for your solicitor appointment
                      </button>
                    ) : (
                      /* Not logged in or case not saved → greyed out */
                      <div>
                        <button
                          disabled
                          title={!user ? "Sign in and save this case to generate your solicitor pack" : "Save this case to generate your solicitor pack"}
                          style={{
                            width:           "100%",
                            padding:         "15px 24px",
                            borderRadius:    "12px",
                            border:          "2px solid #d1d5db",
                            backgroundColor: "#f9fafb",
                            color:           "#9ca3af",
                            fontSize:        "15px",
                            fontWeight:      700,
                            cursor:          "not-allowed",
                            fontFamily:      "inherit",
                            display:         "flex",
                            alignItems:      "center",
                            justifyContent:  "center",
                            gap:             "10px",
                          }}
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                            <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
                            <line x1="12" y1="12" x2="12" y2="12.01" />
                          </svg>
                          Prepare for your solicitor appointment
                        </button>
                        <p style={{ fontSize: "12px", color: "#9ca3af", textAlign: "center", marginTop: "6px", margin: "6px 0 0" }}>
                          {!user
                            ? <>💡 <Link href="/register" style={{ color: "#0f6e56", fontWeight: 600, textDecoration: "none" }}>Create a free account</Link> and save this case to generate your solicitor pack</>
                            : "💡 Save this case above to generate your solicitor pack"
                          }
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* ── Find a solicitor ── */}
                {result && (
                  <div style={{ marginTop: "16px", background: "#f3f4f6", borderRadius: "12px", padding: "20px 22px" }}>
                    <p style={{ fontSize: "13px", fontWeight: 700, color: "#374151", margin: "0 0 6px" }}>Need professional legal help?</p>
                    <p style={{ fontSize: "13px", color: "#6b7280", margin: "0 0 14px", lineHeight: 1.6 }}>
                      If your situation requires a solicitor, we can help you find one specialising in <strong>{result.lawType}</strong> near you.
                    </p>
                    <form
                      onSubmit={e => {
                        e.preventDefault();
                        const input = (e.currentTarget.elements.namedItem("findPostcode") as HTMLInputElement).value.trim();
                        const url = `/solicitors?area=${encodeURIComponent(result.lawType)}${input ? `&postcode=${encodeURIComponent(input)}` : ""}`;
                        router.push(url);
                      }}
                      style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}
                    >
                      <input
                        name="findPostcode"
                        type="text"
                        placeholder="Your postcode (optional)"
                        style={{ flex: 1, minWidth: "140px", padding: "9px 13px", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "14px", fontFamily: "inherit", background: "#fff" }}
                      />
                      <button
                        type="submit"
                        style={{ padding: "9px 18px", borderRadius: "8px", border: "none", background: "#374151", color: "#fff", fontSize: "13px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap" }}
                      >
                        Find a solicitor →
                      </button>
                    </form>
                  </div>
                )}

                {/* Resource links */}
                <div style={{ marginTop: "28px" }}>
                  <p style={{ fontSize: "13px", fontWeight: 600, color: "#888", marginBottom: "12px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Free UK Resources</p>
                  <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                    {RESOURCE_LINKS.map((r) => (
                      <a
                        key={r.label}
                        href={r.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ padding: "8px 18px", borderRadius: "8px", border: "1px solid #e5e0d8", backgroundColor: "#fff", color: "#0f6e56", fontSize: "13px", fontWeight: 600, textDecoration: "none", transition: "border-color 0.15s" }}
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

          {/* Footer inside left column so it scrolls with content */}
          <footer style={{ borderTop: "1px solid #e5e0d8", padding: "24px 48px", textAlign: "center", fontSize: "13px", color: "#999" }}>
            © {new Date().getFullYear()} LegalClear UK · Not a law firm · For informational purposes only
          </footer>
        </div>

        {/* ════ RIGHT COLUMN — chat panel (desktop only) ════ */}
        {!isMobile && (
          <div
            style={{
              flexShrink: 0,
              width:    desktopChatOpen ? "45%" : "0",
              overflow: "hidden",
              transition: "width 300ms ease",
              position: "relative",
            }}
          >
            {/* Inner div is wider than wrapper — slides in from right as wrapper expands */}
            <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: "45vw", minWidth: "320px" }}>
              {ChatPanel}
            </div>
          </div>
        )}

      </div>{/* end two-column wrapper */}

    </div>
  );
}
