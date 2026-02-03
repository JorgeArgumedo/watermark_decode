import type { Candidate } from "@shared/types/candidate";
import type { CandidateApiDetails } from "@shared/types/api";

export function applyApiDataToCandidate(
  candidate: Candidate,
  apiData: CandidateApiDetails,
): void {
  candidate.systemStatus = apiData.exists ? "found" : "not_found";
  candidate.validatedAt = new Date();
  candidate.lastApiSync = new Date();

  if (apiData.exists) {
    candidate.nombre = apiData.nombre;
    candidate.fotos = apiData.fotos;
    candidate.estado = apiData.estado;
    candidate.usuario = apiData.usuario;
    candidate.email = apiData.email;
    candidate.matricula = apiData.matricula;
    candidate.iduniversidad = apiData.iduniversidad;
    candidate.universidad = apiData.universidad;
  } else {
    clearCandidateApiData(candidate);
  }
}

export function clearCandidateApiData(candidate: Candidate): void {
  const fieldsToClear = [
    "nombre",
    "fotos",
    "estado",
    "usuario",
    "email",
    "matricula",
    "iduniversidad",
    "universidad",
  ] as const;

  fieldsToClear.forEach((field) => {
    (candidate as any)[field] = undefined;
  });
}
