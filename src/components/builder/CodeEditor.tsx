import { useRef } from "react";

const RE = /(\/\/.*$|\/\*[\s\S]*?\*\/)|("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)|\b(import|from|export|default|function|return|const|let|interface|type|if|else|null|true|false|useState|useMemo|as)\b|(<\/?[A-Za-z][\w.]*)|\b(\d+(?:\.\d+)?)\b/gm;

function highlight(code: string) {
  const out: React.ReactNode[] = [];
  let last = 0;
  let k = 0;
  for (const m of code.matchAll(RE)) {
    const i = m.index ?? 0;
    if (i > last) out.push(code.slice(last, i));
    const cls = m[1] ? "text-syn-comment italic" : m[2] ? "text-syn-string" : m[3] ? "text-syn-keyword" : m[4] ? "text-syn-tag" : "text-syn-number";
    out.push(<span key={k++} className={cls}>{m[0]}</span>);
    last = i + m[0].length;
  }
  out.push(code.slice(last));
  return out;
}

export function CodeEditor({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const pre = useRef<HTMLPreElement>(null);
  const lines = value.split("\n").length;
  const shared = "m-0 whitespace-pre p-4 font-mono text-[12.5px] leading-6";
  return (
    <div className="flex h-full overflow-hidden bg-code-bg">
      <div className="select-none border-r border-border py-4 pl-3 pr-2 text-right font-mono text-[12.5px] leading-6 text-muted-foreground/50">
        {Array.from({ length: lines }, (_, i) => <div key={i}>{i + 1}</div>)}
      </div>
      <div className="relative flex-1 overflow-hidden">
        <pre ref={pre} aria-hidden className={`${shared} pointer-events-none absolute inset-0 overflow-hidden text-foreground`}>
          {highlight(value)}{"\n"}
        </pre>
        <textarea
          spellCheck={false}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onScroll={(e) => { if (pre.current) { pre.current.scrollTop = e.currentTarget.scrollTop; pre.current.scrollLeft = e.currentTarget.scrollLeft; } }}
          className={`${shared} absolute inset-0 h-full w-full resize-none overflow-auto bg-transparent text-transparent caret-accent outline-none`}
          aria-label="Code editor"
        />
      </div>
    </div>
  );
}
