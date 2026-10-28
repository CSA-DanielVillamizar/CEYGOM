import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath } from "node:url";

// `site` feeds the sitemap and absolute URLs. It is the provisional Azure host until the custom domain is
// linked, then the real one: set PUBLIC_SITE_URL in the GitHub variables.
const site = process.env.PUBLIC_SITE_URL || "https://electrometalicasceygom.com";

// Static output: Azure Static Web Apps serves ./dist and routes /api/* to the managed Functions.
export default defineConfig({
  site,
  output: "static",
  trailingSlash: "always",
  build: { format: "directory" },
  integrations: [react(), sitemap({ filter: (page) => !page.endsWith("/404/") && !page.endsWith("/cotizacion/") })],
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: { "@shared": fileURLToPath(new URL("./packages/shared", import.meta.url)) },
    },
  },
});
