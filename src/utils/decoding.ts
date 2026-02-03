/**
 * Core decoding utilities for symbolic border system
 * Converts symbolic sequences back to numeric IDs
 */

import type { DecodeResult } from "@shared/types/symbol";

/**
 * Decode a symbolic sequence back into its original numeric ID
 * @param symbolicSequence - The symbolic sequence to decode
 * @param symbolIndexMap - Map of symbol to its position in the base set
 * @returns DecodeResult with success status and value
 */
export function decodeSymbolicSequenceToId(
  symbolicSequence: string,
  symbolIndexMap: Map<string, number>,
): DecodeResult {
  const sequenceCharacters = Array.from(symbolicSequence.replace(/\s+/g, ""));
  const baseSize = symbolIndexMap.size;

  if (baseSize === 0) {
    return { ok: false, error: "Empty symbol index map" };
  }

  let accumulatedIdValue = 0n;

  for (let charIndex = 0; charIndex < sequenceCharacters.length; charIndex++) {
    const symbolGlyph = sequenceCharacters[charIndex];
    if (!symbolGlyph) continue; // Safety check

    const symbolValue = symbolIndexMap.get(symbolGlyph);

    if (symbolValue === undefined) {
      return {
        ok: false,
        partialIndex: charIndex,
        value: accumulatedIdValue,
        error: `Invalid symbol at position ${charIndex}: ${symbolGlyph}`,
      };
    }

    accumulatedIdValue =
      accumulatedIdValue * BigInt(baseSize) + BigInt(symbolValue);
  }

  return {
    ok: true,
    value: accumulatedIdValue,
    digits: sequenceCharacters.length,
  };
}

/**
 * Create a map linking each symbol to its index in the base array
 * @param symbolSet - Array of symbols
 * @returns Map of symbol to index
 */
export function createSymbolIndexMap(
  symbolSet: readonly string[],
): Map<string, number> {
  return new Map(symbolSet.map((symbol, index) => [symbol, index]));
}

// Aliases for backward compatibility
export {
  decodeSymbolicSequenceToId as symbolsToInt,
  createSymbolIndexMap as createSymbolMap,
};
