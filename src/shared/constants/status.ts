import type { SystemStatus, AnalysisStatus } from "@shared/types/candidate";

export const SYSTEM_STATUS_OPTIONS: {
  value: SystemStatus;
  icon: string;
  color: string;
}[] = [
  { value: "pending", icon: "hourglass_empty", color: "primary" },
  { value: "found", icon: "check_circle", color: "positive" },
  { value: "not_found", icon: "warning", color: "warning" },
  { value: "error", icon: "error", color: "negative" },
];

export const ANALYSIS_STATUS_OPTIONS: {
  value: AnalysisStatus;
  icon: string;
  color: string;
}[] = [
  { value: "unreviewed", icon: "help_outline", color: "info" },
  { value: "approved", icon: "thumb_up", color: "positive" },
  { value: "excluded", icon: "block", color: "negative" },
];
