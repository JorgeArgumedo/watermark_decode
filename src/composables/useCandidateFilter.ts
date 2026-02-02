import { computed, ref } from "vue";
import type { Ref } from "vue";
import type {
  Candidate,
  SystemStatus,
  AnalysisStatus,
} from "@/types/candidate";

/**
 * Composable to manage candidate filtering logic
 * Provides filtered lists and toggle actions for system and analysis statuses
 */
export function useCandidateFilter(candidates: Ref<Candidate[]>) {
  // Active Filter Sets
  const activeSystemStatusFilters = ref<SystemStatus[]>([]);
  const activeAnalysisStatusFilters = ref<AnalysisStatus[]>([]);

  /**
   * Toggle a system status filter (e.g., found, pending)
   */
  const toggleSystemStatusFilter = (status: SystemStatus) => {
    const filterIndex = activeSystemStatusFilters.value.indexOf(status);
    if (filterIndex === -1) {
      activeSystemStatusFilters.value.push(status);
    } else {
      activeSystemStatusFilters.value.splice(filterIndex, 1);
    }
  };

  /**
   * Toggle an analysis status filter (e.g., approved, excluded)
   */
  const toggleAnalysisStatusFilter = (status: AnalysisStatus) => {
    const filterIndex = activeAnalysisStatusFilters.value.indexOf(status);
    if (filterIndex === -1) {
      activeAnalysisStatusFilters.value.push(status);
    } else {
      activeAnalysisStatusFilters.value.splice(filterIndex, 1);
    }
  };

  /**
   * Main filtering logic - uses AND logic between system and analysis categories
   * and OR logic within each category.
   */
  const filteredCandidates = computed(() => {
    return candidates.value.filter((candidate) => {
      // If a category has no active filters, all items in that category are considered matching
      const matchesSystemStatus =
        activeSystemStatusFilters.value.length === 0 ||
        activeSystemStatusFilters.value.includes(candidate.systemStatus);

      const matchesAnalysisStatus =
        activeAnalysisStatusFilters.value.length === 0 ||
        activeAnalysisStatusFilters.value.includes(candidate.analysisStatus);

      return matchesSystemStatus && matchesAnalysisStatus;
    });
  });

  const filteredCandidatesCount = computed(
    () => filteredCandidates.value.length,
  );

  return {
    systemFilters: activeSystemStatusFilters,
    analysisFilters: activeAnalysisStatusFilters,
    toggleSystemFilter: toggleSystemStatusFilter,
    toggleAnalysisFilter: toggleAnalysisStatusFilter,
    filteredCandidates,
    filteredCount: filteredCandidatesCount,
  };
}
