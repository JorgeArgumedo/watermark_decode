/**
 * Unit tests for wildcard expansion
 */

import { describe, it, expect } from "vitest";
import { expandWildcards, countWildcards } from "@domain/utils/wildcard";

describe("wildcard utilities", () => {
  describe("countWildcards", () => {
    it("should count wildcards correctly", () => {
      expect(countWildcards("ABC")).toBe(0);
      expect(countWildcards("A?C")).toBe(1);
      expect(countWildcards("??C")).toBe(2);
      expect(countWildcards("???")).toBe(3);
    });
  });

  describe("expandWildcards", () => {
    const symbols = ["A", "B", "C"];

    it("should return original sequence if no wildcards", () => {
      const result = expandWildcards("ABC", symbols);
      expect(result).toEqual(["ABC"]);
    });

    it("should expand single wildcard", () => {
      const result = expandWildcards("A?C", symbols);
      expect(result).toHaveLength(3);
      expect(result).toContain("AAC");
      expect(result).toContain("ABC");
      expect(result).toContain("ACC");
    });

    it("should expand two wildcards", () => {
      const result = expandWildcards("??", symbols);
      expect(result).toHaveLength(9); // 3^2
      expect(result).toContain("AA");
      expect(result).toContain("AB");
      expect(result).toContain("AC");
      expect(result).toContain("BA");
      expect(result).toContain("BB");
      expect(result).toContain("BC");
      expect(result).toContain("CA");
      expect(result).toContain("CB");
      expect(result).toContain("CC");
    });

    it("should throw error for more than 2 wildcards", () => {
      expect(() => expandWildcards("???", symbols)).toThrow(
        "Maximum 2 wildcards allowed",
      );
    });

    it("should handle wildcards at different positions", () => {
      const result = expandWildcards("A?B?", symbols);
      expect(result).toHaveLength(9); // 3^2
      expect(result).toContain("AABA");
      expect(result).toContain("ACBC");
    });

    it("should work with production symbols", () => {
      const prodSymbols = ["☀", "☁", "☂"];
      const result = expandWildcards("☀?", prodSymbols);
      expect(result).toHaveLength(3);
      expect(result).toContain("☀☀");
      expect(result).toContain("☀☁");
      expect(result).toContain("☀☂");
    });
  });
});
