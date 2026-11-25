import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { injectPrecache, precacheList } from "./inject-sw-precache.mjs";

const source = fs.readFileSync(path.resolve(import.meta.dirname, "../public/sw.js"), "utf8");

function fakeDist(files, sw = source) {
  const dist = fs.mkdtempSync(path.join(os.tmpdir(), "ceygom-dist-"));
  fs.mkdirSync(path.join(dist, "_astro"));
  for (const f of files) fs.writeFileSync(path.join(dist, "_astro", f), "x");
  fs.writeFileSync(path.join(dist, "sw.js"), sw);
  return dist;
}

describe("offline precache of build files", () => {
  const files = ["archivo-118-700.AAA.woff2", "archivo-118-800.BBB.woff2", "index.CCC.css", "logo-horizontal.DDD.svg", "page.EEE.js", "foto.FFF.webp"];

  it("lists fonts, styles and logos under /_astro/ and nothing else, in a stable order", () => {
    expect(precacheList(fakeDist(files))).toEqual(["/_astro/archivo-118-700.AAA.woff2", "/_astro/archivo-118-800.BBB.woff2", "/_astro/index.CCC.css", "/_astro/logo-horizontal.DDD.svg"]);
  });

  it("fills the line in dist/sw.js, leaves the rest untouched, and can run twice", () => {
    const dist = fakeDist(files);
    injectPrecache(dist);
    const once = fs.readFileSync(path.join(dist, "sw.js"), "utf8");
    expect(once).toContain('const PRECACHE_ASSETS = ["/_astro/archivo-118-700.AAA.woff2"');
    expect(once.replace(/const PRECACHE_ASSETS = \[[^\]]*\];/, "")).toBe(source.replace(/const PRECACHE_ASSETS = \[[^\]]*\];/, ""));
    injectPrecache(dist);
    expect(fs.readFileSync(path.join(dist, "sw.js"), "utf8")).toBe(once);
    expect(() => new Function(once)).not.toThrow(); // still valid JavaScript
  });

  it("fails loudly when sw.js has no line to fill, instead of shipping an empty precache", () => {
    expect(() => injectPrecache(fakeDist(files, "self.addEventListener('fetch', () => {});"))).toThrow(/PRECACHE_ASSETS/);
  });
});
