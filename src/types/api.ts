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
}

export interface CandidateApiDetails {
  idPersona: string;
  exists: boolean;
  // Campos detallados (presentes solo si exists === true)
  nombre?: string;
  fotos?: string; // URLs separadas por ","
  estado?: string; // acceso actual del usuario
  usuario?: string; // nombre del usuario
  email?: string;
  matricula?: string;
  iduniversidad?: string | number;
  universidad?: string; // nombre de la institución
}

export interface CandidateDetailsResponse {
  results: CandidateApiDetails[];
  summary: {
    totalQueried: number;
    totalFound: number;
    totalNotFound: number;
  };
}
