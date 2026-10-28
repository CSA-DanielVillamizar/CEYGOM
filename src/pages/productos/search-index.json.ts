import type { APIRoute } from "astro";
import { PRODUCTS, categoryLabel } from "@shared/catalog";
import { PRODUCT_DETAILS } from "@shared/catalog-details";
import type { SearchEntry } from "@shared/search";

// Built once at deploy time. The catalog page fetches it only when the visitor starts searching, so it costs
// nothing on any other page (about 25 KB, a few KB compressed).
export const GET: APIRoute = () => {
  const index: SearchEntry[] = PRODUCTS.filter((p) => PRODUCT_DETAILS[p.slug]).map((p) => ({
    s: p.slug,
    n: p.name,
    c: p.category,
    l: categoryLabel(p.category),
    r: PRODUCT_DETAILS[p.slug]!.references.map((r) => [r.code, r.text] as [string, string]),
    ...(PRODUCT_DETAILS[p.slug]!.finishes.length ? { f: PRODUCT_DETAILS[p.slug]!.finishes } : {}),
  }));
  return new Response(JSON.stringify(index), { headers: { "content-type": "application/json; charset=utf-8" } });
};
