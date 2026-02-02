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
export function intToDigits(n: bigint, base: number): number[] {
  if (n < 0n) return [0];
  if (base <= 1) return [0];
  if (n === 0n) return [0];

  const digits: number[] = [];
  let remaining = n;

  while (remaining > 0n) {
    digits.push(Number(remaining % BigInt(base)));
    remaining = remaining / BigInt(base);
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
  return digits.map((d) => symbols[d] || "?").join("");
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
  const n = BigInt(idPersona);
  const base = symbols.length || DEFAULT_BASE;
  const digits = intToDigits(n, base);
  return digitsToSymbols(digits, symbols);
}
