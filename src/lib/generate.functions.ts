import { createServerFn } from "@tanstack/react-start";
import { generateResponse, generateChatCompletion, generateMessage, GatewayError } from "@lovable.dev/ai-gateway";

const ALLOWED = ["google/gemini-3.8-flash", "anthropic/claude-sonnet-5", "openai/gpt-6-astra"] as const;
type Allowed = (typeof ALLOWED)[number];

const SYSTEM = `You are an expert web app builder (like Lovable or Bolt). The user describes an app. Build it from scratch as a small multi-file project.
Rules:
- Files: /index.html (markup only, loads Tailwind via <script src="https://cdn.tailwindcss.com"></script>, links ./styles.css and loads ./app.js at the end of body), /styles.css (custom CSS incl. :root color variables), /app.js (all vanilla JS). You may add more /js/*.js or /css/*.css files if useful; reference them with relative paths.
- COLORS: read the color/theme words in the prompt (e.g. "emerald", "dark", "sunset orange", "pastel") and build a matching palette as CSS variables in styles.css, used consistently. If no colors are mentioned, pick a tasteful palette that fits the app.
- Polished, modern, responsive, fully working (real state, buttons do things), realistic content. Images: https://images.unsplash.com/... or https://picsum.photos.
Output format: first line "SUMMARY: <one short sentence>". Then each file as:
=== FILE: /path ===
<content>
No markdown fences.`;

export const generateApp = createServerFn({ method: "POST" })
  .inputValidator((d: { prompt: string; currentHtml: string; model: string }) => {
    if (typeof d?.prompt !== "string" || !d.prompt.trim() || d.prompt.length > 4000) throw new Error("Invalid prompt");
    const model = (ALLOWED as readonly string[]).includes(d.model) ? (d.model as Allowed) : "openai/gpt-6-astra";
    return { model, prompt: d.prompt, currentHtml: typeof d.currentHtml === "string" ? d.currentHtml.slice(0, 200_000) : "" };
  })
  .handler(async ({ data }) => {
        try {
      const text = await callModel(data.model, `REQUEST: ${data.prompt}`);
      const m = text.match(/SUMMARY:\s*(.*)/);
      const summary = m?.[1]?.trim() || "Generated your app.";
      const files: Record<string, string> = {};
      const parts = text.split(/^=== FILE:\s*(\S+)\s*===\s*$/m);
      for (let i = 1; i < parts.length; i += 2) {
        const path = parts[i].startsWith("/") ? parts[i] : "/" + parts[i];
        files[path] = (parts[i + 1] ?? "").replace(/^```\w*\s*|```\s*$/g, "").trim() + "\n";
      }
      if (!files["/index.html"]) {
        const start = text.search(/<!DOCTYPE html>|<html/i);
        if (start < 0) return { ok: false as const, error: "The AI didn't return a page. Try rephrasing." };
        files["/index.html"] = text.slice(start).trim();
      }
      return { ok: true as const, files, summary };
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
