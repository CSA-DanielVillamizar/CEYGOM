import { describe, expect, it } from "vitest";
import { PRODUCT_DETAILS } from "./catalog-details";
import { PRODUCTS, categoryLabel } from "./catalog";
import { MAX_REFERENCE_HITS, fold, search, type SearchEntry } from "./search";

const index: SearchEntry[] = [
  { s: "bandeja-porta-cables", n: "Bandejas porta cables", c: "bandejas-portacables", l: "Bandejas portacables", r: [["BP0101", "Bandeja porta cables 5*5"], ["BP0201", "Bandeja porta cables 10*5"]] },
  { s: "bandeja-reduccion-simetrica", n: "Reducción simétrica", c: "bandejas-portacables", l: "Bandejas portacables", r: [] },
  { s: "rack-de-piso", n: "Racks de piso", c: "racks-comunicaciones", l: "Racks y comunicaciones", r: [["RA1301", "Rack de piso 120cm"], ["RA1401", "Rack de piso 150cm"]] },
  { s: "canaleta", n: "Canaletas", c: "canaletas", l: "Canaletas", r: [["CA0101", "Canaleta 5*3"]] },
];

describe("fold", () => {
  it("ignores case and accents", () => {
    expect(fold("Reducción SIMÉTRICA")).toBe("reduccion simetrica");
  });
});

describe("search", () => {
  it("finds a product by an exact reference code, case-insensitively, and ranks it first", () => {
    const r = search(index, "bp0101");
    expect(r.products.map((p) => p.s)).toEqual(["bandeja-porta-cables"]);
    expect(r.references[0]).toMatchObject({ code: "BP0101", slug: "bandeja-porta-cables" });
  });

  it("matches a code prefix", () => {
    const r = search(index, "RA13");
    expect(r.references.map((x) => x.code)).toEqual(["RA1301"]);
  });

  it("finds by name without accents and by category", () => {
    expect(search(index, "reduccion").products.map((p) => p.s)).toEqual(["bandeja-reduccion-simetrica"]);
    expect(search(index, "comunicaciones").products.map((p) => p.s)).toEqual(["rack-de-piso"]);
  });

  it("requires every term (AND) and understands dimensions", () => {
    expect(search(index, "bandeja 10*5").references.map((x) => x.code)).toEqual(["BP0201"]);
    expect(search(index, "rack canaleta").products).toEqual([]);
  });

  it("applies the category filter, with or without a query", () => {
    expect(search(index, "", "canaletas").products.map((p) => p.s)).toEqual(["canaleta"]);
    expect(search(index, "bandeja", "canaletas").products).toEqual([]);
    expect(search(index, "", "").products).toHaveLength(index.length);
    expect(search(index, "", "").references).toEqual([]);
  });

  it("returns nothing for unknown terms and does not break on odd input", () => {
    expect(search(index, "zzzz").products).toEqual([]);
    for (const q of ["   ", "%%%", "(", "\\", "'; drop table", "<script>"]) expect(() => search(index, q)).not.toThrow();
  });
});

describe("search over the real catalog", () => {
  const real: SearchEntry[] = PRODUCTS.filter((p) => PRODUCT_DETAILS[p.slug]).map((p) => ({
    s: p.slug,
    n: p.name,
    c: p.category,
    l: categoryLabel(p.category),
    r: PRODUCT_DETAILS[p.slug]!.references.map((r) => [r.code, r.text] as [string, string]),
  }));

  it("finds every published reference code by its own code", () => {
    let checked = 0;
    for (const entry of real) {
      for (const [code] of entry.r) {
        checked++;
        const hit = search(real, code).references.find((h) => h.code === code && h.slug === entry.s);
        expect(hit, `${entry.s} ${code}`).toBeDefined();
      }
    }
    expect(checked).toBeGreaterThan(300);
  });

  it("caps the number of listed references", () => {
    expect(search(real, "a").references.length).toBeLessThanOrEqual(MAX_REFERENCE_HITS);
  });

  it("keeps the search index small enough to load on demand", () => {
    expect(JSON.stringify(real).length).toBeLessThan(60_000);
  });
});

describe("finish filter", () => {
  const withFinish: SearchEntry[] = [
    { ...index[0]!, f: ["galvanizado", "pintura-electrostatica"] },
    { ...index[2]!, f: ["pintura-electrostatica"] },
    index[3]!,
  ];

  it("keeps only the products offered in that finish, and combines with category and text", () => {
    expect(search(withFinish, "", "", "galvanizado").products.map((p) => p.s)).toEqual(["bandeja-porta-cables"]);
    expect(search(withFinish, "", "", "pintura-electrostatica").products.map((p) => p.s).sort()).toEqual(["bandeja-porta-cables", "rack-de-piso"]);
    expect(search(withFinish, "rack", "", "galvanizado").products).toEqual([]);
    expect(search(withFinish, "", "racks-comunicaciones", "pintura-electrostatica").products.map((p) => p.s)).toEqual(["rack-de-piso"]);
  });

  it("does not filter when no finish is chosen, and products without finish data never match a finish", () => {
    expect(search(withFinish, "").products).toHaveLength(3);
    expect(search(withFinish, "canaleta", "", "galvanizado").products).toEqual([]);
  });
});
