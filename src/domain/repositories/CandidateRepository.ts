import type { CandidateApiDetails } from "@shared/types/api";

export interface CandidateRepositoryResponse {
  results: CandidateApiDetails[];
  summary: {
    totalQueried: number;
    totalFound: number;
    totalNotFound: number;
  };
}

export interface CandidateRepository {
  fetchDetails(ids: string[]): Promise<CandidateRepositoryResponse>;
}
