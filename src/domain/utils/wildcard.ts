/**
 * Wildcard expansion utilities (domain)
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

  const totalExpansionCombinations = Math.pow(
    symbolSetSize,
    activeWildcardCount,
  );

  for (
    let combinationIndex = 0;
    combinationIndex < totalExpansionCombinations;
    combinationIndex++
  ) {
    const sequenceUnderExpansion = [...baseCharacters];
    let remainingCombinationValue = combinationIndex;

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

export function countWildcards(sequence: string): number {
  const wildcardMatch = sequence.match(/\?/g);
  return wildcardMatch ? wildcardMatch.length : 0;
}
