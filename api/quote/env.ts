import { z } from "zod";
import { normalizeWhatsappNumber } from "../../packages/shared/whatsapp";

// App settings arrive as strings; an empty value means "not set".
const blankToUndefined = (v: unknown) => (typeof v === "string" && v.trim() === "" ? undefined : v);

const EnvSchema = z.object({
  /** Sales WhatsApp number, international format. Required. */
  WHATSAPP_NUMBER: z
    .string()
    .transform(normalizeWhatsappNumber)
    .pipe(z.string().regex(/^\d{8,15}$/)),
  /** Optional: where each lead is POSTed (Apps Script web app, Make, Zapier, CRM...). */
  LEADS_WEBHOOK_URL: z.preprocess(blankToUndefined, z.string().url().optional()),
  /** Optional: HMAC key used to sign the webhook body. */
  LEADS_WEBHOOK_SECRET: z.preprocess(blankToUndefined, z.string().min(1).optional()),
  /** Optional: when set, requests carrying a different Origin header are rejected. */
  ALLOWED_ORIGIN: z.preprocess(blankToUndefined, z.string().url().optional()),
});

export type Env = z.infer<typeof EnvSchema>;

export type EnvResult = { ok: true; value: Env } | { ok: false; invalid: string[] };

/** Returns the names of the invalid or missing variables, never their values. */
export function loadEnv(source: Record<string, string | undefined> = process.env): EnvResult {
  const parsed = EnvSchema.safeParse(source);
  if (parsed.success) return { ok: true, value: parsed.data };
  return { ok: false, invalid: [...new Set(parsed.error.issues.map((i) => String(i.path[0])))] };
}
