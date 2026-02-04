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
import { candidateService } from "@/services/candidateService";
import type { CandidateApiDetails } from "@/types/api";

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

    // Map by idPersona to deduplicate the incoming list itself
    const uniqueIncoming = new Map<string, Candidate>();
    candidatesToRegister.forEach((candidate) => {
      if (!existingIds.has(candidate.idPersona)) {
        uniqueIncoming.set(candidate.idPersona, candidate);
      }
    });

    if (uniqueIncoming.size > 0) {
      candidates.value.push(...uniqueIncoming.values());
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
    const targetCandidate = candidates.value.find(
      (candidate) => candidate.id === candidateId,
    );

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

  // Añadir esta acción dentro del return del store existente:
  // async function synchronizeCandidatesWithExternalApi() {
  //   const synchronizationThresholdInMinutes = 5;
  //   const currentTime = new Date();
  //   const cutoffTimeForResync = new Date(
  //     currentTime.getTime() - synchronizationThresholdInMinutes * 60000,
  //   );
  //   // 1. Identificar candidatos que necesitan sincronización
  //   const candidatesRequiringSync = candidates.value.filter((candidate) => {
  //     const isPendingStatus = candidate.systemStatus === "pending";
  //     const neverSynced = candidate.lastApiSync === undefined;
  //     const hasStaleData = candidate.lastApiSync
  //       ? candidate.lastApiSync < cutoffTimeForResync
  //       : false;
  //     return isPendingStatus || neverSynced || hasStaleData;
  //   });
  //   if (candidatesRequiringSync.length === 0) {
  //     console.debug(
  //       "[Store] No se requieren sincronizaciones en este momento.",
  //     );
  //     return { totalFound: 0, totalNotFound: 0 };
  //   }
  //   // 2. Crear mapa para acceso eficiente O(1)
  //   const candidateMapByIdPersona = new Map<string, Candidate>();
  //   candidatesRequiringSync.forEach((candidate) => {
  //     candidateMapByIdPersona.set(candidate.idPersona, candidate);
  //   });
  //   const candidateIdsToSync = Array.from(candidateMapByIdPersona.keys());
  //   // 3. Consultar lote a la API externa
  //   const apiResponse = await candidateService.fetchDetailsForCandidates(candidateIdsToSync);
  //   // 4. Actualizar candidatos usando el mapa (operación eficiente)
  //   apiResponse.data.forEach((apiData: CandidateApiDetails) => {
  //     const localCandidate = candidateMapByIdPersona.get(apiData.idPersona);
  //     if (!localCandidate) return;
  //     this.updateCandidateWithApiData(localCandidate, apiData);
  //   });
  //   // 5. Forzar reactividad reasignando el array
  //   candidates.value = [...candidates.value];
  //   return candidates.value.length;
  // }
  function markCandidateAsFound(
    candidate: Candidate,
    apiData: CandidateApiDetails,
  ) {
    candidate.systemStatus = "found";
    candidate.validatedAt = new Date();
    candidate.lastApiSync = new Date();

    // Datos enriquecidos desde la API
    candidate.nombre = apiData.nombre;
    candidate.fotos = apiData.fotos;
    candidate.estado = apiData.estado;
    candidate.usuario = apiData.usuario;
    candidate.email = apiData.email;
    candidate.matricula = apiData.matricula;
    candidate.grupos = apiData.grupos;
  }

  function markCandidateAsNotFound(candidate: Candidate) {
    candidate.systemStatus = "not_found";
    candidate.lastApiSync = new Date();
  }

  function markCandidateAsError(candidate: Candidate) {
    candidate.systemStatus = "error";
    candidate.lastApiSync = new Date();
  }

  async function synchronizeCandidatesWithExternalApi() {
    const synchronizationThresholdInMinutes = 5;
    const now = new Date();
    const cutoffTime = new Date(
      now.getTime() - synchronizationThresholdInMinutes * 60000,
    );

    // 1️⃣ Selección de candidatos elegibles
    const candidatesToSync = candidates.value.filter((candidate) => {
      const isRetryableStatus =
        candidate.systemStatus === "pending" ||
        candidate.systemStatus === "error";

      const neverSynced = candidate.lastApiSync === undefined;
      const isStale =
        candidate.lastApiSync !== undefined &&
        candidate.lastApiSync < cutoffTime;

      return isRetryableStatus && (neverSynced || isStale);
    });

    if (candidatesToSync.length === 0) {
      return { totalFound: 0, totalNotFound: 0 };
    }

    // 2️⃣ Indexación por idPersona (string)
    const candidateMap = new Map<string, Candidate>();
    candidatesToSync.forEach((candidate) => {
      candidateMap.set(candidate.idPersona, candidate);
    });

    const idsToQuery = Array.from(candidateMap.keys());

    try {
      const apiResponse =
        await candidateService.fetchDetailsForCandidates(idsToQuery);

      if (apiResponse.status !== "success") {
        throw new Error(apiResponse.message || "External API error");
      }

      const apiDataList: CandidateApiDetails[] = apiResponse.data ?? [];

      const foundIdSet = new Set<string>(
        apiDataList.map((apiData) => String(apiData.idPersona)),
      );

      apiDataList.forEach((apiData) => {
        const candidate = candidateMap.get(String(apiData.idPersona));
        if (!candidate) return;

        markCandidateAsFound(candidate, apiData);
      });

      candidateMap.forEach((candidate, idPersona) => {
        if (!foundIdSet.has(idPersona)) {
          markCandidateAsNotFound(candidate);
        }
      });

      candidates.value = [...candidates.value];

      return {
        totalFound: foundIdSet.size,
        totalNotFound: idsToQuery.length - foundIdSet.size,
      };
    } catch (err) {
      console.error("[Sync] Error técnico al sincronizar:", err);

      candidateMap.forEach((candidate) => {
        markCandidateAsError(candidate);
      });

      candidates.value = [...candidates.value];

      return {
        totalFound: 0,
        totalNotFound: idsToQuery.length,
      };
    }
  }

  /**
   * Actualiza un candidato local con datos provenientes de la API.
   * Separado como función auxiliar por claridad y reutilización.
   */
  function updateCandidateWithApiData(
    localCandidate: Candidate,
    apiData: CandidateApiDetails,
  ): void {
    localCandidate.systemStatus = apiData.idPersona ? "found" : "not_found";
    localCandidate.validatedAt = new Date();
    localCandidate.lastApiSync = new Date();

    if (apiData.idPersona) {
      localCandidate.nombre = apiData.nombre;
      localCandidate.estado = apiData.estado;
      localCandidate.usuario = apiData.usuario;
      localCandidate.email = apiData.email;
      localCandidate.matricula = apiData.matricula;
      localCandidate.fotos = apiData.fotos;
      localCandidate.grupos = apiData.grupos;
    } else {
      this.clearCandidateApiData(localCandidate);
    }
  }

  /**
   * Limpia los datos de API de un candidato cuando ya no existe.
   */
  function clearCandidateApiData(candidate: Candidate): void {
    const fieldsToClear = [
      "nombre",
      "fotos",
      "estado",
      "usuario",
      "email",
      "matricula",
      "grupos",
    ] as const;

    fieldsToClear.forEach((field) => {
      candidate[field] = undefined;
    });
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
    synchronizeCandidatesWithExternalApi,
    updateCandidateWithApiData,
    clearCandidateApiData,
  };
});
