import { createHmac } from "node:crypto";
import type { LeadRecord } from "../../packages/shared/quote.schema";

export const WEBHOOK_TIMEOUT_MS = 8000;

/** POSTs the lead as JSON. Throws on network errors, timeouts and non-2xx answers. */
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
    signal: AbortSignal.timeout(WEBHOOK_TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`Webhook responded ${res.status}`);
}
