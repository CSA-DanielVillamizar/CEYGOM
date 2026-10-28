import { describe, expect, it } from "vitest";
import { nitCheckDigit } from "./fiscal";
import { QuoteContactSchema, QuoteRequestSchema, RUT_MAX_BYTES, RutFileSchema } from "./quote.schema";
import { buildWhatsappMessage, buildWhatsappProductUrl, buildWhatsappUrl, MAX_MESSAGE_LENGTH } from "./whatsapp";

export const rutFixture = (kind: "pdf" | "jpeg" | "png" = "pdf", extra = 0) => {
  const head = {
    pdf: Buffer.from("%PDF-1.4\n"),
    jpeg: Buffer.from([0xff, 0xd8, 0xff, 0xe0]),
    png: Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  }[kind];
  const bytes = Buffer.concat([head, Buffer.alloc(extra, 1)]);
  return {
    fileName: "RUT.pdf",
    mimeType: { pdf: "application/pdf", jpeg: "image/jpeg", png: "image/png" }[kind],
    sizeBytes: bytes.length,
    contentBase64: bytes.toString("base64"),
  };
};

const juridica = () => ({
  personType: "juridica" as const,
  fullName: "Ana Pérez",
  businessName: "Ejemplo SAS",
  taxId: "900.123.456",
  taxIdCheckDigit: "8",
  ciiuCode: "2599",
  fiscalResponsibilities: ["responsable-iva" as const],
  email: "ANA@Ejemplo.com",
  phone: "+57 300 123 4567",
  acceptsDataPolicy: true as const,
});

const valid = () => ({
  items: [{ category: "racks-comunicaciones" as const, productSlug: "rack-cerrado-abatible", quantity: 2, widthMm: 600, heightMm: 2100, depthMm: 600 }],
  project: { city: "Medellín", notes: "Puerta con chapa & ventilación" },
  contact: juridica(),
});

describe("nitCheckDigit", () => {
  it("matches known NITs", () => {
    expect(nitCheckDigit("800197268")).toBe("4"); // DIAN
    expect(nitCheckDigit("900123456")).toBe("8");
  });
});

describe("QuoteRequestSchema", () => {
  it("accepts a valid request and normalizes email, phone and NIT", () => {
    const r = QuoteRequestSchema.safeParse(valid());
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.contact.email).toBe("ana@ejemplo.com");
      expect(r.data.contact.phone).toBe("573001234567");
      expect(r.data.contact.taxId).toBe("900123456");
    }
  });

  it("rejects a missing email with its path", () => {
    const bad = valid() as unknown as { contact: Record<string, unknown> };
    delete bad.contact.email;
    const r = QuoteRequestSchema.safeParse(bad);
    expect(r.success).toBe(false);
    if (!r.success) expect(r.error.issues.map((i) => i.path.join("."))).toContain("contact.email");
  });

  it("requires consent", () => {
    const bad = valid() as unknown as { contact: Record<string, unknown> };
    bad.contact.acceptsDataPolicy = false;
    expect(QuoteRequestSchema.safeParse(bad).success).toBe(false);
  });

  it("accepts an optional product reference, normalized to upper case, and rejects malformed ones", () => {
    const withRef = (reference: unknown) => {
      const req = valid();
      (req.items[0] as Record<string, unknown>).reference = reference;
      return QuoteRequestSchema.safeParse(req);
    };
    const ok = withRef(" bp0101 ");
    expect(ok.success && ok.data.items[0]!.reference).toBe("BP0101");
    expect(withRef("").success && withRef("").data!.items[0]!.reference).toBeUndefined();
    expect(withRef(undefined).success).toBe(true);
    for (const bad of ["BP", "0101", "bandeja 1", "BP0101; DROP", "ABCDE0101", "BP01"]) expect(withRef(bad).success, bad).toBe(false);
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

describe("QuoteContactSchema: person type and tax data", () => {
  const issuePaths = (input: unknown) => {
    const r = QuoteContactSchema.safeParse(input);
    return r.success ? [] : r.error.issues.map((i) => i.path.join("."));
  };

  it("requires the person type", () => {
    expect(issuePaths({ ...juridica(), personType: undefined })).toContain("personType");
  });

  it("legal entity needs business name and a correct verification digit", () => {
    expect(issuePaths({ ...juridica(), businessName: "" })).toContain("businessName");
    expect(issuePaths({ ...juridica(), taxIdCheckDigit: undefined })).toContain("taxIdCheckDigit");
    expect(issuePaths({ ...juridica(), taxIdCheckDigit: "" })).toContain("taxIdCheckDigit");
    expect(issuePaths({ ...juridica(), taxIdCheckDigit: "3" })).toContain("taxIdCheckDigit");
    expect(issuePaths({ ...juridica(), taxIdCheckDigit: "12" })).toContain("taxIdCheckDigit");
  });

  it("natural person needs only name and cédula; legal-entity fields are dropped", () => {
    const natural = { ...juridica(), personType: "natural", taxId: "1.020.304.050", businessName: "Ignorada SAS", taxIdCheckDigit: "9" };
    const r = QuoteContactSchema.safeParse(natural);
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.taxId).toBe("1020304050");
      expect(r.data.businessName).toBeUndefined();
      expect(r.data.taxIdCheckDigit).toBeUndefined();
    }
  });

  it.each([undefined, "", "   ", "12345", "abc", "1".repeat(16)])("rejects the NIT or cédula %j", (taxId) => {
    expect(issuePaths({ ...juridica(), taxId })).toContain("taxId");
  });

  it.each([undefined, "", "25", "25991", "abcd"])("rejects the CIIU code %j", (ciiuCode) => {
    expect(issuePaths({ ...juridica(), ciiuCode })).toContain("ciiuCode");
  });

  it("requires at least one fiscal responsibility, and not both IVA statuses", () => {
    expect(issuePaths({ ...juridica(), fiscalResponsibilities: [] })).toContain("fiscalResponsibilities");
    expect(issuePaths({ ...juridica(), fiscalResponsibilities: undefined })).toContain("fiscalResponsibilities");
    expect(issuePaths({ ...juridica(), fiscalResponsibilities: ["responsable-iva", "no-responsable-iva"] })).toContain("fiscalResponsibilities");
    expect(issuePaths({ ...juridica(), fiscalResponsibilities: ["no-responsable-iva", "autorretenedor"] })).toEqual([]);
    expect(issuePaths({ ...juridica(), fiscalResponsibilities: ["invalida"] })).not.toEqual([]);
  });
});

describe("RutFileSchema", () => {
  const paths = (input: unknown) => {
    const r = RutFileSchema.safeParse(input);
    return r.success ? [] : r.error.issues.map((i) => i.path.join("."));
  };

  it.each(["pdf", "jpeg", "png"] as const)("accepts a small %s", (kind) => {
    expect(RutFileSchema.safeParse(rutFixture(kind)).success).toBe(true);
  });

  it("is optional in the request and travels with it when present", () => {
    expect(QuoteRequestSchema.safeParse(valid()).success).toBe(true);
    const r = QuoteRequestSchema.safeParse({ ...valid(), rutFile: rutFixture("pdf") });
    expect(r.success && r.data.rutFile?.fileName).toBe("RUT.pdf");
  });

  it("accepts a file of exactly 5 MB and rejects one byte more", () => {
    expect(RutFileSchema.safeParse(rutFixture("pdf", RUT_MAX_BYTES - 9)).success).toBe(true);
    expect(paths(rutFixture("pdf", RUT_MAX_BYTES - 8))).not.toEqual([]);
  });

  it("rejects other formats", () => {
    expect(paths({ ...rutFixture("pdf"), mimeType: "application/zip" })).toContain("mimeType");
    expect(paths({ ...rutFixture("pdf"), mimeType: "text/html" })).toContain("mimeType");
  });

  it("rejects content that does not match the declared type", () => {
    const png = rutFixture("png");
    expect(paths({ ...png, mimeType: "application/pdf" })).toContain("mimeType");
    expect(paths({ ...rutFixture("pdf"), contentBase64: Buffer.from("<script>alert(1)</script>").toString("base64"), sizeBytes: 25 })).toContain("mimeType");
  });

  it("rejects a size that does not match the content, empty and malformed content", () => {
    expect(paths({ ...rutFixture("pdf"), sizeBytes: 3 })).toContain("sizeBytes");
    expect(paths({ ...rutFixture("pdf"), contentBase64: "" })).toContain("contentBase64");
    expect(paths({ ...rutFixture("pdf"), contentBase64: "no es base64!" })).toContain("contentBase64");
  });

  it("rejects path-like file names", () => {
    expect(paths({ ...rutFixture("pdf"), fileName: "../etc/passwd" })).toContain("fileName");
    expect(paths({ ...rutFixture("pdf"), fileName: "" })).toContain("fileName");
  });
});

describe("WhatsApp link", () => {
  it("encodes the text and keeps contact and tax data out of it", () => {
    const parsed = QuoteRequestSchema.parse({ ...valid(), rutFile: rutFixture("pdf") });
    const text = buildWhatsappMessage("COT-2026-ABC123", parsed);
    const url = buildWhatsappUrl("+57 XXX 300 000 000".replace(/X/g, "0"), text);
    expect(url.startsWith("https://wa.me/57")).toBe(true);
    const decoded = decodeURIComponent(url.split("?text=")[1]!);
    expect(decoded).toContain("COT-2026-ABC123");
    expect(decoded).toContain("Rack cerrado abatible x2");
    expect(decoded).toContain("Medellín");
    for (const secret of ["ana@ejemplo.com", "573001234567", "900123456", "2599", "responsable", "RUT", parsed.rutFile!.contentBase64]) {
      expect(decoded).not.toContain(secret);
    }
    expect(decoded.length).toBeLessThanOrEqual(MAX_MESSAGE_LENGTH);
  });

  it("shows the chosen reference next to the product", () => {
    const req = valid();
    (req.items[0] as Record<string, unknown>).reference = "RA1301";
    const text = buildWhatsappMessage(undefined, QuoteRequestSchema.parse(req));
    expect(text).toContain("Rack cerrado abatible (RA1301) x2");
  });

  it("strips non-digits from the number", () => {
    expect(buildWhatsappUrl("+57 (300) 111-2222", "hola")).toBe("https://wa.me/573001112222?text=hola");
  });
});

describe("WhatsApp product enquiry", () => {
  it("names the product and the exact reference, with a digits-only number and no personal data", () => {
    const url = new URL(buildWhatsappProductUrl("+57 310 512 7314", "Bandeja ranurada", "BP0101"));
    expect(url.origin + url.pathname).toBe("https://wa.me/573105127314");
    const text = url.searchParams.get("text")!;
    expect(text).toContain("Bandeja ranurada (ref. BP0101)");
    expect(text).toContain("disponibilidad");
  });

  it("works without a reference", () => {
    const text = new URL(buildWhatsappProductUrl("573105127314", "Rack de piso")).searchParams.get("text")!;
    expect(text).toContain("Rack de piso.");
    expect(text).not.toContain("ref.");
  });
});
