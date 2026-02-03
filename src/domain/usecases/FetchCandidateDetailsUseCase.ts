import type { CandidateRepository } from "@/domain/repositories/CandidateRepository";
import type { CandidateApiDetails } from "@shared/types/api";

export class FetchCandidateDetailsUseCase {
  constructor(private readonly repo: CandidateRepository) {}

  async execute(idPersona: string): Promise<{ apiData: CandidateApiDetails | null; summary: { totalQueried: number; totalFound: number; totalNotFound: number } }> {
    const resp = await this.repo.fetchDetails([idPersona]);
    console.log("FetchCandidateDetailsUseCase Response:", resp);
    console.log("Searching for idPersona:", idPersona);
    const found = resp.results.find((r) => r.idPersona === idPersona) || null;
    console.log("Found candidate data:", found);
    return { apiData: found, summary: resp.summary };
  }
}
