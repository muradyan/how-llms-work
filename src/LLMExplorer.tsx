import { useState, useEffect, useMemo } from "react";
import {
  Brain, Layers, Eye, Cpu, Play, Pause, SkipForward, RotateCcw,
  ChevronDown, Database, Sparkles, ArrowRight, Check, Repeat,
  SlidersHorizontal, Network, Server, Clock, Coins
} from "lucide-react";

const ACCENTS = {
  pre: "#38bdf8", post: "#a78bfa", attn: "#fbbf24", inf: "#34d399",
  params: "#f472b6", moe: "#22d3ee",
};

/* ---------- shared bits ---------- */

function Controls({ playing, setPlaying, onStep, onReset, accent }) {
  const btn = "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors";
  return (
    <div className="flex flex-wrap items-center gap-2 mt-4">
      <button
        onClick={() => setPlaying((p) => !p)}
        className={btn + " text-slate-900"}
        style={{ background: accent }}
      >
        {playing ? <Pause size={15} /> : <Play size={15} />}
        {playing ? "Pause" : "Play"}
      </button>
      <button onClick={onStep} className={btn + " bg-slate-700 text-slate-100 hover:bg-slate-600"}>
        <SkipForward size={15} /> Step
      </button>
      <button onClick={onReset} className={btn + " bg-slate-800 text-slate-300 hover:bg-slate-700"}>
        <RotateCcw size={15} /> Reset
      </button>
    </div>
  );
}

function UnderHood({ accent, children }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-5 border-t border-slate-800 pt-3">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 text-xs font-semibold tracking-wide uppercase text-slate-400 hover:text-slate-200"
      >
        <ChevronDown size={14} style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform .2s" }} />
        Under the hood
      </button>
      {open && <div className="mt-3 text-sm text-slate-400 leading-relaxed space-y-2">{children}</div>}
    </div>
  );
}

function Caption({ children }) {
  return <p className="text-sm text-slate-400 leading-relaxed mt-3">{children}</p>;
}

function Chip({ text, lit, color, dim, pulse }: {
  text: string; lit?: boolean; color?: string; dim?: boolean; pulse?: boolean;
}) {
  return (
    <span
      className="inline-flex items-center justify-center px-2 py-1 rounded-md text-xs font-medium border transition-all"
      style={{
        borderColor: lit ? color : "#334155",
        background: lit ? color + "22" : "#1e293b",
        color: lit ? "#e2e8f0" : dim ? "#475569" : "#94a3b8",
        boxShadow: pulse ? `0 0 0 2px ${color}` : "none",
        opacity: dim ? 0.5 : 1,
      }}
    >
      {text}
    </span>
  );
}

function useTicker(playing, ms, fn) {
  useEffect(() => {
    if (!playing) return;
    const id = setInterval(fn, ms);
    return () => clearInterval(id);
    // eslint-disable-next-line
  }, [playing, ms]);
}

/* ---------- Stage 1: Pre-training ---------- */

const BATCH = [
  ["The", "sun", "rises", "in", "the", "east", "."],
  ["A", "dog", "barks", "at", "the", "moon", "."],
  ["She", "reads", "books", "every", "single", "night", "."],
  ["We", "walked", "along", "the", "river", "bank", "."],
];
const T = 7;

function lossAt(k) {
  return 0.55 + 3.9 * Math.exp(-k / 16) + 0.12 * Math.sin(k * 0.9) / (1 + k * 0.05);
}

function Pretraining({ accent }) {
  const [playing, setPlaying] = useState(true);
  const [step, setStep] = useState(0);
  useTicker(playing, 750, () => setStep((s) => s + 1));

  const col = 1 + (step % (T - 1));
  const losses = useMemo(() => {
    const arr: { k: number; v: number }[] = [];
    for (let k = Math.max(0, step - 34); k <= step; k++) arr.push({ k, v: lossAt(k) });
    return arr;
  }, [step]);
  const cur = lossAt(step);

  const W = 360, H = 90;
  const minK = losses[0]?.k ?? 0, maxK = losses[losses.length - 1]?.k ?? 1;
  const xs = (k) => (maxK === minK ? 0 : ((k - minK) / (maxK - minK)) * W);
  const ys = (v) => H - ((v - 0.5) / 4.2) * H;
  const path = losses.map((p, i) => `${i ? "L" : "M"}${xs(p.k).toFixed(1)} ${ys(p.v).toFixed(1)}`).join(" ");

  return (
    <div>
      <Caption>
        The model reads enormous amounts of text and learns one skill: <b className="text-slate-200">predict the
        next token</b>. Many sequences are processed together in a <b className="text-slate-200">batch</b>, in
        parallel. Each wrong guess produces a loss; the loss nudges the weights. Repeat billions of times.
      </Caption>

      <div className="mt-4 grid gap-5 md:grid-cols-2">
        {/* batch grid */}
        <div>
          <div className="text-xs uppercase tracking-wide text-slate-500 mb-2">Batch of 4 sequences · processed at once</div>
          <div className="space-y-1.5">
            {BATCH.map((seq, r) => (
              <div key={r} className="flex items-center gap-1.5">
                <span className="text-[10px] text-slate-600 w-4 shrink-0">{r + 1}</span>
                <div className="flex flex-wrap gap-1">
                  {seq.map((tok, c) => (
                    <Chip
                      key={c}
                      text={tok}
                      color={accent}
                      lit={c < col}
                      pulse={c === col}
                      dim={c > col}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
          <Caption>
            Lit tokens = context the model can see. The <span style={{ color: accent }}>outlined</span> token is what
            it must predict — for every sequence in the batch simultaneously.
          </Caption>
        </div>

        {/* loss + step */}
        <div>
          <div className="flex items-baseline justify-between mb-2">
            <div className="text-xs uppercase tracking-wide text-slate-500">Training loss</div>
            <div className="text-xs text-slate-400">step <b className="text-slate-200">{step}</b></div>
          </div>
          <div className="rounded-lg bg-slate-950 border border-slate-800 p-3">
            <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 90 }}>
              <line x1="0" y1={H} x2={W} y2={H} stroke="#1e293b" />
              <path d={path} fill="none" stroke={accent} strokeWidth="2" strokeLinejoin="round" />
              {losses.length > 0 && (
                <circle cx={xs(maxK)} cy={ys(cur)} r="3.5" fill={accent} />
              )}
            </svg>
            <div className="flex items-center justify-between mt-2 text-xs">
              <span className="text-slate-500">loss</span>
              <span className="font-mono" style={{ color: accent }}>{cur.toFixed(3)}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-3 text-xs text-slate-400">
            <Sparkles size={14} style={{ color: accent }} />
            <span>Each step: predict → measure error → update weights a tiny bit.</span>
          </div>
        </div>
      </div>

      <Controls
        playing={playing} setPlaying={setPlaying} accent={accent}
        onStep={() => { setPlaying(false); setStep((s) => s + 1); }}
        onReset={() => { setStep(0); }}
      />

      <UnderHood accent={accent}>
        <p>
          The objective is <span className="font-mono text-slate-300">−log P(next token | previous tokens)</span>,
          averaged over the batch. Batching isn't just convenience — GPUs are fastest when doing the same matrix
          multiply over many examples at once, so a batch of (sequences × tokens) flows through the network as big
          tensors.
        </p>
        <p>This stage produces a <i>base model</i>: fluent, knowledgeable, but not yet good at following instructions.</p>
      </UnderHood>
    </div>
  );
}

/* ---------- Stage 2: Post-training ---------- */

const PHASES = [
  {
    name: "SFT",
    full: "Supervised fine-tuning",
    blurb: "Show the base model thousands of example (instruction → ideal answer) pairs. It learns the format and habit of being helpful.",
  },
  {
    name: "Reward",
    full: "Preference modeling",
    blurb: "Show humans (or a model) which of two answers is better. A reward model learns to score responses the way people would.",
  },
  {
    name: "RLHF",
    full: "Reinforcement learning",
    blurb: "The model proposes answers, the reward model scores them, and the policy is nudged toward higher-scoring behavior.",
  },
];

const SFT_EX = [
  { p: "Explain gravity to a child.", r: "Gravity is the gentle pull that keeps your feet on the ground…" },
  { p: "Write a haiku about rain.", r: "Soft taps on the roof / silver threads stitch earth to sky / puddles hold the clouds" },
  { p: "What's 15% of 80?", r: "15% of 80 is 12." },
];
const PREF = { p: "Should I touch a hot stove?", a: "Sure, go for it!", b: "No — it can cause serious burns. Please don't.", win: "b" };

function Posttraining({ accent }) {
  const [playing, setPlaying] = useState(true);
  const [phase, setPhase] = useState(0);
  const [tick, setTick] = useState(0);
  useTicker(playing, 1800, () => setTick((t) => t + 1));
  const ex = SFT_EX[tick % SFT_EX.length];

  return (
    <div>
      <Caption>
        The base model knows a lot but rambles. Post-training <b className="text-slate-200">shapes</b> it into a
        helpful assistant using much smaller, curated data — in three classic phases.
      </Caption>

      {/* pipeline */}
      <div className="flex items-center gap-1 mt-4 flex-wrap">
        <PipeNode label="Base model" active={false} accent={accent} faded />
        <ArrowRight size={16} className="text-slate-600 shrink-0" />
        {PHASES.map((ph, i) => (
          <div key={ph.name} className="flex items-center gap-1">
            <button onClick={() => setPhase(i)}>
              <PipeNode label={ph.name} active={phase === i} accent={accent} />
            </button>
            <ArrowRight size={16} className="text-slate-600 shrink-0" />
          </div>
        ))}
        <PipeNode label="Aligned model" active={false} accent={accent} />
      </div>

      <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950 p-4">
        <div className="text-sm font-semibold text-slate-200">{PHASES[phase].full}</div>
        <Caption>{PHASES[phase].blurb}</Caption>

        <div className="mt-4">
          {phase === 0 && (
            <div className="space-y-2">
              <Bubble role="Instruction" text={ex.p} color="#475569" />
              <Bubble role="Ideal answer (taught)" text={ex.r} color={accent} />
              <div className="text-xs text-slate-500 flex items-center gap-1.5 pt-1">
                <Repeat size={13} /> cycling through demonstration examples…
              </div>
            </div>
          )}
          {phase === 1 && (
            <div className="space-y-3">
              <Bubble role="Prompt" text={PREF.p} color="#475569" />
              <div className="grid sm:grid-cols-2 gap-2">
                <RankCard text={PREF.a} chosen={PREF.win === "a"} accent={accent} label="Response A" />
                <RankCard text={PREF.b} chosen={PREF.win === "b"} accent={accent} label="Response B" />
              </div>
              <div className="text-xs text-slate-500">The reward model learns: this kind of answer scores higher.</div>
            </div>
          )}
          {phase === 2 && (
            <div className="flex items-center justify-center gap-2 flex-wrap py-2 text-center">
              <Loop label="Policy" sub="generates" accent={accent} />
              <ArrowRight size={16} className="text-slate-600" />
              <Loop label="Reward model" sub="scores it" accent={accent} />
              <ArrowRight size={16} className="text-slate-600" />
              <Loop label="Update" sub="prefer high score" accent={accent} />
              <div className="w-full text-xs text-slate-500 mt-2 flex items-center justify-center gap-1.5">
                <Repeat size={13} /> the loop slowly aligns behavior with human preferences
              </div>
            </div>
          )}
        </div>
      </div>

      <Controls
        playing={playing} setPlaying={setPlaying} accent={accent}
        onStep={() => { setPlaying(false); setTick((t) => t + 1); }}
        onReset={() => { setTick(0); setPhase(0); }}
      />

      <UnderHood accent={accent}>
        <p>
          The base model's weights are barely moved here compared to pre-training — it's already capable. Post-training
          mostly <i>elicits and steers</i> existing abilities. Modern variants (DPO, RLAIF, etc.) fold the reward and
          RL steps together, but the intuition is the same: <span className="text-slate-300">teach format, then teach
          preference</span>.
        </p>
      </UnderHood>
    </div>
  );
}

function PipeNode({ label, active, accent, faded }: {
  label: string; active?: boolean; accent?: string; faded?: boolean;
}) {
  return (
    <span
      className="px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all"
      style={{
        borderColor: active ? accent : "#334155",
        background: active ? accent + "22" : "#1e293b",
        color: active ? "#e2e8f0" : faded ? "#64748b" : "#cbd5e1",
      }}
    >
      {label}
    </span>
  );
}
function Bubble({ role, text, color }) {
  return (
    <div className="rounded-lg p-2.5 border" style={{ borderColor: color + "55", background: color + "11" }}>
      <div className="text-[10px] uppercase tracking-wide mb-0.5" style={{ color }}>{role}</div>
      <div className="text-sm text-slate-200">{text}</div>
    </div>
  );
}
function RankCard({ text, chosen, accent, label }) {
  return (
    <div
      className="rounded-lg p-2.5 border relative"
      style={{ borderColor: chosen ? accent : "#334155", background: chosen ? accent + "18" : "#1e293b" }}
    >
      <div className="text-[10px] uppercase tracking-wide text-slate-500 mb-0.5">{label}</div>
      <div className="text-sm text-slate-300">{text}</div>
      {chosen && (
        <span className="absolute top-2 right-2 flex items-center gap-1 text-[10px] font-semibold" style={{ color: accent }}>
          <Check size={12} /> preferred
        </span>
      )}
    </div>
  );
}
function Loop({ label, sub, accent }) {
  return (
    <div className="rounded-lg px-3 py-2 border border-slate-700 bg-slate-900">
      <div className="text-sm font-semibold text-slate-200">{label}</div>
      <div className="text-[11px]" style={{ color: accent }}>{sub}</div>
    </div>
  );
}

/* ---------- Stage 3: Attention ---------- */

const SENTENCES = [
  ["The", "cat", "that", "she", "saw", "ran", "away"],
  ["I", "gave", "the", "red", "book", "to", "him"],
];
const HEADS = ["prev token", "first token", "long words", "local"];

function softmax(xs) {
  const m = Math.max(...xs);
  const e = xs.map((x) => Math.exp(x - m));
  const s = e.reduce((a, b) => a + b, 0);
  return e.map((x) => x / s);
}
function headScore(tokens, i, j, head) {
  const n = tokens.length;
  switch (head) {
    case 0: return j === i ? 1.5 : j === i - 1 ? 3 : -1;          // previous token
    case 1: return j === 0 ? 3 : j === i ? 1 : -0.5;              // first token
    case 2: return tokens[j].length >= 4 ? 2.2 : 0;               // long / content words
    default: return j === i ? 2.5 : Math.abs(i - j) === 1 ? 1.5 : -0.5; // local
  }
}
function buildMatrix(tokens, head) {
  return tokens.map((_, i) => softmax(tokens.map((_, j) => headScore(tokens, i, j, head))));
}

function Attention({ accent }) {
  const [sIdx, setSIdx] = useState(0);
  const [head, setHead] = useState(-1); // -1 = average
  const [query, setQuery] = useState(1);
  const [hover, setHover] = useState<[number, number] | null>(null);
  const tokens = SENTENCES[sIdx];

  const matrix = useMemo(() => {
    if (head >= 0) return buildMatrix(tokens, head);
    const heads = HEADS.map((_, h) => buildMatrix(tokens, h));
    return tokens.map((_, i) => tokens.map((_, j) => heads.reduce((a, m) => a + m[i][j], 0) / heads.length));
  }, [tokens, head]);

  const n = tokens.length;
  const cell = 30, pad = 64;
  const w = pad + n * cell + 8, h = pad + n * cell + 8;

  return (
    <div>
      <Caption>
        Attention is how each word <b className="text-slate-200">looks at other words</b> to understand context. For a
        given word (the <span style={{ color: accent }}>query</span>), the model scores how relevant every other word
        is, then blends their information by those scores. It's part of the model's <b className="text-slate-200">architecture</b>,
        not a separate phase — the same mechanism runs during pre-training, post-training, and inference alike.
      </Caption>

      {/* controls */}
      <div className="flex flex-wrap gap-3 mt-4 text-sm">
        <div>
          <div className="text-[10px] uppercase tracking-wide text-slate-500 mb-1">Sentence</div>
          <select value={sIdx} onChange={(e) => { setSIdx(+e.target.value); setQuery(1); }}
            className="bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-slate-200">
            {SENTENCES.map((s, i) => <option key={i} value={i}>{s.join(" ")}</option>)}
          </select>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-wide text-slate-500 mb-1">Head</div>
          <select value={head} onChange={(e) => setHead(+e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-slate-200">
            <option value={-1}>Average (all heads)</option>
            {HEADS.map((hd, i) => <option key={i} value={i}>Head {i + 1} · {hd}</option>)}
          </select>
        </div>
      </div>

      <div className="mt-4 grid gap-5 md:grid-cols-2">
        {/* query token row + bars */}
        <div>
          <div className="text-xs uppercase tracking-wide text-slate-500 mb-2">Pick a query word</div>
          <div className="flex flex-wrap gap-1.5">
            {tokens.map((t, i) => (
              <button key={i} onClick={() => setQuery(i)}>
                <Chip text={t} color={accent} lit={i === query} pulse={i === query} />
              </button>
            ))}
          </div>
          <div className="mt-4 text-xs text-slate-500 mb-2">
            “<span style={{ color: accent }}>{tokens[query]}</span>” attends to:
          </div>
          <div className="space-y-1.5">
            {tokens.map((t, j) => {
              const wgt = matrix[query][j];
              return (
                <div key={j} className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 w-12 text-right shrink-0">{t}</span>
                  <div className="flex-1 h-4 rounded bg-slate-800 overflow-hidden">
                    <div className="h-full rounded transition-all" style={{ width: `${wgt * 100}%`, background: accent }} />
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 w-9 shrink-0">{wgt.toFixed(2)}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* heatmap */}
        <div>
          <div className="text-xs uppercase tracking-wide text-slate-500 mb-2">Attention map (rows = query, cols = key)</div>
          <div className="rounded-lg bg-slate-950 border border-slate-800 p-2 overflow-x-auto">
            <svg viewBox={`0 0 ${w} ${h}`} style={{ width: "100%", minWidth: 280 }}>
              {tokens.map((t, j) => (
                <text key={"c" + j} x={pad + j * cell + cell / 2} y={pad - 8} fontSize="9"
                  fill="#94a3b8" textAnchor="middle" transform={`rotate(-35 ${pad + j * cell + cell / 2} ${pad - 8})`}>{t}</text>
              ))}
              {tokens.map((t, i) => (
                <text key={"r" + i} x={pad - 8} y={pad + i * cell + cell / 2 + 3} fontSize="9"
                  fill={i === query ? accent : "#94a3b8"} textAnchor="end">{t}</text>
              ))}
              {matrix.map((row, i) =>
                row.map((v, j) => (
                  <rect key={i + "-" + j}
                    x={pad + j * cell} y={pad + i * cell} width={cell - 2} height={cell - 2} rx="3"
                    fill={accent} fillOpacity={0.12 + v * 0.88}
                    stroke={hover && hover[0] === i && hover[1] === j ? "#fff" : i === query ? accent : "transparent"}
                    strokeWidth={i === query ? 1 : 1.5}
                    onMouseEnter={() => setHover([i, j])} onMouseLeave={() => setHover(null)}
                    onClick={() => setQuery(i)} style={{ cursor: "pointer" }} />
                ))
              )}
            </svg>
          </div>
          <div className="text-xs text-slate-500 mt-2 h-4">
            {hover
              ? <>“{tokens[hover[0]]}” → “{tokens[hover[1]]}” : <span className="font-mono" style={{ color: accent }}>{matrix[hover[0]][hover[1]].toFixed(3)}</span></>
              : "Hover a cell. Brighter = stronger attention."}
          </div>
        </div>
      </div>

      <UnderHood accent={accent}>
        <p>
          Each token is turned into three vectors: a <b className="text-slate-300">Query</b> (what am I looking for?),
          a <b className="text-slate-300">Key</b> (what do I offer?), and a <b className="text-slate-300">Value</b>
          (my actual content). Score = Query · Key; <span className="font-mono">softmax</span> turns scores into the
          weights you see above; the output is the weighted sum of Values.
        </p>
        <p>
          <b className="text-slate-300">Multiple heads</b> run this in parallel, each learning a different relationship
          (one tracks the previous word, another links pronouns to nouns, etc.). The "Average" view blends them — this
          is the obvious place for a deep dive later.
        </p>
      </UnderHood>
    </div>
  );
}

/* ---------- Stage 4: Inference ---------- */

const PROMPT = ["The", "weather", "today", "is"];
const GEN = ["sunny", ",", "warm", ",", "and", "calm", "with", "a", "light", "breeze", "."];
const CTX_CAP = 12;

function Inference({ accent }) {
  const [playing, setPlaying] = useState(true);
  const [gen, setGen] = useState(0); // tokens generated so far
  const [slide, setSlide] = useState(false);
  useTicker(playing, 900, () => setGen((g) => (g < GEN.length ? g + 1 : g)));

  const seq = [...PROMPT, ...GEN.slice(0, gen)];
  const total = seq.length;
  const overflow = Math.max(0, total - CTX_CAP);
  const newestIdx = total - 1;
  const cached = total - 1; // all but the newest were cached
  const visibleStart = slide ? overflow : 0;

  return (
    <div>
      <Caption>
        Now the model <b className="text-slate-200">writes</b>, one token at a time. Each new token is fed back in to
        produce the next — this is <b className="text-slate-200">autoregressive</b> generation.
      </Caption>

      {/* sequence */}
      <div className="mt-4">
        <div className="text-xs uppercase tracking-wide text-slate-500 mb-2">Generated so far</div>
        <div className="flex flex-wrap gap-1.5 items-center">
          {seq.map((t, i) => {
            const isPrompt = i < PROMPT.length;
            const evicted = slide && i < overflow;
            return (
              <Chip key={i} text={t} color={isPrompt ? "#64748b" : accent}
                lit={!evicted} pulse={i === newestIdx && gen > 0} dim={evicted} />
            );
          })}
          {gen < GEN.length && <span className="text-slate-600 animate-pulse text-lg">▍</span>}
        </div>
      </div>

      {/* KV cache */}
      <div className="mt-5 rounded-xl border border-slate-800 bg-slate-950 p-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-200">
          <Database size={15} style={{ color: accent }} /> KV cache — the model's working memory
        </div>
        <Caption>
          For every token already seen, the model stores its Key &amp; Value vectors. To make the next token it only
          computes K/V for the <span style={{ color: accent }}>newest</span> token, then reuses everything cached.
          That's why long replies stay fast.
        </Caption>
        <div className="flex flex-wrap gap-1 mt-3">
          {seq.map((t, i) => {
            const evicted = slide && i < overflow;
            const isNew = i === newestIdx && gen > 0;
            return (
              <div key={i} className="flex flex-col items-center gap-0.5" style={{ opacity: evicted ? 0.35 : 1 }}>
                <div className="text-[9px] text-slate-500 max-w-[40px] truncate">{t}</div>
                <div className="flex flex-col gap-0.5">
                  {["K", "V"].map((lab) => (
                    <div key={lab} className="w-6 h-3 rounded-sm flex items-center justify-center text-[7px] font-bold"
                      style={{
                        background: isNew ? accent : accent + "33",
                        color: isNew ? "#0f172a" : accent,
                        boxShadow: isNew ? `0 0 0 1.5px ${accent}` : "none",
                      }}>{lab}</div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-3 text-xs text-slate-400 flex flex-wrap gap-4">
          <span><span style={{ color: accent }}>■</span> computed this step: <b className="text-slate-200">1</b></span>
          <span><span style={{ color: accent + "55" }}>■</span> reused from cache: <b className="text-slate-200">{Math.max(0, cached)}</b></span>
        </div>
      </div>

      {/* context window */}
      <div className="mt-4">
        <div className="flex items-center justify-between mb-2">
          <div className="text-xs uppercase tracking-wide text-slate-500">Context window ({CTX_CAP} slots)</div>
          <label className="flex items-center gap-1.5 text-xs text-slate-400 cursor-pointer">
            <input type="checkbox" checked={slide} onChange={(e) => setSlide(e.target.checked)} />
            sliding window
          </label>
        </div>
        <div className="flex gap-1">
          {Array.from({ length: CTX_CAP }).map((_, i) => {
            const filled = i < total - visibleStart;
            return <div key={i} className="flex-1 h-3 rounded-sm"
              style={{ background: filled ? accent : "#1e293b", opacity: filled ? 0.9 : 1 }} />;
          })}
        </div>
        <Caption>
          {total > CTX_CAP
            ? slide
              ? <>Full! In sliding-window mode the <b className="text-slate-200">oldest tokens drop out</b> — the model can no longer "see" them.</>
              : <>The window is <b className="text-slate-200">full</b>. Real models hit a hard limit here; older context must be truncated or summarized.</>
            : <>{total} / {CTX_CAP} slots used. Everything in here is what the model can currently "see."</>}
        </Caption>
      </div>

      <Controls
        playing={playing} setPlaying={setPlaying} accent={accent}
        onStep={() => { setPlaying(false); setGen((g) => Math.min(GEN.length, g + 1)); }}
        onReset={() => { setGen(0); }}
      />

      <UnderHood accent={accent}>
        <p>
          <b className="text-slate-300">Batching at inference:</b> servers pack many users' requests into one batch so
          the GPU stays busy — the same parallelism trick as training, now serving traffic.
        </p>
        <p>
          The two phases are <b className="text-slate-300">prefill</b> (process the whole prompt at once, fill the KV
          cache) and <b className="text-slate-300">decode</b> (generate one token per step, reusing the cache). Cache
          size grows with context length, which is the main memory cost of long conversations.
        </p>
      </UnderHood>
    </div>
  );
}

/* ---------- Cost badges (time / GPUs per lifecycle stage) ---------- */

const COSTS = {
  pre:  { gpus: "1,000 – 16,000+",   time: "weeks – months",       bar: 100, note: "By far the most expensive step — millions of GPU-hours on a huge cluster." },
  post: { gpus: "tens – few hundred", time: "hours – days",         bar: 50,  note: "Tiny next to pre-training: small curated datasets, far fewer GPUs." },
  inf:  { gpus: "1 – 8 per request",  time: "~tens of ms / token",  bar: 22,  note: "Cheap per request, but total cost scales with how many users you serve." },
};

function Stat({ icon: Icon, label, value, accent }: {
  icon: any; label: string; value: string; accent?: string;
}) {
  return (
    <div>
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wide text-slate-500 mb-1">
        <Icon size={12} style={{ color: accent }} /> {label}
      </div>
      <div className="text-sm font-semibold text-slate-200">{value}</div>
    </div>
  );
}

function CostStrip({ gpus, time, bar, note, accent }: {
  gpus: string; time: string; bar: number; note: string; accent?: string;
}) {
  return (
    <div className="mb-4 rounded-xl border border-slate-800 bg-slate-950 p-3">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Stat icon={Server} label="GPUs" value={gpus} accent={accent} />
        <Stat icon={Clock} label="Wall-clock" value={time} accent={accent} />
        <div>
          <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wide text-slate-500 mb-1">
            <Coins size={12} style={{ color: accent }} /> relative compute
          </div>
          <div className="h-4 rounded bg-slate-800 overflow-hidden">
            <div className="h-full rounded transition-all" style={{ width: `${bar}%`, background: accent }} />
          </div>
          <div className="text-[10px] text-slate-500 mt-1">log scale — pre-training dominates</div>
        </div>
      </div>
      <div className="text-xs text-slate-400 mt-2.5 flex items-start gap-1.5">
        <span style={{ color: accent }}>≈</span>
        <span>{note} <span className="text-slate-500">Rough, for a ~70B-class model.</span></span>
      </div>
    </div>
  );
}

/* ---------- Architecture: Parameters ---------- */

const PARAM_PRESETS = [
  { name: "Small", d: 1024, layers: 24, vocab: 50000 },
  { name: "Medium", d: 4096, layers: 32, vocab: 100000 },
  { name: "Large", d: 8192, layers: 80, vocab: 128000 },
];

function fmtB(n: number) {
  if (n >= 1e9) return (n / 1e9).toFixed(1) + "B";
  if (n >= 1e6) return (n / 1e6).toFixed(0) + "M";
  return n.toLocaleString();
}
function fmtBytes(n: number) {
  if (n >= 1e9) return (n / 1e9).toFixed(0) + " GB";
  if (n >= 1e6) return (n / 1e6).toFixed(0) + " MB";
  return n + " B";
}
function paramBreakdown({ d, layers, vocab }: { d: number; layers: number; vocab: number }) {
  const embed = 2 * vocab * d;     // input embedding + output unembedding
  const attn = layers * 4 * d * d; // Q, K, V, O projections
  const ffn = layers * 8 * d * d;  // up (≈4×) + down projections
  return { embed, attn, ffn, total: embed + attn + ffn };
}

function Parameters({ accent }: { accent: string }) {
  const [preset, setPreset] = useState(1);
  const [hov, setHov] = useState<string | null>(null);
  const cfg = PARAM_PRESETS[preset];
  const b = paramBreakdown(cfg);
  const bytes = b.total * 2; // ~2 bytes/param at 16-bit precision
  const segs = [
    { key: "embed", label: "Embeddings", v: b.embed, formula: "2 × vocab × d_model", color: "#64748b" },
    { key: "attn", label: "Attention (Q/K/V/O)", v: b.attn, formula: "layers × 4 × d_model²", color: "#fbbf24" },
    { key: "ffn", label: "FFN / MLP", v: b.ffn, formula: "layers × 8 × d_model²", color: accent },
  ];

  return (
    <div>
      <Caption>
        A model's "<b className="text-slate-200">{fmtB(b.total)} parameters</b>" are its individual learned
        numbers — the <b className="text-slate-200">weights</b> packed into its matrices. They're fixed after
        training and shipped in the model file. They are <b className="text-slate-200">not</b> the{" "}
        <span style={{ color: accent }}>context</span> you send at runtime.
      </Caption>

      {/* weights vs context */}
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border p-3" style={{ borderColor: accent + "55", background: accent + "0d" }}>
          <div className="text-xs uppercase tracking-wide mb-1" style={{ color: accent }}>Weights · learned, fixed</div>
          <div className="text-sm text-slate-300">
            Billions of numbers set during training. Identical for every user and every request. Stored on disk
            (~<b className="text-slate-200">{fmtBytes(bytes)}</b> at 16-bit) and loaded into GPU memory.
          </div>
        </div>
        <div className="rounded-xl border border-slate-700 p-3 bg-slate-900">
          <div className="text-xs uppercase tracking-wide mb-1 text-slate-400">Context · transient, per-request</div>
          <div className="text-sm text-slate-300">
            Your prompt + the reply tokens, plus their KV cache. Different every request, discarded afterwards.
            Counts against the <b className="text-slate-200">context window</b> — never against the parameter total.
          </div>
        </div>
      </div>

      {/* composition */}
      <div className="mt-5">
        <div className="flex items-baseline justify-between mb-2 gap-2 flex-wrap">
          <div className="text-xs uppercase tracking-wide text-slate-500">Where the parameters live</div>
          <div className="flex gap-1">
            {PARAM_PRESETS.map((p, i) => (
              <button key={p.name} onClick={() => setPreset(i)}
                className="px-2 py-1 rounded-md text-xs border transition-colors"
                style={{
                  borderColor: i === preset ? accent : "#334155",
                  background: i === preset ? accent + "22" : "#1e293b",
                  color: i === preset ? "#e2e8f0" : "#94a3b8",
                }}>{p.name}</button>
            ))}
          </div>
        </div>
        <div className="flex h-8 rounded-lg overflow-hidden border border-slate-800">
          {segs.map((s) => (
            <div key={s.key}
              onMouseEnter={() => setHov(s.key)} onMouseLeave={() => setHov(null)}
              className="h-full flex items-center justify-center text-[10px] font-medium transition-all"
              style={{
                width: `${(s.v / b.total) * 100}%`,
                background: s.color + (hov && hov !== s.key ? "55" : "ee"),
                color: "#0f172a",
              }}>
              {(s.v / b.total) * 100 >= 12 ? `${Math.round((s.v / b.total) * 100)}%` : ""}
            </div>
          ))}
        </div>
        <div className="mt-2 space-y-1">
          {segs.map((s) => (
            <div key={s.key} className="flex items-center gap-2 text-xs"
              style={{ opacity: hov && hov !== s.key ? 0.5 : 1 }}>
              <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: s.color }} />
              <span className="text-slate-300 w-44 shrink-0">{s.label}</span>
              <span className="font-mono text-slate-400 w-12 shrink-0">{fmtB(s.v)}</span>
              <span className="text-slate-600 font-mono hidden sm:inline">{s.formula}</span>
            </div>
          ))}
        </div>
        <Caption>
          d_model = {cfg.d.toLocaleString()}, layers = {cfg.layers}, vocab = {cfg.vocab.toLocaleString()} →{" "}
          <b className="text-slate-200">{fmtB(b.total)}</b> total. The <span style={{ color: accent }}>FFN</span>{" "}
          blocks usually dominate — roughly two-thirds of the weights.
        </Caption>
      </div>

      <UnderHood accent={accent}>
        <p>
          Every parameter is just one number in a matrix — attention projections, FFN layers, embeddings, plus
          tiny LayerNorm scales (omitted here). The headline count is simply the <i>sum of all those matrix
          sizes</i>; nothing more mysterious.
        </p>
        <p>
          At inference the weights are <b className="text-slate-300">frozen</b>. What changes between requests is
          the context flowing through them — the activations and KV cache — which is why two people get different
          answers from the exact same parameters.
        </p>
      </UnderHood>
    </div>
  );
}

/* ---------- Architecture: Mixture of Experts ---------- */

const MOE_TOKENS = ["The", "cat", "sat", "quietly", "on", "the", "warm", "mat"];
const N_EXPERTS = 8;
const TOP_K = 2;

function expertScores(token: string, t: number) {
  // Deterministic pseudo-router: varies by token characters + a rotating bias.
  return Array.from({ length: N_EXPERTS }, (_, e) => {
    const base = token.charCodeAt((e + token.length) % token.length) || 65;
    return ((base * (e + 3) + t * 7) % 17) / 17 + (e === token.length % N_EXPERTS ? 0.6 : 0);
  });
}
function topKIdx(scores: number[], k: number) {
  return scores
    .map((s, i) => [s, i] as [number, number])
    .sort((a, b) => b[0] - a[0])
    .slice(0, k)
    .map(([, i]) => i);
}

function MoE({ accent }: { accent: string }) {
  const [playing, setPlaying] = useState(true);
  const [tick, setTick] = useState(0);
  useTicker(playing, 1400, () => setTick((t) => t + 1));
  const tokIdx = tick % MOE_TOKENS.length;
  const token = MOE_TOKENS[tokIdx];
  const scores = useMemo(() => expertScores(token, tick), [token, tick]);
  const chosen = useMemo(() => topKIdx(scores, TOP_K), [scores]);
  const chosenSet = new Set(chosen);

  return (
    <div>
      <Caption>
        In a normal transformer block every token flows through one big <b className="text-slate-200">FFN</b>.
        A <b className="text-slate-200">Mixture of Experts</b> replaces that single FFN with many expert FFNs plus
        a <span style={{ color: accent }}>router</span> that sends each token to just a few of them.
      </Caption>

      {/* current token */}
      <div className="mt-4 flex items-center gap-1.5 flex-wrap">
        <span className="text-xs uppercase tracking-wide text-slate-500 mr-1">Routing token:</span>
        {MOE_TOKENS.map((t, i) => (
          <Chip key={i} text={t} color={accent} lit={i === tokIdx} pulse={i === tokIdx} dim={i !== tokIdx} />
        ))}
      </div>

      {/* router -> experts */}
      <div className="mt-5 rounded-xl border border-slate-800 bg-slate-950 p-4">
        <div className="flex items-center justify-center gap-2 mb-3 flex-wrap">
          <div className="rounded-lg px-3 py-1.5 border text-sm font-semibold"
            style={{ borderColor: accent, background: accent + "18", color: "#e2e8f0" }}>Router</div>
          <span className="text-xs text-slate-500">scores all {N_EXPERTS} experts, keeps the top {TOP_K}</span>
        </div>
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
          {scores.map((s, e) => {
            const on = chosenSet.has(e);
            return (
              <div key={e} className="rounded-lg border p-2 text-center transition-all"
                style={{
                  borderColor: on ? accent : "#334155",
                  background: on ? accent + "22" : "#1e293b",
                  boxShadow: on ? `0 0 0 1.5px ${accent}` : "none",
                }}>
                <div className="text-[10px] text-slate-500">E{e + 1}</div>
                <div className="h-10 flex items-end justify-center mt-1">
                  <div className="w-3 rounded-t transition-all"
                    style={{ height: `${20 + s * 60}%`, background: on ? accent : "#475569" }} />
                </div>
                <div className="text-[9px] font-mono mt-1" style={{ color: on ? accent : "#64748b" }}>{s.toFixed(2)}</div>
              </div>
            );
          })}
        </div>
        <div className="text-xs text-slate-400 mt-3 text-center">
          “<span style={{ color: accent }}>{token}</span>” → experts{" "}
          <b className="text-slate-200">{chosen.map((c) => "E" + (c + 1)).join(" & ")}</b>. The other{" "}
          {N_EXPERTS - TOP_K} stay idle for this token.
        </div>
      </div>

      {/* active vs total */}
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-700 bg-slate-900 p-3">
          <div className="text-xs uppercase tracking-wide text-slate-500 mb-1">Total parameters</div>
          <div className="text-sm text-slate-300">
            All {N_EXPERTS} experts sit in memory at once — that's the big headline parameter count.
          </div>
          <div className="flex gap-1 mt-2">
            {Array.from({ length: N_EXPERTS }).map((_, e) => (
              <div key={e} className="flex-1 h-3 rounded-sm" style={{ background: accent + "55" }} />
            ))}
          </div>
        </div>
        <div className="rounded-xl border p-3" style={{ borderColor: accent + "55", background: accent + "0d" }}>
          <div className="text-xs uppercase tracking-wide mb-1" style={{ color: accent }}>Active per token</div>
          <div className="text-sm text-slate-300">
            Only {TOP_K} of {N_EXPERTS} experts actually run — about{" "}
            <b className="text-slate-200">{Math.round((TOP_K / N_EXPERTS) * 100)}%</b> of the FFN work per token.
            Big brain, small bill.
          </div>
          <div className="flex gap-1 mt-2">
            {Array.from({ length: N_EXPERTS }).map((_, e) => (
              <div key={e} className="flex-1 h-3 rounded-sm" style={{ background: chosenSet.has(e) ? accent : "#1e293b" }} />
            ))}
          </div>
        </div>
      </div>

      <Controls
        playing={playing} setPlaying={setPlaying} accent={accent}
        onStep={() => { setPlaying(false); setTick((t) => t + 1); }}
        onReset={() => { setTick(0); }}
      />

      <UnderHood accent={accent}>
        <p>
          The router is a small learned layer: it scores the experts for each token, applies{" "}
          <span className="font-mono">softmax</span>, and routes to the top-{TOP_K}. Because only a fraction run,
          an MoE can hold far more total parameters (capacity / knowledge) while keeping compute per token roughly
          constant — which is why such models advertise “<b className="text-slate-300">X total / Y active</b>”.
        </p>
        <p>
          Trade-offs: every expert must occupy GPU memory even while idle, and training needs{" "}
          <b className="text-slate-300">load balancing</b> so the router doesn't lean on a few favourite experts.
          Experts tend to specialize in different kinds of tokens.
        </p>
      </UnderHood>
    </div>
  );
}

/* ---------- Shell ---------- */

// Two orthogonal axes: the *lifecycle* (sequential phases a model goes through)
// and the *architecture* (attention — a mechanism that runs inside every phase,
// not a step in time). Keeping them in separate groups avoids implying that
// attention happens "after" post-training and "before" inference.
const STAGES = [
  { key: "pre", title: "Pre-training", icon: Layers, sub: "learn language from raw text", C: Pretraining, group: "lifecycle" },
  { key: "post", title: "Post-training", icon: Brain, sub: "shape it into an assistant", C: Posttraining, group: "lifecycle" },
  { key: "inf", title: "Inference", icon: Cpu, sub: "generating the answer", C: Inference, group: "lifecycle" },
  { key: "params", title: "Parameters", icon: SlidersHorizontal, sub: "what the weights are", C: Parameters, group: "architecture" },
  { key: "attn", title: "Attention", icon: Eye, sub: "how words read context", C: Attention, group: "architecture" },
  { key: "moe", title: "Mixture of Experts", icon: Network, sub: "scaling with sparse FFNs", C: MoE, group: "architecture" },
];

const GROUPS = [
  { id: "lifecycle", label: "Lifecycle", blurb: "The phases a model moves through, in order — from raw text to a written answer." },
  { id: "architecture", label: "Architecture", blurb: "Not steps in time — the machinery running inside every phase above." },
];

export default function LLMExplorer() {
  const [stage, setStage] = useState(0);
  const S = STAGES[stage];
  const accent = ACCENTS[S.key];
  const Body = S.C;

  const lifecycle = STAGES.filter((s) => s.group === "lifecycle");
  const lifePos = lifecycle.indexOf(S); // position within the lifecycle (-1 if architecture)
  const isLifecycle = S.group === "lifecycle";
  const goLife = (delta) => {
    const target = lifecycle[lifePos + delta];
    if (target) setStage(STAGES.indexOf(target));
  };

  return (
    <div className="min-h-screen w-full bg-slate-900 text-slate-100 p-4 sm:p-6" style={{ fontFamily: "ui-sans-serif, system-ui, sans-serif" }}>
      <div className="max-w-4xl mx-auto">
        <header className="mb-5">
          <h1 className="text-2xl font-bold tracking-tight">How an LLM Works</h1>
          <p className="text-sm text-slate-400 mt-1">An interactive walk through how a model is built and runs — plus the attention mechanism that powers every step.</p>
        </header>

        {/* tabs, split into the two axes (lifecycle stacked above architecture) */}
        <div className="space-y-4 mb-5">
          {GROUPS.map((g) => {
            const items = STAGES.map((st, i) => ({ st, i })).filter(({ st }) => st.group === g.id);
            return (
              <div key={g.id}>
                <div className="mb-2">
                  <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-400">{g.label}</h2>
                  <p className="text-[11px] text-slate-600 leading-tight mt-0.5">{g.blurb}</p>
                </div>
                <div className="grid gap-2 grid-cols-1 sm:grid-cols-3">
                  {items.map(({ st, i }, j) => {
                    const Icon = st.icon;
                    const a = ACCENTS[st.key];
                    const on = i === stage;
                    return (
                      <button key={st.key} onClick={() => setStage(i)}
                        className="text-left rounded-xl p-3 border transition-all w-full"
                        style={{
                          borderColor: on ? a : "#1e293b",
                          background: on ? a + "18" : "#0f172a",
                        }}>
                        <div className="flex items-center gap-2">
                          <Icon size={16} style={{ color: a }} />
                          <span className="text-[10px] font-mono text-slate-600">
                            {g.id === "lifecycle" ? j + 1 : "·"}
                          </span>
                        </div>
                        <div className="text-sm font-semibold mt-1.5" style={{ color: on ? "#fff" : "#cbd5e1" }}>{st.title}</div>
                        <div className="text-[11px] text-slate-500 leading-tight mt-0.5">{st.sub}</div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* body */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 sm:p-6">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono" style={{ color: accent }}>
              {isLifecycle ? `PHASE ${lifePos + 1} OF ${lifecycle.length}` : "ARCHITECTURE"}
            </span>
            <h2 className="text-lg font-bold">{S.title}</h2>
          </div>
          {isLifecycle && <CostStrip {...COSTS[S.key as keyof typeof COSTS]} accent={accent} />}
          <Body accent={accent} />
        </div>

        {/* nav — only the lifecycle is a sequence; attention is not */}
        {isLifecycle ? (
          <div className="flex justify-between mt-4">
            <button disabled={lifePos === 0} onClick={() => goLife(-1)}
              className="px-4 py-2 rounded-lg text-sm bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed">
              ← Previous
            </button>
            <button disabled={lifePos === lifecycle.length - 1} onClick={() => goLife(1)}
              className="px-4 py-2 rounded-lg text-sm font-medium text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed"
              style={{ background: lifePos === lifecycle.length - 1 ? "#334155" : accent }}>
              Next →
            </button>
          </div>
        ) : (
          <p className="text-center text-xs text-slate-500 mt-4">
            Attention isn’t a phase in time — it runs inside every lifecycle phase above. Pick one to see where.
          </p>
        )}
      </div>
    </div>
  );
}
