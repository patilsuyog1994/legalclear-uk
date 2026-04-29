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

STRICT RULES FOR YOUR REPLIES:
- Write in plain conversational English — like a knowledgeable friend, not a lawyer writing a report
- Keep every reply SHORT: 2-4 sentences max for simple questions, up to 6 sentences for complex ones
- Never use markdown: no **bold**, no bullet points with -, no numbered lists, no headings
- Write in flowing prose only — use commas and full stops, not lists
- Never give regulated legal advice — only information
- If a solicitor is needed, say so in one short sentence at the end
- If asked something unrelated to their case or UK law, politely redirect them in one sentence`;

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

    /* Strip markdown formatting so nothing leaks through */
    const clean = block.text
      .trim()
      .replace(/\*\*(.*?)\*\*/g, "$1")   // **bold** → plain
      .replace(/\*(.*?)\*/g, "$1")        // *italic* → plain
      .replace(/^[-•]\s+/gm, "")          // leading - or • bullet points
      .replace(/^\d+\.\s+/gm, "")         // numbered lists
      .replace(/#{1,6}\s+/g, "")          // headings
      .replace(/\n{3,}/g, "\n\n")         // collapse excessive blank lines
      .trim();

    return NextResponse.json({ reply: clean });

  } catch (err) {
    console.error("[/api/chat] Error:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
