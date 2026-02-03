/**
 * Unit tests for decoding utilities
 */

import { describe, it, expect } from "vitest";
import { symbolsToInt, createSymbolMap } from "@/utils/decoding";
import { SYMBOLS } from "@/utils/symbols";

describe("decoding utilities", () => {
  describe("createSymbolMap", () => {
    it("should create a map from symbols array", () => {
      const symbols = ["A", "B", "C"];
      const map = createSymbolMap(symbols);
      expect(map.get("A")).toBe(0);
      expect(map.get("B")).toBe(1);
      expect(map.get("C")).toBe(2);
      expect(map.size).toBe(3);
    });
  });

  describe("symbolsToInt", () => {
    const testSymbols = ["☀", "☁", "☂"];
    const testMap = createSymbolMap(testSymbols);

    it("should decode single symbol", () => {
      const result = symbolsToInt("☀", testMap);
      expect(result.ok).toBe(true);
      expect(result.value).toBe(0n);
      expect(result.digits).toBe(1);
    });

    it("should decode multiple symbols", () => {
      const result = symbolsToInt("☁☀", testMap);
      expect(result.ok).toBe(true);
      expect(result.value).toBe(3n); // 1*3 + 0 = 3
      expect(result.digits).toBe(2);
    });

    it("should fail on invalid symbol", () => {
      const result = symbolsToInt("☀X☁", testMap);
      expect(result.ok).toBe(false);
      expect(result.partialIndex).toBe(1);
      expect(result.error).toContain("Invalid symbol");
    });

    it("should ignore whitespace", () => {
      const result = symbolsToInt("☀ ☁", testMap);
      expect(result.ok).toBe(true);
      expect(result.value).toBe(1n);
    });

    it("should handle empty symbol map", () => {
      const emptyMap = new Map<string, number>();
      const result = symbolsToInt("☀", emptyMap);
      expect(result.ok).toBe(false);
      expect(result.error).toContain("Empty symbol index map");
    });

    it("should work with production symbols", () => {
      const prodMap = createSymbolMap(SYMBOLS);
      const result = symbolsToInt(SYMBOLS[0] + SYMBOLS[1], prodMap);
      expect(result.ok).toBe(true);
      expect(result.value).toBe(1n);
    });
  });
});
