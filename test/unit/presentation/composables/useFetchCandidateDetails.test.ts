import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock repo class
const mockFetchDetails = vi.fn();
vi.mock("@/infrastructure/repositories/ApiCandidateRepository", () => ({
  ApiCandidateRepository: class {
    fetchDetails = mockFetchDetails;
  },
}));

import { useFetchCandidateDetails } from "@presentation/composables/useFetchCandidateDetails";
import { setActivePinia, createPinia } from "pinia";
import { useCandidatesStore } from "@/stores/candidates";

describe("useFetchCandidateDetails", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setActivePinia(createPinia());
  });

  it("updates store when apiData found", async () => {
    const store = useCandidatesStore();
    const candidate = store.createCandidateNode("1", "A", "manual");
    store.addCandidate(candidate);

    mockFetchDetails.mockResolvedValue({
      results: [{ idPersona: "1", exists: true, nombre: "Alice" }],
      summary: { totalQueried: 1, totalFound: 1, totalNotFound: 0 },
    });

    const { fetchDetails } = useFetchCandidateDetails();
    const res = await fetchDetails("1");

    expect(res.apiData).toBeDefined();
    expect(store.findCandidateById("1")?.nombre).toBe("Alice");
  });

  it("does nothing when apiData not found", async () => {
    const store = useCandidatesStore();
    const candidate = store.createCandidateNode("2", "B", "manual");
    store.addCandidate(candidate);

    mockFetchDetails.mockResolvedValue({
      results: [{ idPersona: "2", exists: false }],
      summary: { totalQueried: 1, totalFound: 0, totalNotFound: 1 },
    });

    const { fetchDetails } = useFetchCandidateDetails();
    const res = await fetchDetails("2");

    expect(res.apiData).toBeDefined();
    expect(store.findCandidateById("2")?.systemStatus).toBe("not_found");
  });
});