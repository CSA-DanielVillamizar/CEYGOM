// Data shown on the personal data policy page (/privacidad/). Only facts already published on the
// site live here; missing ones stay undefined and the page leaves them out instead of guessing.
export const LEGAL = {
  tradeName: "Electro Metálicas Ceygom",
  // Provided by the company (octubre de 2026). The NIT's verification digit is checked by legal.test.ts.
  legalName: "Electro Metálicas Ceygom S.A.S." as string | undefined,
  nit: "900456873-5" as string | undefined,
  address: "Calle 28 nro 57-13, Unidad Industrial de Belén, Medellín, Colombia",
  phoneLabel: "(574) 444 6733",
  phoneHref: "tel:+5744446733",
  // TODO(negocio): correo designado para consultas y reclamos de datos personales.
  privacyEmail: undefined as string | undefined,
  lastUpdate: "octubre de 2026",
};
