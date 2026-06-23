# How an LLM Works

An interactive, visual walkthrough of how large language models work — from raw
text to a written answer. Built with React, TypeScript, Vite, and Tailwind CSS.

🔗 **Live demo:** https://muradyan.github.io/how-llms-work/

## What's inside

The app is organized along two distinct axes, each panel with an animated,
interactive visualization and an "Under the hood" deep-dive.

**Lifecycle** — the sequential phases a model moves through, in order. Each
carries a **cost badge** showing the rough GPU count, wall-clock time, and
relative compute for a representative ~70B-class model:

1. **Pre-training** — the model learns language by predicting the next token
   over enormous batches of text, nudging its weights down a loss curve.
   (~1,000–16,000+ GPUs, weeks–months — by far the dominant cost.)
2. **Post-training** — the base model is shaped into a helpful assistant via
   supervised fine-tuning, preference modeling, and RLHF. (~tens–hundreds of
   GPUs, hours–days.)
3. **Inference** — watch autoregressive generation token by token, see the KV
   cache fill, and a context window with an optional sliding mode. (~1–8 GPUs
   per request, ~tens of ms/token.)

**Architecture** — not steps in time, but the machinery running *inside* every
phase above:

- **The Transformer** — the whole model drawn out as a clickable diagram:
  tokens → embeddings → N × [attention + feed-forward, with residuals & norm] →
  output projection → next-token probabilities. Tap any box for what it does.
- **Parameters** — what "X billion parameters" actually means: the *weights*
  (learned, fixed, shipped in the model file) versus the *context* (transient,
  per-request). Defines the key terms (d_model, embeddings, FFN/MLP, vocab,
  layers), shows a composition breakdown with the **actual arithmetic** (e.g.
  `2 × 100,000 × 4,096 = 819M` for embeddings), and a "build the number" calculator.
- **Attention** — explore how each word attends to others, with a live
  attention heatmap, selectable query words, and multiple heads.
- **Mixture of Experts** — how a router sends each token to just a few of many
  expert FFNs, so total parameters can be huge while compute per token stays
  small ("X total / Y active"), with an animated routing visualization.
- **Modern variants** — a survey of techniques popular in today's models,
  grouped by theme: GQA/MQA/MLA & sliding-window attention, RoPE, RMSNorm,
  SwiGLU, MoE, quantization, speculative decoding, FlashAttention, and Mamba/SSMs.

## Deep Dive — the math of serving LLMs

A second page (toggle **Deep Dive** in the top bar) is a study summary of Reiner
Pope's chalkboard lecture *"How GPT, Claude, and Gemini are actually trained and
served"* on the [Dwarkesh Podcast](https://www.dwarkesh.com/p/reiner-pope). It
keeps the important formulas (typeset with KaTeX), constants, worked examples,
and schematic redraws of the figures:

- the roofline model `T = max(t_compute, t_mem)` and the arithmetic-intensity
  constant **≈ 300**;
- the required batch size `B ≥ 300 / sparsity` (DeepSeek V3 → ~2,400);
- the ~15–20 ms HBM "train", MoE all-to-all rack layout, and pipeline bubbles;
- the `6ND` law and the **~100× over-training** vs Chinchilla argument;
- reading long-context prices off the menu (`bytes/token = (1/300)·N_active/len`).

All credit to Reiner Pope and the Dwarkesh Podcast; the page is a community
summary for learning and links the original [video](https://www.youtube.com/watch?v=xmkSf5IS-zw),
[transcript](https://www.dwarkesh.com/p/reiner-pope), and
[flashcards](https://flashcards.dwarkesh.com/reiner-pope/).

## Run it locally

Requires [Node.js](https://nodejs.org/) 18+.

```bash
npm install
npm run dev
```

Then open the URL Vite prints (usually http://localhost:5173).

## Other scripts

```bash
npm run build      # production build into dist/
npm run preview    # preview the production build locally
npm run typecheck  # type-check without emitting
```

## Deployment

Every push to `main` is built and published to GitHub Pages by the workflow in
[`.github/workflows/deploy.yml`](.github/workflows/deploy.yml). The Vite `base`
in [`vite.config.ts`](vite.config.ts) is set to `/how-llms-work/` so asset paths
resolve correctly under the Pages subpath.

## License

[MIT](LICENSE)
