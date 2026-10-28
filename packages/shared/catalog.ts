// Catalog taxonomy shared by the site (product pages) and the quote wizard + API.
// Names come from the product/data-sheet list of the legacy site (productos.html).
// TODO(negocio): add descriptions, norms, materials and data-sheet PDFs per product.

export const CATEGORIES = [
  { id: "bandejas-portacables", label: "Bandejas portacables" },
  { id: "canaletas", label: "Canaletas" },
  { id: "racks-comunicaciones", label: "Racks y comunicaciones" },
  { id: "linea-electrica", label: "Línea eléctrica" },
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
  { slug: "bandeja-portacables", name: "Bandejas portacables", category: "bandejas-portacables" },
  { slug: "bandeja-cruz", name: "Cruz", category: "bandejas-portacables" },
  { slug: "bandeja-curva-horizontal-45", name: "Curva horizontal 45°", category: "bandejas-portacables" },
  { slug: "bandeja-curva-horizontal-90", name: "Curva horizontal 90°", category: "bandejas-portacables" },
  { slug: "bandeja-curva-vertical-exterior", name: "Curva vertical exterior", category: "bandejas-portacables" },
  { slug: "bandeja-curva-vertical-interior", name: "Curva vertical interior", category: "bandejas-portacables" },
  { slug: "bandeja-reduccion-asimetrica", name: "Reducción asimétrica", category: "bandejas-portacables" },
  { slug: "bandeja-reduccion-simetrica", name: "Reducción simétrica", category: "bandejas-portacables" },
  { slug: "bandeja-te", name: "Te", category: "bandejas-portacables" },

  { slug: "canaleta", name: "Canaletas", category: "canaletas" },
  { slug: "canaleta-curvas-horizontales", name: "Curvas horizontales (interior y exterior)", category: "canaletas" },
  { slug: "canaleta-curvas-verticales", name: "Curvas verticales (interior y exterior)", category: "canaletas" },
  { slug: "canaleta-tapas", name: "Tapas sencillas, dobles y triples (planas y realzadas)", category: "canaletas" },
  { slug: "canaleta-te-cruz", name: "Te y cruz (canaletas y ductos)", category: "canaletas" },

  { slug: "bandeja-19-pulgadas", name: "Bandejas de 19\"", category: "racks-comunicaciones" },
  { slug: "multitoma-19-pulgadas", name: "Multitomas de 19\"", category: "racks-comunicaciones" },
  { slug: "organizador-tipo-varilla", name: "Organizador tipo varilla", category: "racks-comunicaciones" },
  { slug: "rack-cerrado-abatible", name: "Rack cerrado abatible", category: "racks-comunicaciones" },
  { slug: "rack-cerrado-un-cuerpo", name: "Rack cerrado de un cuerpo", category: "racks-comunicaciones" },
  { slug: "rack-de-piso", name: "Racks de piso", category: "racks-comunicaciones" },
  { slug: "rack-abierto-de-pared", name: "Rack abierto de pared", category: "racks-comunicaciones" },
  { slug: "patch-panel", name: "Patch panels (12 y 24 puntos)", category: "racks-comunicaciones" },

  { slug: "celda-seccionador", name: "Celdas para seccionador", category: "linea-electrica" },
  { slug: "celda-transformador", name: "Celdas para transformadores", category: "linea-electrica" },
  { slug: "equipo-medida-proteccion", name: "Equipo de medida y protección", category: "linea-electrica" },
  { slug: "gabinete-contadores", name: "Gabinetes de contadores", category: "linea-electrica" },
  { slug: "ml-proteccion", name: "ML de protección", category: "linea-electrica" },

  { slug: "soporte-aereo", name: "Soporte aéreo", category: "soportes" },
  { slug: "soporte-peldano", name: "Soporte peldaño", category: "soportes" },
  { slug: "soporte-plancha", name: "Soporte plancha", category: "soportes" },
  { slug: "soporte-repisa", name: "Soporte repisa", category: "soportes" },
  { slug: "soporte-universal", name: "Soporte universal", category: "soportes" },

  { slug: "fabricacion-a-medida", name: "Gabinetes, racks y estructuras a medida", category: "a-medida" },
] as const;

export const productBySlug = (slug: string): Product | undefined =>
  PRODUCTS.find((p) => p.slug === slug);

export const categoryLabel = (id: CategoryId): string =>
  CATEGORIES.find((c) => c.id === id)?.label ?? id;
