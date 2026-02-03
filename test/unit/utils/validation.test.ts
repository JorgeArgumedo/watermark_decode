/**
 * Unit tests for validation utilities
 */

import { describe, it, expect } from "vitest";
import { validateSequence, validateIdPersona } from "@/utils/validation";
import { SYMBOLS } from "@/utils/symbols";

describe("validation utilities", () => {
  describe("validateSequence", () => {
    it("should validate correct sequences", () => {
      const result = validateSequence(SYMBOLS[0] + SYMBOLS[1], SYMBOLS);
      expect(result.valid).toBe(true);
      expect(result.wildcardCount).toBe(0);
    });

    it("should validate sequences with wildcards", () => {
      const result = validateSequence(SYMBOLS[0] + "?", SYMBOLS);
      expect(result.valid).toBe(true);
      expect(result.wildcardCount).toBe(1);
    });

    it("should reject empty sequences", () => {
      const result = validateSequence("", SYMBOLS);
      expect(result.valid).toBe(false);
      expect(result.error).toContain("empty");
    });

    it("should reject sequences with too many wildcards", () => {
      const result = validateSequence("???", SYMBOLS);
      expect(result.valid).toBe(false);
      expect(result.error).toContain("errors.tooManyWildcards");
      expect(result.wildcardCount).toBe(3);
    });

    it("should reject sequences with invalid symbols", () => {
      const result = validateSequence(SYMBOLS[0] + "X", SYMBOLS);
      expect(result.valid).toBe(false);
      expect(result.error).toContain("errors.invalidSymbol");
    });

    it("should allow exactly 2 wildcards", () => {
      const result = validateSequence("??", SYMBOLS);
      expect(result.valid).toBe(true);
      expect(result.wildcardCount).toBe(2);
    });
  });

  describe("validateIdPersona", () => {
    it("should validate correct IDs", () => {
      expect(validateIdPersona("12345678").valid).toBe(true); // 8 dígitos mínimo
      expect(validateIdPersona("123456789").valid).toBe(true);
      expect(validateIdPersona("18446744073709551615").valid).toBe(true); // 2^64 - 1
    });

    it("should reject empty IDs", () => {
      const result = validateIdPersona("");
      expect(result.valid).toBe(false);
      expect(result.error).toContain("empty");
    });

    it("should reject non-numeric IDs", () => {
      const result = validateIdPersona("abc");
      expect(result.valid).toBe(false);
      expect(result.error).toContain("errors.numericIdOnly");
    });

    it("should reject negative IDs", () => {
      const result = validateIdPersona("-1");
      expect(result.valid).toBe(false);
      expect(result.error).toContain("errors.numericIdOnly");
    });

    it("should reject IDs exceeding BIGINT UNSIGNED max", () => {
      const result = validateIdPersona("18446744073709551616"); // 2^64
      expect(result.valid).toBe(false);
      expect(result.error).toContain("errors.idTooLarge");
    });

    it("should reject IDs with decimal points", () => {
      const result = validateIdPersona("123.45");
      expect(result.valid).toBe(false);
      expect(result.error).toContain("errors.numericIdOnly");
    });
  });
});
