import { describe, it, expect, beforeEach } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { useUIStore } from "@/stores/ui";

describe("UI Store", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it("should have default values", () => {
    const store = useUIStore();
    expect(store.isLoading).toBe(false);
    expect(store.filterSystemStatus).toBe("all");
    expect(store.filterAnalysisStatus).toBe("all");
    expect(store.currentView).toBe("list");
  });

  it("should set loading state", () => {
    const store = useUIStore();
    store.setLoading(true);
    expect(store.isLoading).toBe(true);
  });

  it("should set system status filter", () => {
    const store = useUIStore();
    store.setFilterSystemStatus("found");
    expect(store.filterSystemStatus).toBe("found");
  });

  it("should set analysis status filter", () => {
    const store = useUIStore();
    store.setFilterAnalysisStatus("approved");
    expect(store.filterAnalysisStatus).toBe("approved");
  });

  it("should set current view", () => {
    const store = useUIStore();
    store.setCurrentView("grid");
    expect(store.currentView).toBe("grid");
  });

  it("should reset filters", () => {
    const store = useUIStore();
    store.setFilterSystemStatus("found");
    store.setFilterAnalysisStatus("approved");

    store.resetFilters();
    expect(store.filterSystemStatus).toBe("all");
    expect(store.filterAnalysisStatus).toBe("all");
  });
});
