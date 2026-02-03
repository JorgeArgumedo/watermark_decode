import { describe, it, expect } from "vitest";
import {
  toNumber,
  formatCoordinate,
  parsePixels,
  buildSidePath,
} from "@shared/utils/border";

describe("border utils", () => {
  describe("toNumber", () => {
    it("should convert valid numbers", () => {
      expect(toNumber("123")).toBe(123);
      expect(toNumber(456)).toBe(456);
    });

    it("should return fallback for invalid numbers", () => {
      expect(toNumber("abc", 10)).toBe(10);
      expect(toNumber(undefined, 5)).toBe(5);
    });
  });

  describe("formatCoordinate", () => {
    it("should format coordinates to 2 decimal places", () => {
      expect(formatCoordinate(10.1234)).toBe("10.12");
      expect(formatCoordinate(5)).toBe("5.00");
    });

    it("should return '0' for non-finite values", () => {
      expect(formatCoordinate(Infinity)).toBe("0");
    });
  });

  describe("parsePixels", () => {
    it("should parse pixel strings", () => {
      expect(parsePixels("10px", 0)).toBe(10);
      expect(parsePixels("5.5px", 0)).toBe(5.5);
    });

    it("should return raw numbers if passed as number", () => {
      expect(parsePixels(15, 0)).toBe(15);
    });

    it("should parse numeric strings without px", () => {
      expect(parsePixels("20", 0)).toBe(20);
    });

    it("should return fallback for invalid values", () => {
      expect(parsePixels(null, 10)).toBe(10);
      expect(parsePixels("abc", 5)).toBe(5);
    });
  });

  describe("buildSidePath", () => {
    it("should return empty string for invalid dimensions", () => {
      expect(buildSidePath(0, 0, 0, 100, 5, ["full"])).toBe("");
      expect(buildSidePath(0, 0, 100, 0, 5, ["full"])).toBe("");
    });

    it("should generate a full rectangle path", () => {
      const path = buildSidePath(0, 0, 100, 100, 0, ["full"]);
      expect(path).toContain("M 0.00 0.00");
      expect(path).toContain("H 100.00");
      expect(path).toContain("V 100.00");
      expect(path).toContain("Z");
    });

    it("should generate path with rounded corners", () => {
      const path = buildSidePath(0, 0, 100, 100, 10, ["full"]);
      expect(path).toContain("M 10.00 0.00");
      expect(path).toContain("A 10.00 10.00 0 0 1 100.00 10.00");
    });

    it("should handle specific sides", () => {
      const path = buildSidePath(0, 0, 100, 100, 0, ["top", "bottom"]);
      expect(path).toContain("M 0.00 0.00");
      expect(path).not.toContain("V 100.00"); // No right side
      expect(path).toContain("H 100.00");
      expect(path).not.toContain("Z");
    });

    it("should return empty string if no sides provided", () => {
      expect(buildSidePath(0, 0, 100, 100, 0, [])).toBe("");
    });
  });
});
