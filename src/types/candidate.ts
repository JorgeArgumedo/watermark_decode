/**
 * Type definitions for candidates
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
}

export interface CandidateInput {
  idPersona?: string;
  sequence?: string;
}
