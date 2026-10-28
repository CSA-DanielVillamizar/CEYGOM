// Technical annex of the printed quote list: for every product in the list, what its data sheet says (material,
// finishes, colors, data sheet code) and, for each specific reference, its description and dimensions.
// Pure and DOM-free. The index is built at deploy time (src/pages/productos/anexo-index.json.ts) and fetched only
// by the quote-list page when the list has lines. Nothing is estimated: what the sheet does not state is left out.
import { FINISH_LABELS } from "./search";

export interface AnnexProduct {
  /** Product name. */
  n: string;
  /** Data sheet code (FT-MYV-nn) and public path. */
  t?: string;
  p?: string;
  /** Material as stated in the sheet. */
  m?: string;
  /** Finishes offered. */
  f?: string[];
  /** Index into AnnexIndex.colors. */
  k?: number;
  /** Dimension columns, when the sheet table is read with certainty. */
  c?: string[];
  /** Reference code -> [description, ...one value per column in `c`]. */
  r: Record<string, string[]>;
}

export interface AnnexIndex {
  /** Distinct color tables ("01 Blanco, 02 Negro, ..."): they are not identical across sheets. */
  colors: string[];
  products: Record<string, AnnexProduct>;
}

export interface AnnexEntry {
  name: string;
  ficha?: { code?: string; path: string };
  material?: string;
  finishes: string[];
  colors?: string;
  refs: { code: string; text: string; specs: [string, string][] }[];
}

interface SourceDetail {
  ficha: { path: string; code: string | null } | null;
  references: { code: string; text: string }[];
  material?: string;
  finishes: string[];
  colors: { code: string; name: string }[];
  specs?: { columns: string[]; rows: Record<string, string[]> };
}

export function buildAnnexIndex(products: readonly { slug: string; name: string }[], details: Record<string, SourceDetail | undefined>): AnnexIndex {
  const colors: string[] = [];
  const out: Record<string, AnnexProduct> = {};
  for (const p of products) {
    const d = details[p.slug];
    if (!d) continue;
    const entry: AnnexProduct = { n: p.name, r: {} };
    if (d.ficha) {
      if (d.ficha.code) entry.t = d.ficha.code;
      entry.p = d.ficha.path;
    }
    if (d.material) entry.m = d.material;
    if (d.finishes.length) entry.f = d.finishes;
    if (d.colors.length) {
      const text = d.colors.map((c) => `${c.code} ${c.name}`).join(", ");
      let i = colors.indexOf(text);
      if (i < 0) i = colors.push(text) - 1;
      entry.k = i;
    }
    if (d.specs) entry.c = d.specs.columns;
    for (const r of d.references) entry.r[r.code] = [r.text, ...(d.specs?.rows[r.code] ?? [])];
    out[p.slug] = entry;
  }
  return { colors, products: out };
}

/** One entry per distinct product in the list, in list order, with the specific references asked for. */
export function annexFor(index: AnnexIndex, lines: readonly { slug: string; ref?: string }[]): AnnexEntry[] {
  const entries = new Map<string, AnnexEntry>();
  for (const line of lines) {
    const p = index.products[line.slug];
    if (!p) continue;
    let entry = entries.get(line.slug);
    if (!entry) {
      entry = {
        name: p.n,
        ...(p.p ? { ficha: { path: p.p, ...(p.t ? { code: p.t } : {}) } } : {}),
        ...(p.m ? { material: p.m } : {}),
        finishes: (p.f ?? []).map((f) => FINISH_LABELS[f] ?? f),
        ...(p.k !== undefined && index.colors[p.k] ? { colors: index.colors[p.k] } : {}),
        refs: [],
      };
      entries.set(line.slug, entry);
    }
    const ref = line.ref ? p.r[line.ref] : undefined;
    if (line.ref && ref && !entry.refs.some((r) => r.code === line.ref)) {
      const [text = "", ...values] = ref;
      entry.refs.push({ code: line.ref, text, specs: values.length === p.c?.length ? (p.c.map((label, i) => [label, values[i]!]) as [string, string][]) : [] });
    }
  }
  return [...entries.values()];
}
