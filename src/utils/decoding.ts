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
  const symbolCharacters = Array.from(sequence.replace(/\s+/g, ""));
  const base = symbolMap.size;

  if (base === 0) {
    return { ok: false, error: "Empty symbol map" };
  }

  let currentValue = 0n;

  for (let index = 0; index < symbolCharacters.length; index++) {
    const glyph = symbolCharacters[index];
    if (!glyph) continue; // Safety check
    const symbolIndex = symbolMap.get(glyph);

    if (symbolIndex === undefined) {
      return {
        ok: false,
        partialIndex: index,
        value: currentValue,
        error: `Invalid symbol at position ${index}: ${glyph}`,
      };
    }

    currentValue = currentValue * BigInt(base) + BigInt(symbolIndex);
  }

  return {
    ok: true,
    value: currentValue,
    digits: symbolCharacters.length,
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
  return new Map(symbols.map((symbol, index) => [symbol, index]));
}
