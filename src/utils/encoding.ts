/**
 * Core encoding utilities for symbolic border system
 * Converts numeric IDs to symbolic sequences
 */

import { SYMBOLS, DEFAULT_BASE } from "./symbols";

/**
 * Convert a number to an array of digits in the given base
 * @param n - The number to convert (as bigint for large numbers)
 * @param base - The base to use for conversion
 * @returns Array of digits (most significant first)
 */
export function intToDigits(numberToConvert: bigint, base: number): number[] {
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
 * Convert an array of digits to symbols
 * @param digits - Array of digit values
 * @param symbols - Symbol array to use for mapping
 * @returns String of symbols
 */
export function digitsToSymbols(
  digits: number[],
  symbols: readonly string[],
): string {
  return digits.map((digit) => symbols[digit] || "?").join("");
}

/**
 * Convert a numeric ID (as string) to a symbolic sequence
 * @param idPersona - The person ID as a string (to handle BIGINT)
 * @param symbols - Optional symbol array (defaults to SYMBOLS)
 * @returns Symbolic sequence string
 */
export function intToSymbolSeq(
  idPersona: string,
  symbols: readonly string[] = SYMBOLS,
): string {
  const numberValue = BigInt(idPersona);
  const base = symbols.length || DEFAULT_BASE;
  const digits = intToDigits(numberValue, base);
  return digitsToSymbols(digits, symbols);
}
