// FinOps guardrail: fails the build when the site grows past what the Azure Static Web Apps Free plan
// (and our own performance budget) allows. Run after `npm run build`:  npm run budget
//
// Plan limits (Free): 250 MB per environment and 15 000 files. Every pull request also gets a preview
// environment that holds a full copy, so the budget leaves a wide margin.
import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";

const dist = path.resolve(import.meta.dirname, "../dist");
if (!fs.existsSync(dist)) throw new Error("dist/ not found: run `npm run build` first");

const LIMITS = {
  totalMB: 150, // plan limit 250 MB per environment
  files: 10_000, // plan limit 15 000
  singleFileMB: 15,
  wizardGzipKB: 200, // JavaScript of /cotizador/ (see HU-02)
  commonPageGzipKB: 15, // home, product pages and the quote list: only the small site script
  catalogGzipKB: 20, // /productos/: site script + catalog search
  searchIndexGzipKB: 15, // fetched only when the visitor starts searching
};

const files = [];
(function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else files.push({ full, rel: path.relative(dist, full).split(path.sep).join("/"), size: fs.statSync(full).size });
  }
})(dist);

const totalMB = files.reduce((a, f) => a + f.size, 0) / 1048576;
const biggest = [...files].sort((a, b) => b.size - a.size)[0];

// JavaScript a page makes the browser download and run, gzipped: external scripts, inline module scripts,
// the islands and every chunk they import (JSON-LD blocks are data, not code).
const gzipKB = (buf) => zlib.gzipSync(buf).length / 1024;
function pageJsKB(page) {
  const html = fs.readFileSync(path.join(dist, page), "utf8");
  const chunks = new Set();
  const collect = (rel) => {
    const file = path.join(dist, rel);
    if (chunks.has(rel) || !fs.existsSync(file)) return;
    chunks.add(rel);
    // Follow the static and dynamic imports between chunks.
    for (const m of fs.readFileSync(file, "utf8").matchAll(/from"\.\/([^"]+\.js)"|import\("\.\/([^"]+\.js)"\)/g)) collect(`/_astro/${m[1] ?? m[2]}`);
  };
  for (const m of html.matchAll(/(?:src|component-url|renderer-url|before-hydration-url)="(\/_astro\/[^"]+\.js)"/g)) collect(m[1]);
  let inline = 0;
  for (const m of html.matchAll(/<script(?![^>]*\bsrc=)(?![^>]*ld\+json)[^>]*>([\s\S]*?)<\/script>/g)) {
    inline += gzipKB(Buffer.from(m[1]));
    for (const i of m[1].matchAll(/["'](\/_astro\/[^"']+\.js)["']/g)) collect(i[1]);
  }
  return inline + [...chunks].reduce((a, rel) => a + gzipKB(fs.readFileSync(path.join(dist, rel))), 0);
}

const pages = [
  ["JavaScript de /cotizador/ (gzip)", "cotizador/index.html", LIMITS.wizardGzipKB],
  ["JavaScript del inicio (gzip)", "index.html", LIMITS.commonPageGzipKB],
  ["JavaScript de /productos/ (gzip)", "productos/index.html", LIMITS.catalogGzipKB],
  ["JavaScript de una página de producto (gzip)", "productos/racks-comunicaciones/rack-de-piso/index.html", LIMITS.commonPageGzipKB],
  ["JavaScript de /cotizacion/ (gzip)", "cotizacion/index.html", LIMITS.commonPageGzipKB],
];
const searchIndexKB = gzipKB(fs.readFileSync(path.join(dist, "productos/search-index.json")));

const rows = [
  ["Tamaño total del sitio", `${totalMB.toFixed(1)} MB`, `${LIMITS.totalMB} MB`, totalMB <= LIMITS.totalMB],
  ["Archivos", String(files.length), String(LIMITS.files), files.length <= LIMITS.files],
  ["Archivo más grande", `${(biggest.size / 1048576).toFixed(2)} MB (${biggest.rel})`, `${LIMITS.singleFileMB} MB`, biggest.size / 1048576 <= LIMITS.singleFileMB],
  ...pages.map(([name, page, limit]) => {
    const kb = pageJsKB(page);
    return [name, `${kb.toFixed(1)} KB`, `${limit} KB`, kb <= limit];
  }),
  ["Índice del buscador, solo al buscar (gzip)", `${searchIndexKB.toFixed(1)} KB`, `${LIMITS.searchIndexGzipKB} KB`, searchIndexKB <= LIMITS.searchIndexGzipKB],
];
for (const [name, value, limit, ok] of rows) console.log(`${ok ? "OK  " : "FAIL"} ${name}: ${value} (límite ${limit})`);
if (rows.some((r) => !r[3])) {
  console.error("\nPresupuesto superado: optimiza los archivos o revisa docs/finops.md antes de desplegar.");
  process.exit(1);
}
