import { describe, it, expect, vi } from 'vitest';
import * as decoding from '@/utils/decoding';
import * as wildcard from '@/utils/wildcard';

describe('utils functions - branch coverage', () => {
  it('countWildcards returns correct count', () => {
    expect(wildcard.countWildcards('ABC')).toBe(0);
    expect(wildcard.countWildcards('A?C')).toBe(1);
    expect(wildcard.countWildcards('???')).toBe(3);
  });

  it('expandWildcards returns array with all combinations', () => {
    const symbols = ['A', 'B'];
    const result = wildcard.expandWildcards('A?', symbols);
    expect(result).toContain('AA');
    expect(result).toContain('AB');
  });

  it('decodeSymbolicSequenceToId returns ok=false for invalid input', () => {
    const map = new Map([['🕐', 0]]);
    const result = decoding.decodeSymbolicSequenceToId('invalid', map);
    expect(result.ok).toBe(false);
  });

  it('decodeSymbolicSequenceToId returns ok=true for valid sequence', () => {
    const map = new Map([['🕐', 0], ['🕑', 1]]);
    const result = decoding.decodeSymbolicSequenceToId('🕐🕑', map);
    expect(result.ok).toBe(true);
    expect(result.value).toBeGreaterThan(0);
  });
});