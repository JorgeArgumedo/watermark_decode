/**
 * Definiciones de tipos para comunicación con APIs externas.
 */

export interface ValidationRequest {
  ids: string[]; // Array of idPersona values to validate
}

export interface ValidationResult {
  idPersona: string;
  exists: boolean;
}

export interface ValidationResponse {
  results: ValidationResult[];
}

export interface ApiError {
  message: string;
  code?: string;
  details?: unknown;
}

export interface CandidateDetailsRequest {
  ids: string[]; // Array de idPersona (BIGINT como string)
  authorization: boolean;
}

export interface GroupCandidateApiDetails {
  iduniversidad: string;
  universidad: string;
  iddepartamento: string;
  departamento: string;
  idPeriodo: string;
  periodo: string;
  idgrupo: string;
  grupo: string;
}
export interface CandidateApiDetails {
  id: string;
  idPersona: string;
  nombre?: string;
  estado?: string; // acceso actual del usuario
  usuario?: string; // nombre del usuario
  email?: string;
  matricula?: string;
  fotos?: string[];
  grupos?: GroupCandidateApiDetails[]; // datos adicionales de grupos
}
export interface CandidateDetailsResponse {
  data: CandidateApiDetails[];
  status?: string;
  message?: string;
}
