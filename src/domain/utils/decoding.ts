/**
 * Core decoding utilities for symbolic border system (domain)
 * Converts symbolic sequences back to numeric IDs
 */

import type { DecodeResult } from "@shared/types/symbol";

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

export function createSymbolIndexMap(
  symbolSet: readonly string[],
): Map<string, number> {
  return new Map(symbolSet.map((symbol, index) => [symbol, index]));
}

export {
  decodeSymbolicSequenceToId as symbolsToInt,
  createSymbolIndexMap as createSymbolMap,
};
