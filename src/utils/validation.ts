/**
 * Validation utilities for input validation
 */

import type { ValidationResult } from "@/types/symbol";
import { countWildcards } from "./wildcard";

/**
 * Validate a symbolic sequence
 * @param sequence - The sequence to validate
 * @param symbols - Valid symbols
 * @returns Validation result
 */
export function validateSequence(
  sequence: string,
  symbols: readonly string[],
): ValidationResult {
  if (!sequence || sequence.trim().length === 0) {
    return { valid: false, error: "Sequence cannot be empty" };
  }

  const wildcardCount = countWildcards(sequence);

  if (wildcardCount > 2) {
    return {
      valid: false,
      error: "Maximum 2 wildcards allowed",
      wildcardCount,
    };
  }

  const symbolSet = new Set(symbols);
  const chars = Array.from(sequence);

  for (let i = 0; i < chars.length; i++) {
    const char = chars[i];
    if (char !== "?" && !symbolSet.has(char)) {
      return {
        valid: false,
        error: `Invalid symbol at position ${i}: ${char}`,
      };
    }
  }

  return { valid: true, wildcardCount };
}

/**
 * Validate a person ID
 * @param id - The ID to validate
 * @returns Validation result
 */
export function validateIdPersona(id: string): ValidationResult {
  if (!id || id.trim().length === 0) {
    return { valid: false, error: "ID cannot be empty" };
  }

  // Check if it's a valid number
  if (!/^\d+$/.test(id)) {
    return { valid: false, error: "ID must contain only digits" };
  }

  // Check if it's within BIGINT UNSIGNED range (0 to 2^64 - 1)
  try {
    const numericId = BigInt(id);
    if (numericId < 0n) {
      return { valid: false, error: "ID must be non-negative" };
    }
    if (numericId > 18446744073709551615n) {
      // 2^64 - 1
      return { valid: false, error: "ID exceeds maximum value" };
    }
  } catch (error) {
    return { valid: false, error: "Invalid number format" };
  }

  return { valid: true };
}
