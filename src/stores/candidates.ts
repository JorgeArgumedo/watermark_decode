/**
 * Candidates store - manages the candidate list
 */

import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type {
  Candidate,
  SystemStatus,
  AnalysisStatus,
  CandidateSource,
} from "@/types/candidate";
import { expandWildcards } from "@/utils/wildcard";
import { decodeSymbolicSequenceToId } from "@/utils/decoding";
import { useSymbolsStore } from "@/stores/symbols";

export const useCandidatesStore = defineStore("candidates", () => {
  const symbolsStore = useSymbolsStore();

  // State
  const candidates = ref<Candidate[]>([]);

  // Getters
  const totalCount = computed(() => candidates.value.length);

  /**
   * Factory function to create a new candidate object
   */
  const createCandidateNode = (
    idPersona: string,
    sequence: string,
    source: CandidateSource,
  ): Candidate => ({
    id: idPersona, // Using idPersona as the primary unique identifier
    idPersona,
    sequence,
    systemStatus: "pending",
    analysisStatus: "unreviewed",
    source,
    createdAt: new Date(),
  });

  // Filters (Getters that return functions for dynamic filtering)
  const getCandidatesBySystemStatus = computed(() => {
    return (status: SystemStatus) =>
      candidates.value.filter((candidate) => candidate.systemStatus === status);
  });

  const getCandidatesByAnalysisStatus = computed(() => {
    return (status: AnalysisStatus) =>
      candidates.value.filter(
        (candidate) => candidate.analysisStatus === status,
      );
  });

  // Pre-computed common filters
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
  function addCandidate(newCandidate: Candidate) {
    const isAlreadyRegistered = candidates.value.some(
      (existing) => existing.idPersona === newCandidate.idPersona,
    );

    if (!isAlreadyRegistered) {
      candidates.value.push(newCandidate);
    }
  }

  function addCandidates(candidatesToRegister: Candidate[]) {
    const existingIds = new Set(
      candidates.value.map((candidate) => candidate.idPersona),
    );

    const uniqueNewCandidates = candidatesToRegister.filter(
      (candidate) => !existingIds.has(candidate.idPersona),
    );

    if (uniqueNewCandidates.length > 0) {
      candidates.value.push(...uniqueNewCandidates);
    }
  }

  function removeCandidateById(candidateId: string) {
    const targetIndex = candidates.value.findIndex(
      (candidate) => candidate.id === candidateId,
    );

    if (targetIndex !== -1) {
      candidates.value.splice(targetIndex, 1);
    }
  }

  function removeAllCandidatesBySystemStatus(status: SystemStatus) {
    candidates.value = candidates.value.filter(
      (candidate) => candidate.systemStatus !== status,
    );
  }

  function removeAllCandidatesByAnalysisStatus(status: AnalysisStatus) {
    candidates.value = candidates.value.filter(
      (candidate) => candidate.analysisStatus !== status,
    );
  }

  function updateCandidateStatus(
    candidateId: string,
    statusUpdates: Partial<Pick<Candidate, "systemStatus" | "analysisStatus">>,
  ) {
    const targetCandidate = candidates.value.find((c) => c.id === candidateId);

    if (targetCandidate) {
      if (statusUpdates.systemStatus !== undefined) {
        targetCandidate.systemStatus = statusUpdates.systemStatus;
        targetCandidate.validatedAt = new Date();
      }
      if (statusUpdates.analysisStatus !== undefined) {
        targetCandidate.analysisStatus = statusUpdates.analysisStatus;
      }
    }
  }

  function clearAllCandidates() {
    candidates.value = [];
  }

  function findCandidateById(candidateId: string): Candidate | undefined {
    return candidates.value.find((candidate) => candidate.id === candidateId);
  }

  /**
   * Core business logic: Expand wildcards and generate candidate entities
   */
  async function generateCandidatesFromSequence(
    symbolicSequence: string,
  ): Promise<number> {
    // Artificial delay for UI responsiveness
    await new Promise((resolve) => setTimeout(resolve, 50));

    const expandedSequences = expandWildcards(
      symbolicSequence,
      symbolsStore.symbols,
    );
    const successfullyGeneratedCandidates: Candidate[] = [];

    expandedSequences.forEach((sequence) => {
      const decodingResult = decodeSymbolicSequenceToId(
        sequence,
        symbolsStore.symbolIndexMap,
      );

      if (decodingResult.ok && decodingResult.value !== undefined) {
        const source: CandidateSource =
          expandedSequences.length > 1 ? "expanded" : "manual";
        successfullyGeneratedCandidates.push(
          createCandidateNode(String(decodingResult.value), sequence, source),
        );
      } else {
        console.warn(
          `Failed to decode sequence ${sequence}:`,
          decodingResult.error,
        );
      }
    });

    if (successfullyGeneratedCandidates.length > 0) {
      addCandidates(successfullyGeneratedCandidates);
    }

    return successfullyGeneratedCandidates.length;
  }

  return {
    // State
    candidates,
    // Getters
    totalCount,
    getCandidatesBySystemStatus,
    getCandidatesByAnalysisStatus,
    pendingCandidates,
    foundCandidates,
    unreviewedCandidates,
    // Actions
    addCandidate,
    addCandidates,
    removeCandidateById,
    removeAllCandidatesBySystemStatus,
    removeAllCandidatesByAnalysisStatus,
    updateCandidateStatus,
    clearAllCandidates,
    findCandidateById,
    generateCandidatesFromSequence,
    createCandidateNode,
    // Aliases for backward compatibility
    removeCandidate: removeCandidateById,
    removeCandidatesBySystemStatus: removeAllCandidatesBySystemStatus,
    removeCandidatesByAnalysisStatus: removeAllCandidatesByAnalysisStatus,
    clearAll: clearAllCandidates,
    getCandidateById: findCandidateById,
    createCandidate: createCandidateNode,
  };
});
