// Builds the raster brand images from the CEYGOM logo files (src/assets/brand/*.svg, from the brand kit):
//
//   node scripts/brand/make-brand-assets.mjs
//
// Output (commit it): src/assets/brand/og-default.jpg (share image, 1200x630) and public/apple-touch-icon.png.
// public/favicon.svg and the logos come from the brand kit unchanged. The headline of the share image is set in
// Arial because the build machine does not ship Archivo: replace it with a designed file when the company has one.
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const root = path.resolve(import.meta.dirname, "../..");
const sharp = createRequire(path.join(root, "package.json"))("sharp");
const out = path.join(root, "src/assets/brand");

// Apple touch icon from the favicon (monogram on grafito).
await sharp(path.join(root, "public/favicon.svg"), { density: 384 }).resize(180, 180).png().toFile(path.join(root, "public/apple-touch-icon.png"));

// Share image: grafito panel, negative logo, promise, and two product photos on flat white cards.
const logo = await sharp(path.join(out, "logo-horizontal-negativo.svg"), { density: 192 }).resize({ width: 480 }).png().toBuffer();
const photos = ["rack-piso-cerrado", "gabinete-equipos-medida"].map((n) => path.join(root, "src/assets/productos", `${n}.webp`));
const tile = { w: 230, h: 330, gap: 24 };
const tiles = await Promise.all(
  photos.map((file) => sharp(file).flatten({ background: "#ffffff" }).resize({ width: tile.w, height: tile.h, fit: "contain", background: "#ffffff" }).png().toBuffer()),
);
const left = 1200 - 70 - (tile.w * 2 + tile.gap);
const top = Math.round((630 - tile.h) / 2);
const text = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
  <text x="70" y="250" font-family="Arial, Helvetica, sans-serif" font-size="44" font-weight="700" fill="#F4F5F3">Gabinetes, racks y</text>
  <text x="70" y="304" font-family="Arial, Helvetica, sans-serif" font-size="44" font-weight="700" fill="#F4F5F3">estructuras metálicas</text>
  <text x="70" y="358" font-family="Arial, Helvetica, sans-serif" font-size="44" font-weight="700" fill="#F4F5F3">a medida</text>
  <rect x="70" y="404" width="6" height="74" fill="#FF4A4F"/>
  <text x="92" y="438" font-family="Arial, Helvetica, sans-serif" font-size="28" fill="#FF4A4F">Lo ve en 3D antes de que</text>
  <text x="92" y="474" font-family="Arial, Helvetica, sans-serif" font-size="28" fill="#FF4A4F">lo fabriquemos.</text>
  <text x="70" y="574" font-family="Arial, Helvetica, sans-serif" font-size="24" fill="#9AA1AA">Medellín, Colombia</text>
</svg>`;
await sharp({ create: { width: 1200, height: 630, channels: 3, background: "#16191D" } })
  .composite([
    { input: Buffer.from(text), left: 0, top: 0 },
    { input: logo, left: 70, top: 70 },
    { input: tiles[0], left, top },
    { input: tiles[1], left: left + tile.w + tile.gap, top },
  ])
  .jpeg({ quality: 84, mozjpeg: true })
  .toFile(path.join(out, "og-default.jpg"));

for (const f of ["src/assets/brand/og-default.jpg", "public/apple-touch-icon.png"]) console.log(f, Math.round(fs.statSync(path.join(root, f)).size / 1024), "KB");
