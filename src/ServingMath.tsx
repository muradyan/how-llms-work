import katex from "katex";
import { Youtube, FileText, GraduationCap, ExternalLink } from "lucide-react";

/* Summary of the Dwarkesh Podcast talk:
   "How GPT, Claude, and Gemini are actually trained and served" — Reiner Pope.
   A community study summary. All credit to Reiner Pope and the Dwarkesh Podcast.
   Formulas/constants/examples follow the published transcript + flashcards. */

const ACC = "#f472b6";
const C_COMPUTE = "#fbbf24"; // compute-bound
const C_MEM = "#38bdf8";     // weight fetch / memory
const C_KV = "#a78bfa";      // KV cache
const C_TOTAL = "#f472b6";   // total / envelope

/* ---------- math + layout primitives ---------- */

function Tex({ children, block = false }: { children: string; block?: boolean }) {
  const html = katex.renderToString(children, { displayMode: block, throwOnError: false });
  return (
    <span
      className={block ? "block my-1 overflow-x-auto" : ""}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

function Eq({ children }: { children: string }) {
  return (
    <div className="my-3 rounded-lg border border-slate-800 bg-slate-950 px-3 py-2.5 overflow-x-auto">
      <Tex block>{children}</Tex>
    </div>
  );
}

function Section({ n, title, children }: { n: string; title: string; children: any }) {
  return (
    <section className="mt-8 scroll-mt-20">
      <div className="flex items-baseline gap-2 mb-2">
        <span className="text-xs font-mono" style={{ color: ACC }}>{n}</span>
        <h2 className="text-lg font-bold text-slate-100">{title}</h2>
      </div>
      <div className="text-sm text-slate-300 leading-relaxed space-y-2">{children}</div>
    </section>
  );
}

function Example({ children, title = "Worked example" }: { children: any; title?: string }) {
  return (
    <div className="my-3 rounded-xl border p-3" style={{ borderColor: ACC + "55", background: ACC + "0d" }}>
      <div className="text-xs uppercase tracking-wide mb-1" style={{ color: ACC }}>{title}</div>
      <div className="text-sm text-slate-300 leading-relaxed space-y-1">{children}</div>
    </div>
  );
}

function KeyNum({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 text-center">
      <div className="text-xl font-bold" style={{ color: ACC }}>{value}</div>
      <div className="text-[11px] text-slate-400 mt-0.5 leading-tight">{label}</div>
    </div>
  );
}

function Figure({ title, caption, children }: { title: string; caption?: any; children: any }) {
  return (
    <figure className="my-4 rounded-xl border border-slate-800 bg-slate-950 p-3">
      <figcaption className="text-xs uppercase tracking-wide text-slate-500 mb-2">{title}</figcaption>
      {children}
      {caption && <div className="text-xs text-slate-500 mt-2 leading-relaxed">{caption}</div>}
    </figure>
  );
}

function Dot({ c }: { c: string }) {
  return <span className="inline-block w-2.5 h-2.5 rounded-sm align-middle mr-1" style={{ background: c }} />;
}

/* ---------- figures (schematic redraws of the chalkboard) ---------- */

const X0 = 44, X1 = 312, Y0 = 124, Y1 = 14;
const mx = (t: number) => X0 + (X1 - X0) * t;
const myFn = (v: number, vmax: number) => Y0 - (Y0 - Y1) * (v / vmax);
function poly(f: (t: number) => number, vmax: number, n = 48) {
  return Array.from({ length: n + 1 }, (_, i) => {
    const t = i / n;
    return `${mx(t).toFixed(1)},${myFn(f(t), vmax).toFixed(1)}`;
  }).join(" ");
}
function Axes({ xlabel, ylabel }: { xlabel: string; ylabel: string }) {
  return (
    <>
      <line x1={X0} y1={Y0} x2={X1} y2={Y0} stroke="#334155" />
      <line x1={X0} y1={Y0} x2={X0} y2={Y1} stroke="#334155" />
      <text x={X1} y={Y0 + 11} fontSize="9" fill="#64748b" textAnchor="end">{xlabel}</text>
      <text x={X0 - 2} y={Y1 - 4} fontSize="9" fill="#64748b" textAnchor="start">{ylabel}</text>
    </>
  );
}

function LatencyFig() {
  const vmax = 1.25;
  const compute = (t: number) => 0.08 + 1.0 * t;
  const mem = (t: number) => 0.55 + 0.16 * t;
  const total = (t: number) => Math.max(compute(t), mem(t));
  // crossover: 0.08 + t = 0.55 + 0.16t  -> 0.84t = 0.47 -> t≈0.56
  const xc = 0.56;
  return (
    <svg viewBox="0 0 330 140" className="w-full" style={{ maxHeight: 180 }}>
      <Axes xlabel="batch size →" ylabel="latency" />
      <line x1={X0} y1={myFn(0.55, vmax)} x2={X1} y2={myFn(0.55, vmax)} stroke="#475569" strokeDasharray="3 3" />
      <text x={X0 + 4} y={myFn(0.55, vmax) - 3} fontSize="8" fill="#94a3b8">latency floor (weight fetch)</text>
      <polyline points={poly(compute, vmax)} fill="none" stroke={C_COMPUTE} strokeWidth="1.5" />
      <polyline points={poly(mem, vmax)} fill="none" stroke={C_MEM} strokeWidth="1.5" />
      <polyline points={poly(total, vmax)} fill="none" stroke={C_TOTAL} strokeWidth="2.6" strokeLinejoin="round" />
      <line x1={mx(xc)} y1={Y0} x2={mx(xc)} y2={Y1} stroke="#475569" strokeDasharray="2 3" />
      <text x={mx(xc) + 3} y={Y1 + 8} fontSize="8" fill="#94a3b8">balance point</text>
    </svg>
  );
}

function CostBatchFig() {
  const vmax = 1.25;
  const floor = 0.22;
  const cost = (t: number) => Math.min(vmax, floor + 0.04 / Math.max(t, 0.03));
  return (
    <svg viewBox="0 0 330 140" className="w-full" style={{ maxHeight: 180 }}>
      <Axes xlabel="batch size →" ylabel="cost / token" />
      <line x1={X0} y1={myFn(floor, vmax)} x2={X1} y2={myFn(floor, vmax)} stroke="#475569" strokeDasharray="3 3" />
      <text x={X1 - 2} y={myFn(floor, vmax) - 3} fontSize="8" fill="#94a3b8" textAnchor="end">compute floor</text>
      <polyline points={poly(cost, vmax)} fill="none" stroke={C_TOTAL} strokeWidth="2.6" strokeLinejoin="round" />
      <line x1={mx(0.42)} y1={Y0} x2={mx(0.42)} y2={Y1} stroke="#475569" strokeDasharray="2 3" />
      <text x={mx(0.42) + 3} y={Y1 + 8} fontSize="8" fill="#94a3b8">B ≈ 300 / sparsity</text>
    </svg>
  );
}

function ContextCostFig() {
  const vmax = 1.25;
  const xc = 0.5;
  const cost = (t: number) => (t < xc ? 0.3 : 0.3 + 1.5 * (t - xc));
  return (
    <svg viewBox="0 0 330 140" className="w-full" style={{ maxHeight: 180 }}>
      <Axes xlabel="context length →" ylabel="cost / token" />
      <polyline points={poly(cost, vmax)} fill="none" stroke={C_TOTAL} strokeWidth="2.6" strokeLinejoin="round" />
      <line x1={mx(xc)} y1={Y0} x2={mx(xc)} y2={Y1} stroke="#475569" strokeDasharray="2 3" />
      <text x={mx(xc) + 3} y={Y1 + 8} fontSize="8" fill="#94a3b8">crossover ≈ 200K</text>
      <text x={mx(0.18)} y={myFn(0.3, vmax) - 5} fontSize="8" fill={C_COMPUTE}>compute-bound (flat)</text>
      <text x={mx(0.62)} y={myFn(0.95, vmax)} fontSize="8" fill={C_MEM}>memory-bound (rising)</text>
    </svg>
  );
}

function PipelineFig() {
  const P = 4, M = 5, T = P + M - 1; // stages, micro-batches, total steps
  const cw = 30, ch = 18, gx = 40, gy = 18;
  return (
    <svg viewBox={`0 0 ${gx + T * cw + 10} ${gy + P * ch + 14}`} className="w-full" style={{ maxHeight: 150 }}>
      {Array.from({ length: P }).map((_, s) => (
        <text key={"s" + s} x={gx - 4} y={gy + s * ch + ch / 2 + 3} fontSize="8" fill="#94a3b8" textAnchor="end">stage {s + 1}</text>
      ))}
      {Array.from({ length: P }).map((_, s) =>
        Array.from({ length: T }).map((_, t) => {
          const active = t >= s && t < s + M;
          return (
            <rect key={s + "-" + t} x={gx + t * cw} y={gy + s * ch} width={cw - 2} height={ch - 2} rx="2"
              fill={active ? ACC : "#1e293b"} fillOpacity={active ? 0.85 : 1}
              stroke={active ? "none" : "#334155"} strokeWidth="0.5" />
          );
        })
      )}
      <text x={gx} y={gy + P * ch + 11} fontSize="8" fill="#64748b">time →</text>
      <text x={gx + T * cw + 8} y={gy + 10} fontSize="8" fill="#64748b" textAnchor="end"> </text>
    </svg>
  );
}

function MeshFig() {
  const n = 8, cx = 90, cy = 70, r = 52;
  const pos = Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2 - Math.PI / 2;
    return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
  });
  const lines: any[] = [];
  for (let i = 0; i < n; i++)
    for (let j = i + 1; j < n; j++)
      lines.push(<line key={i + "-" + j} x1={pos[i].x} y1={pos[i].y} x2={pos[j].x} y2={pos[j].y} stroke={ACC} strokeOpacity="0.18" strokeWidth="0.8" />);
  return (
    <svg viewBox="0 0 180 140" className="w-full" style={{ maxHeight: 150 }}>
      {lines}
      {pos.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r="9" fill="#0f172a" stroke={ACC} strokeWidth="1.2" />
          <text x={p.x} y={p.y + 3} fontSize="7" fill="#cbd5e1" textAnchor="middle">G{i + 1}</text>
        </g>
      ))}
      <text x={cx} y={cy + 3} fontSize="8" fill="#64748b" textAnchor="middle">all-to-all</text>
    </svg>
  );
}

/* ---------- the page ---------- */

export default function ServingMath() {
  return (
    <div>
      {/* header / attribution */}
      <div className="rounded-2xl border p-4 sm:p-5" style={{ borderColor: ACC + "44", background: ACC + "0d" }}>
        <h1 className="text-xl font-bold text-slate-100">The math behind how LLMs are trained and served</h1>
      </div>

      <Section n="01" title="The roofline model: time = max(compute, memory)">
        <p>
          Every forward pass through a transformer is bounded by two resources — moving bytes (memory
          bandwidth) and doing math (compute). The actual time is the larger of the two:
        </p>
        <Eq>{String.raw`T \;=\; \max\!\left(t_{\text{compute}},\; t_{\text{mem}}\right)`}</Eq>
        <p>
          The compute term scales with how many tokens you process; the memory term is loading the weights plus
          the <b className="text-slate-200">KV cache</b> — the Key and Value vectors the model stores for every
          token it has already seen, so it can attend to them without recomputing them each step (see the
          Explorer's Inference panel):
        </p>
        <Eq>{String.raw`t_{\text{compute}} = \frac{B \cdot N_{\text{active}}}{\text{FLOPs}} \qquad t_{\text{mem}} = \frac{N_{\text{total}} + B \cdot \text{len}_{\text{ctx}} \cdot \text{KV}_{\text{bytes}}}{\text{mem\_bw}}`}</Eq>
        <p>
          where <Tex>{String.raw`B`}</Tex> is the <b className="text-slate-200">batch size</b> — how many tokens
          (from many different users' requests) the GPU processes together in one pass, reusing the same weight
          fetch for all of them — <Tex>{String.raw`N_{\text{active}}`}</Tex> the active parameters, and{" "}
          <Tex>{String.raw`N_{\text{total}}`}</Tex> the total. Almost everything else — batching, MoE layout,
          pipelining, API price tiers — is a corollary of which term dominates.
        </p>
        <Figure
          title="Figure · latency vs batch size"
          caption={<><Dot c={C_COMPUTE} />compute&nbsp;&nbsp;<Dot c={C_MEM} />memory (weights + KV)&nbsp;&nbsp;<Dot c={C_TOTAL} />total = max. At small batch the weight fetch dominates → a hard latency floor; past the balance point, compute dominates and latency rises.</>}>
          <LatencyFig />
        </Figure>
      </Section>

      <Section n="02" title="The magic constant: arithmetic intensity ≈ 300">
        <p>
          Set the two terms equal (the "balanced" point where you're neither wasting compute nor bandwidth).
          The hardware ratio that pops out is <Tex>{String.raw`\text{FLOPs}/\text{mem\_bw}`}</Tex>. Made
          dimensionless by accounting for bytes per operation (an FP4 multiply is half a byte), it lands around
          the same number on essentially every modern GPU:
        </p>
        <div className="grid grid-cols-3 gap-2 my-3">
          <KeyNum value="≈ 300" label="FLOPs : memory-bandwidth ratio" />
          <KeyNum value="15–20 ms" label="GPU memory capacity ÷ bandwidth (one full sweep)" />
          <KeyNum value="scale-up size" label="GPUs reachable at full NVLink bandwidth" />
        </div>
        <p>
          These three hardware-derived constants anchor every decision below. The ~300 has stayed remarkably
          stable from A100 → H100 → B100: FLOPs grew, bandwidth grew, the ratio barely moved.
        </p>
      </Section>

      <Section n="03" title="Required batch size: B ≥ 300 / sparsity">
        <p>Solving "compute time = weight-fetch time" for the batch size gives the minimum batch you must serve to keep the GPU busy:</p>
        <Eq>{String.raw`B \;=\; \frac{\text{FLOPs}}{\text{mem\_bw}} \cdot \frac{N_{\text{total}}}{N_{\text{active}}} \;=\; 300 \cdot \frac{1}{\text{sparsity}}`}</Eq>
        <p>
          Compute scales with <Tex>{String.raw`B`}</Tex> (every token needs its own matmul) while the weights
          are fetched once and reused — so below this batch you're just waiting on memory.
        </p>
        <Example>
          <p><b className="text-slate-200">DeepSeek V3</b> activates 32 of 256 experts → sparsity = 8.</p>
          <p><Tex>{String.raw`B \ge 300 \times 8 = 2{,}400`}</Tex> tokens (in practice 2–3× that). This is why serving is a batching game.</p>
        </Example>
        <Figure
          title="Figure · cost per token vs batch size"
          caption="Dividing latency by batch turns the weight fetch into a 1/B hyperbola: cost is enormous at batch 1 and falls to a compute floor. A patient 'slow mode' can't go below that floor — once weights are amortized across a full batch, you're done.">
          <CostBatchFig />
        </Figure>
      </Section>

      <Section n="04" title="The ~20 ms 'train' and how fast you can serve">
        <p>
          A second constant comes from <b className="text-slate-200">HBM</b> — the High-Bandwidth Memory stacked
          on the GPU that holds the weights and KV cache. Its capacity ÷ bandwidth is how long it takes to read
          every weight once — like a train that departs on a fixed schedule. Miss it and the FLOPs sit idle.
        </p>
        <Eq>{String.raw`t_{\text{sweep}} = \frac{\text{HBM capacity}}{\text{mem\_bw}} \approx 15\text{–}20\,\text{ms} \qquad \text{(Rubin: } 288\,\text{GB} / 20\,\text{TB/s} \approx 15\,\text{ms)}`}</Eq>
        <Example title="Back-of-envelope throughput">
          <p>One rack at batch ≈ 2,000, ~64 layers worth of work per sweep → on the order of <Tex>{String.raw`2{,}000 \times 64 \approx 128{,}000`}</Tex> tokens/sec.</p>
          <p>Gemini reportedly serves <i>hundreds of millions</i> of tokens/sec — so a single rack is roughly one-thousandth of Gemini. To compete you need at least ~1/1000 of that fleet.</p>
        </Example>
      </Section>

      <Section n="05" title="Mixture of Experts maps onto a GPU rack">
        <p>
          A sparse MoE layer routes each token to a few experts living on different GPUs, so the traffic is
          <b className="text-slate-200"> all-to-all</b>: any GPU's tokens may need any GPU's experts. Nvidia's
          rack design — GPUs around central NVLink switches, a full mesh in two hops — is a near-perfect fit.
        </p>
        <Figure
          title="Figure · all-to-all within a rack"
          caption="Within a rack, NVLink (scale-up) gives full bandwidth between all GPUs. Crossing racks (scale-out) is ~8× slower and becomes the bottleneck — so one rack is the natural size of an expert layer.">
          <MeshFig />
        </Figure>
        <p>
          On a Blackwell NVL72 (72 GPUs, ~64 used), DeepSeek's 256 experts land ~4 per GPU. Total parameters
          are limited by the scale-up domain size; active parameters by compute. DeepSeek's innovation:
          more, finer-grained experts.
        </p>
      </Section>

      <Section n="06" title="Pipeline parallelism — and why it 'is not wise'">
        <p>
          Pipelining splits the model's layers across stages. It saves weight memory, but it introduces
          <b className="text-slate-200"> bubbles</b> (idle GPUs while the pipeline fills and drains) and,
          crucially, it does <i>not</i> shrink the KV cache:
        </p>
        <Eq>{String.raw`\text{per-GPU mem} = \frac{N_{\text{total}} + B \cdot \text{len}_{\text{ctx}} \cdot \text{KV}_{\text{bytes}}}{E \cdot P}`}</Eq>
        <p>
          Keeping <Tex>{String.raw`P`}</Tex> stages busy needs <Tex>{String.raw`P`}</Tex> micro-batches in
          flight, so the in-flight sequences grow with <Tex>{String.raw`P`}</Tex> and the KV term cancels.
          Since KV cache dominates memory at long context, pipelining's benefit is limited — and it adds
          architecture constraints that slow research iteration. Hence Ilya's "as we now know, pipelining is
          not wise."
        </p>
        <Figure
          title="Figure · pipeline bubbles"
          caption="Each row is a pipeline stage, each column a time step. Filled = computing, empty = idle bubble. The triangles at the start and end are wasted GPU time.">
          <PipelineFig />
        </Figure>
      </Section>

      <Section n="07" title="The 6ND formula and ~100× over-training">
        <p>
          Training compute is the famous <b className="text-slate-200">6ND</b>: 2 FLOPs per parameter per token
          for the forward pass (a multiply + an add), and the backward pass costs 2× that (gradients w.r.t.
          both input matrices), so <Tex>{String.raw`2 + 4 = 6`}</Tex>. Total compute splits three ways:
        </p>
        <Eq>{String.raw`C_{\text{total}} = \underbrace{6\,N_{\text{active}}\,D_{\text{pretrain}}}_{\text{pre-train}} \;+\; \underbrace{C_{\text{RL}}}_{\text{RL}} \;+\; \underbrace{2\,N_{\text{active}}\,D_{\text{inference}}}_{\text{inference}}`}</Eq>
        <p>
          If those costs trade off, the optimum is roughly where they're equal — which (accounting for decode
          running at ~⅓ the efficiency of prefill) implies the <i>token counts</i> are comparable:
        </p>
        <Eq>{String.raw`D_{\text{pretrain}} \;\approx\; 1.5\,D_{\text{RL}} \;\approx\; D_{\text{inference}}`}</Eq>
        <Example>
          <p>~50M tokens/sec served × 2 months ≈ <Tex>{String.raw`50\text{M} \times 60 \times 86{,}400 \approx 200\text{T}`}</Tex> inference tokens, so pre-training is also ~150–200T tokens.</p>
          <p>Chinchilla-optimal is <Tex>{String.raw`D \approx 20 \cdot N_{\text{active}}`}</Tex>. With ~100B active → ~2T tokens. So today's models are <b className="text-slate-200">~100× over-trained</b> vs Chinchilla — worth it because it shrinks the model you then serve billions of times.</p>
        </Example>
      </Section>

      <Section n="08" title="Reading long-context prices off the menu">
        <p>
          Gemini charges ~<b className="text-slate-200">50% more</b> above 200K tokens. That's the crossover
          where KV-cache memory time overtakes compute time. Setting <Tex>{String.raw`t_{\text{compute}} = t_{\text{KV}}`}</Tex> lets
          you back out the KV size per token:
        </p>
        <Eq>{String.raw`\text{bytes/token} \;=\; \frac{1}{300} \cdot \frac{N_{\text{active}}}{\text{len}_{\text{ctx}}}`}</Eq>
        <Example title="Inferring a private number">
          <p>With <Tex>{String.raw`N_{\text{active}} \approx 100\text{B}`}</Tex> and <Tex>{String.raw`\text{len} = 200\text{K}`}</Tex> → <Tex>{String.raw`\approx 1.7\,\text{KB/token}`}</Tex> of KV cache — deduced purely from the price list.</p>
        </Example>
        <Figure
          title="Figure · cost per token vs context length"
          caption={<><Dot c={C_COMPUTE} />Below the crossover you're compute-bound, so marginal cost is flat. <Dot c={C_MEM} />Above it the KV cache grows and you're memory-bound, so cost rises linearly — the step-up in the price list.</>}>
          <ContextCostFig />
        </Figure>
        <p>
          Two corollaries from the same model: <b className="text-slate-200">output tokens cost 3–5× input</b>
          {" "}(prefill processes the whole prompt in parallel and amortizes the weight fetch; decode loads all
          the weights to make a single token), and <b className="text-slate-200">cache hits are ~10× cheaper</b>
          {" "}(reading stored KVs beats recomputing them). Pope is skeptical the long-context plateau breaks
          soon: "The HBM is where it is. It's not getting hugely better."
        </p>
      </Section>

      <Section n="09" title="A closing curiosity: neural nets ≈ cryptography">
        <p>
          Pope notes a convergent design: both ciphers and neural nets rely on <b className="text-slate-200">repeated
          rounds of mixing and scrambling</b> so that every output depends on every input — but to opposite
          ends. Cryptography turns structured data into something indistinguishable from random; a neural net
          extracts structure out of seemingly random data.
        </p>
      </Section>

      <Section n="10" title="Three numbers to remember">
        <div className="grid sm:grid-cols-3 gap-2 mt-1">
          <KeyNum value="≈ 300" label="FLOPs : memory-bandwidth → sets the required batch (÷ sparsity)" />
          <KeyNum value="15–20 ms" label="HBM capacity : bandwidth → the serving 'clock'" />
          <KeyNum value="1 rack" label="scale-up domain → bounds the size of an expert layer" />
        </div>
        <p className="mt-3">
          Anchor any inference decision to these and most of the labs' choices — pricing tiers, rack design,
          over-training, context limits — stop looking arbitrary.
        </p>
      </Section>

      <div className="mt-8 text-xs text-slate-500 border-t border-slate-800 pt-4">
        Summary of <a className="underline hover:text-slate-300" href="https://www.youtube.com/watch?v=xmkSf5IS-zw" target="_blank" rel="noreferrer">
        "How GPT, Claude, and Gemini are actually trained and served"</a> by Reiner Pope, Dwarkesh Podcast.
        Errors in this summary are mine, not the speaker's.
      </div>
    </div>
  );
}
