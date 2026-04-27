import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

/* ─── Types ──────────────────────────────────────────────────── */

interface Step {
  title:  string;
  detail: string;
}

interface ChatMessage {
  role:      "user" | "ai";
  text:      string;
  timestamp: string;
}

interface FullResult {
  lawType:       string;
  urgencyLevel:  string;
  urgencyReason: string;
  summaryTitle:  string;
  explanation:   string;
  rights:        string[];
  steps:         Step[];
  letter:        string;
}

interface CaseInput {
  summaryTitle: string;
  lawType:      string;
  urgencyLevel: string;
  urgencyReason?: string;
  inputText?:   string;
  fullResult:   FullResult;
  chatHistory?: ChatMessage[];
  letter?:      string;
}

/* ─── Helpers ────────────────────────────────────────────────── */

/** Build the user message that feeds the model */
function buildPrompt(c: CaseInput): string {
  const lines: string[] = [];

  lines.push("=== CLIENT SITUATION ===");
  lines.push(`Case title: ${c.summaryTitle}`);
  lines.push(`Law area: ${c.lawType}`);
  lines.push(`Urgency: ${c.urgencyLevel}${c.urgencyReason ? ` — ${c.urgencyReason}` : ""}`);

  if (c.inputText) {
    lines.push("\n=== ORIGINAL PROBLEM DESCRIPTION ===");
    lines.push(c.inputText);
  }

  lines.push("\n=== AI ANALYSIS ===");
  lines.push(`Summary: ${c.fullResult.summaryTitle}`);
  lines.push(`\nExplanation:\n${c.fullResult.explanation}`);

  if (c.fullResult.rights.length > 0) {
    lines.push("\nRights identified:");
    c.fullResult.rights.forEach((r, i) => lines.push(`  ${i + 1}. ${r}`));
  }

  if (c.fullResult.steps.length > 0) {
    lines.push("\nRecommended steps:");
    c.fullResult.steps.forEach((s, i) =>
      lines.push(`  ${i + 1}. ${s.title}: ${s.detail}`)
    );
  }

  if (c.letter || c.fullResult.letter) {
    lines.push("\n=== GENERATED RESPONSE LETTER ===");
    lines.push(c.letter || c.fullResult.letter);
  }

  if (c.chatHistory && c.chatHistory.length > 0) {
    /* Filter out welcome messages and only include substantive exchanges */
    const substantive = c.chatHistory.filter(
      (m) => !(m.role === "ai" && m.text.startsWith("Hi! I've already read"))
    );
    if (substantive.length > 0) {
      lines.push("\n=== CHAT HISTORY (follow-up questions and AI answers) ===");
      substantive.forEach((m) => {
        const speaker = m.role === "user" ? "CLIENT" : "AI ADVISOR";
        lines.push(`[${speaker}] ${m.text}`);
      });
    }
  }

  return lines.join("\n");
}

/* ─── Route ──────────────────────────────────────────────────── */

const SYSTEM_PROMPT = `You are a professional legal case summariser. Based on the information provided, generate a structured pre-solicitor briefing document. The document is for the user to hand to their solicitor before their first appointment. It should be formal, clear, and professionally written. Generate the following sections in JSON format:

clientSummary: A two paragraph plain English summary of who the client is and what their situation is
timeline: An array of events in chronological order, each with a date (if known) and a description of what happened
legalContext: A clear explanation of the relevant UK law that applies, written for a solicitor to skim quickly
keyFacts: An array of the most important facts a solicitor needs to know immediately
questionsForSolicitor: An array of 6 to 8 smart questions the user should ask their solicitor based on their specific situation
documentsToGather: An array of documents and evidence the user should bring to the appointment
urgentActions: Any actions that must be taken before the solicitor appointment due to deadlines

Respond in valid JSON only. No markdown. No backticks.`;

export async function POST(req: NextRequest) {
  try {
    /* ── Parse request body ── */
    const body = await req.json() as CaseInput;

    const {
      summaryTitle,
      lawType,
      urgencyLevel,
      urgencyReason,
      inputText,
      fullResult,
      chatHistory,
      letter,
    } = body;

    /* ── Validate required fields ── */
    if (!summaryTitle || !lawType || !urgencyLevel || !fullResult) {
      return NextResponse.json(
        { error: "Missing required case fields (summaryTitle, lawType, urgencyLevel, fullResult)." },
        { status: 400 }
      );
    }

    /* ── Build the prompt ── */
    const userPrompt = buildPrompt({
      summaryTitle,
      lawType,
      urgencyLevel,
      urgencyReason,
      inputText,
      fullResult,
      chatHistory,
      letter,
    });

    /* ── Call Claude ── */
    const response = await client.messages.create({
      model:      "claude-opus-4-5",
      max_tokens: 3000,
      system: [
        {
          type:          "text",
          text:          SYSTEM_PROMPT,
          cache_control: { type: "ephemeral" }, /* cache system prompt */
        },
      ],
      messages: [
        {
          role:    "user",
          content: userPrompt,
        },
      ],
    });

    /* ── Extract text block ── */
    const block = response.content.find((b) => b.type === "text");
    if (!block || block.type !== "text") {
      throw new Error("No text content in Claude response.");
    }

    /* ── Parse JSON — strip any accidental markdown fences ── */
    let rawText = block.text.trim();
    if (rawText.startsWith("```")) {
      rawText = rawText.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
    }

    let packData: unknown;
    try {
      packData = JSON.parse(rawText);
    } catch {
      console.error("[/api/generate-pack] JSON parse failed. Raw output:", rawText.slice(0, 400));
      return NextResponse.json(
        { error: "Failed to parse AI response as JSON. Please try again." },
        { status: 500 }
      );
    }

    /* ── Normalise all array fields to plain strings ──
       Claude occasionally returns items as objects e.g. { action, reason, deadline }
       instead of plain strings. Flatten them here so the UI never receives an object. */
    function flattenItem(item: unknown): string {
      if (typeof item === "string") return item;
      if (item && typeof item === "object") {
        const obj = item as Record<string, unknown>;
        // Try common key names in order of preference
        const val = obj.action ?? obj.question ?? obj.document ?? obj.fact ??
                    obj.text ?? obj.description ?? obj.content ?? obj.item ?? obj.step;
        if (val) return String(val);
        // Fallback: join all string values
        return Object.values(obj).filter(v => typeof v === "string").join(" — ");
      }
      return String(item ?? "");
    }

    const pack = packData as Record<string, unknown>;
    const arrayFields = [
      "keyFacts", "questionsForSolicitor", "documentsToGather", "urgentActions",
    ] as const;
    for (const field of arrayFields) {
      if (Array.isArray(pack[field])) {
        pack[field] = (pack[field] as unknown[]).map(flattenItem);
      }
    }

    /* ── Return the generated pack ── */
    return NextResponse.json({ pack: packData });

  } catch (err) {
    console.error("[/api/generate-pack] Error:", err);
    return NextResponse.json(
      { error: "Something went wrong generating the pack. Please try again." },
      { status: 500 }
    );
  }
}
