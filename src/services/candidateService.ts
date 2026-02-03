/**
 * Servicio para operaciones relacionadas con candidatos.
 * Actúa como una capa de abstracción sobre la API de backend.
 */
import { apiClient } from "./apiClient";
import type {
  CandidateDetailsRequest,
  CandidateDetailsResponse,
  CandidateApiDetails,
} from "@shared/types/api";

class CandidateService {
  private readonly batchDetailsEndpoint = "/candidates/batch-details";

  /**
   * Obtiene información detallada para un lote de candidatos.
   * Realiza una sola petición optimizada al servidor.
   */
  async fetchDetailsForCandidates(
    candidateIds: string[],
  ): Promise<CandidateDetailsResponse> {
    if (candidateIds.length === 0) {
      return this.createEmptyResponse();
    }

    const requestPayload: CandidateDetailsRequest = {
      ids: candidateIds,
    };

    try {
      return await apiClient.post<CandidateDetailsResponse>(
        this.batchDetailsEndpoint,
        requestPayload,
      );
    } catch (error) {
      console.error("[CandidateService] Error al obtener detalles:", error);
      return this.createErrorResponse(candidateIds);
    }
  }

  /**
   * Crea una respuesta vacía para casos sin IDs.
   */
  private createEmptyResponse(): CandidateDetailsResponse {
    return {
      results: [],
      summary: {
        totalQueried: 0,
        totalFound: 0,
        totalNotFound: 0,
      },
    };
  }

  /**
   * Crea una respuesta estructurada en caso de error.
   * Permite que la aplicación continúe funcionando sin datos reales.
   */
  private createErrorResponse(
    candidateIds: string[],
  ): CandidateDetailsResponse {
    const errorResults: CandidateApiDetails[] = candidateIds.map((id) => ({
      idPersona: id,
      exists: false,
    }));

    return {
      results: errorResults,
      summary: {
        totalQueried: candidateIds.length,
        totalFound: 0,
        totalNotFound: candidateIds.length,
      },
    };
  }
}

// Exportar una instancia singleton del servicio
export const candidateService = new CandidateService();
