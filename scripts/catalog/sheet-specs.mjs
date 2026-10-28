// Reads the technical facts printed in a data sheet (text from `pdftotext -layout`): material, finishes, color
// codes and the dimension columns of the reference table. It only returns what the sheet states unambiguously:
// a reference whose row does not line up with the table header (the PDF text is sometimes misaligned) gets no
// dimensions, and the product keeps the PDF as the source of truth.

const COLUMN_LABELS = [
  ["Altura total", /^altura total/i],
  ["Altura útil", /^altura [uú]til/i],
  ["Altura", /^altura/i],
  ["Ancho total", /^ancho total/i],
  ["Ancho", /^ancho/i],
  ["Alto", /^alto/i],
  ["Fondo", /^fondo/i],
  ["Longitud", /^longitud/i],
  ["Calibre", /^calibre/i],
  ["Capacidad de carga", /^capacidad( de carga)?/i],
];

/** Text of a titled section ("Material:", "Acabado:") up to the next blank line. */
function section(text, title) {
  const lines = text.split(/\r?\n/);
  const start = lines.findIndex((l) => new RegExp(`^\\s*${title}\\s*:?\\s*$`, "i").test(l));
  if (start < 0) return "";
  const body = [];
  for (const line of lines.slice(start + 1)) {
    if (!line.trim()) {
      if (body.length) break;
      continue;
    }
    body.push(line.trim().replace(/\s+/g, " "));
  }
  return body.join(" ");
}

function cleanMaterial(raw) {
  if (!raw) return undefined;
  let s = raw
    .replace(/^Nuestros? productos? (est[aá] )?fabricados? (a partir de|en) /i, "")
    .replace(/\blaminas\b/i, "láminas")
    .replace(/\bfrio\b/i, "frío")
    .replace(/\s+o su equivalente\s+/i, " (equivale a ")
    .replace(/\.$/, "");
  if (s.includes("(equivale a ")) s += ")";
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function parseFinishes(raw) {
  const s = raw.toLowerCase();
  const finishes = [];
  if (s.includes("galvaniz")) finishes.push("galvanizado");
  if (/pintura electro/.test(s)) finishes.push("pintura-electrostatica");
  return finishes;
}

function parseColors(text) {
  const lines = text.split(/\r?\n/);
  const start = lines.findIndex((l) => /^\s*C[oó]digo\s+Color\s*$/i.test(l));
  if (start < 0) return [];
  const colors = [];
  for (const line of lines.slice(start + 1)) {
    const m = line.match(/^\s*(\d{2})\s+([A-Za-zÁÉÍÓÚáéíóúñ]+(?: [A-Za-zÁÉÍÓÚáéíóúñ]+)*)\s*$/);
    if (!m) break;
    colors.push({ code: m[1], name: m[2] });
  }
  return colors;
}

/** Column labels printed after the description column of the reference table header. */
function parseHeader(line, mm) {
  const rest = line.replace(/^\s*Referencia\s+(Descripci[oó]n|Especificaci[oó]n)\s*/i, "");
  const labels = [];
  const pattern = /(Altura total|Altura [uú]til|Altura|Ancho total|Ancho|Alto|Fondo|Longitud|Calibre|Capacidad(?: de carga)?)\s*(\([A-Z]\))?/gi;
  for (const m of rest.matchAll(pattern)) {
    const base = COLUMN_LABELS.find(([, re]) => re.test(m[1]))[0];
    const letter = m[2] ?? "";
    const unit = base === "Capacidad de carga" ? "kg/m" : base === "Calibre" ? "" : mm ? "mm" : "";
    labels.push(`${base}${letter ? ` ${letter}` : ""}${unit ? ` (${unit})` : ""}`);
  }
  return labels;
}

function parseSpecTable(text) {
  const lines = text.split(/\r?\n/);
  const headerAt = lines.findIndex((l) => /^\s*Referencia\s+(Descripci[oó]n|Especificaci[oó]n)\b/i.test(l));
  if (headerAt < 0) return undefined;
  const mm = /mil[ií]metros/i.test(text);
  const columns = parseHeader(lines[headerAt], mm);
  if (columns.length === 0) return undefined;

  const rows = {};
  for (const line of lines.slice(headerAt + 1)) {
    if (/^\s*(Nota|C[oó]digo|CODIGOS)/i.test(line)) break;
    const m = line.match(/^\s*([A-Z]{1,4}\d{3,6}[A-Z]?)\s+(.+?)\s*$/);
    if (!m) continue;
    // Trailing pure-number tokens are the dimension columns; "5*5" or "120cm" in the description are not.
    const tokens = m[2].replace(/(\d)\s?[Kk]g\/m\b/g, "$1").split(/\s+/).filter((t) => !/^[Kk]g\/m$/.test(t));
    const values = [];
    while (tokens.length > 1 && /^\d+([.,]\d+)?$/.test(tokens.at(-1))) values.unshift(tokens.pop().replace(",", "."));
    if (values.length !== columns.length) continue;
    rows[m[1]] = values;
  }
  return Object.keys(rows).length ? { columns, rows } : undefined;
}

export function parseSheet(text) {
  const material = cleanMaterial(section(text, "Material"));
  const finishes = parseFinishes(section(text, "Acabado"));
  const colors = parseColors(text);
  const specs = parseSpecTable(text);
  return { ...(material ? { material } : {}), finishes, colors, ...(specs ? { specs } : {}) };
}
