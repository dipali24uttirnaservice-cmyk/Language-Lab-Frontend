import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";

export async function POST(req) {
  const { messages } = await req.json();

  const result = streamText({
    model: openai("gpt-4o"),
    system:
      "You are an expert AI Language Tutor. Be concise, encouraging, and provide natural, helpful corrections.",
    messages,
  });

  return result.toDataStreamResponse();
}