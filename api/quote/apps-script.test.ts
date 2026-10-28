// Behaviour tests for the Google Apps Script receiver (docs/integraciones/apps-script-leads.gs).
// The script runs in a Node VM against in-memory fakes of Sheets, Drive, Gmail and the script properties, so the
// real file is what is tested. What cannot be tested here is Google itself: see docs/integraciones/google-apps-script.md.
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { describe, expect, it } from "vitest";

const source = fs.readFileSync(path.resolve(__dirname, "../../docs/integraciones/apps-script-leads.gs"), "utf8");

interface Opts {
  quota?: number;
  mailFails?: boolean;
  today?: string;
}

interface Mail {
  to: string;
  replyTo?: string;
  name?: string;
  subject: string;
  body: string;
}

function world(initial: Record<string, string>, opts: Opts = {}) {
  const props = { ...initial }; // the script writes counters here: never share the object between tests
  const rows: unknown[][] = [];
  const folders: Record<string, { files: { name: string }[]; createFile(b: { name: string }): { getUrl(): string } }> = {};
  const logs: string[] = [];
  const emails: Mail[] = [];
  const state = { quota: opts.quota ?? 100 };

  const sheet = {
    getLastRow: () => rows.length,
    appendRow: (r: unknown[]) => rows.push(r),
    setFrozenRows() {},
    getRange: (_r: number, _c: number, n: number) => ({ getValues: () => rows.slice(1, 1 + n).map((x) => [x[0]]) }),
  };
  const context = {
    console: { error: (m: string) => logs.push(m) },
    PropertiesService: { getScriptProperties: () => ({ getProperty: (k: string) => (k in props ? props[k] : null), setProperty: (k: string, v: string) => (props[k] = v) }) },
    LockService: { getScriptLock: () => ({ waitLock() {}, releaseLock() {} }) },
    SpreadsheetApp: { getActiveSpreadsheet: () => ({ getSheetByName: () => sheet, insertSheet: () => sheet, getUrl: () => "https://sheet/url" }) },
    ContentService: { MimeType: { JSON: "json" }, createTextOutput: (s: string) => ({ s, setMimeType() { return this; } }) },
    Utilities: { base64Decode: (b: string) => Buffer.from(b, "base64"), newBlob: (bytes: Buffer, mime: string, name: string) => ({ bytes, mime, name }), formatDate: () => opts.today ?? "2026-10-28" },
    Session: { getScriptTimeZone: () => "America/Bogota" },
    MailApp: {
      getRemainingDailyQuota: () => state.quota,
      sendEmail: (m: Mail) => {
        if (opts.mailFails) throw new Error("mail down");
        state.quota -= 1;
        emails.push(m);
      },
    },
    DriveApp: {
      getFolderById: () => ({
        getFoldersByName: (n: string) => {
          const f = folders[n];
          let used = false;
          return { hasNext: () => !!f && !used, next: () => ((used = true), f) };
        },
        createFolder: (n: string) => (folders[n] = { files: [], createFile(b) { this.files.push(b); return { getUrl: () => `https://drive/${b.name}` }; } }),
      }),
    },
  };
  vm.createContext(context);
  vm.runInContext(source, context);
  const api = context as unknown as { doPost(e: unknown): { s: string }; doGet(): { s: string } };
  const call = (lead: unknown, token = "tok") => JSON.parse(api.doPost({ parameter: { token }, postData: { contents: typeof lead === "string" ? lead : JSON.stringify(lead) } }).s);
  return { rows, folders, logs, emails, call, props, state, get: () => JSON.parse(api.doGet().s) };
}

const lead = (ref: string, rut?: object, over: { email?: string; items?: object[] } = {}) => ({
  reference: ref,
  createdAt: "2026-03-01T00:00:00.000Z",
  request: {
    items: over.items ?? [{ category: "canaletas", quantity: 2, productSlug: "canaletas" }],
    project: { city: "Medellín", neededBy: "2026-12-01", notes: "urgente" },
    contact: {
      personType: "juridica",
      fullName: "Ana Pérez",
      businessName: "Ejemplo SAS",
      taxId: "900123456",
      taxIdCheckDigit: "8",
      ciiuCode: "2599",
      fiscalResponsibilities: ["responsable-iva", "autorretenedor"],
      email: over.email ?? "ana@ejemplo.com",
      phone: "573001112233",
    },
    ...(rut ? { rutFile: rut } : {}),
  },
});
const pdf = { fileName: "x.pdf", mimeType: "application/pdf", sizeBytes: 9, contentBase64: Buffer.from("%PDF-1.4\n").toString("base64") };
const base = { WEBHOOK_TOKEN: "tok", RUT_FOLDER_ID: "parent" };
const team = "contacto@electrometalicasceygom.com";

describe("receiver basics", () => {
  it("answers the health check, rejects bad tokens, JSON and payloads", () => {
    const w = world(base);
    expect(w.get()).toEqual({ ok: true, service: "ceygom-leads" });
    expect(w.call(lead("COT-2026-AAAAAA"), "malo").error).toBe("unauthorized");
    expect(w.call("no es json").error).toBe("invalid_json");
    expect(w.call({ ...lead("x"), reference: "x" }).error).toBe("invalid_payload");
  });

  it("stores the row and the RUT in a per-quote folder, ignores duplicates, and lists item references", () => {
    const w = world(base);
    const items = [{ category: "bandejas-portacables", productSlug: "bandeja-porta-cables", reference: "BP0101", quantity: 10 }];
    expect(w.call(lead("COT-2026-AAAAAA", pdf, { items }))).toEqual({ ok: true, rutSaved: true });
    expect(Object.keys(w.folders)).toEqual(["COT-2026-AAAAAA"]);
    expect(w.rows[1]![2]).toContain("10 x bandeja-porta-cables (BP0101)");
    expect(w.rows[1]![16]).toBe("https://drive/COT-2026-AAAAAA-RUT.pdf");
    expect(w.call(lead("COT-2026-AAAAAA"))).toEqual({ ok: true, duplicate: true });
    expect(w.rows).toHaveLength(2);
  });

  it("stores nothing when Drive fails, and logs only the reference", () => {
    const broken = world(base);
    // Simulate a Drive failure through an unsupported mime type.
    const r = broken.call(lead("COT-2026-BBBBBB", { ...pdf, mimeType: "text/html" }));
    expect(r).toEqual({ ok: false, error: "internal" });
    expect(broken.rows).toHaveLength(1); // only the header row
    expect(broken.logs.join("\n")).toContain("COT-2026-BBBBBB");
    expect(broken.logs.join("\n")).not.toContain("ana@ejemplo.com");
  });
});

describe("internal alert to the team", () => {
  it("is sent with contact data and without tax data", () => {
    const w = world({ ...base, NOTIFY_EMAIL: team, CUSTOMER_ACK: "off" });
    w.call(lead("COT-2026-AAAAAA", pdf));
    expect(w.emails).toHaveLength(1);
    const m = w.emails[0]!;
    expect(m.to).toBe(team);
    expect(m.replyTo).toBe("ana@ejemplo.com");
    for (const s of ["Ejemplo SAS", "573001112233", "ana@ejemplo.com", "Medellín", "2 x canaletas", "https://drive/COT-2026-AAAAAA-RUT.pdf", "https://sheet/url"]) expect(m.body).toContain(s);
    for (const s of ["900123456", "2599", "responsable-iva"]) expect(m.body).not.toContain(s);
  });

  it("is skipped without NOTIFY_EMAIL, and a mail failure never loses the lead", () => {
    const quiet = world({ ...base, CUSTOMER_ACK: "off" });
    expect(quiet.call(lead("COT-2026-BBBBBB"))).toEqual({ ok: true, rutSaved: true });
    expect(quiet.emails).toHaveLength(0);

    const failing = world({ ...base, NOTIFY_EMAIL: team }, { mailFails: true });
    expect(failing.call(lead("COT-2026-CCCCCC"))).toEqual({ ok: true, rutSaved: true });
    expect(failing.rows).toHaveLength(2);
    expect(failing.logs.some((l) => l.includes("COT-2026-CCCCCC") && l.includes("notification failed"))).toBe(true);
    expect(failing.logs.join("\n")).not.toContain("ana@ejemplo.com");
  });

  it("limits the RUT files stored per day and reports them as not saved", () => {
    const w = world({ ...base, NOTIFY_EMAIL: team, MAX_RUT_PER_DAY: "2", CUSTOMER_ACK: "off" });
    expect(w.call(lead("COT-2026-EEEEE1", pdf)).rutSaved).toBe(true);
    expect(w.call(lead("COT-2026-EEEEE2", pdf)).rutSaved).toBe(true);
    expect(w.call(lead("COT-2026-EEEEE3", pdf))).toEqual({ ok: true, rutSaved: false });
    expect(w.rows[3]).toContain("NO GUARDADO: límite diario de archivos");
    expect(Object.keys(w.folders)).toHaveLength(2);
    expect(w.emails[2]!.body).toContain("NO se guardó");
    expect(w.call(lead("COT-2026-EEEEE4")).rutSaved).toBe(true);
    expect(world({ ...w.props }, { today: "2026-10-29" }).call(lead("COT-2026-EEEEE5", pdf)).rutSaved).toBe(true);
  });
});

describe("acknowledgement to the customer", () => {
  const ackOf = (w: ReturnType<typeof world>) => w.emails.filter((m) => m.to !== team);

  it("is sent to the customer after the team alert, with the reference, items and a reply-to of the team", () => {
    const w = world({ ...base, NOTIFY_EMAIL: team, SITE_URL: "https://sitio.example/" });
    const items = [
      { category: "bandejas-portacables", productSlug: "bandeja-porta-cables", reference: "BP0101", quantity: 10 },
      { category: "racks-comunicaciones", productSlug: "rack-de-piso", quantity: 1 },
    ];
    w.call(lead("COT-2026-AAAAAA", undefined, { items }));
    expect(w.emails.map((m) => m.to)).toEqual([team, "ana@ejemplo.com"]); // the team is always first
    const ack = ackOf(w)[0]!;
    expect(ack.subject).toBe("Recibimos tu solicitud de cotización COT-2026-AAAAAA");
    expect(ack.replyTo).toBe(team);
    expect(ack.name).toBe("Electro Metálicas Ceygom");
    for (const s of ["Hola Ana Pérez", "COT-2026-AAAAAA", "- 10 x Bandeja porta cables (BP0101)", "- 1 x Rack de piso", "Ciudad: Medellín", "no es una cotización ni un compromiso de precio", "(574) 444 6733", "https://sitio.example/privacidad/", "NIT 900456873-5"]) {
      expect(ack.body).toContain(s);
    }
  });

  it("never includes tax data, the RUT link or the sheet link", () => {
    const w = world({ ...base, NOTIFY_EMAIL: team });
    w.call(lead("COT-2026-AAAAAA", pdf));
    const ack = ackOf(w)[0]!;
    for (const s of ["900123456", "2599", "responsable-iva", "drive", "sheet/url", "573001112233"]) expect(ack.body).not.toContain(s);
    expect(ack.body).toContain("Recibimos tu RUT.");
  });

  it("tells the customer to send the RUT by WhatsApp when it could not be stored", () => {
    const w = world({ ...base, NOTIFY_EMAIL: team, MAX_RUT_PER_DAY: "1" });
    w.call(lead("COT-2026-AAAAAA", pdf));
    w.call(lead("COT-2026-BBBBBB", pdf, { email: "otra@ejemplo.com" }));
    expect(ackOf(w)[1]!.body).toContain("No pudimos guardar tu RUT");
  });

  it("omits the policy link when SITE_URL is not set, and works without NOTIFY_EMAIL (no reply-to)", () => {
    const w = world(base);
    w.call(lead("COT-2026-AAAAAA"));
    const ack = ackOf(w)[0]!;
    expect(ack.body).toContain("según nuestra política de tratamiento de datos personales.");
    expect(ack.body).not.toContain("/privacidad/");
    expect(ack.replyTo).toBeUndefined();
  });

  it("can be switched off with CUSTOMER_ACK=off without touching the team alert", () => {
    const w = world({ ...base, NOTIFY_EMAIL: team, CUSTOMER_ACK: "off" });
    w.call(lead("COT-2026-AAAAAA"));
    expect(w.emails.map((m) => m.to)).toEqual([team]);
  });

  it("keeps a reserve of the daily quota for the team alerts", () => {
    // 12 left: alert leaves 11 (> 10), so the acknowledgement goes out.
    const enough = world({ ...base, NOTIFY_EMAIL: team }, { quota: 12 });
    enough.call(lead("COT-2026-AAAAAA"));
    expect(enough.emails.map((m) => m.to)).toEqual([team, "ana@ejemplo.com"]);

    // 11 left: alert leaves 10, the reserve, so only the alert is sent.
    const tight = world({ ...base, NOTIFY_EMAIL: team }, { quota: 11 });
    expect(tight.call(lead("COT-2026-BBBBBB"))).toEqual({ ok: true, rutSaved: true });
    expect(tight.emails.map((m) => m.to)).toEqual([team]);
    expect(tight.logs.some((l) => l.includes("COT-2026-BBBBBB") && l.includes("quota low"))).toBe(true);
    expect(tight.rows).toHaveLength(2);
  });

  it("limits acknowledgements per address and per day, and starts again the next day", () => {
    const w = world({ ...base, NOTIFY_EMAIL: team });
    for (let i = 1; i <= 5; i++) w.call(lead(`COT-2026-ADDR0${i}`, undefined, { email: "Mismo@Ejemplo.com" }));
    expect(ackOf(w)).toHaveLength(3); // 3 per address per day, case-insensitive
    expect(w.rows).toHaveLength(6); // every lead is still stored
    expect(w.logs.some((l) => l.includes("acknowledgement limit"))).toBe(true);
    expect(world({ ...w.props }, { today: "2026-10-29" }).call(lead("COT-2026-ADDR09", undefined, { email: "mismo@ejemplo.com" })).ok).toBe(true);

    const capped = world({ ...base, NOTIFY_EMAIL: team, MAX_ACK_PER_DAY: "2" });
    for (let i = 1; i <= 4; i++) capped.call(lead(`COT-2026-CAPS0${i}`, undefined, { email: `cliente${i}@ejemplo.com` }));
    expect(ackOf(capped)).toHaveLength(2);
  });

  it("never loses the lead or the team alert when the customer's mail fails", () => {
    const w = world({ ...base, NOTIFY_EMAIL: team });
    // Fail only the customer's mail.
    const originalCall = w.call;
    expect(originalCall(lead("COT-2026-AAAAAA", undefined, { email: "x@ejemplo.com" })).ok).toBe(true);
    const failing = world({ ...base, NOTIFY_EMAIL: team }, { mailFails: true });
    expect(failing.call(lead("COT-2026-BBBBBB"))).toEqual({ ok: true, rutSaved: true });
    expect(failing.rows).toHaveLength(2);
    expect(failing.logs.some((l) => l.includes("acknowledgement failed"))).toBe(true);
    expect(failing.logs.join("\n")).not.toContain("ana@ejemplo.com");
  });

  it("is not sent for a repeated delivery of the same quote", () => {
    const w = world({ ...base, NOTIFY_EMAIL: team });
    w.call(lead("COT-2026-AAAAAA"));
    w.call(lead("COT-2026-AAAAAA"));
    expect(w.emails).toHaveLength(2); // one alert and one acknowledgement, not four
  });
});
