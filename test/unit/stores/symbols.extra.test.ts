import { describe, it, expect } from 'vitest';
import { useSymbolsStore } from '@/stores/symbols';
import { setActivePinia, createPinia } from 'pinia';

describe('symbols store - branches', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('handles symbolIndexMap getter when map is empty', () => {
    const store = useSymbolsStore();
    store.symbols = [];
    const map = store.symbolIndexMap;
    expect(map).toBeInstanceOf(Map);
    expect(map.size).toBe(0);
  });

  it('builds symbolIndexMap correctly from symbols array', () => {
    const store = useSymbolsStore();
    store.symbols = ['A', 'B', 'C'];
    const map = store.symbolIndexMap;
    expect(map.get('A')).toBe(0);
    expect(map.get('B')).toBe(1);
    expect(map.get('C')).toBe(2);
  });
});