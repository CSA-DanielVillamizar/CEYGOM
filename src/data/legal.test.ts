import { describe, expect, it } from "vitest";
import { nitCheckDigit } from "../../packages/shared/fiscal";
import { LEGAL, nitDisplay } from "./legal";

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

describe("brand manual formatting", () => {
  it("prints the NIT with dots, as in the manual, and keeps the stored value untouched", () => {
    expect(nitDisplay(LEGAL.nit!)).toBe("900.456.873-5");
    expect(LEGAL.nit).toBe("900456873-5");
  });

  it("uses the current Medellín area code (604) in the label and the tel: link", () => {
    expect(LEGAL.phoneLabel).toBe("(604) 444 6733");
    expect(LEGAL.phoneHref).toBe("tel:+576044446733");
  });
});
