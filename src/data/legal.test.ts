import { describe, expect, it } from "vitest";
import { nitCheckDigit } from "../../packages/shared/fiscal";
import { LEGAL } from "./legal";

describe("company legal data", () => {
  it("has a NIT whose verification digit is correct", () => {
    expect(LEGAL.nit).toMatch(/^\d{9}-\d$/);
    const [number, digit] = LEGAL.nit!.split("-");
    expect(nitCheckDigit(number!)).toBe(digit);
  });

  it("names the legal entity", () => {
    expect(LEGAL.legalName).toMatch(/S\.A\.S\.$/);
    expect(LEGAL.legalName).toContain(LEGAL.tradeName);
  });

  it("does not publish anything that was not provided", () => {
    // The email for queries and claims is still pending: the policy page omits it instead of guessing.
    expect(LEGAL.privacyEmail).toBeUndefined();
  });
});
