// Builds the catalog data from the manifest and the files downloaded from the company's current site.
//
//   node scripts/catalog/import-catalog.mjs <download-folder>
//
// <download-folder> must contain `fichas/*.pdf` and `img/*.png` (see scripts/catalog/README.md).
// Requires `pdftotext` (poppler) to read the references printed in each data sheet.
//
// Output (commit it): public/fichas/**, src/assets/productos/*.webp, packages/shared/catalog-index.ts,
// packages/shared/catalog-details.ts and docs/catalogo/pendientes.md. Nothing is invented: the references come
// from the data sheets, and whatever is missing is listed as pending for the company to provide.
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const root = path.resolve(import.meta.dirname, "../..");
const staging = process.argv[2];
if (!staging) throw new Error("Usage: node scripts/catalog/import-catalog.mjs <download-folder>");
const sharp = createRequire(path.join(root, "package.json"))("sharp");

const manifest = JSON.parse(fs.readFileSync(path.join(root, "scripts/catalog/manifest.json"), "utf8"));
const out = {
  fichas: path.join(root, "public/fichas"),
  assets: path.join(root, "src/assets/productos"),
};
fs.rmSync(out.fichas, { recursive: true, force: true });
fs.rmSync(out.assets, { recursive: true, force: true });
fs.mkdirSync(out.fichas, { recursive: true });
fs.mkdirSync(out.assets, { recursive: true });

const kebab = (s) => s.replace(/\.[a-z]+$/i, "").replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

// Drops the dimension columns that follow the description in a reference row ("... 5*5 55 50 2400 42 74 Kg/m").
function describe(rest) {
  // The sheets sometimes glue words and numbers ("cables30*8", "149Kg/m").
  const tokens = rest.replace(/([a-záéíóúñ])(\d+\*\d+)/gi, "$1 $2").trim().split(/\s+/);
  const numeric = (t) => /^\d+([.,]\d+)?(kg\/m|kg)?$/i.test(t);
  const unit = (t) => /^(kg|kg\/m|mm|cm|m)$/i.test(t);
  if (tokens.length > 1 && unit(tokens.at(-1)) && numeric(tokens.at(-2) ?? "")) tokens.pop();
  while (tokens.length > 1 && numeric(tokens.at(-1))) tokens.pop();
  return tokens.join(" ");
}

function parseReferences(text) {
  const seen = new Set();
  const refs = [];
  for (const line of text.split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z]{1,4}\d{3,6}[A-Z]?)\s+(.+?)\s*$/);
    if (!m || seen.has(m[1])) continue;
    seen.add(m[1]);
    refs.push({ code: m[1], text: describe(m[2]) });
  }
  return refs;
}

// Optimized WebP masters (max 800 px wide); Astro derives the delivered sizes at build time.
const imageCache = new Map();
async function webp(file) {
  if (imageCache.has(file)) return imageCache.get(file);
  const name = kebab(file);
  const src = path.join(staging, "img", file);
  if (!fs.existsSync(src)) throw new Error(`Missing image ${file}`);
  await sharp(src).flatten({ background: "#ffffff" }).resize({ width: 800, withoutEnlargement: true }).webp({ quality: 80 }).toFile(path.join(out.assets, `${name}.webp`));
  imageCache.set(file, name);
  return name;
}

const placeholderSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="500" height="650"><rect width="500" height="650" fill="#eef0f2"/><rect x="170" y="200" width="160" height="120" rx="8" fill="none" stroke="#9aa3ad" stroke-width="6"/><circle cx="215" cy="245" r="12" fill="#9aa3ad"/><path d="M180 310 l45 -40 l35 30 l25 -20 l30 30" fill="none" stroke="#9aa3ad" stroke-width="6"/><text x="250" y="390" font-family="Arial" font-size="26" fill="#5b6570" text-anchor="middle">Foto en preparación</text></svg>`;
await sharp(Buffer.from(placeholderSvg)).webp({ quality: 85 }).toFile(path.join(out.assets, "placeholder.webp"));

const index = [];
const details = {};
const pending = [];

for (const p of manifest.products) {
  index.push({ slug: p.slug, name: p.name, category: p.category });
  const missing = [];
  let ficha = null;
  let references = [];

  if (p.ficha) {
    const src = path.join(staging, "fichas", p.ficha);
    if (!fs.existsSync(src)) throw new Error(`Missing data sheet ${p.ficha}`);
    fs.mkdirSync(path.join(out.fichas, p.category), { recursive: true });
    const dest = path.join(out.fichas, p.category, `${p.slug}.pdf`);
    fs.copyFileSync(src, dest);
    const text = execFileSync("pdftotext", ["-layout", "-enc", "UTF-8", src, "-"], { encoding: "utf8", maxBuffer: 20 * 1024 * 1024 });
    references = parseReferences(text);
    ficha = { path: `/fichas/${p.category}/${p.slug}.pdf`, code: text.match(/FT-MYV-\d+/)?.[0] ?? null, sizeKb: Math.round(fs.statSync(dest).size / 1024) };
    if (references.length === 0) missing.push("Tabla de referencias (la ficha no se puede leer como texto; consultar el PDF)");
  } else {
    missing.push(p.fichaNote ? `Ficha técnica (${p.fichaNote})` : "Ficha técnica");
  }

  const images = [];
  for (const img of p.images) {
    images.push({ file: await webp(img.file), illustrative: Boolean(img.illustrative), confirm: Boolean(img.confirm) });
    if (img.illustrative) missing.push("Foto real del producto (la actual es ilustrativa)");
    if (img.confirm) missing.push("Confirmar que la foto corresponde al producto");
  }
  if (images.length === 0) {
    images.push({ file: "placeholder", illustrative: true, confirm: false });
    missing.push("Foto del producto");
  }
  missing.push("Descripción comercial y especificaciones aprobadas por la empresa");

  details[p.slug] = { ficha, references, images, pending: [...new Set(missing)] };
  pending.push({ ...p, missing: [...new Set(missing)] });
}

const header = "// Output of scripts/catalog/import-catalog.mjs (source: scripts/catalog/manifest.json). Do not edit by hand.\n";
fs.writeFileSync(
  path.join(root, "packages/shared/catalog-index.ts"),
  `${header}// Light product index (slug, name, category): the only catalog data the quote wizard bundles.\nimport type { CategoryId } from "./catalog";\n\nexport const CATALOG_INDEX: readonly { slug: string; name: string; category: CategoryId }[] = ${JSON.stringify(index, null, 2)};\n`,
);
fs.writeFileSync(
  path.join(root, "packages/shared/catalog-details.ts"),
  `${header}// Product pages only: references read from the data sheets, photos and pending items. Keep it out of the wizard.\n\nexport interface ProductImage {\n  /** File name (no extension) in src/assets/productos. */\n  file: string;\n  /** True when the photo does not show this exact product. */\n  illustrative: boolean;\n  /** True when the assignment of the photo still has to be confirmed with the company. */\n  confirm: boolean;\n}\n\nexport interface ProductDetail {\n  ficha: { path: string; code: string | null; sizeKb: number } | null;\n  references: { code: string; text: string }[];\n  images: ProductImage[];\n  pending: string[];\n}\n\nexport const PRODUCT_DETAILS: Record<string, ProductDetail> = ${JSON.stringify(details, null, 2)};\n`,
);

// Review list for the company.
const cats = { "bandejas-portacables": "Bandejas portacables", canaletas: "Canaletas", "racks-comunicaciones": "Racks y comunicaciones", "linea-electrica": "Línea eléctrica y gabinetes", soportes: "Soportes" };
let md = "# Catálogo: datos pendientes por producto\n\nGenerado por `scripts/catalog/import-catalog.mjs`. Lista lo que falta o debe confirmar la empresa antes de publicar el catálogo. Las referencias de cada producto se leen de su ficha técnica; no se ha inventado ningún dato técnico.\n";
for (const [id, label] of Object.entries(cats)) {
  md += `\n## ${label}\n\n| Producto | Referencias leídas | Ficha | Pendiente |\n|---|---|---|---|\n`;
  for (const p of pending.filter((x) => x.category === id)) {
    const d = details[p.slug];
    md += `| ${p.name} | ${d.references.length} | ${d.ficha ? `${d.ficha.code ?? "PDF"}` : "falta"} | ${p.missing.join("; ")} |\n`;
  }
}
fs.mkdirSync(path.join(root, "docs/catalogo"), { recursive: true });
fs.writeFileSync(path.join(root, "docs/catalogo/pendientes.md"), md);

const totals = {
  products: index.length,
  fichas: Object.values(details).filter((d) => d.ficha).length,
  withReferences: Object.values(details).filter((d) => d.references.length).length,
  references: Object.values(details).reduce((a, d) => a + d.references.length, 0),
  images: imageCache.size,
  illustrative: Object.values(details).filter((d) => d.images.some((i) => i.illustrative)).length,
};
console.log(JSON.stringify(totals));
