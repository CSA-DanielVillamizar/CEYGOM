// Pure helpers for the tax data and the RUT attachment. No DOM or Node APIs, so they run in the
// browser (client-side validation) and in the Azure Function (authoritative validation).

// DIAN weights applied from the rightmost digit of the NIT.
const NIT_WEIGHTS = [3, 7, 13, 17, 19, 23, 29, 37, 41, 43, 47, 53, 59, 67, 71];

/** Verification digit (DV) of a Colombian NIT, as defined by the DIAN. `nit` must contain only digits. */
export function nitCheckDigit(nit: string): string {
  let sum = 0;
  for (let i = 0; i < nit.length; i++) {
    const digit = Number(nit[nit.length - 1 - i]);
    sum += digit * (NIT_WEIGHTS[i] ?? 0);
  }
  const rest = sum % 11;
  return String(rest > 1 ? 11 - rest : rest);
}

const B64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

/** Decodes the first `count` bytes of a Base64 string without decoding (or copying) the whole payload. */
export function firstBytes(base64: string, count: number): number[] {
  const bytes: number[] = [];
  for (let i = 0; i + 3 < base64.length && bytes.length < count; i += 4) {
    const quad = [0, 1, 2, 3].map((k) => (base64[i + k] === "=" ? 0 : B64.indexOf(base64[i + k] ?? "")));
    if (quad.some((v) => v < 0)) break;
    const n = (quad[0]! << 18) | (quad[1]! << 12) | (quad[2]! << 6) | quad[3]!;
    bytes.push((n >> 16) & 255, (n >> 8) & 255, n & 255);
  }
  return bytes.slice(0, count);
}

const startsWith = (bytes: number[], signature: number[]) => signature.every((b, i) => bytes[i] === b);

const SIGNATURES = {
  "application/pdf": [0x25, 0x50, 0x44, 0x46, 0x2d], // %PDF-
  "image/jpeg": [0xff, 0xd8, 0xff],
  "image/png": [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a],
} as const;

/** True when the file content starts with the signature of the declared MIME type. */
export function matchesSignature(mimeType: keyof typeof SIGNATURES, base64: string): boolean {
  const signature = SIGNATURES[mimeType];
  return startsWith(firstBytes(base64, signature.length), [...signature]);
}

/** Number of bytes encoded by a well-formed Base64 string, or -1 if its length is not valid. */
export function base64ByteLength(base64: string): number {
  if (base64.length === 0 || base64.length % 4 !== 0) return -1;
  const padding = base64.endsWith("==") ? 2 : base64.endsWith("=") ? 1 : 0;
  return (base64.length / 4) * 3 - padding;
}
