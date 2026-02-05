import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useSymbolsStore } from '@/stores/symbols';

describe('symbols store - default initialization', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('initializes with default SYMBOLS array', () => {
    const store = useSymbolsStore();
    expect(store.symbols.length).toBeGreaterThan(0);
    // Just check it's an array with elements, not a specific symbol
    expect(typeof store.symbols[0]).toBe('string');
  });

  it('converts symbols to Map with correct indices', () => {
    const store = useSymbolsStore();
    const map = store.symbolIndexMap;

    // Verify the first symbol maps to index 0
    if (store.symbols.length > 0) {
      expect(map.get(store.symbols[0])).toBe(0);
    }
    if (store.symbols.length > 1) {
      expect(map.get(store.symbols[1])).toBe(1);
    }
  });
});