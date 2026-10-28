import { describe, expect, it } from "vitest";
import { QuoteRequestSchema, type QuoteRequest } from "./quote.schema";
import { buildWhatsappMessage, buildWhatsappUrl, MAX_MESSAGE_LENGTH } from "./whatsapp";

const valid = (): QuoteRequest => ({
  items: [{ category: "racks-comunicaciones", productSlug: "rack-cerrado-abatible", quantity: 2, widthMm: 600, heightMm: 2100, depthMm: 600 }],
  project: { city: "Medellín", notes: "Puerta con chapa & ventilación" },
  contact: { fullName: "Ana Pérez", taxId: "900.123.456-7", email: "ANA@Ejemplo.com", phone: "+57 300 123 4567", acceptsDataPolicy: true },
});

describe("QuoteRequestSchema", () => {
  it("accepts a valid request and normalizes email and phone", () => {
    const r = QuoteRequestSchema.safeParse(valid());
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.contact.email).toBe("ana@ejemplo.com");
      expect(r.data.contact.phone).toBe("573001234567");
    }
  });

  it("rejects a missing email with its path", () => {
    const bad = valid() as unknown as { contact: Record<string, unknown> };
    delete bad.contact.email;
    const r = QuoteRequestSchema.safeParse(bad);
    expect(r.success).toBe(false);
    if (!r.success) expect(r.error.issues.map((i) => i.path.join("."))).toContain("contact.email");
  });

  it("keeps only the digits of the NIT or cédula", () => {
    const r = QuoteRequestSchema.safeParse(valid());
    expect(r.success && r.data.contact.taxId).toBe("9001234567");
  });

  it.each([undefined, "", "   ", "12345", "abc", "1".repeat(16)])("rejects the NIT or cédula %j", (taxId) => {
    const bad = valid() as unknown as { contact: Record<string, unknown> };
    bad.contact.taxId = taxId;
    const r = QuoteRequestSchema.safeParse(bad);
    expect(r.success).toBe(false);
    if (!r.success) expect(r.error.issues.map((i) => i.path.join("."))).toContain("contact.taxId");
  });

  it("requires consent", () => {
    const bad = valid();
    (bad.contact as { acceptsDataPolicy: boolean }).acceptsDataPolicy = false;
    expect(QuoteRequestSchema.safeParse(bad).success).toBe(false);
  });

  it("requires at least one item and a quantity >= 1", () => {
    expect(QuoteRequestSchema.safeParse({ ...valid(), items: [] }).success).toBe(false);
    const zero = valid();
    zero.items[0]!.quantity = 0;
    expect(QuoteRequestSchema.safeParse(zero).success).toBe(false);
  });

  it("rejects a filled honeypot", () => {
    expect(QuoteRequestSchema.safeParse({ ...valid(), website: "spam" }).success).toBe(false);
  });
});

describe("WhatsApp link", () => {
  it("encodes the text and keeps personal contact data out of it", () => {
    const parsed = QuoteRequestSchema.parse(valid());
    const text = buildWhatsappMessage("COT-2026-ABC123", parsed);
    const url = buildWhatsappUrl("+57 XXX 300 000 000".replace(/X/g, "0"), text);
    expect(url.startsWith("https://wa.me/57")).toBe(true);
    const decoded = decodeURIComponent(url.split("?text=")[1]!);
    expect(decoded).toContain("COT-2026-ABC123");
    expect(decoded).toContain("Rack cerrado abatible x2");
    expect(decoded).toContain("Medellín");
    expect(decoded).not.toContain("ana@ejemplo.com");
    expect(decoded).not.toContain("573001234567");
    expect(decoded).not.toContain("9001234567");
    expect(decoded.length).toBeLessThanOrEqual(MAX_MESSAGE_LENGTH);
  });

  it("strips non-digits from the number", () => {
    expect(buildWhatsappUrl("+57 (300) 111-2222", "hola")).toBe("https://wa.me/573001112222?text=hola");
  });
});
