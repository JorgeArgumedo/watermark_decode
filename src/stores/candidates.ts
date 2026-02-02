/**
 * Candidates store - manages the candidate list
 */

import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type {
  Candidate,
  SystemStatus,
  AnalysisStatus,
} from "@/types/candidate";
import { expandWildcards } from "@/utils/wildcard";
import { symbolsToInt } from "@/utils/decoding";
import { useSymbolsStore } from "@/stores/symbols";

export const useCandidatesStore = defineStore("candidates", () => {
  const symbolsStore = useSymbolsStore();
  // State
  const candidates = ref<Candidate[]>([]);

  // Getters
  const totalCount = computed(() => candidates.value.length);

  const candidatesBySystemStatus = computed(() => {
    return (status: SystemStatus) =>
      candidates.value.filter((candidate) => candidate.systemStatus === status);
  });

  const candidatesByAnalysisStatus = computed(() => {
    return (status: AnalysisStatus) =>
      candidates.value.filter(
        (candidate) => candidate.analysisStatus === status,
      );
  });

  const pendingCandidates = computed(() =>
    candidates.value.filter(
      (candidate) => candidate.systemStatus === "pending",
    ),
  );

  const foundCandidates = computed(() =>
    candidates.value.filter((candidate) => candidate.systemStatus === "found"),
  );

  const unreviewedCandidates = computed(() =>
    candidates.value.filter(
      (candidate) => candidate.analysisStatus === "unreviewed",
    ),
  );

  // Actions
  function addCandidate(candidate: Candidate) {
    // Check for duplicates by idPersona
    // Optimization: findIndex is O(N), but for single item it's okay.
    // Ideally we maintain a Set of IDs for O(1) checks.
    const exists = candidates.value.some(
      (existingCandidate) =>
        existingCandidate.idPersona === candidate.idPersona,
    );
    if (!exists) {
      candidates.value.push(candidate);
    }
  }

  function addCandidates(newCandidates: Candidate[]) {
    // Optimization: Bulk add with Set lookup
    const existingIds = new Set(
      candidates.value.map((candidate) => candidate.idPersona),
    );
    const toAdd = newCandidates.filter(
      (candidate) => !existingIds.has(candidate.idPersona),
    );

    if (toAdd.length > 0) {
      candidates.value.push(...toAdd);
    }
  }

  function removeCandidate(id: string) {
    const index = candidates.value.findIndex(
      (candidate) => candidate.id === id,
    );
    if (index !== -1) {
      candidates.value.splice(index, 1);
    }
  }

  function removeCandidatesBySystemStatus(status: SystemStatus) {
    candidates.value = candidates.value.filter(
      (candidate) => candidate.systemStatus !== status,
    );
  }

  function removeCandidatesByAnalysisStatus(status: AnalysisStatus) {
    candidates.value = candidates.value.filter(
      (candidate) => candidate.analysisStatus !== status,
    );
  }

  function updateCandidateStatus(
    id: string,
    status: Partial<Pick<Candidate, "systemStatus" | "analysisStatus">>,
  ) {
    const candidate = candidates.value.find((candidate) => candidate.id === id);
    if (candidate) {
      if (status.systemStatus !== undefined) {
        candidate.systemStatus = status.systemStatus;
        candidate.validatedAt = new Date();
      }
      if (status.analysisStatus !== undefined) {
        candidate.analysisStatus = status.analysisStatus;
      }
    }
  }

  function clearAll() {
    candidates.value = [];
  }

  function getCandidateById(id: string): Candidate | undefined {
    return candidates.value.find((candidate) => candidate.id === id);
  }

  const createCandidate = (
    idPersona: string,
    sequence: string,
    source: "manual" | "expanded",
  ): Candidate => ({
    id: idPersona, // Use idPersona as unique ID
    idPersona,
    sequence,
    systemStatus: "pending",
    analysisStatus: "unreviewed",
    source,
    createdAt: new Date(),
  });

  async function generateCandidatesFromSequence(
    sequence: string,
  ): Promise<number> {
    // Artificial delay to allow UI to update if synchronous blocking occurs
    await new Promise((resolve) => setTimeout(resolve, 50));

    const expanded = expandWildcards(sequence, symbolsStore.symbols);
    const newCandidates: Candidate[] = [];

    expanded.forEach((seq) => {
      const decodeResult = symbolsToInt(seq, symbolsStore.symbolMap);
      if (decodeResult.ok && decodeResult.value !== undefined) {
        newCandidates.push(
          createCandidate(
            String(decodeResult.value),
            seq,
            expanded.length > 1 ? "expanded" : "manual",
          ),
        );
      } else {
        console.warn(`Failed to decode sequence ${seq}:`, decodeResult.error);
      }
    });

    if (newCandidates.length > 0) {
      addCandidates(newCandidates);
    }

    return newCandidates.length;
  }

  return {
    // State
    candidates,
    // Getters
    totalCount,
    candidatesBySystemStatus,
    candidatesByAnalysisStatus,
    pendingCandidates,
    foundCandidates,
    unreviewedCandidates,
    // Actions
    addCandidate,
    addCandidates,
    removeCandidate,
    removeCandidatesBySystemStatus,
    removeCandidatesByAnalysisStatus,
    updateCandidateStatus,
    clearAll,
    getCandidateById,
    generateCandidatesFromSequence,
    createCandidate,
  };
});
