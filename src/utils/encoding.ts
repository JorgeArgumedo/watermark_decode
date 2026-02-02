/**
 * Core encoding utilities for symbolic border system
 * Converts numeric IDs to symbolic sequences
 */

import { SYMBOLS, DEFAULT_BASE } from "./symbols";

/**
 * Convert a big integer to an array of digits in the given base
 * @param numberToConvert - The number to convert
 * @param base - The base to use for conversion
 * @returns Array of digits (most significant first)
 */
export function encodeBigIntToDigits(
  numberToConvert: bigint,
  base: number,
): number[] {
  if (numberToConvert < 0n) return [0];
  if (base <= 1) return [0];
  if (numberToConvert === 0n) return [0];

  const digits: number[] = [];
  let remainingValue = numberToConvert;

  while (remainingValue > 0n) {
    digits.push(Number(remainingValue % BigInt(base)));
    remainingValue = remainingValue / BigInt(base);
  }

  return digits.reverse();
}

/**
 * Map an array of numeric digits to their symbolic representation
 * @param digits - Array of digit values
 * @param symbolSet - Symbol array to use for mapping
 * @returns String of symbols
 */
export function mapDigitsToSymbols(
  digits: number[],
  symbolSet: readonly string[],
): string {
  return digits.map((digit) => symbolSet[digit] || "?").join("");
}

/**
 * Encode a numeric ID (as string) to a symbolic sequence
 * @param targetId - The person ID as a string (to handle BIGINT)
 * @param symbolSet - Optional symbol array (defaults to SYMBOLS)
 * @returns Symbolic sequence string
 */
export function encodeIdToSymbolicSequence(
  targetId: string,
  symbolSet: readonly string[] = SYMBOLS,
): string {
  const bigIntValue = BigInt(targetId);
  const baseSize = symbolSet.length || DEFAULT_BASE;
  const numericDigits = encodeBigIntToDigits(bigIntValue, baseSize);
  return mapDigitsToSymbols(numericDigits, symbolSet);
}

// Aliases for backward compatibility
export {
  encodeBigIntToDigits as intToDigits,
  mapDigitsToSymbols as digitsToSymbols,
  encodeIdToSymbolicSequence as intToSymbolSeq,
};
