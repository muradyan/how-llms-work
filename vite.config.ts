import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// `base` must match the repo name so assets resolve correctly on GitHub Pages
// (served from https://<user>.github.io/how-llms-work/).
export default defineConfig({
  base: "/how-llms-work/",
  plugins: [react(), tailwindcss()],
});
