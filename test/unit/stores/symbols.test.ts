import { describe, it, expect, beforeEach } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { useSymbolsStore } from "@/stores/symbols";

describe("Symbols Store", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it("should have default symbols", () => {
    const store = useSymbolsStore();
    expect(store.symbols.length).toBeGreaterThan(0);
    expect(store.base).toBe(store.symbols.length);
  });

  it("should validate symbols", () => {
    const store = useSymbolsStore();
    const firstSymbol = store.symbols[0];
    expect(store.isValidSymbol(firstSymbol)).toBe(true);
    expect(store.isValidSymbol("INVALID_SYMBOL_XYZ")).toBe(false);
  });

  it("should return correct symbol index", () => {
    const store = useSymbolsStore();
    const firstSymbol = store.symbols[0];
    expect(store.getSymbolIndex(firstSymbol)).toBe(0);
  });

  it("should update symbols", () => {
    const store = useSymbolsStore();
    const newSymbols = ["A", "B", "C"];
    store.setSymbols(newSymbols);
    expect(store.symbols).toEqual(newSymbols);
    expect(store.base).toBe(3);
    expect(store.getSymbolIndex("B")).toBe(1);
  });

  it("should throw error when setting empty symbols", () => {
    const store = useSymbolsStore();
    expect(() => store.setSymbols([])).toThrow("Symbol set cannot be empty");
  });
});
