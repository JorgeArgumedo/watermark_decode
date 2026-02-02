/**
 * Symbols store - manages the global symbol set
 */

import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { SYMBOLS, DEFAULT_BASE } from "@/utils/symbols";
import { createSymbolMap } from "@/utils/decoding";

export const useSymbolsStore = defineStore("symbols", () => {
  // State
  const symbols = ref<readonly string[]>(SYMBOLS);

  // Getters
  const base = computed(() => symbols.value.length || DEFAULT_BASE);

  const symbolMap = computed(() => createSymbolMap(symbols.value));

  const getSymbolIndex = (symbol: string): number | undefined => {
    return symbolMap.value.get(symbol);
  };

  const isValidSymbol = (symbol: string): boolean => {
    return symbolMap.value.has(symbol);
  };

  // Actions
  function setSymbols(newSymbols: readonly string[]) {
    if (newSymbols.length === 0) {
      throw new Error("Symbol set cannot be empty");
    }
    symbols.value = newSymbols;
  }

  return {
    // State
    symbols,
    // Getters
    base,
    symbolMap,
    getSymbolIndex,
    isValidSymbol,
    // Actions
    setSymbols,
  };
});
