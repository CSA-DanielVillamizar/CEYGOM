// Single source of truth for the quote payload. Types are derived with z.infer, never hand-written.
// Used by the React island (client-side validation) and the Azure Function (server-side validation).
import { z } from "zod";
import { CATEGORY_IDS } from "./catalog";

export const FINISHES = ["galvanizado", "pintura-electrostatica", "inoxidable", "otro"] as const;
export const ENVIRONMENTS = ["interior", "exterior"] as const;

export const MAX_ITEMS = 20;

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Máximo ${max} caracteres`)
    .optional()
    .transform((v) => (v === "" ? undefined : v));

const optionalMm = z.number().int("Usa números enteros").positive("Debe ser mayor que 0").max(5000, "Máximo 5000 mm").optional();

export const QuoteItemSchema = z.object({
  category: z.enum(CATEGORY_IDS, { errorMap: () => ({ message: "Elige una categoría" }) }),
  productSlug: z.string().trim().regex(/^[a-z0-9-]+$/).max(80).optional(),
  quantity: z
    .number({ invalid_type_error: "Ingresa una cantidad" })
    .int("Usa números enteros")
    .min(1, "La cantidad mínima es 1")
    .max(100000, "Cantidad demasiado alta"),
  widthMm: optionalMm,
  heightMm: optionalMm,
  depthMm: optionalMm,
  finish: z.enum(FINISHES).optional(),
  notes: optionalText(500),
});
export type QuoteItem = z.infer<typeof QuoteItemSchema>;

export const QuoteProjectSchema = z.object({
  city: z.string().trim().min(2, "Ingresa la ciudad").max(80),
  neededBy: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha inválida")
    .optional()
    .or(z.literal("").transform(() => undefined)),
  environment: z.enum(ENVIRONMENTS).optional(),
  notes: optionalText(1000),
});
export type QuoteProject = z.infer<typeof QuoteProjectSchema>;

export const QuoteContactSchema = z.object({
  fullName: z.string().trim().min(2, "Ingresa tu nombre").max(120),
  company: optionalText(120),
  email: z.string().trim().toLowerCase().email("Correo inválido").max(160),
  // NIT or cédula as it appears in the RUT, required to create the customer and invoice. Digits only
  // (dots, hyphens and spaces are dropped); the verification digit, if typed, is kept as part of the number.
  taxId: z
    .string({ required_error: "Ingresa el NIT o la cédula" })
    .trim()
    .min(1, "Ingresa el NIT o la cédula")
    .transform((v) => v.replace(/\D/g, ""))
    .pipe(z.string().min(6, "NIT o cédula inválido").max(15, "NIT o cédula inválido")),
  // Keep digits only; WhatsApp and the CRM both want a normalized number.
  phone: z
    .string()
    .trim()
    .transform((v) => v.replace(/\D/g, ""))
    .pipe(z.string().min(7, "Celular inválido").max(15, "Celular inválido")),
  acceptsDataPolicy: z.literal(true, {
    errorMap: () => ({ message: "Debes aceptar la política de tratamiento de datos" }),
  }),
});
export type QuoteContact = z.infer<typeof QuoteContactSchema>;

export const QuoteRequestSchema = z.object({
  items: z.array(QuoteItemSchema).min(1, "Agrega al menos un producto").max(MAX_ITEMS),
  project: QuoteProjectSchema,
  contact: QuoteContactSchema,
  // Anti-spam honeypot: real users never see or fill this field.
  website: z.string().max(0).optional(),
});
export type QuoteRequest = z.infer<typeof QuoteRequestSchema>;

/** Record sent to the leads webhook. */
export const LeadRecordSchema = z.object({
  reference: z.string().regex(/^COT-\d{4}-[A-Z0-9]{6}$/),
  createdAt: z.string().datetime(),
  request: QuoteRequestSchema.omit({ website: true }),
});
export type LeadRecord = z.infer<typeof LeadRecordSchema>;

/** API contract: POST /api/quote */
export const QuoteResponseSchema = z.object({
  reference: z.string(),
  whatsappUrl: z.string().url(),
  webhookDelivered: z.boolean(),
});
export type QuoteResponse = z.infer<typeof QuoteResponseSchema>;

export const QuoteErrorCodes = ["VALIDATION_ERROR", "FORBIDDEN_ORIGIN", "SERVER_MISCONFIGURED"] as const;
export interface QuoteErrorBody {
  error: (typeof QuoteErrorCodes)[number];
  issues?: { path: string; message: string }[];
}
