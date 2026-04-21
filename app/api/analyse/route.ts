import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are LegalClear UK, an AI legal information assistant for UK law. Respond only in valid JSON with this structure: lawType, urgencyLevel (high/medium/low), urgencyReason, summaryTitle, explanation (2-3 paragraphs), rights (array), steps (array of title and detail), letter. Use plain English. Never give regulated legal advice.`;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const inputText = formData.get("text") as string | null;
    const jurisdiction = (formData.get("jurisdiction") as string) || "England and Wales";
    const file = formData.get("file") as File | null;

    // Build content blocks
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const content: any[] = [];

    if (file && file.size > 0) {
      const bytes = await file.arrayBuffer();
      const base64 = Buffer.from(bytes).toString("base64");

      if (file.type === "text/plain") {
        const text = Buffer.from(bytes).toString("utf-8");
        content.push({
          type: "text",
          text: `Jurisdiction: ${jurisdiction}\n\nDocument text:\n${text}`,
        });
      } else if (file.type === "image/jpeg" || file.type === "image/png") {
        content.push({
          type: "text",
          text: `Jurisdiction: ${jurisdiction}\n\nPlease analyse the legal notice shown in this image:`,
        });
        content.push({
          type: "image",
          source: {
            type: "base64",
            media_type: file.type as "image/jpeg" | "image/png",
            data: base64,
          },
        });
      } else if (file.type === "application/pdf") {
        content.push({
          type: "text",
          text: `Jurisdiction: ${jurisdiction}\n\nPlease analyse this legal document:`,
        });
        content.push({
          type: "document",
          source: {
            type: "base64",
            media_type: "application/pdf",
            data: base64,
          },
        });
      } else {
        return NextResponse.json(
          { error: "Unsupported file type. Please upload PDF, JPG, PNG, or TXT." },
          { status: 400 }
        );
      }
    } else if (inputText && inputText.trim()) {
      content.push({
        type: "text",
        text: `Jurisdiction: ${jurisdiction}\n\n${inputText.trim()}`,
      });
    } else {
      return NextResponse.json(
        { error: "Please provide a description or upload a file." },
        { status: 400 }
      );
    }

    const response = await client.messages.create({
      model: "claude-opus-4-7",
      max_tokens: 3000,
      thinking: { type: "adaptive" },
      system: [
        {
          type: "text",
          text: SYSTEM_PROMPT,
          cache_control: { type: "ephemeral" },
        },
      ],
      messages: [{ role: "user", content }],
    });

    const block = response.content.find((b) => b.type === "text");
    if (!block || block.type !== "text") {
      throw new Error("No text response received from Claude.");
    }

    // Strip markdown code fences if present
    const raw = block.text
      .trim()
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    const result = JSON.parse(raw);
    return NextResponse.json(result);
  } catch (err) {
    console.error("[/api/analyse] Error:", err);
    const message =
      err instanceof SyntaxError
        ? "Could not parse AI response. Please try again."
        : "An error occurred while analysing. Please try again.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
