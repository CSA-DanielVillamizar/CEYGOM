import { describe, expect, it, vi } from "vitest";
import { HttpRequest, InvocationContext } from "@azure/functions";
import { handleQuote, type Deps } from "./handler";
import { loadEnv } from "./env";
import { newReference } from "./reference";
import { isSafeWebhookUrl, postLead, webhookTimeoutMs, WEBHOOK_TIMEOUT_MS, WEBHOOK_TIMEOUT_WITH_FILE_MS } from "./webhook";

const validBody = {
  items: [{ category: "canaletas", quantity: 10, productSlug: "canaleta" }],
  project: { city: "Medellín" },
  contact: {
    personType: "juridica",
    fullName: "Ana Pérez",
    businessName: "Ejemplo SAS",
    taxId: "900123456",
    taxIdCheckDigit: "8",
    ciiuCode: "2599",
    fiscalResponsibilities: ["responsable-iva"],
    email: "ana@ejemplo.com",
    phone: "3001234567",
    acceptsDataPolicy: true,
  },
};

const rut = (extraBytes = 0) => {
  const bytes = Buffer.concat([Buffer.from("%PDF-1.4\n"), Buffer.alloc(extraBytes, 1)]);
  return { fileName: "RUT.pdf", mimeType: "application/pdf", sizeBytes: bytes.length, contentBase64: bytes.toString("base64") };
};

const baseEnv = { WHATSAPP_NUMBER: "573000000000", LEADS_WEBHOOK_URL: "https://hooks.example/lead" };

const call = (body: unknown, deps: Partial<Deps> = {}, headers: Record<string, string> = {}) => {
  const req = new HttpRequest({
    method: "POST",
    url: "http://localhost/api/quote",
    headers: { "content-type": "application/json", ...headers },
    body: { string: typeof body === "string" ? body : JSON.stringify(body) },
  });
  return handleQuote(req, new InvocationContext(), {
    env: baseEnv,
    postLead: vi.fn().mockResolvedValue(undefined),
    now: () => new Date("2026-03-01T00:00:00Z"),
    ...deps,
  });
};

describe("POST /api/quote", () => {
  it("returns reference and wa.me link and posts the lead once", async () => {
    const post = vi.fn().mockResolvedValue(undefined);
    const res = await call(validBody, { postLead: post });
    expect(res.status).toBe(200);
    const body = res.jsonBody as { reference: string; whatsappUrl: string; webhookDelivered: boolean };
    expect(body.reference).toMatch(/^COT-2026-[A-Z0-9]{6}$/);
    expect(body.whatsappUrl.startsWith("https://wa.me/573000000000?text=")).toBe(true);
    expect(body.webhookDelivered).toBe(true);
    expect(post).toHaveBeenCalledTimes(1);
    expect(decodeURIComponent(body.whatsappUrl)).not.toContain("ana@ejemplo.com");
  });

  it("400 on invalid data, with the failing path, and no webhook call", async () => {
    const post = vi.fn();
    const bad = { ...validBody, contact: { ...validBody.contact, email: undefined } };
    const res = await call(bad, { postLead: post });
    expect(res.status).toBe(400);
    expect((res.jsonBody as { issues: { path: string }[] }).issues.map((i) => i.path)).toContain("contact.email");
    expect(post).not.toHaveBeenCalled();
  });

  it("400 without the NIT or cédula, and the webhook receives it normalized otherwise", async () => {
    const post = vi.fn().mockResolvedValue(undefined);
    const missing = await call({ ...validBody, contact: { ...validBody.contact, taxId: undefined } }, { postLead: post });
    expect(missing.status).toBe(400);
    expect((missing.jsonBody as { issues: { path: string }[] }).issues.map((i) => i.path)).toContain("contact.taxId");
    expect(post).not.toHaveBeenCalled();

    await call({ ...validBody, contact: { ...validBody.contact, taxId: "900.123.456" } }, { postLead: post });
    expect(post.mock.calls[0]![1].request.contact.taxId).toBe("900123456");
  });

  it.each([
    ["person type", { personType: undefined }, "contact.personType"],
    ["business name of a legal entity", { businessName: "" }, "contact.businessName"],
    ["NIT verification digit", { taxIdCheckDigit: "1" }, "contact.taxIdCheckDigit"],
    ["CIIU code", { ciiuCode: "12" }, "contact.ciiuCode"],
    ["fiscal responsibilities", { fiscalResponsibilities: [] }, "contact.fiscalResponsibilities"],
  ])("400 for an invalid %s", async (_name, patch, path) => {
    const post = vi.fn();
    const res = await call({ ...validBody, contact: { ...validBody.contact, ...patch } }, { postLead: post });
    expect(res.status).toBe(400);
    expect((res.jsonBody as { issues: { path: string }[] }).issues.map((i) => i.path)).toContain(path);
    expect(post).not.toHaveBeenCalled();
  });

  it("forwards the RUT file to the webhook but never puts it, or tax data, in the wa.me link or the logs", async () => {
    const post = vi.fn().mockResolvedValue(undefined);
    const file = rut(1000);
    const logs: string[] = [];
    const ctx = new InvocationContext();
    for (const level of ["log", "error", "warn", "info"] as const) ctx[level] = ((...a: unknown[]) => void logs.push(a.join(" "))) as never;
    const req = new HttpRequest({
      method: "POST",
      url: "http://localhost/api/quote",
      headers: { "content-type": "application/json" },
      body: { string: JSON.stringify({ ...validBody, rutFile: file }) },
    });
    const res = await handleQuote(req, ctx, { env: baseEnv, postLead: post, now: () => new Date("2026-03-01T00:00:00Z") });
    expect(res.status).toBe(200);
    expect(post.mock.calls[0]![1].request.rutFile).toEqual(file);
    const url = decodeURIComponent((res.jsonBody as { whatsappUrl: string }).whatsappUrl);
    for (const secret of [file.contentBase64, "900123456", "2599", "ana@ejemplo.com", "3001234567"]) {
      expect(url).not.toContain(secret);
      expect(logs.join("\n")).not.toContain(secret);
    }
    expect(logs.join("\n")).toContain("rut=attached");
  });

  it("accepts a 5 MB RUT and rejects a bigger or inconsistent one without calling the webhook", async () => {
    const post = vi.fn().mockResolvedValue(undefined);
    expect((await call({ ...validBody, rutFile: rut(5 * 1024 * 1024 - 9) }, { postLead: post })).status).toBe(200);

    const tooBig = await call({ ...validBody, rutFile: rut(5 * 1024 * 1024) }, { postLead: post });
    expect(tooBig.status).toBe(400);
    const fake = { ...rut(), mimeType: "image/png" };
    expect((await call({ ...validBody, rutFile: fake }, { postLead: post })).status).toBe(400);
    expect(post).toHaveBeenCalledTimes(1);
  });

  it("400 when consent is missing", async () => {
    const res = await call({ ...validBody, contact: { ...validBody.contact, acceptsDataPolicy: false } });
    expect(res.status).toBe(400);
  });

  it("400 when the body is not JSON", async () => {
    expect((await call("hola")).status).toBe(400);
  });

  it("looks successful but stores nothing when the honeypot is filled", async () => {
    const post = vi.fn();
    const res = await call({ ...validBody, website: "http://spam" }, { postLead: post });
    expect(res.status).toBe(200);
    expect(post).not.toHaveBeenCalled();
  });

  it("403 for a different Origin when ALLOWED_ORIGIN is set", async () => {
    const res = await call(validBody, { env: { ...baseEnv, ALLOWED_ORIGIN: "https://electrometalicasceygom.com" } }, { origin: "https://evil.example" });
    expect(res.status).toBe(403);
  });

  it("still answers 200 when the webhook fails, flagging it", async () => {
    const res = await call(validBody, { postLead: vi.fn().mockRejectedValue(new Error("boom")) });
    expect(res.status).toBe(200);
    expect((res.jsonBody as { webhookDelivered: boolean }).webhookDelivered).toBe(false);
  });

  it.each([null, undefined, "boom", { code: 500 }])("keeps the wa.me link when the webhook throws %j", async (thrown) => {
    const res = await call(validBody, { postLead: vi.fn().mockRejectedValue(thrown) });
    expect(res.status).toBe(200);
    const body = res.jsonBody as { whatsappUrl: string; webhookDelivered: boolean };
    expect(body.webhookDelivered).toBe(false);
    expect(body.whatsappUrl.startsWith("https://wa.me/573000000000?text=")).toBe(true);
  });

  it("works without a webhook configured", async () => {
    const res = await call(validBody, { env: { WHATSAPP_NUMBER: "573000000000" } });
    expect(res.status).toBe(200);
  });

  it("500 SERVER_MISCONFIGURED without the WhatsApp number", async () => {
    const res = await call(validBody, { env: {} });
    expect(res.status).toBe(500);
    expect((res.jsonBody as { error: string }).error).toBe("SERVER_MISCONFIGURED");
  });
});

describe("helpers", () => {
  it("loadEnv names the invalid variable but not its value", () => {
    const r = loadEnv({ WHATSAPP_NUMBER: "abc" });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.invalid).toEqual(["WHATSAPP_NUMBER"]);
  });

  it("newReference matches the contract", () => {
    expect(newReference()).toMatch(/^COT-\d{4}-[A-Z0-9]{6}$/);
  });

  it("postLead signs the body with HMAC when a secret is given", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response("ok", { status: 200 }));
    const lead = { reference: "COT-2026-AAAAAA", createdAt: "2026-03-01T00:00:00.000Z", request: validBody as never };
    await postLead("https://hooks.example/x", lead, "s3cret", fetchMock as unknown as typeof fetch);
    const init = fetchMock.mock.calls[0]![1] as { headers: Record<string, string> };
    expect(init.headers["x-ceygom-signature"]).toMatch(/^sha256=[0-9a-f]{64}$/);
  });

  it("postLead throws on non-2xx", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response("no", { status: 500 }));
    await expect(postLead("https://hooks.example/x", {} as never, undefined, fetchMock as unknown as typeof fetch)).rejects.toThrow("500");
  });
});

describe("leads webhook", () => {
  const lead = (withFile: boolean) =>
    ({
      reference: "COT-2026-AAAAAA",
      createdAt: "2026-03-01T00:00:00.000Z",
      request: { ...validBody, ...(withFile ? { rutFile: rut() } : {}) },
    }) as never;
  const send = (answer: Response, withFile = false) =>
    postLead("https://script.google.com/macros/s/ID/exec?token=SECRET", lead(withFile), undefined, vi.fn().mockResolvedValue(answer) as unknown as typeof fetch);

  it("waits longer when the lead carries the RUT file", () => {
    expect(webhookTimeoutMs(lead(false))).toBe(WEBHOOK_TIMEOUT_MS);
    expect(webhookTimeoutMs(lead(true))).toBe(WEBHOOK_TIMEOUT_WITH_FILE_MS);
    expect(WEBHOOK_TIMEOUT_WITH_FILE_MS).toBeGreaterThan(WEBHOOK_TIMEOUT_MS);
    expect(WEBHOOK_TIMEOUT_WITH_FILE_MS).toBeLessThan(45_000); // managed functions stop at 45 s
  });

  it("sends the request to the configured URL with a timeout signal", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response("{}", { status: 200 }));
    await postLead("https://script.google.com/macros/s/ID/exec?token=SECRET", lead(true), undefined, fetchMock as unknown as typeof fetch);
    expect(fetchMock.mock.calls[0]![0]).toBe("https://script.google.com/macros/s/ID/exec?token=SECRET");
    expect((fetchMock.mock.calls[0]![1] as { signal: AbortSignal }).signal).toBeInstanceOf(AbortSignal);
  });

  it.each([["Apps Script ok", '{"ok":true}'], ["duplicate", '{"ok":true,"duplicate":true}'], ["Make", "Accepted"], ["empty", ""], ["HTML page", "<html>hola</html>"]])(
    "counts a 200 answer as delivered: %s",
    async (_name, answer) => {
      await expect(send(new Response(answer, { status: 200 }))).resolves.toBeUndefined();
    },
  );

  it.each([
    ["unauthorized", '{"ok":false,"error":"unauthorized"}', "Webhook rejected the lead: unauthorized"],
    ["internal", '{"ok":false,"error":"internal"}', "Webhook rejected the lead: internal"],
    ["no code", '{"ok":false}', "Webhook rejected the lead"],
    ["odd code is not echoed", '{"ok":false,"error":"Token SECRET <b>"}', "Webhook rejected the lead"],
  ])("fails when the destination reports a rejection with status 200: %s", async (_name, answer, message) => {
    await expect(send(new Response(answer, { status: 200 }))).rejects.toThrow(new RegExp(`^${message}$`));
  });

  it("never puts the URL, which may carry a token, in the error", async () => {
    const attempts = [send(new Response("no", { status: 502 })), send(new Response('{"ok":false,"error":"unauthorized"}', { status: 200 }))];
    for (const attempt of attempts) {
      await attempt.catch((e: Error) => {
        expect(e.message).not.toContain("SECRET");
        expect(e.message).not.toContain("script.google.com");
      });
    }
  });

  it.each([
    ["https://script.google.com/macros/s/ID/exec?token=x", true],
    ["https://hook.eu1.make.com/abc", true],
    ["http://localhost:9999/", true],
    ["http://127.0.0.1:9999/", true],
    ["http://script.google.com/macros/s/ID/exec", false],
    ["http://hooks.example/x", false],
    ["ftp://hooks.example/x", false],
    ["no es una url", false],
  ])("isSafeWebhookUrl(%s) is %s", (url, expected) => {
    expect(isSafeWebhookUrl(url)).toBe(expected);
  });
});

describe("webhook failures are logged as warnings and never block the customer", () => {
  const logsOf = (ctx: InvocationContext) => {
    const out: { level: string; text: string }[] = [];
    for (const level of ["log", "error", "warn", "info"] as const) ctx[level] = ((...a: unknown[]) => void out.push({ level, text: a.join(" ") })) as never;
    return out;
  };
  const run = async (deps: Partial<Deps>) => {
    const ctx = new InvocationContext();
    const logs = logsOf(ctx);
    const req = new HttpRequest({ method: "POST", url: "http://localhost/api/quote", headers: { "content-type": "application/json" }, body: { string: JSON.stringify({ ...validBody, rutFile: rut(100) }) } });
    const res = await handleQuote(req, ctx, { env: baseEnv, postLead: vi.fn().mockResolvedValue(undefined), now: () => new Date("2026-03-01T00:00:00Z"), ...deps });
    return { res, logs };
  };

  it("a timeout answers 200 with the wa.me link and a warning that names the reference only", async () => {
    const timeout = Object.assign(new Error("The operation was aborted due to timeout"), { name: "TimeoutError" });
    const { res, logs } = await run({ postLead: vi.fn().mockRejectedValue(timeout) });
    const body = res.jsonBody as { reference: string; whatsappUrl: string; webhookDelivered: boolean };
    expect(res.status).toBe(200);
    expect(body.webhookDelivered).toBe(false);
    expect(body.whatsappUrl.startsWith("https://wa.me/573000000000?text=")).toBe(true);
    const warning = logs.find((l) => l.level === "warn")!;
    expect(warning.text).toContain(body.reference);
    expect(warning.text).toContain("timeout");
    expect(logs.filter((l) => l.level === "error")).toEqual([]);
    for (const secret of ["900123456", "ana@ejemplo.com", "3001234567", "hooks.example"]) expect(logs.map((l) => l.text).join("\n")).not.toContain(secret);
  });

  it("does not forward the lead over plain http, but still answers 200", async () => {
    const post = vi.fn();
    const { res, logs } = await run({ env: { ...baseEnv, LEADS_WEBHOOK_URL: "http://hooks.example/lead" }, postLead: post });
    expect(res.status).toBe(200);
    expect((res.jsonBody as { webhookDelivered: boolean }).webhookDelivered).toBe(false);
    expect(post).not.toHaveBeenCalled();
    expect(logs.find((l) => l.level === "warn")!.text).toContain("https");
  });

  it("reads the destination from LEADS_WEBHOOK_URL", async () => {
    const post = vi.fn().mockResolvedValue(undefined);
    const url = "https://script.google.com/macros/s/ID/exec?token=abc";
    const { res } = await run({ env: { ...baseEnv, LEADS_WEBHOOK_URL: url }, postLead: post });
    expect(post.mock.calls[0]![0]).toBe(url);
    expect((res.jsonBody as { webhookDelivered: boolean }).webhookDelivered).toBe(true);
  });
});
