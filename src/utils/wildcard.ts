/**
 * Wildcard expansion utilities
 * Expands sequences with wildcards (?) into all possible combinations
 */

/**
 * Expand a sequence with wildcards into all possible combinations
 * @param sequence - Sequence with wildcards (?)
 * @param symbols - Array of symbols to use for expansion
 * @returns Array of all possible sequences (without wildcards)
 */
export function expandWildcards(
  sequence: string,
  symbols: readonly string[],
): string[] {
  const wildcardCount = countWildcards(sequence);

  if (wildcardCount === 0) {
    return [sequence];
  }

  if (wildcardCount > 2) {
    throw new Error("Maximum 2 wildcards allowed");
  }

  const chars = Array.from(sequence);
  const wildcardPositions: number[] = [];

  // Find wildcard positions
  chars.forEach((char, index) => {
    if (char === "?") {
      wildcardPositions.push(index);
    }
  });

  const results: string[] = [];
  const symbolCount = symbols.length;
  if (symbolCount === 0) return [];

  const totalCombinations = Math.pow(symbolCount, wildcardCount);

  // Generate all combinations
  for (let i = 0; i < totalCombinations; i++) {
    const newChars = [...chars];
    let combinationIndex = i;

    // Replace each wildcard with the appropriate symbol
    for (let j = wildcardPositions.length - 1; j >= 0; j--) {
      const symbolIndex = combinationIndex % symbolCount;
      newChars[wildcardPositions[j]] = symbols[symbolIndex];
      combinationIndex = Math.floor(combinationIndex / symbolCount);
    }

    results.push(newChars.join(""));
  }

  return results;
}

/**
 * Count the number of wildcards in a sequence
 * @param sequence - The sequence to check
 * @returns Number of wildcards
 */
export function countWildcards(sequence: string): number {
  return (sequence.match(/\?/g) || []).length;
}
