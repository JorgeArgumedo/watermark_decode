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

export const useCandidatesStore = defineStore("candidates", () => {
  // State
  const candidates = ref<Candidate[]>([]);

  // Getters
  const totalCount = computed(() => candidates.value.length);

  const candidatesBySystemStatus = computed(() => {
    return (status: SystemStatus) =>
      candidates.value.filter((c) => c.systemStatus === status);
  });

  const candidatesByAnalysisStatus = computed(() => {
    return (status: AnalysisStatus) =>
      candidates.value.filter((c) => c.analysisStatus === status);
  });

  const pendingCandidates = computed(() =>
    candidates.value.filter((c) => c.systemStatus === "pending"),
  );

  const foundCandidates = computed(() =>
    candidates.value.filter((c) => c.systemStatus === "found"),
  );

  const unreviewedCandidates = computed(() =>
    candidates.value.filter((c) => c.analysisStatus === "unreviewed"),
  );

  // Actions
  function addCandidate(candidate: Candidate) {
    // Check for duplicates by idPersona
    // Optimization: findIndex is O(N), but for single item it's okay.
    // Ideally we maintain a Set of IDs for O(1) checks.
    const exists = candidates.value.some(
      (c) => c.idPersona === candidate.idPersona,
    );
    if (!exists) {
      candidates.value.push(candidate);
    }
  }

  function addCandidates(newCandidates: Candidate[]) {
    // Optimization: Bulk add with Set lookup
    const existingIds = new Set(candidates.value.map((c) => c.idPersona));
    const toAdd = newCandidates.filter((c) => !existingIds.has(c.idPersona));

    if (toAdd.length > 0) {
      candidates.value.push(...toAdd);
    }
  }

  function removeCandidate(id: string) {
    const index = candidates.value.findIndex((c) => c.id === id);
    if (index !== -1) {
      candidates.value.splice(index, 1);
    }
  }

  function removeCandidatesBySystemStatus(status: SystemStatus) {
    candidates.value = candidates.value.filter(
      (c) => c.systemStatus !== status,
    );
  }

  function removeCandidatesByAnalysisStatus(status: AnalysisStatus) {
    candidates.value = candidates.value.filter(
      (c) => c.analysisStatus !== status,
    );
  }

  function updateCandidateStatus(
    id: string,
    status: Partial<Pick<Candidate, "systemStatus" | "analysisStatus">>,
  ) {
    const candidate = candidates.value.find((c) => c.id === id);
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
    return candidates.value.find((c) => c.id === id);
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
  };
});
