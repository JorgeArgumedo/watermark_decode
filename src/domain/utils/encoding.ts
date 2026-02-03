/**
 * Core encoding utilities for symbolic border system (domain)
 * Converts numeric IDs to symbolic sequences
 */

import { SYMBOLS, DEFAULT_BASE } from "@shared/utils/symbols";

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

export function mapDigitsToSymbols(
  digits: number[],
  symbolSet: readonly string[],
): string {
  return digits.map((digit) => symbolSet[digit] || "?").join("");
}

export function encodeIdToSymbolicSequence(
  targetId: string,
  symbolSet: readonly string[] = SYMBOLS,
): string {
  const bigIntValue = BigInt(targetId);
  const baseSize = symbolSet.length || DEFAULT_BASE;
  const numericDigits = encodeBigIntToDigits(bigIntValue, baseSize);
  return mapDigitsToSymbols(numericDigits, symbolSet);
}

export {
  encodeBigIntToDigits as intToDigits,
  mapDigitsToSymbols as digitsToSymbols,
  encodeIdToSymbolicSequence as intToSymbolSeq,
};
