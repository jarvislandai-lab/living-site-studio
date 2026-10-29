import { createServerFn } from "@tanstack/react-start";
import { generateResponse, generateChatCompletion, generateMessage, GatewayError } from "@lovable.dev/ai-gateway";

const ALLOWED = ["google/gemini-3.8-flash", "anthropic/claude-sonnet-5", "openai/gpt-6-astra"] as const;
type Allowed = (typeof ALLOWED)[number];

const SYSTEM = `You are an expert web app builder (like Lovable or Bolt). The user describes an app or a change.
Return ONE complete, self-contained HTML document that implements it.
Rules:
- Load Tailwind via <script src="https://cdn.tailwindcss.com"></script>. Google Fonts allowed via <link>.
- All interactivity in vanilla JS inside <script> tags. No build step, no imports from local files.
- Make it polished, modern, responsive and fully working (real state, buttons do things). Use realistic content.
- Images: use https://images.unsplash.com/... or https://picsum.photos URLs.
- If CURRENT HTML is given, modify it to apply the request and keep everything else.
Output format: first line "SUMMARY: <one short sentence of what you built/changed>", then the HTML starting with <!DOCTYPE html>. No markdown fences.`;

export const generateApp = createServerFn({ method: "POST" })
  .inputValidator((d: { prompt: string; currentHtml: string; model: string }) => {
    if (typeof d?.prompt !== "string" || !d.prompt.trim() || d.prompt.length > 4000) throw new Error("Invalid prompt");
    const model = (ALLOWED as readonly string[]).includes(d.model) ? (d.model as Allowed) : "openai/gpt-6-astra";
    return { model, prompt: d.prompt, currentHtml: typeof d.currentHtml === "string" ? d.currentHtml.slice(0, 200_000) : "" };
  })
  .handler(async ({ data }) => {
    const input = data.currentHtml
      ? `CURRENT HTML:\n${data.currentHtml}\n\nREQUEST: ${data.prompt}`
      : `REQUEST: ${data.prompt}`;
    try {
      const text = await callModel(data.model, input);
      const m = text.match(/SUMMARY:\s*(.*)/);
      const summary = m?.[1]?.trim() || "Generated your app.";
      const start = text.search(/<!DOCTYPE html>|<html/i);
      if (start < 0) return { ok: false as const, error: "The AI didn't return a page. Try rephrasing." };
      const html = text.slice(start).replace(/```\s*$/, "").trim();
      return { ok: true as const, html, summary };
    } catch (e) {
      console.error("generateApp failed", e);
      if (e instanceof GatewayError) {
        if (e.httpStatus === 402) return { ok: false as const, error: "Out of AI credits. Add credits in workspace settings." };
        if (e.httpStatus === 429) return { ok: false as const, error: "Too many requests. Wait a moment and try again." };
      }
      return { ok: false as const, error: "Generation failed. Please try again." };
    }
  });

async function callModel(model: Allowed, input: string): Promise<string> {
  if (model === "anthropic/claude-sonnet-5") {
    const res = await generateMessage({ model, max_tokens: 32000, system: SYSTEM, messages: [{ role: "user", content: input }] });
    return (res.content as Array<{ type: string; text?: string }>).filter((c) => c.type === "text").map((c) => c.text ?? "").join("");
  }
  if (model === "google/gemini-3.8-flash") {
    const res = await generateChatCompletion({ model, messages: [{ role: "system", content: SYSTEM }, { role: "user", content: input }] });
    const c = res.choices?.[0]?.message?.content;
    return typeof c === "string" ? c : "";
  }
  const res = await generateResponse({ model, instructions: SYSTEM, input });
  let text = "";
  for (const item of (res as { output?: Array<{ type: string; content?: Array<{ type: string; text?: string }> }> }).output ?? []) {
    if (item.type === "message") for (const c of item.content ?? []) if (c.type === "output_text") text += c.text ?? "";
  }
  return text;
}
