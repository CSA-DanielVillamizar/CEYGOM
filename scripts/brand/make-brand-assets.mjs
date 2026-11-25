// Builds the touch icon for iPhone and iPad from the favicon (monogram on grafito):
//
//   node scripts/brand/make-brand-assets.mjs
//
// Output (commit it): public/apple-touch-icon.png. public/favicon.svg and the logos come from the brand kit unchanged.
// The share image is NOT built here any more: it is a designed piece from the brand team, set with
// scripts/brand/set-share-image.mjs.
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const root = path.resolve(import.meta.dirname, "../..");
const sharp = createRequire(path.join(root, "package.json"))("sharp");

const out = path.join(root, "public/apple-touch-icon.png");
await sharp(path.join(root, "public/favicon.svg"), { density: 384 }).resize(180, 180).png().toFile(out);
console.log("public/apple-touch-icon.png", Math.round(fs.statSync(out).size / 1024), "KB");
