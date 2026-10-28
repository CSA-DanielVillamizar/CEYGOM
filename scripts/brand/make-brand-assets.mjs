// Builds the brand images from the company's own logo (the "EMC" mark in the banner of its current site):
//
//   node scripts/brand/make-brand-assets.mjs <folder-with-banner.png>
//
// Output (commit it): src/assets/brand/logo-emc.webp, src/assets/brand/og-default.jpg and public/apple-touch-icon.png.
// public/favicon.svg is hand-written. The logo is a crop of a 980x150 banner: ask the company for the vector or a
// high-resolution original and replace logo-emc.webp (see docs/catalogo/pendientes.md).
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const root = path.resolve(import.meta.dirname, "../..");
const folder = process.argv[2];
if (!folder) throw new Error("Usage: node scripts/brand/make-brand-assets.mjs <folder-with-banner.png>");
const sharp = createRequire(path.join(root, "package.json"))("sharp");
const out = path.join(root, "src/assets/brand");
fs.mkdirSync(out, { recursive: true });

// 1. Logo: crop of the EMC mark with its swoosh (left part of the banner), dark background kept.
const banner = path.join(folder, "banner.png");
await sharp(banner)
  .extract({ left: 172, top: 4, width: 186, height: 146 })
  .resize({ height: 112 })
  .webp({ quality: 90 })
  .toFile(path.join(out, "logo-emc.webp"));

// 2. Default share image (1200x630): dark panel, logo, headline and two real product photos.
const logo = await sharp(path.join(out, "logo-emc.webp")).resize({ height: 150 }).png().toBuffer();
// Both photos share one height, chosen so that together they fit the right half (x 660 to 1150).
const sources = ["rack-piso-cerrado", "gabinete-equipos-medida"].map((n) => path.join(root, "src/assets/productos", `${n}.webp`));
const aspects = await Promise.all(sources.map(async (s) => { const m = await sharp(s).metadata(); return (m.width ?? 1) / (m.height ?? 1); }));
const gap = 24;
const height = Math.min(420, Math.floor((490 - gap) / (aspects[0] + aspects[1])));
const [rack, cabinet] = await Promise.all(sources.map((s) => sharp(s).resize({ height }).toBuffer()));
const rackMeta = await sharp(rack).metadata();
const top = Math.round((630 - height) / 2);
const text = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
  <text x="70" y="290" font-family="Arial, Helvetica, sans-serif" font-size="58" font-weight="700" fill="#ffffff">Electro Metálicas</text>
  <text x="70" y="360" font-family="Arial, Helvetica, sans-serif" font-size="58" font-weight="700" fill="#e11d3a">Ceygom</text>
  <text x="70" y="430" font-family="Arial, Helvetica, sans-serif" font-size="30" fill="#d6dbe0">Gabinetes, racks y estructuras metálicas</text>
  <text x="70" y="472" font-family="Arial, Helvetica, sans-serif" font-size="30" fill="#d6dbe0">para redes eléctricas y de comunicación</text>
  <text x="70" y="560" font-family="Arial, Helvetica, sans-serif" font-size="26" fill="#9aa3ad">Medellín, Colombia</text>
</svg>`;
await sharp({ create: { width: 1200, height: 630, channels: 3, background: "#1c2024" } })
  .composite([
    { input: Buffer.from(text), left: 0, top: 0 },
    { input: logo, left: 70, top: 60 },
    { input: rack, left: 660, top },
    { input: cabinet, left: 660 + (rackMeta.width ?? 300) + gap, top },
  ])
  .jpeg({ quality: 82, mozjpeg: true })
  .toFile(path.join(out, "og-default.jpg"));

// 3. Apple touch icon from the favicon.
await sharp(path.join(root, "public/favicon.svg"), { density: 384 }).resize(180, 180).png().toFile(path.join(root, "public/apple-touch-icon.png"));

for (const f of ["logo-emc.webp", "og-default.jpg"]) console.log(f, Math.round(fs.statSync(path.join(out, f)).size / 1024), "KB");
