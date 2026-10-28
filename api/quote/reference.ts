import { randomInt } from "node:crypto";

// No 0/O/1/I to avoid transcription mistakes when read over the phone.
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

/** COT-<year>-<6 chars>, e.g. COT-2026-K7M2QX. Matches LeadRecordSchema. */
export function newReference(now: Date = new Date()): string {
  let suffix = "";
  for (let i = 0; i < 6; i++) suffix += ALPHABET[randomInt(ALPHABET.length)];
  return `COT-${now.getUTCFullYear()}-${suffix}`;
}
