// Behaviour of public/sw.js (offline mode), run in a Node VM against in-memory fakes of the Cache API.
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { describe, expect, it } from "vitest";

const source = fs.readFileSync(path.resolve(import.meta.dirname, "../public/sw.js"), "utf8");

class FakeResponse {
  constructor(body, init = {}) {
    Object.assign(this, { body, status: 200, ok: true, type: "basic", redirected: false }, init);
  }
  clone() {
    return new FakeResponse(this.body, this);
  }
  static error() {
    return new FakeResponse("", { status: 0, ok: false, type: "error" });
  }
}

function sw({ online = true, hangs = false } = {}) {
  const stores = new Map();
  const abs = (u) => (typeof u === "string" ? new URL(u, "https://sitio.test").href : u.url);
  const open = (name) => {
    if (!stores.has(name)) stores.set(name, new Map());
    const m = stores.get(name);
    return Promise.resolve({
      match: (req) => Promise.resolve(m.get(abs(req))),
      put: (req, res) => (m.set(req.url, res), Promise.resolve()),
      keys: () => Promise.resolve([...m.keys()].map((url) => ({ url }))),
      delete: (req) => (m.delete(req.url), Promise.resolve(true)),
      addAll: (urls) => (urls.forEach((u) => m.set(abs(u), new FakeResponse(`page ${u}`))), Promise.resolve()),
    });
  };
  const listeners = {};
  const net = { calls: 0, response: () => new FakeResponse("fresh") };
  const context = {
    self: { location: { origin: "https://sitio.test" }, addEventListener: (t, fn) => (listeners[t] = fn), skipWaiting: () => Promise.resolve(), clients: { claim: () => Promise.resolve() } },
    caches: { open, keys: () => Promise.resolve([...stores.keys()]), delete: (n) => (stores.delete(n), Promise.resolve(true)) },
    fetch: () => {
      net.calls++;
      if (hangs) return new Promise(() => undefined);
      return online ? Promise.resolve(net.response()) : Promise.reject(new TypeError("offline"));
    },
    Response: FakeResponse,
    URL,
    Promise,
    setTimeout: (fn) => setTimeout(fn, 5), // shrink the 4 s timeout for the test
    console,
  };
  context.self.fetch = context.fetch;
  vm.createContext(context);
  vm.runInContext(source, context);
  const req = (url, init = {}) => ({ url: `https://sitio.test${url}`, method: "GET", mode: "cors", headers: { get: () => null }, ...init });
  const handle = (request) => {
    let promise;
    listeners.fetch({ request, respondWith: (p) => (promise = p) });
    return promise;
  };
  return { context, stores, listeners, net, req, handle };
}

const strategy = (s, url, init) => s.context.strategyFor(new URL(`https://sitio.test${url}`), s.req(url, init));

describe("which requests it handles", () => {
  const s = sw();
  it("leaves quote requests, other methods, other origins, ranges and itself alone", () => {
    expect(strategy(s, "/api/quote", { method: "POST" })).toBe("skip");
    expect(strategy(s, "/api/quote")).toBe("skip");
    expect(strategy(s, "/fichas/x.pdf", { headers: { get: (h) => (h === "range" ? "bytes=0-9" : null) } })).toBe("skip");
    expect(strategy(s, "/sw.js")).toBe("skip");
    expect(s.context.strategyFor(new URL("https://otro.test/x.js"), s.req("/x.js"))).toBe("skip");
  });
  it("picks a strategy per kind of file", () => {
    expect(strategy(s, "/productos/", { mode: "navigate" })).toBe("network-first");
    expect(strategy(s, "/_astro/app.abc123.js")).toBe("cache-first");
    expect(strategy(s, "/fichas/bandejas-portacables/bandeja-cruz.pdf")).toBe("stale-while-revalidate");
    expect(strategy(s, "/fichas/bandejas-portacables/bandeja-cruz.pdf", { mode: "navigate" })).toBe("stale-while-revalidate"); // opened from a link
    expect(strategy(s, "/productos/anexo-index.json")).toBe("stale-while-revalidate");
  });
});

describe("pages", () => {
  it("precaches the offline page and the main entry points on install", async () => {
    const s = sw();
    await s.listeners.install({ waitUntil: (p) => p });
    const cached = [...s.stores.get("ceygom-pages-v1").keys()];
    expect(cached).toEqual(expect.arrayContaining(["https://sitio.test/sin-conexion/", "https://sitio.test/", "https://sitio.test/productos/", "https://sitio.test/cotizacion/"]));
  });

  it("serves the network copy when online and keeps it for later", async () => {
    const s = sw();
    const request = s.req("/productos/bandejas-portacables/", { mode: "navigate" });
    expect((await s.handle(request)).body).toBe("fresh");
    expect(s.stores.get("ceygom-pages-v1").has(request.url)).toBe(true);
  });

  it("falls back to the cached copy offline, then to the offline page", async () => {
    const s = sw();
    const seen = s.req("/productos/", { mode: "navigate" });
    await s.handle(seen); // stored while online
    s.context.fetch = () => Promise.reject(new TypeError("offline"));
    expect((await s.handle(seen)).body).toBe("fresh");

    await s.listeners.install({ waitUntil: (p) => p });
    const unseen = s.req("/productos/canaletas/canaleta/", { mode: "navigate" });
    expect((await s.handle(unseen)).body).toBe("page /sin-conexion/");
  });

  it("does not wait forever for a hanging network", async () => {
    const s = sw({ hangs: true });
    await s.listeners.install({ waitUntil: (p) => p });
    expect((await s.handle(s.req("/", { mode: "navigate" }))).body).toBe("page /");
  });

  it("never stores redirects, errors or partial responses", async () => {
    const s = sw();
    for (const init of [{ redirected: true }, { status: 404, ok: false }, { status: 206 }, { type: "opaque" }]) {
      s.net.response = () => new FakeResponse("x", init);
      await s.handle(s.req(`/p${JSON.stringify(init).length}/`, { mode: "navigate" }));
    }
    expect(s.stores.get("ceygom-pages-v1").size).toBe(0);
  });
});

describe("files", () => {
  it("serves a data sheet from the cache while refreshing it", async () => {
    const s = sw();
    const sheet = s.req("/fichas/canaletas/canaleta.pdf");
    s.net.response = () => new FakeResponse("v1");
    expect((await s.handle(sheet)).body).toBe("v1"); // first visit: network
    s.net.response = () => new FakeResponse("v2");
    expect((await s.handle(sheet)).body).toBe("v1"); // stale copy now, fresh one stored in the background
    await new Promise((r) => setTimeout(r, 20));
    expect((await s.handle(sheet)).body).toBe("v2");
    s.context.fetch = () => Promise.reject(new TypeError("offline"));
    expect((await s.handle(sheet)).body).toBe("v2"); // works offline
  });

  it("serves hashed assets from the cache without asking the network again", async () => {
    const s = sw();
    const asset = s.req("/_astro/app.abc123.js");
    await s.handle(asset);
    const calls = s.net.calls;
    await s.handle(asset);
    expect(s.net.calls).toBe(calls);
  });
});

describe("activation", () => {
  it("drops caches of older versions and keeps the current ones", async () => {
    const s = sw();
    await s.context.caches.open("ceygom-pages-v0");
    await s.context.caches.open("ceygom-pages-v1");
    await s.context.caches.open("otra-app");
    await s.listeners.activate({ waitUntil: (p) => p });
    expect([...s.stores.keys()].sort()).toEqual(["ceygom-pages-v1", "otra-app"]);
  });
});
