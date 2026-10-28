import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath } from "node:url";

// Static output: Azure Static Web Apps serves ./dist and routes /api/* to the managed Functions.
export default defineConfig({
  output: "static",
  trailingSlash: "always",
  build: { format: "directory" },
  integrations: [react()],
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: { "@shared": fileURLToPath(new URL("./packages/shared", import.meta.url)) },
    },
  },
});
