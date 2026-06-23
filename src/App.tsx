import { useState } from "react";
import { Boxes, Sigma } from "lucide-react";
import { Explorer } from "./LLMExplorer";
import ServingMath from "./ServingMath";

const PAGES = [
  { id: "explorer", label: "Explorer", sub: "how an LLM works", icon: Boxes, accent: "#38bdf8" },
  { id: "math", label: "Deep Dive", sub: "the math of serving", icon: Sigma, accent: "#f472b6" },
];

export default function App() {
  const [page, setPage] = useState<"explorer" | "math">("explorer");

  return (
    <div
      className="min-h-screen w-full bg-slate-900 text-slate-100"
      style={{ fontFamily: "ui-sans-serif, system-ui, sans-serif" }}
    >
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-lg font-bold tracking-tight">How an LLM Works</h1>
          <div className="flex gap-1 rounded-xl border border-slate-800 bg-slate-950 p-1">
            {PAGES.map((p) => {
              const Icon = p.icon;
              const on = page === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => setPage(p.id as "explorer" | "math")}
                  className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition-colors"
                  style={{
                    background: on ? p.accent + "22" : "transparent",
                    color: on ? "#fff" : "#94a3b8",
                    boxShadow: on ? `inset 0 0 0 1px ${p.accent}66` : "none",
                  }}
                >
                  <Icon size={15} style={{ color: p.accent }} />
                  <span className="font-medium">{p.label}</span>
                  <span className="hidden sm:inline text-[11px] text-slate-500">· {p.sub}</span>
                </button>
              );
            })}
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-5">
        {page === "explorer" ? <Explorer /> : <ServingMath />}
      </main>
    </div>
  );
}
