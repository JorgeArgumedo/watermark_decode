import { describe, it, expect, beforeEach, vi } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { useCandidatesStore } from "@/stores/candidates";
import { useSymbolsStore } from "@/stores/symbols";
import type { Candidate } from "@/types/candidate";

describe("Candidates Store", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it("should start with an empty list", () => {
    const store = useCandidatesStore();
    expect(store.candidates).toEqual([]);
    expect(store.totalCount).toBe(0);
  });

  it("should create a candidate node", () => {
    const store = useCandidatesStore();
    const candidate = store.createCandidateNode("123", "ABC", "manual");

    expect(candidate.idPersona).toBe("123");
    expect(candidate.sequence).toBe("ABC");
    expect(candidate.source).toBe("manual");
    expect(candidate.systemStatus).toBe("pending");
    expect(candidate.analysisStatus).toBe("unreviewed");
    expect(candidate.createdAt).toBeInstanceOf(Date);
  });

  it("should add a candidate if not already registered", () => {
    const store = useCandidatesStore();
    const candidate = store.createCandidateNode("1", "A", "manual");

    store.addCandidate(candidate);
    expect(store.totalCount).toBe(1);

    // Try adding the same candidate again
    store.addCandidate(candidate);
    expect(store.totalCount).toBe(1);
  });

  it("should add multiple candidates and deduplicate", () => {
    const store = useCandidatesStore();
    const c1 = store.createCandidateNode("1", "A", "manual");
    const c2 = store.createCandidateNode("2", "B", "manual");
    const c3 = store.createCandidateNode("1", "A", "manual"); // Duplicate ID

    store.addCandidates([c1, c2, c3]);
    expect(store.totalCount).toBe(2);
  });

  it("should remove candidate by ID", () => {
    const store = useCandidatesStore();
    const c1 = store.createCandidateNode("1", "A", "manual");
    store.addCandidate(c1);

    store.removeCandidateById("1");
    expect(store.totalCount).toBe(0);
  });

  it("should remove candidates by system status", () => {
    const store = useCandidatesStore();
    const c1 = store.createCandidateNode("1", "A", "manual");
    const c2 = store.createCandidateNode("2", "B", "manual");
    c2.systemStatus = "found";

    store.addCandidates([c1, c2]);
    store.removeAllCandidatesBySystemStatus("found");

    expect(store.totalCount).toBe(1);
    expect(store.candidates[0].idPersona).toBe("1");
  });

  it("should update candidate status", () => {
    const store = useCandidatesStore();
    const c1 = store.createCandidateNode("1", "A", "manual");
    store.addCandidate(c1);

    store.updateCandidateStatus("1", {
      systemStatus: "found",
      analysisStatus: "approved",
    });

    const updated = store.findCandidateById("1");
    expect(updated?.systemStatus).toBe("found");
    expect(updated?.analysisStatus).toBe("approved");
    expect(updated?.validatedAt).toBeInstanceOf(Date);
  });

  it("should clear all candidates", () => {
    const store = useCandidatesStore();
    store.addCandidate(store.createCandidateNode("1", "A", "manual"));
    store.clearAllCandidates();
    expect(store.totalCount).toBe(0);
  });

  it("should filter candidates correctly (getters)", () => {
    const store = useCandidatesStore();
    const c1 = store.createCandidateNode("1", "A", "manual");
    const c2 = store.createCandidateNode("2", "B", "manual");
    c2.systemStatus = "found";
    c1.analysisStatus = "excluded";

    store.addCandidates([c1, c2]);

    expect(store.pendingCandidates.length).toBe(1);
    expect(store.foundCandidates.length).toBe(1);
    expect(store.unreviewedCandidates.length).toBe(1);
    expect(store.getCandidatesBySystemStatus("found").length).toBe(1);
    expect(store.getCandidatesByAnalysisStatus("excluded").length).toBe(1);
  });

  it("should generate candidates from sequence", async () => {
    const store = useCandidatesStore();
    const symbolsStore = useSymbolsStore();

    // Ensure symbols are loaded (default symbols from store)
    expect(symbolsStore.symbols.length).toBeGreaterThan(0);

    // Testing with a sequence that will result in 1 candidate
    // Using valid symbols from the store (SYMBOLS[0] repeated)
    const validSymbol = symbolsStore.symbols[0];
    const sequence = validSymbol.repeat(4);
    const count = await store.generateCandidatesFromSequence(sequence);

    expect(count).toBeGreaterThan(0);
    expect(store.totalCount).toBe(count);
  });
});
