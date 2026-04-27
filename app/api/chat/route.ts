import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

/* Shape of each message coming from the UI */
interface IncomingMessage {
  id:        string;
  role:      "user" | "ai";
  text:      string;
  timestamp: string;
}

/* Shape of the analysis result sent as context */
interface AnalysisContext {
  lawType:       string;
  urgencyLevel:  string;
  urgencyReason: string;
  summaryTitle:  string;
  explanation:   string;
  rights:        string[];
  steps:         { title: string; detail: string }[];
  letter:        string;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      messages,
      context,
      originalInput,
    }: {
      messages:      IncomingMessage[];
      context:       AnalysisContext;
      originalInput: string;
    } = body;

    /* ── Validate ── */
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "No messages provided." }, { status: 400 });
    }
    if (!context) {
      return NextResponse.json({ error: "No analysis context provided." }, { status: 400 });
    }

    /* ── Build system prompt with injected context ── */
    const contextSummary = [
      `Law area: ${context.lawType}`,
      `Case title: ${context.summaryTitle}`,
      `Urgency: ${context.urgencyLevel}${context.urgencyReason ? ` — ${context.urgencyReason}` : ""}`,
      `Explanation: ${context.explanation}`,
      `Rights identified:\n${context.rights.map((r, i) => `  ${i + 1}. ${r}`).join("\n")}`,
      `Recommended steps:\n${context.steps.map((s, i) => `  ${i + 1}. ${s.title}: ${s.detail}`).join("\n")}`,
    ].join("\n\n");

    const systemPrompt = `You are LegalClear AI, a legal information assistant specialising in UK law. The user has just received an analysis of their legal situation.

Here is their full case context:
${contextSummary}

Their original query was: "${originalInput}"

Answer their follow-up questions in plain English. Be specific to their situation. Never give regulated legal advice — only information. Always recommend a solicitor for serious decisions. Keep answers concise and conversational — this is a chat not an essay. If asked something outside UK law or unrelated to their situation, politely redirect them.`;

    /* ── Convert UI messages → Anthropic format ──
       Skip the welcome message (id="welcome") so the conversation
       always starts with a user turn, as required by the API. ── */
    const anthropicMessages = messages
      .filter((m) => m.id !== "welcome")
      .map((m) => ({
        role:    m.role === "ai" ? ("assistant" as const) : ("user" as const),
        content: m.text,
      }));

    /* The last message must be from the user — guard against edge cases */
    if (
      anthropicMessages.length === 0 ||
      anthropicMessages[anthropicMessages.length - 1].role !== "user"
    ) {
      return NextResponse.json(
        { error: "The last message must be from the user." },
        { status: 400 }
      );
    }

    /* ── Call Claude ── */
    const response = await client.messages.create({
      model:      "claude-opus-4-7",
      max_tokens: 1024,
      system: [
        {
          type:          "text",
          text:          systemPrompt,
          cache_control: { type: "ephemeral" }, /* cache system prompt for multi-turn efficiency */
        },
      ],
      messages: anthropicMessages,
    });

    /* Extract text reply */
    const block = response.content.find((b) => b.type === "text");
    if (!block || block.type !== "text") {
      throw new Error("No text content in Claude response.");
    }

    return NextResponse.json({ reply: block.text.trim() });

  } catch (err) {
    console.error("[/api/chat] Error:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
