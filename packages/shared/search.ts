// Catalog search: by reference code, product name or category. Pure and dependency-free so the page script
// stays tiny and the logic is unit-tested. The index is built at build time (src/pages/productos/search-index.json.ts)
// and fetched only when the visitor starts searching.

export interface SearchEntry {
  /** Product slug. */
  s: string;
  /** Product name. */
  n: string;
  /** Category id. */
  c: string;
  /** Category label. */
  l: string;
  /** References [code, description]. */
  r: [string, string][];
  /** Finishes the data sheet says the product comes in (see FINISH_LABELS). */
  f?: string[];
}

export const FINISH_LABELS: Record<string, string> = {
  galvanizado: "Galvanizado",
  "pintura-electrostatica": "Pintura electrostática en polvo",
};

export interface ReferenceHit {
  code: string;
  text: string;
  slug: string;
  name: string;
  category: string;
}

export interface SearchResult {
  products: SearchEntry[];
  references: ReferenceHit[];
}

/** Lower-case without accents, so "cruz" finds "Cruz" and "reduccion" finds "Reducción". */
export const fold = (value: string): string =>
  value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();

export const MAX_REFERENCE_HITS = 40;

const terms = (query: string): string[] => fold(query).split(/[^a-z0-9"*°]+/).filter(Boolean);

/**
 * Every term must appear in the product (name, category or any of its references) for it to match. References
 * are listed separately when a term looks like part of a code or of a description. Exact reference codes rank first.
 */
export function search(index: readonly SearchEntry[], query: string, category = "", finish = ""): SearchResult {
  const words = terms(query);
  const pool = index.filter((e) => (!category || e.c === category) && (!finish || e.f?.includes(finish)));
  if (words.length === 0) return { products: pool, references: [] };

  const scored: { entry: SearchEntry; score: number }[] = [];
  const references: (ReferenceHit & { score: number })[] = [];

  for (const entry of pool) {
    const name = fold(entry.n);
    const label = fold(entry.l);
    const refText = entry.r.map(([code, text]) => `${fold(code)} ${fold(text)}`).join(" ");
    const haystack = `${name} ${label} ${refText}`;
    if (!words.every((w) => haystack.includes(w))) continue;

    let score = 0;
    for (const w of words) {
      if (entry.r.some(([code]) => fold(code) === w)) score += 100;
      else if (entry.r.some(([code]) => fold(code).startsWith(w))) score += 20;
      if (name.startsWith(w)) score += 10;
      else if (name.includes(w)) score += 5;
      else if (label.includes(w)) score += 2;
    }
    scored.push({ entry, score });

    for (const [code, text] of entry.r) {
      const ref = `${fold(code)} ${fold(text)} ${name}`;
      if (!words.every((w) => ref.includes(w))) continue;
      const exact = words.some((w) => fold(code) === w);
      const prefix = words.some((w) => fold(code).startsWith(w));
      references.push({ code, text, slug: entry.s, name: entry.n, category: entry.c, score: exact ? 100 : prefix ? 20 : 1 });
    }
  }

  scored.sort((a, b) => b.score - a.score || a.entry.n.localeCompare(b.entry.n, "es"));
  references.sort((a, b) => b.score - a.score || a.code.localeCompare(b.code));
  return {
    products: scored.map((x) => x.entry),
    references: references.slice(0, MAX_REFERENCE_HITS).map(({ score: _score, ...hit }) => hit),
  };
}
