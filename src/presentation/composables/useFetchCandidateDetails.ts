import { ApiCandidateRepository } from "@/infrastructure/repositories/ApiCandidateRepository";
import { FetchCandidateDetailsUseCase } from "@/domain/usecases/FetchCandidateDetailsUseCase";
import { useCandidatesStore } from "@/stores/candidates";
import type { CandidateApiDetails } from "@/shared/types/api";

export function useFetchCandidateDetails() {
  async function fetchDetails(idPersona: string) {
    const repo = new ApiCandidateRepository();
    const usecase = new FetchCandidateDetailsUseCase(repo);

    const resp = await usecase.execute(idPersona);

    if (resp.apiData) {
      const store = useCandidatesStore();
      const local = store.findCandidateById(resp.apiData.idPersona);
      if (local) {
        store.updateCandidateWithApiData(local, resp.apiData as CandidateApiDetails);
      }
    }

    return resp;
  }

  return { fetchDetails };
}
