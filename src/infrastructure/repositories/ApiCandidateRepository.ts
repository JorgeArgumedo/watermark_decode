import { apiClient } from "@/services/apiClient";
import type { CandidateRepository } from "@/domain/repositories/CandidateRepository";
import type { CandidateApiDetails } from "@shared/types/api";

export class ApiCandidateRepository implements CandidateRepository {
  private readonly batchDetailsEndpoint = "/candidates/batch-details";

  async fetchDetails(ids: string[]) {
    if (ids.length === 0) {
      return {
        results: [],
        summary: { totalQueried: 0, totalFound: 0, totalNotFound: 0 },
      };
    }

    const requestPayload = { ids };
    const response = await apiClient.post<{
      results: CandidateApiDetails[];
      summary: { totalQueried: number; totalFound: number; totalNotFound: number };
    }>(this.batchDetailsEndpoint, requestPayload);

    return response;
  }
}
