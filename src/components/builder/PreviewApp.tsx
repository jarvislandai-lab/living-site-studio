import { useMemo, useState } from "react";
import { Moon, Sun, ShoppingCart, Search, X, Plus, TrendingUp, TrendingDown, Check, ArrowRight } from "lucide-react";
import type { AppSpec } from "@/lib/workspace";

type Log = (msg: string) => void;

export function PreviewApp({ spec, log, onToggleDark }: { spec: AppSpec; log: Log; onToggleDark: () => void }) {
  return (
    <div className={`pv-${spec.theme} ${spec.dark ? "pv-dark" : ""} min-h-full bg-pv-bg text-pv-fg font-sans`}>
      <nav data-inspect="Navbar" className="flex items-center justify-between border-b border-pv-border bg-pv-surface px-4 py-3">
        <span className="font-bold tracking-tight"><span className="text-pv-accent">●</span> {spec.title}</span>
        <button
          data-inspect="ThemeToggle"
          aria-label="Toggle theme"
          onClick={() => { onToggleDark(); log(`Theme switched to ${spec.dark ? "light" : "dark"}`); }}
          className="rounded-lg border border-pv-border p-2 hover:bg-pv-bg"
        >
          {spec.dark ? <Sun size={16} /> : <Moon size={16} />}
        </button>
      </nav>
      {spec.kind === "store" && <Store log={log} />}
      {spec.kind === "dashboard" && <Dashboard log={log} />}
      {spec.kind === "kanban" && <Kanban log={log} />}
    </div>
  );
}

const PRODUCTS = [
  { id: "1", name: "Ceramic Mug", price: 24, category: "Kitchen" },
  { id: "2", name: "Linen Throw", price: 89, category: "Living" },
  { id: "3", name: "Oak Tray", price: 42, category: "Kitchen" },
  { id: "4", name: "Wool Cushion", price: 55, category: "Living" },
  { id: "5", name: "Brass Lamp", price: 129, category: "Lighting" },
  { id: "6", name: "Paper Shade", price: 38, category: "Lighting" },
];

function Store({ log }: { log: Log }) {
  const [cart, setCart] = useState<typeof PRODUCTS>([]);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("All");
  const [open, setOpen] = useState(false);
  const cats = ["All", "Kitchen", "Living", "Lighting"];
  const list = PRODUCTS.filter((p) => (cat === "All" || p.category === cat) && p.name.toLowerCase().includes(q.toLowerCase()));
  const total = cart.reduce((s, p) => s + p.price, 0);
  return (
    <div className="relative">
      <section data-inspect="Hero" className="px-6 py-12 text-center">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Objects for slow living</h1>
        <p className="mx-auto mt-2 max-w-md text-sm text-pv-muted">Hand-made homeware, shipped carbon-neutral.</p>
        <button onClick={() => { setOpen(true); log("CartDrawer opened"); }} className="mt-5 inline-flex items-center gap-2 rounded-full bg-pv-accent px-5 py-2 text-sm font-medium text-pv-accent-fg">
          <ShoppingCart size={15} /> Cart ({cart.length})
        </button>
      </section>
      <div className="flex flex-col gap-3 px-4 sm:flex-row sm:items-center">
        <label className="flex flex-1 items-center gap-2 rounded-lg border border-pv-border bg-pv-surface px-3 py-2">
          <Search size={14} className="text-pv-muted" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search products" className="w-full bg-transparent text-sm outline-none" />
        </label>
        <div className="flex gap-1 overflow-x-auto">
          {cats.map((c) => (
            <button key={c} onClick={() => setCat(c)} className={`rounded-full px-3 py-1 text-xs ${cat === c ? "bg-pv-accent text-pv-accent-fg" : "border border-pv-border"}`}>{c}</button>
          ))}
        </div>
      </div>
      <div data-inspect="FeatureGrid" className="grid grid-cols-2 gap-3 p-4 md:grid-cols-3">
        {list.map((p) => (
          <article key={p.id} className="rounded-xl border border-pv-border bg-pv-surface p-3">
            <div className="mb-3 aspect-square rounded-lg bg-pv-accent/15" />
            <h3 className="text-sm font-medium">{p.name}</h3>
            <div className="mt-1 flex items-center justify-between">
              <span className="text-sm text-pv-muted">${p.price}</span>
              <button aria-label={`Add ${p.name}`} onClick={() => { setCart((c) => [...c, p]); log(`Added "${p.name}" to cart`); }} className="rounded-md bg-pv-accent p-1 text-pv-accent-fg"><Plus size={14} /></button>
            </div>
          </article>
        ))}
        {!list.length && <p className="col-span-full py-8 text-center text-sm text-pv-muted">No products match.</p>}
      </div>
      {open && (
        <div className="absolute inset-0 z-10 flex justify-end bg-pv-fg/30" onClick={() => setOpen(false)}>
          <aside data-inspect="CartDrawer" onClick={(e) => e.stopPropagation()} className="h-full w-72 max-w-full bg-pv-surface p-4 shadow-xl">
            <div className="mb-4 flex items-center justify-between"><strong>Your cart</strong><button aria-label="Close cart" onClick={() => setOpen(false)}><X size={16} /></button></div>
            {cart.length ? cart.map((p, i) => (
              <div key={i} className="flex justify-between border-b border-pv-border py-2 text-sm"><span>{p.name}</span><span>${p.price}</span></div>
            )) : <p className="text-sm text-pv-muted">Cart is empty.</p>}
            <div className="mt-4 flex justify-between font-semibold"><span>Total</span><span>${total}</span></div>
            <button disabled={!cart.length} onClick={() => { log(`Checkout: $${total}`); setCart([]); setOpen(false); }} className="mt-4 w-full rounded-lg bg-pv-accent py-2 text-sm text-pv-accent-fg disabled:opacity-40">Checkout</button>
          </aside>
        </div>
      )}
    </div>
  );
}

function Dashboard({ log }: { log: Log }) {
  const [range, setRange] = useState<"7d" | "30d" | "90d">("30d");
  const n = range === "7d" ? 7 : range === "30d" ? 15 : 24;
  const bars = useMemo(() => Array.from({ length: n }, (_, i) => 30 + ((i * 37 + n * 11) % 65)), [n]);
  const metrics = [
    { label: "MRR", value: range === "7d" ? "$11.4k" : range === "30d" ? "$48.2k" : "$139k", delta: 12.4 },
    { label: "Active users", value: "8,931", delta: 4.1 },
    { label: "Churn", value: "2.3%", delta: -0.6 },
  ];
  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Overview</h1>
        <div className="flex rounded-lg border border-pv-border p-0.5">
          {(["7d", "30d", "90d"] as const).map((r) => (
            <button key={r} onClick={() => { setRange(r); log(`Range changed to ${r}`); }} className={`rounded-md px-2.5 py-1 text-xs ${range === r ? "bg-pv-accent text-pv-accent-fg" : ""}`}>{r}</button>
          ))}
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        {metrics.map((m) => (
          <div key={m.label} data-inspect="StatCard" className="rounded-xl border border-pv-border bg-pv-surface p-4">
            <p className="text-xs text-pv-muted">{m.label}</p>
            <p className="mt-1 text-2xl font-bold">{m.value}</p>
            <span className="mt-1 inline-flex items-center gap-1 text-xs text-pv-accent">{m.delta > 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}{Math.abs(m.delta)}%</span>
          </div>
        ))}
      </div>
      <div data-inspect="RevenueChart" className="rounded-xl border border-pv-border bg-pv-surface p-4">
        <p className="mb-3 text-sm font-medium">Revenue</p>
        <div className="flex h-40 items-end gap-1">
          {bars.map((h, i) => <div key={i} style={{ height: `${h}%` }} className="flex-1 rounded-t bg-pv-accent/80 transition-all hover:bg-pv-accent" />)}
        </div>
      </div>
    </div>
  );
}

type Status = "todo" | "doing" | "done";
function Kanban({ log }: { log: Log }) {
  const [tasks, setTasks] = useState([
    { id: "a", title: "Design onboarding", status: "todo" as Status },
    { id: "b", title: "Wire up auth", status: "doing" as Status },
    { id: "c", title: "Write changelog", status: "done" as Status },
    { id: "d", title: "Pricing page copy", status: "todo" as Status },
  ]);
  const [draft, setDraft] = useState("");
  const next: Record<Status, Status> = { todo: "doing", doing: "done", done: "todo" };
  return (
    <div className="space-y-3 p-4">
      <form onSubmit={(e) => { e.preventDefault(); if (!draft.trim()) return; setTasks((t) => [...t, { id: crypto.randomUUID(), title: draft, status: "todo" }]); log(`Task created: ${draft}`); setDraft(""); }} className="flex gap-2">
        <input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="New task…" className="flex-1 rounded-lg border border-pv-border bg-pv-surface px-3 py-2 text-sm outline-none" />
        <button className="rounded-lg bg-pv-accent px-3 text-sm text-pv-accent-fg">Add</button>
      </form>
      <div className="grid gap-3 sm:grid-cols-3">
        {(["todo", "doing", "done"] as Status[]).map((s) => (
          <section key={s} data-inspect="Column" className="rounded-xl border border-pv-border bg-pv-surface p-3">
            <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-pv-muted">{s} · {tasks.filter((t) => t.status === s).length}</h2>
            {tasks.filter((t) => t.status === s).map((t) => (
              <div key={t.id} data-inspect="TaskCard" className="mb-2 flex items-center justify-between rounded-lg border border-pv-border bg-pv-bg p-2.5 text-sm">
                <span className={s === "done" ? "line-through opacity-60" : ""}>{t.title}</span>
                <button aria-label="Move task" onClick={() => { setTasks((all) => all.map((x) => x.id === t.id ? { ...x, status: next[s] } : x)); log(`"${t.title}" → ${next[s]}`); }} className="rounded p-1 text-pv-accent hover:bg-pv-accent/10">
                  {s === "doing" ? <Check size={14} /> : <ArrowRight size={14} />}
                </button>
              </div>
            ))}
          </section>
        ))}
      </div>
    </div>
  );
}
