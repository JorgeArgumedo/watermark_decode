/**
 * Type definitions for symbol system
 */

export interface SymbolSet {
  symbols: readonly string[];
  base: number;
  symbolMap: Map<string, number>;
}

export interface DecodeResult {
  ok: boolean;
  value?: bigint;
  digits?: number;
  partialIndex?: number;
  error?: string;
}

export interface ValidationResult {
  valid: boolean;
  error?: string;
  wildcardCount?: number;
}
