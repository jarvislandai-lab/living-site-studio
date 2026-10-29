export type AppKind = "dashboard" | "store" | "kanban";
export type Theme = "violet" | "emerald" | "cyan" | "rose" | "amber";
export type ModelId = "gemini-3.5-flash" | "claude-3.5-sonnet" | "gpt-4o";

export interface AppSpec {
  kind: AppKind;
  theme: Theme;
  dark: boolean;
  title: string;
}

export const MODELS: { id: ModelId; label: string }[] = [
  { id: "gemini-3.5-flash", label: "Gemini 3.5 Flash" },
  { id: "claude-3.5-sonnet", label: "Claude 3.5 Sonnet" },
  { id: "gpt-4o", label: "GPT-4o" },
];

export const TEMPLATES: { label: string; prompt: string }[] = [
  { label: "SaaS Analytics Dashboard", prompt: "Build a SaaS analytics dashboard" },
  { label: "E-Commerce Storefront", prompt: "Build an e-commerce storefront with cart" },
  { label: "Kanban Board", prompt: "Build a kanban board for my team" },
];

export const STEPS = ["Parsing Prompt", "Generating Component Tree", "Applying CSS", "Compiling Preview"];

const THEME_WORDS: [RegExp, Theme][] = [
  [/emerald|green/, "emerald"],
  [/cyan|blue|teal/, "cyan"],
  [/rose|pink|red/, "rose"],
  [/amber|orange|yellow|gold/, "amber"],
  [/violet|purple/, "violet"],
];

const DEFAULT_TITLES: Record<AppKind, string> = {
  dashboard: "Pulse Analytics",
  store: "Nova Store",
  kanban: "FlowBoard",
};

/** Interpret a prompt against the current spec; returns the next spec and a summary. */
export function interpretPrompt(prompt: string, current: AppSpec): { spec: AppSpec; changes: string[] } {
  const p = prompt.toLowerCase();
  const spec = { ...current };
  const changes: string[] = [];
  let kind: AppKind | null = null;
  if (/kanban|board|task/.test(p)) kind = "kanban";
  else if (/shop|store|commerce|cart|product/.test(p)) kind = "store";
  else if (/dashboard|analytics|saas|metric/.test(p)) kind = "dashboard";
  if (kind && kind !== spec.kind) {
    spec.kind = kind;
    spec.title = DEFAULT_TITLES[kind];
    changes.push(`Switched to ${kind} app`);
  }
  for (const [re, t] of THEME_WORDS) {
    if (re.test(p)) {
      spec.theme = t;
      changes.push(`Applied ${t} theme`);
      break;
    }
  }
  if (/\blight\b/.test(p)) { spec.dark = false; changes.push("Light mode"); }
  if (/\bdark\b/.test(p)) { spec.dark = true; changes.push("Dark mode"); }
  const named = prompt.match(/(?:called|named|title)\s+["']?([\w\s-]{2,30}?)["']?(?:$|[.,!])/i);
  if (named) { spec.title = named[1].trim(); changes.push(`Renamed to "${spec.title}"`); }
  if (!changes.length) changes.push("Refined layout and spacing");
  return { spec, changes };
}

export type FileMap = Record<string, string>;

export function generateFiles(s: AppSpec): FileMap {
  const common: FileMap = {
    "/src/App.tsx": `import { Navbar } from "./components/Navbar";
import { ${pageName(s.kind)} } from "./pages/${pageName(s.kind)}";
import "./styles.css";

export default function App() {
  const [dark, setDark] = useState(${s.dark});
  return (
    <div className={\`theme-${s.theme} \${dark ? "dark" : ""}\`}>
      <Navbar title="${s.title}" onToggleTheme={() => setDark(!dark)} />
      <${pageName(s.kind)} />
    </div>
  );
}
`,
    "/src/components/Navbar.tsx": `interface NavbarProps {
  title: string;
  onToggleTheme: () => void;
}

export function Navbar({ title, onToggleTheme }: NavbarProps) {
  return (
    <nav className="flex items-center justify-between border-b px-6 py-4">
      <span className="font-bold">{title}</span>
      <button onClick={onToggleTheme} aria-label="Toggle theme">
        <Moon size={18} />
      </button>
    </nav>
  );
}
`,
    "/src/styles.css": `:root {
  --accent: var(--${s.theme}-500);
  --radius: 0.75rem;
}
.dark {
  --bg: #16161e;
  --fg: #f1f1f5;
}
`,
    "/src/types.ts": typesFor(s.kind),
  };
  if (s.kind === "store") {
    Object.assign(common, {
      "/src/pages/Storefront.tsx": `import { Hero } from "../components/Hero";
import { FeatureGrid } from "../components/FeatureGrid";
import { CartDrawer } from "../components/CartDrawer";
import type { Product } from "../types";

export function Storefront() {
  const [cart, setCart] = useState<Product[]>([]);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const visible = PRODUCTS.filter((p) =>
    p.name.toLowerCase().includes(query.toLowerCase())
  );
  return (
    <main>
      <Hero onShop={() => setOpen(true)} />
      <input value={query} onChange={(e) => setQuery(e.target.value)} />
      <FeatureGrid products={visible} onAdd={(p) => setCart([...cart, p])} />
      <CartDrawer open={open} items={cart} onClose={() => setOpen(false)} />
    </main>
  );
}
`,
      "/src/components/Hero.tsx": `export function Hero({ onShop }: { onShop: () => void }) {
  return (
    <section className="py-16 text-center">
      <h1 className="text-4xl font-bold">Objects for slow living</h1>
      <button onClick={onShop}>Shop now</button>
    </section>
  );
}
`,
      "/src/components/FeatureGrid.tsx": `import type { Product } from "../types";

export function FeatureGrid({ products, onAdd }: {
  products: Product[];
  onAdd: (p: Product) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
      {products.map((p) => (
        <article key={p.id}>
          <h3>{p.name}</h3>
          <p>\${p.price}</p>
          <button onClick={() => onAdd(p)}>Add to cart</button>
        </article>
      ))}
    </div>
  );
}
`,
      "/src/components/CartDrawer.tsx": `import type { Product } from "../types";

export function CartDrawer({ open, items, onClose }: {
  open: boolean;
  items: Product[];
  onClose: () => void;
}) {
  if (!open) return null;
  const total = items.reduce((sum, p) => sum + p.price, 0);
  return (
    <aside className="fixed right-0 top-0 h-full w-80">
      <button onClick={onClose}>Close</button>
      {items.map((p, i) => <div key={i}>{p.name}</div>)}
      <strong>Total: \${total}</strong>
    </aside>
  );
}
`,
    });
  } else if (s.kind === "dashboard") {
    Object.assign(common, {
      "/src/pages/Dashboard.tsx": `import { StatCard } from "../components/StatCard";
import { RevenueChart } from "../components/RevenueChart";
import type { Metric } from "../types";

const METRICS: Metric[] = [
  { label: "MRR", value: "$48.2k", delta: 12.4 },
  { label: "Active users", value: "8,931", delta: 4.1 },
  { label: "Churn", value: "2.3%", delta: -0.6 },
];

export function Dashboard() {
  const [range, setRange] = useState<"7d" | "30d" | "90d">("30d");
  return (
    <main className="space-y-6 p-6">
      <RangePicker value={range} onChange={setRange} />
      <div className="grid gap-4 md:grid-cols-3">
        {METRICS.map((m) => <StatCard key={m.label} metric={m} />)}
      </div>
      <RevenueChart range={range} />
    </main>
  );
}
`,
      "/src/components/StatCard.tsx": `import type { Metric } from "../types";

export function StatCard({ metric }: { metric: Metric }) {
  return (
    <div className="rounded-xl border p-4">
      <p className="text-sm opacity-60">{metric.label}</p>
      <p className="text-2xl font-bold">{metric.value}</p>
      <span>{metric.delta > 0 ? "▲" : "▼"} {Math.abs(metric.delta)}%</span>
    </div>
  );
}
`,
      "/src/components/RevenueChart.tsx": `export function RevenueChart({ range }: { range: string }) {
  const bars = useMemo(() => generateSeries(range), [range]);
  return (
    <div className="flex h-48 items-end gap-1">
      {bars.map((h, i) => (
        <div key={i} style={{ height: \`\${h}%\` }} className="flex-1 rounded-t bg-accent" />
      ))}
    </div>
  );
}
`,
    });
  } else {
    Object.assign(common, {
      "/src/pages/Board.tsx": `import { Column } from "../components/Column";
import type { Task, Status } from "../types";

export function Board() {
  const [tasks, setTasks] = useState<Task[]>(SEED_TASKS);
  const move = (id: string, to: Status) =>
    setTasks((t) => t.map((x) => (x.id === id ? { ...x, status: to } : x)));
  return (
    <main className="grid gap-4 p-6 md:grid-cols-3">
      {(["todo", "doing", "done"] as Status[]).map((s) => (
        <Column key={s} status={s} tasks={tasks.filter((t) => t.status === s)} onMove={move} />
      ))}
    </main>
  );
}
`,
      "/src/components/Column.tsx": `import { TaskCard } from "./TaskCard";
import type { Task, Status } from "../types";

export function Column({ status, tasks, onMove }: {
  status: Status;
  tasks: Task[];
  onMove: (id: string, to: Status) => void;
}) {
  return (
    <section className="rounded-xl border p-3">
      <h2 className="mb-2 font-semibold capitalize">{status}</h2>
      {tasks.map((t) => <TaskCard key={t.id} task={t} onMove={onMove} />)}
    </section>
  );
}
`,
      "/src/components/TaskCard.tsx": `import type { Task, Status } from "../types";

export function TaskCard({ task, onMove }: {
  task: Task;
  onMove: (id: string, to: Status) => void;
}) {
  return (
    <div className="mb-2 rounded-lg border p-3">
      <p>{task.title}</p>
      <button onClick={() => onMove(task.id, "done")}>Complete</button>
    </div>
  );
}
`,
    });
  }
  return common;
}

function pageName(k: AppKind) {
  return k === "store" ? "Storefront" : k === "dashboard" ? "Dashboard" : "Board";
}

function typesFor(k: AppKind) {
  if (k === "store")
    return `export interface Product {\n  id: string;\n  name: string;\n  price: number;\n  category: string;\n}\n`;
  if (k === "dashboard")
    return `export interface Metric {\n  label: string;\n  value: string;\n  delta: number;\n}\n`;
  return `export type Status = "todo" | "doing" | "done";\n\nexport interface Task {\n  id: string;\n  title: string;\n  status: Status;\n  tag?: string;\n}\n`;
}

export const DEFAULT_SPEC: AppSpec = { kind: "store", theme: "violet", dark: false, title: "Nova Store" };
