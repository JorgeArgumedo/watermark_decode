/**
 * Type definitions for candidates (shared types)
 */

export type SystemStatus = "pending" | "found" | "not_found" | "error";
export type AnalysisStatus = "unreviewed" | "approved" | "excluded";
export type CandidateSource = "manual" | "expanded";

export interface Candidate {
  id: string; // UUID
  idPersona: string; // BIGINT as string (to avoid precision loss)
  sequence: string; // Symbolic sequence (no wildcards)
  systemStatus: SystemStatus; // Validation result from API
  analysisStatus: AnalysisStatus; // Human decision
  source: CandidateSource; // Origin of candidate
  createdAt: Date;
  validatedAt?: Date;
  nombre?: string;
  fotos?: string; // URLs separadas por ","
  estado?: string; // estado es el acceso que tioene el usuario actualmente
  usuario?: string; // usuario es el nombre del usuario
  email?: string; // email es el correo del usuario
  matricula?: string; // matricula es el numero de matricula del usuario
  iduniversidad?: string | number; // iduniversidad es el id de la universidad
  universidad?: string; // universidad es el nombre de la institucion a la que pertenece el usuario
  lastApiSync?: Date;
}

export interface CandidateInput {
  idPersona?: string;
  sequence?: string;
}
