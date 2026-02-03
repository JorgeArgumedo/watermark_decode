import { describe, it, expect } from "vitest";
import { ref } from "vue";
import { useCandidateFilter } from "@/composables/useCandidateFilter";
import type { Candidate } from "@/types/candidate";

describe("useCandidateFilter", () => {
  const mockCandidates: Candidate[] = [
    {
      id: "1",
      idPersona: "123",
      nombre: "Test 1",
      systemStatus: "found",
      analysisStatus: "pending",
      similarity: 100,
      sequence: [],
      symbolicSequence: "",
      history: [],
    },
    {
      id: "2",
      idPersona: "456",
      nombre: "Test 2",
      systemStatus: "pending",
      analysisStatus: "approved",
      similarity: 90,
      sequence: [],
      symbolicSequence: "",
      history: [],
    },
    {
      id: "3",
      idPersona: "789",
      nombre: "Test 3",
      systemStatus: "found",
      analysisStatus: "excluded",
      similarity: 80,
      sequence: [],
      symbolicSequence: "",
      history: [],
    },
  ];

  it("should return all candidates when no filters are active", () => {
    const candidates = ref(mockCandidates);
    const { filteredCandidates, filteredCount } =
      useCandidateFilter(candidates);

    expect(filteredCount.value).toBe(3);
    expect(filteredCandidates.value).toEqual(mockCandidates);
  });

  it("should filter by system status", () => {
    const candidates = ref(mockCandidates);
    const { filteredCandidates, toggleSystemFilter } =
      useCandidateFilter(candidates);

    toggleSystemFilter("found");
    expect(filteredCandidates.value.length).toBe(2);
    expect(
      filteredCandidates.value.every((c) => c.systemStatus === "found"),
    ).toBe(true);

    toggleSystemFilter("found"); // Toggle off
    expect(filteredCandidates.value.length).toBe(3);
  });

  it("should filter by analysis status", () => {
    const candidates = ref(mockCandidates);
    const { filteredCandidates, toggleAnalysisFilter } =
      useCandidateFilter(candidates);

    toggleAnalysisFilter("approved");
    expect(filteredCandidates.value.length).toBe(1);
    expect(filteredCandidates.value[0].id).toBe("2");
  });

  it("should combine filters (AND logic between categories)", () => {
    const candidates = ref(mockCandidates);
    const { filteredCandidates, toggleSystemFilter, toggleAnalysisFilter } =
      useCandidateFilter(candidates);

    toggleSystemFilter("found");
    toggleAnalysisFilter("excluded");
    expect(filteredCandidates.value.length).toBe(1);
    expect(filteredCandidates.value[0].id).toBe("3");
  });

  it("should use OR logic within same category", () => {
    const candidates = ref(mockCandidates);
    const { filteredCandidates, toggleSystemFilter } =
      useCandidateFilter(candidates);

    toggleSystemFilter("found");
    toggleSystemFilter("pending");
    expect(filteredCandidates.value.length).toBe(3);
  });
});
