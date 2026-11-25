// The only place that knows which logo the site uses. If the client picks logo B (EMC), replace the files below
// (same names) with the ones from the kit's `opcion-b-emc` folder and nothing else changes: the header, the footer,
// the printed list, the share image (scripts/brand/make-brand-assets.mjs), the structured data and the email all
// read these files. Keep `public/favicon.svg` and `public/apple-touch-icon.png` in step (the latter is generated).
import negativo from "../assets/brand/logo-horizontal-negativo.svg";
import positivo from "../assets/brand/logo-horizontal.svg";

export const LOGO = {
  alt: "CEYGOM Electro Metálicas",
  /** For dark backgrounds (header, footer). */
  negativo,
  /** For light backgrounds (printed list). */
  positivo,
  /** Public PNG for the confirmation email (SITE_URL + this path) and the structured data. */
  pngPath: "/brand/logo-horizontal.png",
} as const;
