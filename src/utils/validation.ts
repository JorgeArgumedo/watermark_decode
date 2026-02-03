/**
 * Validation utilities for input validation
 */

import type { ValidationResult } from "@shared/types/symbol";
import { countWildcards } from "./wildcard";

/**
 * Validate a symbolic sequence
 * @param sequence - The sequence string to validate
 * @param validSymbols - Array of allowed symbols
 * @returns ValidationResult indicating success or specific error key
 */
export function validateSymbolicSequence(
  sequence: string,
  validSymbols: readonly string[],
): ValidationResult {
  const normalizedSequence = sequence?.trim() || "";

  if (normalizedSequence.length === 0) {
    return { valid: false, error: "errors.emptySequence" };
  }

  const activeWildcardCount = countWildcards(normalizedSequence);

  if (activeWildcardCount > 2) {
    return {
      valid: false,
      error: "errors.tooManyWildcards",
      wildcardCount: activeWildcardCount,
    };
  }

  const allowedSymbolSet = new Set(validSymbols);
  const sequenceCharacters = Array.from(normalizedSequence);

  for (
    let characterPosition = 0;
    characterPosition < sequenceCharacters.length;
    characterPosition++
  ) {
    const currentCharacter = sequenceCharacters[characterPosition] as string;

    const isWildcard = currentCharacter === "?";
    const isAllowedSymbol = allowedSymbolSet.has(currentCharacter);

    if (!isWildcard && !isAllowedSymbol) {
      return {
        valid: false,
        error: "errors.invalidSymbol",
      };
    }
  }

  return {
    valid: true,
    wildcardCount: activeWildcardCount,
  };
}

/**
 * Validate a person ID (numeric string representing BigInt)
 * @param idPersona - The numeric ID to validate
 * @returns ValidationResult indicating success or specific error key
 */
export function validateIdPersona(idPersona: string): ValidationResult {
  const normalizedId = idPersona?.trim() || "";

  if (normalizedId.length === 0) {
    return { valid: false, error: "errors.emptyId" };
  }

  const isStrictlyNumeric = /^\d+$/.test(normalizedId);
  if (!isStrictlyNumeric) {
    return { valid: false, error: "errors.numericIdOnly" };
  }

  try {
    const numericValue = BigInt(normalizedId);
    const MAX_BIGINT_UNSIGNED = 18446744073709551615n; // 2^64 - 1

    if (numericValue < 0n) {
      return { valid: false, error: "errors.negativeId" };
    }

    if (numericValue > MAX_BIGINT_UNSIGNED) {
      return { valid: false, error: "errors.idTooLarge" };
    }
  } catch {
    return { valid: false, error: "errors.invalidNumberFormat" };
  }

  return { valid: true };
}

// Re-export with original names for backward compatibility if needed,
// though internally we used descriptive ones.
export { validateSymbolicSequence as validateSequence };
