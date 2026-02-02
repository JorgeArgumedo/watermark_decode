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

  const sequenceCharacters = Array.from(sequence);
  const wildcardPositions: number[] = [];

  // Find wildcard positions
  sequenceCharacters.forEach((character, index) => {
    if (character === "?") {
      wildcardPositions.push(index);
    }
  });

  const expandedSequences: string[] = [];
  const symbolCount = symbols.length;
  if (symbolCount === 0) return [];

  const totalCombinations = Math.pow(symbolCount, wildcardCount);

  // Generate all combinations
  for (
    let combinationIndex = 0;
    combinationIndex < totalCombinations;
    combinationIndex++
  ) {
    const currentCombinationCharacters = [...sequenceCharacters];
    let temporaryCombinationIndex = combinationIndex;

    // Replace each wildcard with the appropriate symbol
    for (
      let wildcardPosIndex = wildcardPositions.length - 1;
      wildcardPosIndex >= 0;
      wildcardPosIndex--
    ) {
      const symbolIndex = temporaryCombinationIndex % symbolCount;
      currentCombinationCharacters[wildcardPositions[wildcardPosIndex]] =
        symbols[symbolIndex];
      temporaryCombinationIndex = Math.floor(
        temporaryCombinationIndex / symbolCount,
      );
    }

    expandedSequences.push(currentCombinationCharacters.join(""));
  }

  return expandedSequences;
}

/**
 * Count the number of wildcards in a sequence
 * @param sequence - The sequence to check
 * @returns Number of wildcards
 */
export function countWildcards(sequence: string): number {
  return (sequence.match(/\?/g) || []).length;
}
