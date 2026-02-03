import { describe, it, expect } from "vitest";
import { ref, nextTick } from "vue";
import { useSelectionSync } from "@presentation/composables/useSelectionSync";

import type { Candidate } from "@shared/types/candidate";

describe("useSelectionSync", () => {
  it("clears selected candidate when it is removed from the list", async () => {
    const selected = ref<Candidate | null>({
      id: "1",
      idPersona: "1",
      sequence: "A",
      systemStatus: "pending",
      analysisStatus: "unreviewed",
      source: "manual",
      createdAt: new Date(),
    });

    const candidates = ref<Candidate[]>([selected.value!]);

    const { stop } = useSelectionSync(selected, candidates as any);

    // Remove the candidate from the list
    candidates.value = [];

    // Wait for watcher to trigger
    await nextTick();

    expect(selected.value).toBeNull();

    // Stop watcher to clean up
    stop();
  });
});