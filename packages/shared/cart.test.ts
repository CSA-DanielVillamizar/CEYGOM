import { describe, expect, it } from "vitest";
import {
  CART_KEY,
  CART_MAX_LINES,
  CART_MAX_QTY,
  CART_TTL_DAYS,
  addLine,
  cartUnits,
  clearStoredCart,
  emptyCart,
  lineKey,
  loadCart,
  parseCart,
  removeLine,
  saveCart,
  setQty,
} from "./cart";

const NOW = 1_800_000_000_000;
const DAY = 86_400_000;

describe("addLine", () => {
  it("adds a product, then a specific reference as a separate line", () => {
    let r = addLine(emptyCart(NOW), { slug: "bandeja-porta-cables", name: "Bandejas porta cables" }, NOW);
    expect(r.status).toBe("added");
    r = addLine(r.cart, { slug: "bandeja-porta-cables", ref: "bp0101", qty: 10 }, NOW);
    expect(r.status).toBe("added");
    expect(r.cart.lines.map(lineKey)).toEqual(["bandeja-porta-cables|", "bandeja-porta-cables|BP0101"]);
    expect(r.cart.lines[1]).toMatchObject({ ref: "BP0101", qty: 10 });
    expect(cartUnits(r.cart)).toBe(11);
  });

  it("merges the same product and reference by adding quantities", () => {
    const a = addLine(emptyCart(NOW), { slug: "canaleta", ref: "CA0101", qty: 2 }, NOW);
    const b = addLine(a.cart, { slug: "canaleta", ref: "CA0101", qty: 3 }, NOW);
    expect(b.status).toBe("updated");
    expect(b.cart.lines).toHaveLength(1);
    expect(b.cart.lines[0]!.qty).toBe(5);
  });

  it("refuses a 21st different line and keeps the list intact", () => {
    let cart = emptyCart(NOW);
    for (let i = 0; i < CART_MAX_LINES; i++) cart = addLine(cart, { slug: `producto-${i}` }, NOW).cart;
    const full = addLine(cart, { slug: "uno-mas" }, NOW);
    expect(full.status).toBe("full");
    expect(full.cart.lines).toHaveLength(CART_MAX_LINES);
    // An existing line can still grow.
    expect(addLine(cart, { slug: "producto-0", qty: 4 }, NOW).status).toBe("updated");
  });

  it.each([null, undefined, 5, "x", {}, { slug: "Slug Con Espacios" }, { slug: "../etc" }, { slug: "ok", ref: "no-valida" }, { slug: "ok", ref: 12 }])(
    "ignores the invalid input %j",
    (input) => {
      const start = emptyCart(NOW);
      const r = addLine(start, input, NOW);
      expect(r.status).toBe("invalid");
      expect(r.cart).toBe(start);
    },
  );

  it("keeps a valid category for linking and drops an invalid one", () => {
    expect(addLine(emptyCart(NOW), { slug: "a", cat: "canaletas" }, NOW).cart.lines[0]!.cat).toBe("canaletas");
    for (const cat of ["Canaletas", "../x", "a b", 5, "x".repeat(41)]) expect(addLine(emptyCart(NOW), { slug: "a", cat }, NOW).cart.lines[0]!.cat, String(cat)).toBeUndefined();
  });

  it("clamps quantities and strips control characters from names", () => {
    const r = addLine(emptyCart(NOW), { slug: "a", qty: 10 ** 9, name: "Nombre\u0000\n raro" }, NOW);
    expect(r.cart.lines[0]).toEqual({ slug: "a", qty: CART_MAX_QTY, name: "Nombre raro" });
    expect(addLine(emptyCart(NOW), { slug: "a", qty: -3 }, NOW).cart.lines[0]!.qty).toBe(1);
    expect(addLine(emptyCart(NOW), { slug: "a", qty: "7" }, NOW).cart.lines[0]!.qty).toBe(7);
    expect(addLine(emptyCart(NOW), { slug: "a", qty: "abc" }, NOW).cart.lines[0]!.qty).toBe(1);
  });
});

describe("setQty and removeLine", () => {
  const start = addLine(addLine(emptyCart(NOW), { slug: "a", qty: 2 }, NOW).cart, { slug: "b", ref: "TE0901" }, NOW).cart;

  it("changes a quantity, and zero removes the line", () => {
    expect(setQty(start, "a|", 9, NOW).lines.find((l) => l.slug === "a")!.qty).toBe(9);
    expect(setQty(start, "a|", 0, NOW).lines.map((l) => l.slug)).toEqual(["b"]);
    expect(setQty(start, "a|", Number.NaN, NOW).lines.map((l) => l.slug)).toEqual(["b"]);
  });

  it("removes by key and leaves the rest", () => {
    expect(removeLine(start, "b|TE0901", NOW).lines.map(lineKey)).toEqual(["a|"]);
    expect(removeLine(start, "no-existe|", NOW).lines).toHaveLength(2);
  });
});

describe("parseCart", () => {
  it.each([null, undefined, "texto", 42, [], {}, { v: 2, lines: [] }, { v: 1, lines: "no" }])("turns %j into an empty list", (raw) => {
    expect(parseCart(raw, NOW).lines).toEqual([]);
  });

  it("drops bad and repeated lines and trims to the limit", () => {
    const lines = [
      { slug: "ok", qty: 2 },
      { slug: "ok", qty: 9 },
      { slug: "MALO" },
      { slug: "ok", ref: "ZZ", qty: 1 },
      ...Array.from({ length: 40 }, (_, i) => ({ slug: `p-${i}` })),
    ];
    const cart = parseCart({ v: 1, updatedAt: NOW, lines }, NOW);
    expect(cart.lines).toHaveLength(CART_MAX_LINES);
    expect(cart.lines[0]).toEqual({ slug: "ok", qty: 2 });
  });

  it("discards a list older than the retention period", () => {
    const stored = { v: 1, updatedAt: NOW - (CART_TTL_DAYS + 1) * DAY, lines: [{ slug: "ok" }] };
    expect(parseCart(stored, NOW).lines).toEqual([]);
    expect(parseCart({ ...stored, updatedAt: NOW - (CART_TTL_DAYS - 1) * DAY }, NOW).lines).toHaveLength(1);
  });

  it("does not trust prototype or script payloads", () => {
    const cart = parseCart(JSON.parse('{"v":1,"lines":[{"slug":"ok","name":"<img src=x onerror=alert(1)>","__proto__":{"admin":true}}]}'), NOW);
    expect(cart.lines).toHaveLength(1);
    expect(Object.keys(cart.lines[0]!).sort()).toEqual(["name", "qty", "slug"]);
    expect(({} as Record<string, unknown>).admin).toBeUndefined();
  });
});

describe("storage helpers", () => {
  const memory = () => {
    const data = new Map<string, string>();
    return { getItem: (k: string) => data.get(k) ?? null, setItem: (k: string, v: string) => void data.set(k, v), removeItem: (k: string) => void data.delete(k), data };
  };

  it("round-trips a list and clears it", () => {
    const store = memory();
    const cart = addLine(emptyCart(NOW), { slug: "a", ref: "BP0101", qty: 3, name: "Bandeja" }, NOW).cart;
    expect(saveCart(store, cart)).toBe(true);
    expect(loadCart(store, NOW)).toEqual(cart);
    clearStoredCart(store);
    expect(store.data.has(CART_KEY)).toBe(false);
    expect(loadCart(store, NOW).lines).toEqual([]);
  });

  it("survives corrupt, missing or throwing storage", () => {
    const corrupt = memory();
    corrupt.setItem(CART_KEY, "{no es json");
    expect(loadCart(corrupt, NOW).lines).toEqual([]);
    expect(loadCart(undefined, NOW).lines).toEqual([]);
    const blocked = {
      getItem: () => { throw new Error("blocked"); },
      setItem: () => { throw new Error("quota"); },
      removeItem: () => { throw new Error("blocked"); },
    };
    expect(loadCart(blocked, NOW).lines).toEqual([]);
    expect(saveCart(blocked, emptyCart(NOW))).toBe(false);
    expect(() => clearStoredCart(blocked)).not.toThrow();
    expect(saveCart(undefined, emptyCart(NOW))).toBe(false);
  });
});
