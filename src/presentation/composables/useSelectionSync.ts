import { watch } from "vue";
import type { Ref } from "vue";
import type { Candidate } from "@shared/types/candidate";

/**
 * Keeps a selected candidate ref in sync with a candidates list ref.
 * If the selected candidate is removed from the list, it will be set to null.
 */
export function useSelectionSync(
  selected: Ref<Candidate | null>,
  candidates: Ref<Candidate[]>,
) {
  const stop = watch(
    candidates,
    (newCandidates) => {
      if (!selected.value) return;
      const stillExists = newCandidates.some(
        (c) => c.id === selected.value?.id,
      );
      if (!stillExists) selected.value = null;
    },
    { deep: true },
  );

  return { stop };
}
