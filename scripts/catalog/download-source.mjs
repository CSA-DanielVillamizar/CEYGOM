// Downloads the data sheets (PDF) and product photos listed on the company's current site (productos.html) into
// <folder>/fichas and <folder>/img, validating type and size. Run it into a NEW, EMPTY folder outside the repo:
//
//   node scripts/catalog/download-source.mjs <folder>
//
// Then: node scripts/catalog/import-catalog.mjs <folder>
// Only use it while the legacy site is online; the generated files are what the new site serves.

import fs from "node:fs/promises";
import path from "node:path";

const out = process.argv[2];
const base = "https://electrometalicasceygom.com/";
const html = Buffer.from(await (await fetch(base + "productos.html")).arrayBuffer()).toString("latin1");
const hrefs = [...html.matchAll(/href=["']([^"']+)["']/gi)].map((m) => m[1].trim());
const pdfs = [...new Set(hrefs.filter((h) => /\.pdf$/i.test(h)))];
const imgs = [...new Set(hrefs.filter((h) => /(^|\/)productos\/[^"]+\.png$/i.test(h)))];
console.log("pdfs", pdfs.length, "imgs", imgs.length);

const MAX = 15 * 1024 * 1024;
const magic = { fichas: [0x25, 0x50, 0x44, 0x46], img: [0x89, 0x50, 0x4e, 0x47] };
const report = [];

async function get(rel, kind) {
  const url = new URL(rel.replace(/ /g, "%20"), base).href;
  const decoded = decodeURIComponent(new URL(url).pathname.replace(/^\//, ""));
  const dest = path.join(out, kind, decoded.split("/").slice(1).join("__"));
  await fs.mkdir(path.dirname(dest), { recursive: true });
  const res = await fetch(url);
  if (!res.ok) return report.push({ url, error: res.status });
  const buf = Buffer.from(await res.arrayBuffer());
  const ok = buf.length <= MAX && magic[kind].every((b, i) => buf[i] === b);
  if (!ok) return report.push({ url, error: "invalid", size: buf.length });
  await fs.writeFile(dest, buf);
  report.push({ file: path.relative(out, dest).split(path.sep).join("/"), size: buf.length, src: url });
}

for (const p of pdfs) await get(p, "fichas");
for (const i of imgs) await get(i, "img");
await fs.writeFile(path.join(out, "report.json"), JSON.stringify(report, null, 1));
const okc = report.filter((r) => r.file);
const bad = report.filter((r) => r.error);
console.log("ok", okc.length, "errors", bad.length, "totalMB", (okc.reduce((a, r) => a + r.size, 0) / 1048576).toFixed(1));
bad.forEach((b) => console.log("ERR", JSON.stringify(b)));
