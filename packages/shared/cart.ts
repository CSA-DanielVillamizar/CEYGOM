// Quote list ("Mi cotización"): products and specific references the visitor collects while browsing the
// catalog, before opening the quote wizard. It lives in the browser (localStorage) and holds no personal data.
//
// Everything here is pure (no DOM): storage is passed in, so it runs in the browser scripts, in the wizard and
// in the tests. Whatever comes from storage is untrusted: parseCart drops or clamps anything unexpected.
import { REFERENCE_PATTERN } from "./reference";

export const CART_KEY = "ceygom-cart-v1";
/** Same limit as the quote request (MAX_ITEMS). */
export const CART_MAX_LINES = 20;
export const CART_MAX_QTY = 100_000;
/** A list untouched for this long is discarded. */
export const CART_TTL_DAYS = 30;

const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export interface CartLine {
  slug: string;
  /** Specific reference of the product (BP0101); absent when the visitor wants the product in general. */
  ref?: string;
  qty: number;
  /** Product name at the time it was added, only used to show the list without loading the catalog. */
  name?: string;
  /** Category id, only used to link the line to its product page. */
  cat?: string;
}

export interface Cart {
  v: 1;
  updatedAt: number;
  lines: CartLine[];
}

export type AddStatus = "added" | "updated" | "full" | "invalid";

export const emptyCart = (now = Date.now()): Cart => ({ v: 1, updatedAt: now, lines: [] });

export const lineKey = (line: Pick<CartLine, "slug" | "ref">): string => `${line.slug}|${line.ref ?? ""}`;

export const cartUnits = (cart: Cart): number => cart.lines.reduce((total, l) => total + l.qty, 0);

const clampQty = (value: unknown): number => {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return 1;
  return Math.min(CART_MAX_QTY, Math.max(1, Math.floor(n)));
};

// eslint-disable-next-line no-control-regex
const stripControl = (s: string) => s.replace(/[\u0000-\u001f\u007f]/g, "").trim();

/** Validates one line coming from storage or from the page. Returns null when it cannot be trusted. */
export function sanitizeLine(raw: unknown): CartLine | null {
  if (typeof raw !== "object" || raw === null) return null;
  const l = raw as { slug?: unknown; ref?: unknown; qty?: unknown; name?: unknown; cat?: unknown };
  if (typeof l.slug !== "string" || l.slug.length > 80 || !SLUG_PATTERN.test(l.slug)) return null;
  const line: CartLine = { slug: l.slug, qty: clampQty(l.qty ?? 1) };
  if (l.ref !== undefined && l.ref !== null && l.ref !== "") {
    if (typeof l.ref !== "string") return null;
    const ref = l.ref.trim().toUpperCase();
    if (!REFERENCE_PATTERN.test(ref)) return null;
    line.ref = ref;
  }
  if (typeof l.name === "string") {
    const name = stripControl(l.name).slice(0, 120);
    if (name) line.name = name;
  }
  if (typeof l.cat === "string" && l.cat.length <= 40 && SLUG_PATTERN.test(l.cat)) line.cat = l.cat;
  return line;
}

/** Reads a stored value tolerantly: anything invalid, expired or oversized becomes an empty or trimmed list. */
export function parseCart(raw: unknown, now = Date.now()): Cart {
  const empty = emptyCart(now);
  if (typeof raw !== "object" || raw === null) return empty;
  const r = raw as { v?: unknown; updatedAt?: unknown; lines?: unknown };
  if (r.v !== 1 || !Array.isArray(r.lines)) return empty;
  const updatedAt = typeof r.updatedAt === "number" && Number.isFinite(r.updatedAt) ? r.updatedAt : now;
  if (now - updatedAt > CART_TTL_DAYS * 86_400_000) return empty;

  const lines: CartLine[] = [];
  const seen = new Set<string>();
  for (const candidate of r.lines) {
    const line = sanitizeLine(candidate);
    if (!line || seen.has(lineKey(line))) continue;
    if (lines.length >= CART_MAX_LINES) break;
    seen.add(lineKey(line));
    lines.push(line);
  }
  return { v: 1, updatedAt, lines };
}

/** Adds a product or reference; adding the same one again increases its quantity. */
export function addLine(cart: Cart, input: unknown, now = Date.now()): { cart: Cart; status: AddStatus } {
  const line = sanitizeLine(input);
  if (!line) return { cart, status: "invalid" };
  const key = lineKey(line);
  const index = cart.lines.findIndex((l) => lineKey(l) === key);
  if (index >= 0) {
    const lines = cart.lines.map((l, i) => (i === index ? { ...l, qty: clampQty(l.qty + line.qty), name: line.name ?? l.name, cat: line.cat ?? l.cat } : l));
    return { cart: { ...cart, updatedAt: now, lines }, status: "updated" };
  }
  if (cart.lines.length >= CART_MAX_LINES) return { cart, status: "full" };
  return { cart: { ...cart, updatedAt: now, lines: [...cart.lines, line] }, status: "added" };
}

/** Sets the quantity of a line; zero or less removes it. */
export function setQty(cart: Cart, key: string, qty: number, now = Date.now()): Cart {
  if (!(qty >= 1)) return removeLine(cart, key, now);
  return { ...cart, updatedAt: now, lines: cart.lines.map((l) => (lineKey(l) === key ? { ...l, qty: clampQty(qty) } : l)) };
}

export function removeLine(cart: Cart, key: string, now = Date.now()): Cart {
  return { ...cart, updatedAt: now, lines: cart.lines.filter((l) => lineKey(l) !== key) };
}

// ---- Storage helpers (storage is injected; every call tolerates a missing or blocked storage) ----

type ReadStore = Pick<Storage, "getItem">;
type WriteStore = Pick<Storage, "setItem">;
type RemoveStore = Pick<Storage, "removeItem">;

export function loadCart(store: ReadStore | undefined, now = Date.now()): Cart {
  try {
    const raw = store?.getItem(CART_KEY);
    return parseCart(raw ? JSON.parse(raw) : null, now);
  } catch {
    return emptyCart(now);
  }
}

export function saveCart(store: WriteStore | undefined, cart: Cart): boolean {
  try {
    store?.setItem(CART_KEY, JSON.stringify(cart));
    return Boolean(store);
  } catch {
    return false;
  }
}

export function clearStoredCart(store: RemoveStore | undefined): void {
  try {
    store?.removeItem(CART_KEY);
  } catch {
    /* storage unavailable: nothing to clear */
  }
}
