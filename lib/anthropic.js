// Panggil Claude API (SERVER SAHAJA). Tiada SDK diperlukan.
import { SYSTEM_PROMPT } from "./prompt";

export async function generateCopy(prompt, variasi) {
  const model = process.env.ANTHROPIC_MODEL || "claude-haiku-5-5";
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": process.env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model,
      max_tokens: 1800 * variasi + 800,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: prompt }],
    }),
    signal: AbortSignal.timeout(90000),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    console.error("Claude API error", res.status, detail.slice(0, 500));
    throw new Error("AI_ERROR");
  }

  const json = await res.json();
  const text = (json.content || []).filter((c) => c.type === "text").map((c) => c.text).join("");
  return parseJson(text);
}

function parseJson(text) {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start < 0 || end < 0) throw new Error("AI_BAD_JSON");
  return JSON.parse(text.slice(start, end + 1));
}
