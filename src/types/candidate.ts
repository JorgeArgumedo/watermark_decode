/**
 * Type definitions for candidates
 */

export type SystemStatus = "pending" | "found" | "not_found" | "error";
export type AnalysisStatus = "unreviewed" | "approved" | "excluded";
export type CandidateSource = "manual" | "expanded";

export interface GroupCandidate {
  iduniversidad: string;
  universidad: string;
  iddepartamento: string;
  departamento: string;
  idPeriodo: string;
  periodo: string;
  idgrupo: string;
  grupo: string;
}
export interface Candidate {
  id: string; // UUID
  idPersona: string; // BIGINT as string (to avoid precision loss)
  nombre?: string;
  estado?: string; // estado es el acceso que tioene el usuario actualmente
  usuario?: string; // usuario es el nombre del usuario
  email?: string; // email es el correo del usuario
  matricula?: string; // matricula es el numero de matricula del usuario
  fotos?: string[]; // matricula es el numero de matricula del usuario
  grupos?: GroupCandidate[]; // Additional data groups
  sequence: string; // Symbolic sequence (no wildcards)
  systemStatus: SystemStatus; // Validation result from API
  analysisStatus: AnalysisStatus; // Human decision
  source: CandidateSource; // Origin of candidate
  createdAt: Date;
  validatedAt?: Date;
  lastApiSync?: Date;
}

export interface CandidateInput {
  idPersona?: string;
  sequence?: string;
}
