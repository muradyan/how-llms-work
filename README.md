# How an LLM Works

An interactive, visual walkthrough of how large language models work — from raw
text to a written answer. Built with React, TypeScript, Vite, and Tailwind CSS.

🔗 **Live demo:** https://muradyan.github.io/how-llms-work/

## What's inside

The app walks through four stages, each with an animated, interactive
visualization and a "Under the hood" deep-dive:

1. **Pre-training** — the model learns language by predicting the next token
   over enormous batches of text, nudging its weights down a loss curve.
2. **Post-training** — the base model is shaped into a helpful assistant via
   supervised fine-tuning, preference modeling, and RLHF.
3. **Attention** — explore how each word attends to others, with a live
   attention heatmap, selectable query words, and multiple heads.
4. **Inference** — watch autoregressive generation token by token, see the KV
   cache fill, and a context window with an optional sliding mode.

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
