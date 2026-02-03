import { describe, it, expect, vi, beforeEach } from "vitest";
import { ApiCandidateRepository } from "@/infrastructure/repositories/ApiCandidateRepository";
import { apiClient } from "@infrastructure/http/apiClient";

describe("ApiCandidateRepository", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("delegates to apiClient.post and returns parsed response", async () => {
    const fakeResponse = {
      results: [{ idPersona: "1", exists: true }],
      summary: { totalQueried: 1, totalFound: 1, totalNotFound: 0 },
    };

    const postSpy = vi.spyOn(apiClient, "post").mockResolvedValue(fakeResponse);

    const repo = new ApiCandidateRepository();
    const resp = await repo.fetchDetails(["1"]);

    expect(postSpy).toHaveBeenCalled();
    expect(resp.summary.totalFound).toBe(1);
    expect(resp.results[0].idPersona).toBe("1");
  });
});
