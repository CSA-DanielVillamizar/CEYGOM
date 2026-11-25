// After `astro build`: writes into dist/sw.js the list of build-hashed files the offline mode must have from the
// first visit (fonts, styles and logos under /_astro/), so that a visitor who loses the signal still sees the current
// brand, and an old visitor gets the new one when the service worker updates.
//
//   node scripts/inject-sw-precache.mjs [dist-folder]
//
// public/sw.js ships `const PRECACHE_ASSETS = [];`; this replaces that line in the copy inside dist (idempotent).
import fs from "node:fs";
import path from "node:path";

const PLACEHOLDER = /const PRECACHE_ASSETS = \[[^\]]*\];/;
const WANTED = /\.(woff2|css|svg)$/;

export function precacheList(dist) {
  const dir = path.join(dist, "_astro");
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((name) => WANTED.test(name))
    .sort()
    .map((name) => `/_astro/${name}`);
}

export function injectPrecache(dist) {
  const file = path.join(dist, "sw.js");
  const source = fs.readFileSync(file, "utf8");
  if (!PLACEHOLDER.test(source)) throw new Error("sw.js has no `const PRECACHE_ASSETS = [];` line to fill");
  const list = precacheList(dist);
  fs.writeFileSync(file, source.replace(PLACEHOLDER, () => `const PRECACHE_ASSETS = ${JSON.stringify(list)};`));
  return list;
}

if (import.meta.url === new URL(process.argv[1], "file://").href || process.argv[1]?.endsWith("inject-sw-precache.mjs")) {
  const dist = path.resolve(process.argv[2] ?? path.join(import.meta.dirname, "../dist"));
  const list = injectPrecache(dist);
  console.log(`sw.js: ${list.length} build files in the offline precache`);
}
