/**
 * Wildcard expansion utilities
 * Expands sequences with wildcards (?) into all possible combinations
 */

/**
 * Expand a sequence with wildcards into all possible combinations
 * @param symbolicSequence - Sequence with wildcards (?)
 * @param availableSymbols - Array of symbols to use for expansion
 * @returns Array of all possible sequences (without wildcards)
 */
export function expandWildcards(
  symbolicSequence: string,
  availableSymbols: readonly string[],
): string[] {
  const activeWildcardCount = countWildcards(symbolicSequence);

  if (activeWildcardCount === 0) {
    return [symbolicSequence];
  }

  const MAX_ALLOWED_WILDCARDS = 2;
  if (activeWildcardCount > MAX_ALLOWED_WILDCARDS) {
    throw new Error(
      `Maximum ${MAX_ALLOWED_WILDCARDS} wildcards allowed for expansion.`,
    );
  }

  const baseCharacters = Array.from(symbolicSequence);
  const wildcardPositions: number[] = [];

  // Track the indices of all wildcard characters
  baseCharacters.forEach((character, index) => {
    if (character === "?") {
      wildcardPositions.push(index);
    }
  });

  const expandedSequences: string[] = [];
  const symbolSetSize = availableSymbols.length;

  if (symbolSetSize === 0) {
    return [];
  }

  // Total combinations is symbol_count ^ wildcard_count
  const totalExpansionCombinations = Math.pow(
    symbolSetSize,
    activeWildcardCount,
  );

  // Generate each unique combination
  for (
    let combinationIndex = 0;
    combinationIndex < totalExpansionCombinations;
    combinationIndex++
  ) {
    const sequenceUnderExpansion = [...baseCharacters];
    let remainingCombinationValue = combinationIndex;

    /**
     * Replace each wildcard position with a symbol derived from the current combinationIndex.
     * We iterate backwards through positions to maintain a consistent mapping (like base-N conversion).
     */
    for (
      let positionIndex = wildcardPositions.length - 1;
      positionIndex >= 0;
      positionIndex--
    ) {
      const symbolLookupIndex = remainingCombinationValue % symbolSetSize;
      const targetStringIndex = wildcardPositions[positionIndex] as number;

      sequenceUnderExpansion[targetStringIndex] = availableSymbols[
        symbolLookupIndex
      ] as string;

      remainingCombinationValue = Math.floor(
        remainingCombinationValue / symbolSetSize,
      );
    }

    expandedSequences.push(sequenceUnderExpansion.join(""));
  }

  return expandedSequences;
}

/**
 * Count the number of wildcards in a sequence
 * @param sequence - The sequence string to check
 * @returns Number of wildcards found
 */
export function countWildcards(sequence: string): number {
  const wildcardMatch = sequence.match(/\?/g);
  return wildcardMatch ? wildcardMatch.length : 0;
}
