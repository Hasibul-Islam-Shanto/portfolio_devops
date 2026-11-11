import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";

// Static output: every route is pre-rendered to HTML at build time.
// `site` is intentionally unset (no production origin is known), so no canonical URLs or sitemap are generated.
export default defineConfig({
  output: "static",
  vite: {
    plugins: [tailwindcss()],
  },
});
