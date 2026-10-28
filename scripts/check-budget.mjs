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

// JS referenced by the quote page (the React island and its shared chunks).
const html = fs.readFileSync(path.join(dist, "cotizador/index.html"), "utf8");
const scripts = [...new Set([...html.matchAll(/(?:src|component-url|renderer-url|before-hydration-url)="(\/_astro\/[^"]+\.js)"/g)].map((m) => m[1]))];
const imported = new Set();
const collect = (rel) => {
  const file = path.join(dist, rel);
  if (imported.has(rel) || !fs.existsSync(file)) return;
  imported.add(rel);
  // Follow the static and dynamic imports between chunks.
  for (const m of fs.readFileSync(file, "utf8").matchAll(/from"\.\/([^"]+\.js)"|import\("\.\/([^"]+\.js)"\)/g)) collect(`/_astro/${m[1] ?? m[2]}`);
};
scripts.forEach(collect);
const wizardKB = [...imported].reduce((a, rel) => a + zlib.gzipSync(fs.readFileSync(path.join(dist, rel))).length, 0) / 1024;

const rows = [
  ["Tamaño total del sitio", `${totalMB.toFixed(1)} MB`, `${LIMITS.totalMB} MB`, totalMB <= LIMITS.totalMB],
  ["Archivos", String(files.length), String(LIMITS.files), files.length <= LIMITS.files],
  ["Archivo más grande", `${(biggest.size / 1048576).toFixed(2)} MB (${biggest.rel})`, `${LIMITS.singleFileMB} MB`, biggest.size / 1048576 <= LIMITS.singleFileMB],
  ["JavaScript de /cotizador/ (gzip)", `${wizardKB.toFixed(0)} KB`, `${LIMITS.wizardGzipKB} KB`, wizardKB <= LIMITS.wizardGzipKB],
];
for (const [name, value, limit, ok] of rows) console.log(`${ok ? "OK  " : "FAIL"} ${name}: ${value} (límite ${limit})`);
if (rows.some((r) => !r[3])) {
  console.error("\nPresupuesto superado: optimiza los archivos o revisa docs/finops.md antes de desplegar.");
  process.exit(1);
}
