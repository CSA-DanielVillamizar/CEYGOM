import { existsSync, statSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { CATEGORIES, CATEGORY_IDS, PRODUCTS, categoryLabel, productBySlug } from "./catalog";
import { PRODUCT_DETAILS } from "./catalog-details";

const root = resolve(__dirname, "../..");
const withPage = PRODUCTS.filter((p) => p.category !== "a-medida");

describe("catalog", () => {
  it("has unique, URL-safe slugs", () => {
    const slugs = PRODUCTS.map((p) => p.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const slug of slugs) expect(slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
  });

  it("puts every product in a known category and names it", () => {
    for (const p of PRODUCTS) {
      expect(CATEGORY_IDS).toContain(p.category);
      expect(p.name.trim().length).toBeGreaterThan(1);
      expect(categoryLabel(p.category)).not.toBe(p.category);
    }
    expect(productBySlug("rack-cerrado-abatible")?.name).toBe("Rack cerrado abatible");
    expect(productBySlug("no-existe")).toBeUndefined();
  });

  it("keeps the made-to-order entry the wizard links to", () => {
    expect(productBySlug("fabricacion-a-medida")?.category).toBe("a-medida");
  });

  it("covers every category that has products", () => {
    for (const c of CATEGORIES.filter((c) => c.id !== "a-medida")) {
      expect(PRODUCTS.filter((p) => p.category === c.id).length).toBeGreaterThan(0);
    }
  });
});

describe("product details", () => {
  it("exist for every product with a page and for nothing else", () => {
    expect(Object.keys(PRODUCT_DETAILS).sort()).toEqual(withPage.map((p) => p.slug).sort());
  });

  it("point to data sheets that exist, are PDFs and are small", () => {
    let sheets = 0;
    for (const [slug, d] of Object.entries(PRODUCT_DETAILS)) {
      if (!d.ficha) continue;
      sheets++;
      expect(d.ficha.path, slug).toMatch(/^\/fichas\/[a-z-]+\/[a-z0-9-]+\.pdf$/);
      const file = resolve(root, "public", d.ficha.path.slice(1));
      expect(existsSync(file), `${slug}: missing ${d.ficha.path}`).toBe(true);
      expect(statSync(file).size, slug).toBeLessThan(2 * 1024 * 1024);
    }
    expect(sheets).toBeGreaterThanOrEqual(40);
  });

  it("have at least one photo, and every photo file exists", () => {
    for (const [slug, d] of Object.entries(PRODUCT_DETAILS)) {
      expect(d.images.length, slug).toBeGreaterThan(0);
      for (const image of d.images) {
        expect(existsSync(resolve(root, "src/assets/productos", `${image.file}.webp`)), `${slug}: ${image.file}`).toBe(true);
      }
    }
  });

  it("list well-formed, non-repeated references", () => {
    let total = 0;
    for (const [slug, d] of Object.entries(PRODUCT_DETAILS)) {
      const codes = d.references.map((r) => r.code);
      expect(new Set(codes).size, slug).toBe(codes.length);
      for (const r of d.references) {
        total++;
        expect(r.code, slug).toMatch(/^[A-Z]{1,4}\d{3,6}[A-Z]?$/);
        expect(r.text.trim().length, `${slug} ${r.code}`).toBeGreaterThan(2);
        expect(r.text, `${slug} ${r.code}`).not.toContain("�");
      }
    }
    expect(total).toBeGreaterThan(300);
  });

  it("flag as pending whatever is not backed by real data", () => {
    for (const [slug, d] of Object.entries(PRODUCT_DETAILS)) {
      if (!d.ficha) expect(d.pending.some((x) => x.startsWith("Ficha técnica")), slug).toBe(true);
      if (d.images.some((i) => i.illustrative)) expect(d.pending.some((x) => x.includes("foto") || x.includes("Foto")), slug).toBe(true);
    }
  });
});

describe("technical facts read from the data sheets", () => {
  const details = Object.entries(PRODUCT_DETAILS);

  it("only lists known finishes and well-formed color codes", () => {
    for (const [slug, d] of details) {
      for (const f of d.finishes) expect(["galvanizado", "pintura-electrostatica"], slug).toContain(f);
      for (const c of d.colors) expect(c.code, slug).toMatch(/^\d{2}$/);
    }
  });

  it("publishes dimensions only for references of the product, with one value per column", () => {
    const withSpecs = details.filter(([, d]) => d.specs);
    expect(withSpecs.length).toBeGreaterThanOrEqual(8);
    for (const [slug, d] of withSpecs) {
      const codes = new Set(d.references.map((r) => r.code));
      for (const [code, values] of Object.entries(d.specs!.rows)) {
        expect(codes.has(code), `${slug} ${code}`).toBe(true);
        expect(values, `${slug} ${code}`).toHaveLength(d.specs!.columns.length);
        for (const v of values) expect(v).toMatch(/^\d+(\.\d+)?$/);
      }
      expect(Object.keys(d.specs!.rows).length / d.references.length, slug).toBeGreaterThanOrEqual(0.8);
    }
  });

  it("matches what the printed sheets say (spot checks against the PDFs)", () => {
    const tray = PRODUCT_DETAILS["bandeja-porta-cables"]!;
    expect(tray.specs!.columns).toEqual(["Altura total (mm)", "Ancho (mm)", "Longitud (mm)", "Altura (mm)", "Capacidad de carga (kg/m)"]);
    expect(tray.specs!.rows["BP0101"]).toEqual(["55", "50", "2400", "42", "74"]);
    expect(tray.specs!.rows["BP1201"]).toEqual(["85", "300", "2400", "72", "149"]);
    expect(PRODUCT_DETAILS["canaleta"]!.specs!.rows["CN2401"]).toEqual(["240", "80", "2400", "20"]);
    expect(tray.finishes).toEqual(["galvanizado", "pintura-electrostatica"]);
    expect(PRODUCT_DETAILS["rack-de-piso"]!.finishes).toEqual(["pintura-electrostatica"]);
    expect(tray.colors).toContainEqual({ code: "01", name: "Blanco" });
  });
});
