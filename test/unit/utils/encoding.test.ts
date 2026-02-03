/**
 * Unit tests for encoding utilities
 */

import { describe, it, expect } from "vitest";
import { intToDigits, digitsToSymbols, intToSymbolSeq } from "@domain/utils/encoding";
import { SYMBOLS } from "@shared/utils/symbols";

describe("encoding utilities", () => {
  describe("intToDigits", () => {
    it("should convert 0 to [0]", () => {
      expect(intToDigits(0n, 10)).toEqual([0]);
    });

    it("should convert positive numbers correctly", () => {
      expect(intToDigits(123n, 10)).toEqual([1, 2, 3]);
      expect(intToDigits(255n, 16)).toEqual([15, 15]);
      expect(intToDigits(8n, 2)).toEqual([1, 0, 0, 0]);
    });

    it("should handle large numbers", () => {
      const large = 18446744073709551615n; // 2^64 - 1
      const result = intToDigits(large, 10);
      expect(result.length).toBeGreaterThan(0);
      expect(result.every((d) => d >= 0 && d < 10)).toBe(true);
    });

    it("should handle negative numbers by returning [0]", () => {
      expect(intToDigits(-5n, 10)).toEqual([0]);
    });

    it("should handle base 1 by returning [0]", () => {
      expect(intToDigits(100n, 1)).toEqual([0]);
    });
  });

  describe("digitsToSymbols", () => {
    it("should convert digits to symbols", () => {
      const symbols = ["A", "B", "C"];
      expect(digitsToSymbols([0, 1, 2], symbols)).toBe("ABC");
      expect(digitsToSymbols([2, 1, 0], symbols)).toBe("CBA");
    });

    it("should use ? for invalid indices", () => {
      const symbols = ["A", "B"];
      expect(digitsToSymbols([0, 5, 1], symbols)).toBe("A?B");
    });
  });

  describe("intToSymbolSeq", () => {
    it("should convert ID to symbolic sequence", () => {
      const result = intToSymbolSeq("0", SYMBOLS);
      expect(result).toBe(SYMBOLS[0]);
    });

    it("should handle multi-digit conversions", () => {
      const base = SYMBOLS.length;
      const result = intToSymbolSeq(String(base), SYMBOLS);
      expect(result).toBe(SYMBOLS[1] + SYMBOLS[0]);
    });

    it("should handle large IDs", () => {
      const largeId = "18446744073709551615"; // 2^64 - 1
      const result = intToSymbolSeq(largeId, SYMBOLS);
      expect(result.length).toBeGreaterThan(0);
      expect(Array.from(result).every((char) => SYMBOLS.includes(char))).toBe(
        true,
      );
    });

    it("should use default symbols if not provided", () => {
      const result = intToSymbolSeq("10");
      expect(result.length).toBeGreaterThan(0);
    });
  });
});
