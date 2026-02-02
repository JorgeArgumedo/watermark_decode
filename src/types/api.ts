/**
 * Type definitions for API
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
