import type { CandidateRepository, CandidateRepositoryResponse } from "@/domain/repositories/CandidateRepository";

/**
 * Use case: sincronizar candidatos con la API externa
 * - Recibe un repositorio inyectado (puerto)
 * - Devuelve la respuesta de la API para que el store haga las actualizaciones de estado
 */
export class SynchronizeCandidatesUseCase {
  constructor(private readonly repo: CandidateRepository) {}

  async execute(candidateIds: string[]): Promise<CandidateRepositoryResponse> {
    if (candidateIds.length === 0) {
      return {
        results: [],
        summary: { totalQueried: 0, totalFound: 0, totalNotFound: 0 },
      };
    }

    const resp = await this.repo.fetchDetails(candidateIds);
    return resp;
  }
}
