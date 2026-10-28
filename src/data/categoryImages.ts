// Representative photo per category for the home page and the catalog (files in src/assets/productos).
// `illustrative` is true when the photo is of a related product, not of the category's own products: the page
// then says so. Replace them when the company provides its own photos (docs/catalogo/pendientes.md).
export const CATEGORY_IMAGES: Record<string, { file: string; illustrative: boolean }> = {
  "bandejas-portacables": { file: "bandeja-ranurada40cm", illustrative: true },
  canaletas: { file: "canaleta-metalica2", illustrative: false },
  "racks-comunicaciones": { file: "rack-piso-cerrado", illustrative: false },
  "linea-electrica": { file: "gabinete-equipos-medida", illustrative: false },
  soportes: { file: "bandeja-ranurada30cm", illustrative: true },
  "a-medida": { file: "gabinete-de-gas", illustrative: false },
};
