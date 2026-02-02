/**
 * Core decoding utilities for symbolic border system
 * Converts symbolic sequences back to numeric IDs
 */

import type { DecodeResult } from "@/types/symbol";

/**
 * Convert a symbolic sequence to a numeric ID
 * @param sequence - The symbolic sequence to decode
 * @param symbolMap - Map of symbol to index
 * @returns DecodeResult with success status and value
 */
export function symbolsToInt(
  sequence: string,
  symbolMap: Map<string, number>,
): DecodeResult {
  const glyphs = Array.from(sequence.replace(/\s+/g, ""));
  const base = symbolMap.size;

  if (base === 0) {
    return { ok: false, error: "Empty symbol map" };
  }

  let value = 0n;

  for (let i = 0; i < glyphs.length; i++) {
    const glyph = glyphs[i];
    const idx = symbolMap.get(glyph);

    if (idx === undefined) {
      return {
        ok: false,
        partialIndex: i,
        value,
        error: `Invalid symbol at position ${i}: ${glyph}`,
      };
    }

    value = value * BigInt(base) + BigInt(idx);
  }

  return {
    ok: true,
    value,
    digits: glyphs.length,
  };
}

/**
 * Create a symbol map from an array of symbols
 * @param symbols - Array of symbols
 * @returns Map of symbol to index
 */
export function createSymbolMap(
  symbols: readonly string[],
): Map<string, number> {
  return new Map(symbols.map((s, i) => [s, i]));
}
