import { describe, it, expect, vi } from "vitest";
import { FetchCandidateDetailsUseCase } from "@/domain/usecases/FetchCandidateDetailsUseCase";

const fakeRepo = {
  fetchDetails: vi.fn(),
};

describe("FetchCandidateDetailsUseCase", () => {
  it("returns found apiData when present", async () => {
    fakeRepo.fetchDetails.mockResolvedValue({
      results: [
        { idPersona: "1", exists: true, nombre: "Alice" },
      ],
      summary: { totalQueried: 1, totalFound: 1, totalNotFound: 0 },
    });

    const usecase = new FetchCandidateDetailsUseCase(fakeRepo as any);
    const res = await usecase.execute("1");

    expect(res.apiData).toBeDefined();
    expect(res.apiData?.nombre).toBe("Alice");
    expect(res.summary.totalFound).toBe(1);
  });

  it("returns null apiData when not found", async () => {
    fakeRepo.fetchDetails.mockResolvedValue({
      results: [],
      summary: { totalQueried: 1, totalFound: 0, totalNotFound: 1 },
    });

    const usecase = new FetchCandidateDetailsUseCase(fakeRepo as any);
    const res = await usecase.execute("2");

    expect(res.apiData).toBeNull();
    expect(res.summary.totalFound).toBe(0);
  });
});