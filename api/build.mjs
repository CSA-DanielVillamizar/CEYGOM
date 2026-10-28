// Bundles each function entry (and ../packages/shared + zod) into dist/, so the deployed Function app
// has no dependency on the monorepo layout. "@azure/functions" stays external (installed in api/node_modules).
import { build } from "esbuild";
import { fileURLToPath } from "node:url";
import { rmSync } from "node:fs";

const apiDir = fileURLToPath(new URL(".", import.meta.url));
rmSync(new URL("./dist", import.meta.url), { recursive: true, force: true });

await build({
  entryPoints: { "quote/index": "quote/index.ts" },
  outdir: "dist",
  bundle: true,
  platform: "node",
  target: "node22",
  format: "cjs",
  sourcemap: true,
  external: ["@azure/functions"],
  // zod is imported from ../packages/shared, which has no node_modules of its own.
  nodePaths: [`${apiDir}node_modules`],
  logLevel: "info",
});
