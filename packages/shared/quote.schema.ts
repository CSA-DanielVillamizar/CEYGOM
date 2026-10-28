// Single source of truth for the quote payload. Types are derived with z.infer, never hand-written.
// Used by the React island (client-side validation) and the Azure Function (server-side validation).
import { z } from "zod";
import { CATEGORY_IDS } from "./catalog";
import { base64ByteLength, matchesSignature, nitCheckDigit } from "./fiscal";

export const FINISHES = ["galvanizado", "pintura-electrostatica", "inoxidable", "otro"] as const;
export const ENVIRONMENTS = ["interior", "exterior"] as const;
export const PERSON_TYPES = ["natural", "juridica"] as const;
// Fiscal responsibilities the customer can pick; the RUT attachment is the source of truth for the rest.
export const FISCAL_RESPONSIBILITIES = [
  "responsable-iva",
  "no-responsable-iva",
  "gran-contribuyente",
  "autorretenedor",
  "regimen-simple",
  "otra",
] as const;

export const RUT_MAX_BYTES = 5 * 1024 * 1024;
export const RUT_MIME_TYPES = ["application/pdf", "image/jpeg", "image/png"] as const;
/** Base64 length of the largest allowed file. */
export const RUT_MAX_BASE64_CHARS = 4 * Math.ceil(RUT_MAX_BYTES / 3);

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

const digitsOnly = (v: string) => v.replace(/\D/g, "");

const QuoteContactBase = z.object({
  personType: z.enum(PERSON_TYPES, { errorMap: () => ({ message: "Elige el tipo de persona" }) }),
  // Natural person: the person. Legal entity: the contact person at the company.
  fullName: z.string().trim().min(2, "Ingresa el nombre").max(120),
  // Legal name or trade name; required for legal entities, dropped for natural persons.
  businessName: optionalText(160),
  // NIT (legal entity) or cédula (natural person) as it appears in the RUT. Digits only: dots, hyphens
  // and spaces are dropped. The NIT verification digit goes in `taxIdCheckDigit`.
  taxId: z
    .string({ required_error: "Ingresa el NIT o la cédula" })
    .trim()
    .min(1, "Ingresa el NIT o la cédula")
    .transform(digitsOnly)
    .pipe(z.string().min(6, "NIT o cédula inválido").max(15, "NIT o cédula inválido")),
  taxIdCheckDigit: z
    .string()
    .trim()
    .regex(/^\d$/, "El dígito de verificación es un solo número")
    .optional()
    .or(z.literal("").transform(() => undefined)),
  // Principal economic activity (CIIU Rev. 4 A.C.), four digits, as printed in the RUT.
  ciiuCode: z
    .string({ required_error: "Ingresa el código CIIU" })
    .trim()
    .regex(/^\d{4}$/, "El código CIIU tiene 4 dígitos"),
  fiscalResponsibilities: z
    .array(z.enum(FISCAL_RESPONSIBILITIES), { required_error: "Elige al menos una responsabilidad fiscal" })
    .min(1, "Elige al menos una responsabilidad fiscal"),
  email: z.string().trim().toLowerCase().email("Correo inválido").max(160),
  // Keep digits only; WhatsApp and the CRM both want a normalized number.
  phone: z.string().trim().transform(digitsOnly).pipe(z.string().min(7, "Celular inválido").max(15, "Celular inválido")),
  acceptsDataPolicy: z.literal(true, {
    errorMap: () => ({ message: "Debes aceptar la política de tratamiento de datos" }),
  }),
});

export const QuoteContactSchema = QuoteContactBase.superRefine((c, ctx) => {
  if (c.personType === "juridica") {
    if (!c.businessName) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["businessName"], message: "Ingresa la razón social o el nombre comercial" });
    }
    if (!c.taxIdCheckDigit) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["taxIdCheckDigit"], message: "Ingresa el dígito de verificación" });
    } else if (c.taxIdCheckDigit !== nitCheckDigit(c.taxId)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["taxIdCheckDigit"], message: "El dígito de verificación no corresponde al NIT" });
    }
  }
  if (c.fiscalResponsibilities.includes("responsable-iva") && c.fiscalResponsibilities.includes("no-responsable-iva")) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["fiscalResponsibilities"], message: "No puedes ser responsable y no responsable de IVA a la vez" });
  }
}).transform((c) =>
  c.personType === "natural" ? { ...c, businessName: undefined, taxIdCheckDigit: undefined } : c,
);
export type QuoteContact = z.infer<typeof QuoteContactSchema>;

/** RUT document attached by the customer. The content travels as Base64 inside the JSON request. */
export const RutFileSchema = z
  .object({
    fileName: z
      .string()
      .trim()
      .min(1, "El archivo no tiene nombre")
      .max(120, "El nombre del archivo es muy largo")
      // eslint-disable-next-line no-control-regex
      .regex(/^[^\u0000-\u001f\\/]+$/, "El nombre del archivo no es válido"),
    mimeType: z.enum(RUT_MIME_TYPES, { errorMap: () => ({ message: "Formato no permitido: usa PDF, JPG o PNG" }) }),
    sizeBytes: z.number().int().min(1, "El archivo está vacío").max(RUT_MAX_BYTES, "El archivo supera los 5 MB"),
    contentBase64: z
      .string()
      .min(4, "El archivo está vacío")
      .max(RUT_MAX_BASE64_CHARS, "El archivo supera los 5 MB")
      .regex(/^[A-Za-z0-9+/]+={0,2}$/, "El contenido del archivo no es válido"),
  })
  .superRefine((f, ctx) => {
    if (base64ByteLength(f.contentBase64) !== f.sizeBytes) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["sizeBytes"], message: "El tamaño del archivo no coincide con su contenido" });
    } else if (!matchesSignature(f.mimeType, f.contentBase64)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["mimeType"], message: "El contenido no corresponde al formato del archivo" });
    }
  });
export type RutFile = z.infer<typeof RutFileSchema>;

export const QuoteRequestSchema = z.object({
  items: z.array(QuoteItemSchema).min(1, "Agrega al menos un producto").max(MAX_ITEMS),
  project: QuoteProjectSchema,
  contact: QuoteContactSchema,
  // Optional RUT attachment (PDF, JPG or PNG, up to 5 MB). It is forwarded to the leads webhook only.
  rutFile: RutFileSchema.optional(),
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
