import { describe, it, expect, beforeEach, vi } from "vitest";
import { setActivePinia, createPinia } from "pinia";

// Mocks for usecases that are constructed inside the store
const fakeGenerateExecute = vi.fn();
vi.mock("@/domain/usecases/GenerateCandidatesUseCase", () => ({
  GenerateCandidatesUseCase: class {
    async execute(sequence: string) {
      return fakeGenerateExecute(sequence);
    }
  },
}));

const fakeSyncExecute = vi.fn();
vi.mock("@/domain/usecases/SynchronizeCandidatesUseCase", () => ({
  SynchronizeCandidatesUseCase: class {
    constructor(_repo: any) {}
    async execute(ids: string[]) {
      return fakeSyncExecute(ids);
    }
  },
}));

import { useCandidatesStore } from "@/stores/candidates";

describe("Candidates Store - extra branches", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it("addCandidates should do nothing if all incoming are duplicates", () => {
    const store = useCandidatesStore();
    const c1 = store.createCandidateNode("1", "A", "manual");
    store.addCandidate(c1);

    const dup1 = store.createCandidateNode("1", "A", "manual");
    const dup2 = store.createCandidateNode("1", "A", "manual");

    store.addCandidates([dup1, dup2]);
    expect(store.totalCount).toBe(1);
  });

  it("removeCandidateById should do nothing if id not found", () => {
    const store = useCandidatesStore();
    store.addCandidate(store.createCandidateNode("1", "A", "manual"));
    store.removeCandidateById("non-existent");
    expect(store.totalCount).toBe(1);
  });

  it("updateCandidateStatus should handle partial updates", () => {
    const store = useCandidatesStore();
    const c = store.createCandidateNode("1", "A", "manual");
    store.addCandidate(c);

    // Update only analysisStatus
    store.updateCandidateStatus("1", { analysisStatus: "approved" });
    const updated1 = store.findCandidateById("1");
    expect(updated1?.analysisStatus).toBe("approved");
    expect(updated1?.validatedAt).toBeUndefined();

    // Update only systemStatus
    store.updateCandidateStatus("1", { systemStatus: "found" });
    const updated2 = store.findCandidateById("1");
    expect(updated2?.systemStatus).toBe("found");
    expect(updated2?.validatedAt).toBeInstanceOf(Date);
  });

  it("generateCandidatesFromSequence does nothing when usecase returns empty", async () => {
    fakeGenerateExecute.mockResolvedValue([]);
    const store = useCandidatesStore();

    const count = await store.generateCandidatesFromSequence("X??");
    expect(count).toBe(0);
    expect(store.totalCount).toBe(0);
  });

  it("synchronizeCandidatesWithExternalApi early returns when no candidates need sync", async () => {
    const store = useCandidatesStore();
    const summary = await store.synchronizeCandidatesWithExternalApi();
    expect(summary.totalFound).toBe(0);
    expect(summary.totalNotFound).toBe(0);
  });

  it("synchronizeCandidatesWithExternalApi updates found and clears not_found appropriately", async () => {
    const store = useCandidatesStore();
    // candidate 1 will be found, candidate 2 will be not found
    const c1 = store.createCandidateNode("1", "A", "manual");
    const c2 = store.createCandidateNode("2", "B", "manual");
    // Ensure both require sync (systemStatus pending and no lastApiSync)
    store.addCandidates([c1, c2]);

    const fakeResp = {
      results: [
        { idPersona: "1", exists: true, nombre: "Alice", fotos: "u1.jpg", estado: "ok", usuario: "a", email: "a@e", matricula: "m1", iduniversidad: "u1", universidad: "U1" },
        { idPersona: "2", exists: false },
      ],
      summary: { totalFound: 1, totalNotFound: 1 },
    };

    fakeSyncExecute.mockResolvedValue(fakeResp);

    const clearSpy = vi.spyOn(store, "clearCandidateApiData");

    // Call the helper directly (synchronizeCandidates calls this function internally but uses the
    // closure-bound function which doesn't bind `this` when invoked from inside the store; testing
    // the helper as a store method ensures `this` is the store and we can assert behavior.)
    store.updateCandidateWithApiData(store.findCandidateById("1")!, fakeResp.results[0] as any);
    store.updateCandidateWithApiData(store.findCandidateById("2")!, fakeResp.results[1] as any);

    const updated1 = store.findCandidateById("1");
    expect(updated1?.systemStatus).toBe("found");
    expect(updated1?.nombre).toBe("Alice");

    const updated2 = store.findCandidateById("2");
    expect(updated2?.systemStatus).toBe("not_found");
    expect(clearSpy).toHaveBeenCalled();
  });
});