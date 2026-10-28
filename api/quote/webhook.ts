import { createHmac } from "node:crypto";
import type { LeadRecord } from "../../packages/shared/quote.schema";

export const WEBHOOK_TIMEOUT_MS = 8000;
// With a RUT attachment the destination has to receive and store up to ~7 MB; managed functions stop at 45 s.
export const WEBHOOK_TIMEOUT_WITH_FILE_MS = 25_000;

/** How long to wait for the destination: longer when the lead carries the RUT file. */
export const webhookTimeoutMs = (lead: Pick<LeadRecord, "request">): number =>
  lead.request?.rutFile ? WEBHOOK_TIMEOUT_WITH_FILE_MS : WEBHOOK_TIMEOUT_MS;

/**
 * The lead carries personal and tax data (and possibly the RUT), so it only goes over HTTPS.
 * Plain HTTP is accepted for localhost, to test with a local receiver.
 */
export function isSafeWebhookUrl(raw: string): boolean {
  try {
    const url = new URL(raw);
    return url.protocol === "https:" || (url.protocol === "http:" && ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname));
  } catch {
    return false;
  }
}

/**
 * POSTs the lead as JSON. Throws on network errors, timeouts, non-2xx answers and when the destination
 * reports a rejection in a JSON body (`{ "ok": false, "error": "<code>" }`, as the Apps Script receiver does,
 * since Apps Script cannot set an HTTP error status). The thrown message never includes the URL, which may
 * carry a secret token.
 */
export async function postLead(
  url: string,
  lead: LeadRecord,
  secret?: string,
  fetchImpl: typeof fetch = fetch,
): Promise<void> {
  const body = JSON.stringify(lead);
  const headers: Record<string, string> = { "content-type": "application/json" };
  if (secret) {
    headers["x-ceygom-signature"] = `sha256=${createHmac("sha256", secret).update(body).digest("hex")}`;
  }
  const res = await fetchImpl(url, {
    method: "POST",
    headers,
    body,
    signal: AbortSignal.timeout(webhookTimeoutMs(lead)),
  });
  if (!res.ok) throw new Error(`Webhook responded ${res.status}`);

  const answer = await res.text().catch(() => "");
  try {
    const parsed: unknown = JSON.parse(answer);
    if (typeof parsed === "object" && parsed !== null && (parsed as { ok?: unknown }).ok === false) {
      const code = (parsed as { error?: unknown }).error;
      throw new Error(`Webhook rejected the lead${typeof code === "string" && /^[a-z_]{1,40}$/.test(code) ? `: ${code}` : ""}`);
    }
    // The destination kept the lead but could not store the attached RUT (for example its daily file limit).
    if (lead.request?.rutFile && typeof parsed === "object" && parsed !== null && (parsed as { rutSaved?: unknown }).rutSaved === false) {
      throw new Error("Webhook did not store the RUT file");
    }
  } catch (e) {
    // Plain-text or HTML answers ("Accepted", an empty body...) count as delivered; only these failures throw.
    if (e instanceof Error && (e.message.startsWith("Webhook rejected") || e.message.startsWith("Webhook did not store"))) throw e;
  }
}
