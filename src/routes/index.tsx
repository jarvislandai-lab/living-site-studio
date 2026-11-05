import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  Sparkles, Send, ChevronDown, FileCode2, Folder, Monitor, Tablet, Smartphone, Eye, Code2,
  MousePointer2, Terminal, Check, Loader2, MessageSquare, X, Trash2, LayoutTemplate,
} from "lucide-react";
import {
  DEFAULT_SPEC, MODELS, STEPS, generateFiles,
  type AppSpec, type FileMap, type ModelId,
} from "@/lib/workspace";
import { PreviewApp } from "@/components/builder/PreviewApp";
import { CodeEditor } from "@/components/builder/CodeEditor";
import { useServerFn } from "@tanstack/react-start";
import { generateApp } from "@/lib/generate.functions";
import { STARTER_TEMPLATES } from "@/lib/templates";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Forge — AI App Builder Workspace" },
      { name: "description", content: "Describe an app, watch it generate as files, and edit it live in a split-screen AI builder." },
      { property: "og:title", content: "Forge — AI App Builder Workspace" },
      { property: "og:description", content: "Prompt, preview and edit generated apps in real time." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Workspace,
});

type Msg = { role: "user" | "ai"; text: string };
type Device = "desktop" | "tablet" | "mobile";
const DEVICE_W: Record<Device, string> = { desktop: "w-full", tablet: "w-[768px] max-w-full", mobile: "w-[375px] max-w-full" };

function Workspace() {
  const [spec, setSpec] = useState<AppSpec>(DEFAULT_SPEC);
  const [files, setFiles] = useState<FileMap>(() => generateFiles(DEFAULT_SPEC));
  const [active, setActive] = useState("/src/App.tsx");
  const [tabs, setTabs] = useState<string[]>(["/src/App.tsx"]);
  const [model, setModel] = useState<ModelId>("google/gemini-3.8-flash");
  const [prompt, setPrompt] = useState("");
  const [msgs, setMsgs] = useState<Msg[]>([{ role: "ai", text: "Your Nova Store project is ready. Try “Add emerald theme” or “Switch to Kanban view”." }]);
  const [step, setStep] = useState(-1);
  const [view, setView] = useState<"preview" | "code">("preview");
  const [device, setDevice] = useState<Device>("desktop");
  const [inspect, setInspect] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);
  const [consoleOpen, setConsoleOpen] = useState(false);
  const [logs, setLogs] = useState<{ t: string; m: string; lvl: "info" | "event" }[]>([]);
  const [mobilePane, setMobilePane] = useState<"chat" | "canvas">("chat");
  const busy = step >= 0;
  const generate = useServerFn(generateApp);
  const chatEnd = useRef<HTMLDivElement>(null);
  const hoverEl = useRef<Element | null>(null);

  const log = (m: string, lvl: "info" | "event" = "event") =>
    setLogs((l) => [...l.slice(-199), { t: new Date().toLocaleTimeString(), m, lvl }]);

  useEffect(() => { chatEnd.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs, step]);
  useEffect(() => { log("Preview compiled · vite ready", "info"); }, []);

  const openFile = (f: string) => {
    setActive(f);
    setTabs((t) => (t.includes(f) ? t : [...t, f]));
    setView("code");
    setMobilePane("canvas");
  };

  const run = async (text: string) => {
    if (!text.trim() || busy) return;
    setMsgs((m) => [...m, { role: "user", text }]);
    setPrompt("");
    setStep(0);
    let i = 0;
    const timer = setInterval(() => { i = Math.min(i + 1, STEPS.length - 1); setStep(i); }, 2500);
    try {
      const res = await generate({ data: { prompt: text, currentHtml: files["/index.html"] ?? "", model } });
      if (!res.ok) { setMsgs((m) => [...m, { role: "ai", text: res.error }]); return; }
      setFiles({ "/index.html": res.html });
      setTabs(["/index.html"]);
      setActive("/index.html");
      setInspect(false);
      setMsgs((m) => [...m, { role: "ai", text: res.summary }]);
      log(`HMR update · index.html (${Math.round(res.html.length / 1024)} KB)`, "info");
      setMobilePane("canvas");
      setView("preview");
    } catch {
      setMsgs((m) => [...m, { role: "ai", text: "Generation failed. Please try again." }]);
    } finally {
      clearInterval(timer);
      setStep(-1);
    }
  };

  const loadTemplate = (t: { label: string; title: string; html: string }) => {
    setFiles({ "/index.html": t.html });
    setTabs(["/index.html"]);
    setActive("/index.html");
    setSpec((s) => ({ ...s, title: t.title }));
    setMsgs((m) => [...m, { role: "ai", text: `Loaded the ${t.label} template. Ask for any change and I'll edit it.` }]);
    log(`Template loaded · ${t.label}`, "info");
    setView("preview");
    setMobilePane("canvas");
  };

  const tree = buildTree(Object.keys(files));

  const onPreviewOver = (e: React.MouseEvent) => {
    if (!inspect) return;
    const el = (e.target as HTMLElement).closest("[data-inspect]");
    if (hoverEl.current && hoverEl.current !== el) hoverEl.current.classList.remove("inspect-hover");
    if (el) { el.classList.add("inspect-hover"); setHovered(el.getAttribute("data-inspect")); }
    hoverEl.current = el;
  };
  const onPreviewClick = (e: React.MouseEvent) => {
    if (!inspect) return;
    e.preventDefault(); e.stopPropagation();
    const name = hovered;
    if (!name) return;
    const file = Object.keys(files).find((f) => f.endsWith(`/${name}.tsx`));
    log(`Inspected <${name} />${file ? ` → ${file}` : ""}`, "info");
    hoverEl.current?.classList.remove("inspect-hover");
    setInspect(false);
    if (file) openFile(file);
  };

  return (
    <div className="flex h-dvh flex-col">
      <header className="glass flex items-center justify-between border-x-0 border-t-0 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <div className="grid size-8 place-items-center rounded-lg bg-brand shadow-glow"><Sparkles size={16} className="text-primary-foreground" /></div>
          <span className="font-semibold tracking-tight">Forge</span>
          <span className="hidden text-sm text-muted-foreground sm:inline">/ {spec.title}</span>
        </div>
        <div className="flex rounded-lg border border-border p-0.5 lg:hidden">
          {(["chat", "canvas"] as const).map((p) => (
            <button key={p} onClick={() => setMobilePane(p)} className={`flex items-center gap-1 rounded-md px-3 py-1 text-xs capitalize ${mobilePane === p ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>
              {p === "chat" ? <MessageSquare size={13} /> : <Eye size={13} />}{p}
            </button>
          ))}
        </div>
        <span className="hidden items-center gap-1.5 text-xs text-success lg:flex"><span className="size-1.5 rounded-full bg-success" /> Synced</span>
      </header>

      <div className="flex min-h-0 flex-1 gap-3 p-3">
        {/* LEFT */}
        <aside className={`${mobilePane === "chat" ? "flex" : "hidden"} min-h-0 w-full flex-col gap-3 lg:flex lg:w-[380px] lg:shrink-0`}>
          <div className="glass flex min-h-0 flex-1 flex-col rounded-2xl">
            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              {msgs.map((m, i) => (
                <div key={i} className={`max-w-[90%] rounded-xl px-3 py-2 text-sm ${m.role === "user" ? "ml-auto bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}>{m.text}</div>
              ))}
              {busy && (
                <div className="space-y-1.5 rounded-xl border border-border bg-muted/50 p-3">
                  {STEPS.map((s, i) => (
                    <div key={s} className={`flex items-center gap-2 text-xs ${i < step ? "text-success" : i === step ? "text-accent" : "text-muted-foreground/50"}`}>
                      {i < step ? <Check size={13} /> : i === step ? <Loader2 size={13} className="animate-spin" /> : <span className="size-[13px] rounded-full border border-current" />}
                      {s}{i < STEPS.length - 1 && i === step ? "…" : ""}
                    </div>
                  ))}
                </div>
              )}
              <div ref={chatEnd} />
            </div>
            <div className="border-t border-border p-3">
              <div className="mb-2 flex flex-wrap gap-1.5">
                {STARTER_TEMPLATES.map((t) => (
                  <button key={t.label} disabled={busy} onClick={() => loadTemplate(t)} className="flex items-center gap-1 rounded-full border border-border px-2.5 py-1 text-[11px] text-muted-foreground transition hover:border-accent hover:text-accent disabled:opacity-40">
                    <LayoutTemplate size={11} />{t.label}
                  </button>
                ))}
              </div>
              <form onSubmit={(e) => { e.preventDefault(); run(prompt); }} className="rounded-xl border border-input bg-background/60 focus-within:border-primary focus-within:shadow-glow">
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); run(prompt); } }}
                  rows={2}
                  placeholder="Describe any app — e.g. “A pomodoro timer with stats”"
                  className="w-full resize-none bg-transparent px-3 pt-2.5 text-sm outline-none placeholder:text-muted-foreground"
                />
                <div className="flex items-center justify-between px-2 pb-2">
                  <label className="relative flex items-center text-xs text-muted-foreground">
                    <select value={model} onChange={(e) => setModel(e.target.value as ModelId)} className="appearance-none rounded-md bg-secondary py-1 pl-2 pr-6 outline-none">
                      {MODELS.map((m) => <option key={m.id} value={m.id}>{m.label}</option>)}
                    </select>
                    <ChevronDown size={12} className="pointer-events-none absolute right-1.5" />
                  </label>
                  <button disabled={busy || !prompt.trim()} aria-label="Send" className="grid size-8 place-items-center rounded-lg bg-brand text-primary-foreground disabled:opacity-40">
                    {busy ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
                  </button>
                </div>
              </form>
            </div>
          </div>
          <div className="glass max-h-56 shrink-0 overflow-y-auto rounded-2xl p-3">
            <p className="mb-1.5 px-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Files</p>
            <TreeView node={tree} depth={0} active={active} onOpen={openFile} />
          </div>
        </aside>

        {/* RIGHT */}
        <main className={`${mobilePane === "canvas" ? "flex" : "hidden"} glass min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-2xl lg:flex`}>
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-3 py-2">
            <div className="flex rounded-lg bg-secondary p-0.5">
              {([["preview", Eye, "Live Preview"], ["code", Code2, "Code Editor"]] as const).map(([v, Icon, l]) => (
                <button key={v} onClick={() => setView(v)} className={`flex items-center gap-1.5 rounded-md px-3 py-1 text-xs ${view === v ? "bg-background text-foreground shadow-glow" : "text-muted-foreground"}`}><Icon size={13} />{l}</button>
              ))}
            </div>
            {view === "preview" && (
              <div className="flex items-center gap-1">
                {([["desktop", Monitor], ["tablet", Tablet], ["mobile", Smartphone]] as const).map(([d, Icon]) => (
                  <IconBtn key={d} on={device === d} onClick={() => setDevice(d)} label={d}><Icon size={15} /></IconBtn>
                ))}
                <span className="mx-1 h-5 w-px bg-border" />
                <IconBtn on={inspect} onClick={() => setInspect(!inspect)} label="Inspect element"><MousePointer2 size={15} /></IconBtn>
              </div>
            )}
            <IconBtn on={consoleOpen} onClick={() => setConsoleOpen(!consoleOpen)} label="Console"><Terminal size={15} /><span className="ml-1 text-[10px]">{logs.length}</span></IconBtn>
          </div>

          <div className="relative min-h-0 flex-1">
            {view === "preview" ? (
              <div className="flex h-full justify-center overflow-auto p-3">
                <div className={`${DEVICE_W[device]} transition-all duration-300 ${device === "mobile" ? "h-[700px] max-h-full rounded-[2.5rem] border-[10px] border-device shadow-glow" : device === "tablet" ? "rounded-2xl border-[8px] border-device" : "rounded-xl border border-border"} relative overflow-hidden`}>
                  {device === "mobile" && <div className="absolute left-1/2 top-1.5 z-20 h-5 w-24 -translate-x-1/2 rounded-full bg-device" />}
                  <div
                    className={`h-full overflow-y-auto ${inspect ? "cursor-crosshair" : ""} ${device === "mobile" ? "pt-6" : ""}`}
                    onMouseOver={onPreviewOver}
                    onClickCapture={onPreviewClick}
                  >
                    {files["/index.html"] ? (
                      <iframe title="App preview" srcDoc={files["/index.html"]} sandbox="allow-scripts allow-forms allow-modals allow-popups" className="h-full min-h-[600px] w-full border-0 bg-pv-surface" />
                    ) : (
                      <PreviewApp spec={spec} log={(m) => log(m)} onToggleDark={() => setSpec((s) => ({ ...s, dark: !s.dark }))} />
                    )}
                  </div>
                  {inspect && hovered && <div className="absolute bottom-2 left-2 z-20 rounded-md bg-accent px-2 py-1 font-mono text-[11px] text-accent-foreground">&lt;{hovered} /&gt;</div>}
                </div>
              </div>
            ) : (
              <div className="flex h-full flex-col">
                <div className="flex overflow-x-auto border-b border-border bg-code-bg">
                  {tabs.map((t) => (
                    <div key={t} className={`group flex shrink-0 items-center gap-1.5 border-r border-border px-3 py-1.5 text-xs ${t === active ? "bg-background text-foreground" : "text-muted-foreground"}`}>
                      <button onClick={() => setActive(t)} className="flex items-center gap-1.5"><FileCode2 size={12} className="text-accent" />{t.split("/").pop()}</button>
                      {tabs.length > 1 && <button aria-label="Close tab" onClick={() => { const n = tabs.filter((x) => x !== t); setTabs(n); if (active === t && n[0]) setActive(n[0]); }} className="opacity-50 hover:opacity-100"><X size={11} /></button>}
                    </div>
                  ))}
                </div>
                <div className="min-h-0 flex-1">
                  <CodeEditor value={files[active] ?? ""} onChange={(v) => setFiles((f) => ({ ...f, [active]: v }))} />
                </div>
              </div>
            )}

            {consoleOpen && (
              <div className="absolute inset-x-0 bottom-0 z-30 flex h-48 flex-col border-t border-border bg-code-bg/95 backdrop-blur">
                <div className="flex items-center justify-between px-3 py-1.5 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5"><Terminal size={12} /> Console</span>
                  <div className="flex gap-2">
                    <button aria-label="Clear console" onClick={() => setLogs([])}><Trash2 size={12} /></button>
                    <button aria-label="Close console" onClick={() => setConsoleOpen(false)}><X size={12} /></button>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto px-3 pb-2 font-mono text-[11.5px]">
                  {logs.map((l, i) => (
                    <div key={i} className="flex gap-2 py-0.5"><span className="text-muted-foreground/60">{l.t}</span><span className={l.lvl === "info" ? "text-accent" : "text-foreground"}>{l.m}</span></div>
                  ))}
                  {!logs.length && <p className="text-muted-foreground/60">No output.</p>}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

function IconBtn({ on, onClick, label, children }: { on: boolean; onClick: () => void; label: string; children: React.ReactNode }) {
  return (
    <button aria-label={label} title={label} onClick={onClick} className={`flex items-center rounded-md p-1.5 transition ${on ? "bg-primary/20 text-accent" : "text-muted-foreground hover:text-foreground"}`}>{children}</button>
  );
}

type Node = { name: string; path: string; children: Node[] };
function buildTree(paths: string[]): Node {
  const root: Node = { name: "", path: "", children: [] };
  for (const p of [...paths].sort()) {
    let cur = root;
    p.split("/").filter(Boolean).forEach((part, i, arr) => {
      const path = "/" + arr.slice(0, i + 1).join("/");
      let n = cur.children.find((c) => c.name === part);
      if (!n) { n = { name: part, path, children: [] }; cur.children.push(n); }
      cur = n;
    });
  }
  return root;
}

function TreeView({ node, depth, active, onOpen }: { node: Node; depth: number; active: string; onOpen: (p: string) => void }) {
  const sorted = [...node.children].sort((a, b) => Number(!a.children.length) - Number(!b.children.length) || a.name.localeCompare(b.name));
  return (
    <>
      {sorted.map((c) => c.children.length ? (
        <div key={c.path}>
          <div className="flex items-center gap-1.5 py-0.5 text-xs text-muted-foreground" style={{ paddingLeft: depth * 12 + 4 }}><Folder size={12} className="text-primary" />{c.name}</div>
          <TreeView node={c} depth={depth + 1} active={active} onOpen={onOpen} />
        </div>
      ) : (
        <button key={c.path} onClick={() => onOpen(c.path)} style={{ paddingLeft: depth * 12 + 4 }} className={`flex w-full items-center gap-1.5 rounded py-0.5 text-left font-mono text-xs ${active === c.path ? "bg-primary/15 text-accent" : "text-foreground/80 hover:bg-secondary"}`}>
          <FileCode2 size={12} className="shrink-0 text-accent" />{c.name}
        </button>
      ))}
    </>
  );
}
