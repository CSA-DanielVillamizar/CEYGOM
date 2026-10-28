import type { HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import {
  QuoteRequestSchema,
  type LeadRecord,
  type QuoteErrorBody,
  type QuoteResponse,
} from "../../packages/shared/quote.schema";
import { buildWhatsappMessage, buildWhatsappUrl } from "../../packages/shared/whatsapp";
import { loadEnv } from "./env";
import { newReference } from "./reference";
import { postLead } from "./webhook";

const MAX_BODY_CHARS = 20_000;
const HEADERS = { "cache-control": "no-store" };

export interface Deps {
  env: Record<string, string | undefined>;
  postLead: typeof postLead;
  now: () => Date;
}

const defaultDeps = (): Deps => ({ env: process.env, postLead, now: () => new Date() });

const fail = (status: number, body: QuoteErrorBody): HttpResponseInit => ({ status, jsonBody: body, headers: HEADERS });

export async function handleQuote(
  req: HttpRequest,
  ctx: InvocationContext,
  deps: Deps = defaultDeps(),
): Promise<HttpResponseInit> {
  const env = loadEnv(deps.env);
  if (!env.ok) {
    // Names only: values may be secrets.
    ctx.error(`Invalid or missing app settings: ${env.invalid.join(", ")}`);
    return fail(500, { error: "SERVER_MISCONFIGURED" });
  }

  const origin = req.headers.get("origin");
  if (env.value.ALLOWED_ORIGIN && origin && origin !== env.value.ALLOWED_ORIGIN) {
    return fail(403, { error: "FORBIDDEN_ORIGIN" });
  }

  const text = await req.text();
  if (text.length > MAX_BODY_CHARS) {
    return fail(400, { error: "VALIDATION_ERROR", issues: [{ path: "", message: "Solicitud demasiado grande" }] });
  }

  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    return fail(400, { error: "VALIDATION_ERROR", issues: [{ path: "", message: "El cuerpo debe ser JSON" }] });
  }

  // Honeypot: look like a success, store nothing.
  if (typeof raw === "object" && raw !== null && "website" in raw && (raw as { website?: unknown }).website) {
    const decoy: QuoteResponse = { reference: "COT-0000-AAAAAA", whatsappUrl: "https://wa.me/", webhookDelivered: false };
    return { status: 200, jsonBody: decoy, headers: HEADERS };
  }

  const parsed = QuoteRequestSchema.safeParse(raw);
  if (!parsed.success) {
    return fail(400, {
      error: "VALIDATION_ERROR",
      issues: parsed.error.issues.map((i) => ({ path: i.path.join("."), message: i.message })),
    });
  }

  const now = deps.now();
  const { website: _website, ...request } = parsed.data;
  const lead: LeadRecord = { reference: newReference(now), createdAt: now.toISOString(), request };

  // The webhook is optional. If it fails we still answer 200 so the customer can reach sales on WhatsApp;
  // the response says whether the lead was stored.
  let webhookDelivered = false;
  if (env.value.LEADS_WEBHOOK_URL) {
    try {
      await deps.postLead(env.value.LEADS_WEBHOOK_URL, lead, env.value.LEADS_WEBHOOK_SECRET);
      webhookDelivered = true;
    } catch (e) {
      // `e` can be anything (a thrown string or null included); never let logging break the response.
      ctx.error(`Lead ${lead.reference}: webhook failed: ${e instanceof Error ? e.message : "unknown error"}`);
    }
  }

  // No personal data in logs.
  ctx.log(`Quote ${lead.reference} processed (items=${request.items.length}, webhook=${webhookDelivered})`);

  const body: QuoteResponse = {
    reference: lead.reference,
    whatsappUrl: buildWhatsappUrl(env.value.WHATSAPP_NUMBER, buildWhatsappMessage(lead.reference, request)),
    webhookDelivered,
  };
  return { status: 200, jsonBody: body, headers: HEADERS };
}
