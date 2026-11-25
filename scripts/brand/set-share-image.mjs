// Sets the share image (1200x630) the site serves from one of the three pieces the brand team delivered
// (docs/marca/og/): `a` (logo A), `b` (logo B) or `neutra` (no logo).
//
//   node scripts/brand/set-share-image.mjs a
//
// Output (commit it): src/assets/brand/og-default.jpg. This is the only thing that writes that file; make-brand-assets.mjs
// no longer touches it, so regenerating the touch icon never overwrites the designed piece.
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const root = path.resolve(import.meta.dirname, "../..");
const choice = process.argv[2];
const options = { a: "og-ceygom-a.png", b: "og-ceygom-b.png", neutra: "og-ceygom-neutra.png" };
if (!options[choice]) throw new Error(`Usage: node scripts/brand/set-share-image.mjs <${Object.keys(options).join("|")}>`);

const sharp = createRequire(path.join(root, "package.json"))("sharp");
const source = path.join(root, "docs/marca/og", options[choice]);
const meta = await sharp(source).metadata();
if (meta.width !== 1200 || meta.height !== 630) throw new Error(`${options[choice]} must be 1200x630, it is ${meta.width}x${meta.height}`);

const out = path.join(root, "src/assets/brand/og-default.jpg");
await sharp(source).flatten({ background: "#16191D" }).jpeg({ quality: 88, mozjpeg: true }).toFile(out);
console.log(`og-default.jpg <- ${options[choice]} (${Math.round(fs.statSync(out).size / 1024)} KB)`);
