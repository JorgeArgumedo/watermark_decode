import { describe, it, expect } from "vitest";
import { SynchronizeCandidatesUseCase } from "@/domain/usecases/SynchronizeCandidatesUseCase";

const fakeRepo = {
  async fetchDetails(ids: string[]) {
    return {
      results: ids.map((id) => ({ idPersona: id, exists: true })),
      summary: { totalQueried: ids.length, totalFound: ids.length, totalNotFound: 0 },
    };
  },
};

describe("SynchronizeCandidatesUseCase", () => {
  it("returns API response via repository", async () => {
    const usecase = new SynchronizeCandidatesUseCase(fakeRepo as any);

    const ids = ["1", "2", "3"];
    const resp = await usecase.execute(ids);

    expect(resp.summary.totalQueried).toBe(3);
    expect(resp.results.length).toBe(3);
  });
});
