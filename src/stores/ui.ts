/**
 * UI store - manages UI state
 */

import { defineStore } from "pinia";
import { ref } from "vue";
import type { SystemStatus, AnalysisStatus } from "@shared/types/candidate";

export const useUIStore = defineStore("ui", () => {
  // State
  const isLoading = ref(false);
  const filterSystemStatus = ref<SystemStatus | "all">("all");
  const filterAnalysisStatus = ref<AnalysisStatus | "all">("all");
  const currentView = ref<"list" | "grid">("list");

  // Actions
  function setLoading(loading: boolean) {
    isLoading.value = loading;
  }

  function setFilterSystemStatus(status: SystemStatus | "all") {
    filterSystemStatus.value = status;
  }

  function setFilterAnalysisStatus(status: AnalysisStatus | "all") {
    filterAnalysisStatus.value = status;
  }

  function setCurrentView(view: "list" | "grid") {
    currentView.value = view;
  }

  function resetFilters() {
    filterSystemStatus.value = "all";
    filterAnalysisStatus.value = "all";
  }

  return {
    // State
    isLoading,
    filterSystemStatus,
    filterAnalysisStatus,
    currentView,
    // Actions
    setLoading,
    setFilterSystemStatus,
    setFilterAnalysisStatus,
    setCurrentView,
    resetFilters,
  };
});
