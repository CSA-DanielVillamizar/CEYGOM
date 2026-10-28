// Catalog taxonomy shared by the site (product pages) and the quote wizard + API.
// Products live in catalog-index.ts (generated from scripts/catalog/manifest.json, which comes from the
// product and data-sheet list of the legacy site). The heavy data (references, photos, pending items) is in
// catalog-details.ts and is only imported by the Astro pages, never by the wizard.

import { CATALOG_INDEX } from "./catalog-index";

export const CATEGORIES = [
  { id: "bandejas-portacables", label: "Bandejas portacables" },
  { id: "canaletas", label: "Canaletas" },
  { id: "racks-comunicaciones", label: "Racks y comunicaciones" },
  { id: "linea-electrica", label: "Línea eléctrica y gabinetes" },
  { id: "soportes", label: "Soportes" },
  { id: "a-medida", label: "Fabricación a medida" },
] as const;

export type CategoryId = (typeof CATEGORIES)[number]["id"];

// z.enum needs a non-empty tuple of string literals.
export const CATEGORY_IDS = CATEGORIES.map((c) => c.id) as [CategoryId, ...CategoryId[]];

export interface Product {
  slug: string;
  name: string;
  category: CategoryId;
}

export const PRODUCTS: readonly Product[] = [
  ...CATALOG_INDEX,
  { slug: "fabricacion-a-medida", name: "Gabinetes, racks y estructuras a medida", category: "a-medida" },
];

export const productBySlug = (slug: string): Product | undefined =>
  PRODUCTS.find((p) => p.slug === slug);

export const categoryLabel = (id: CategoryId): string =>
  CATEGORIES.find((c) => c.id === id)?.label ?? id;
