import path from "node:path";
import { createRequire } from "node:module";
import { describe, expect, it } from "vitest";

const root = path.resolve(import.meta.dirname, "../..");
const sharp = createRequire(path.join(root, "package.json"))("sharp");
const size = async (file) => {
  const m = await sharp(path.join(root, file)).metadata();
  return [m.width, m.height];
};

describe("share image", () => {
  it("keeps the three designed pieces at 1200x630, and serves a 1200x630 JPG", async () => {
    for (const name of ["og-ceygom-a", "og-ceygom-b", "og-ceygom-neutra"]) expect(await size(`docs/marca/og/${name}.png`), name).toEqual([1200, 630]);
    expect(await size("src/assets/brand/og-default.jpg")).toEqual([1200, 630]);
  });
});
