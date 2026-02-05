import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useSymbolsStore } from '@/stores/symbols';

describe('useSymbolsStore branches', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('symbolIndexMap creates valid map', () => {
    const store = useSymbolsStore();
    const map = store.symbolIndexMap;
    expect(map).toBeInstanceOf(Map);
    expect(map.size).toBeGreaterThan(0);
  });

  it('getSymbolIndex returns index for valid symbol', () => {
    const store = useSymbolsStore();
    const symbols = store.symbols;
    if (symbols.length > 0) {
      const index = store.getSymbolIndex(symbols[0]);
      expect(typeof index).toBe('number');
    }
  });

  it('getSymbolIndex returns undefined for invalid symbol', () => {
    const store = useSymbolsStore();
    const result = store.getSymbolIndex('🚀🚀🚀NOT_A_SYMBOL🚀🚀🚀');
    expect(result).toBeUndefined();
  });

  it('isValidSymbol returns true for valid symbol', () => {
    const store = useSymbolsStore();
    const symbols = store.symbols;
    if (symbols.length > 0) {
      const result = store.isValidSymbol(symbols[0]);
      expect(result).toBe(true);
    }
  });

  it('isValidSymbol returns false for invalid symbol', () => {
    const store = useSymbolsStore();
    const result = store.isValidSymbol('FAKE_SYM');
    expect(result).toBe(false);
  });

  it('setSymbols updates symbols correctly', () => {
    const store = useSymbolsStore();
    const newSymbols = ['X', 'Y', 'Z'];
    store.setSymbols(newSymbols);
    expect(store.symbols).toEqual(newSymbols);
  });

  it('setSymbols throws on empty array', () => {
    const store = useSymbolsStore();
    expect(() => store.setSymbols([])).toThrow('Symbol set cannot be empty');
  });

  it('base computed returns length of symbols', () => {
    const store = useSymbolsStore();
    expect(store.base).toBe(store.symbols.length);
  });
});
