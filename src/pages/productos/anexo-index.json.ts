import type { APIRoute } from "astro";
import { PRODUCTS } from "@shared/catalog";
import { PRODUCT_DETAILS } from "@shared/catalog-details";
import { buildAnnexIndex } from "@shared/annex";

// Built once at deploy time. "Mi cotización" fetches it only when the list has lines, to print the technical annex.
export const GET: APIRoute = () =>
  new Response(JSON.stringify(buildAnnexIndex(PRODUCTS, PRODUCT_DETAILS)), { headers: { "content-type": "application/json; charset=utf-8" } });
