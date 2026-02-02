/**
 * Symbols store - manages the global symbol set
 */

import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { SYMBOLS, DEFAULT_BASE } from "@/utils/symbols";
import { createSymbolIndexMap } from "@/utils/decoding";

export const useSymbolsStore = defineStore("symbols", () => {
  // State
  const symbols = ref<readonly string[]>(SYMBOLS);

  // Getters
  const base = computed(() => symbols.value.length || DEFAULT_BASE);

  const symbolIndexMap = computed(() => createSymbolIndexMap(symbols.value));

  const getSymbolIndex = (symbol: string): number | undefined => {
    return symbolIndexMap.value.get(symbol);
  };

  const isValidSymbol = (symbol: string): boolean => {
    return symbolIndexMap.value.has(symbol);
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
    symbolIndexMap,
    getSymbolIndex,
    isValidSymbol,
    // Actions
    setSymbols,
    // Aliases for backward compatibility
    symbolMap: symbolIndexMap,
  };
});
