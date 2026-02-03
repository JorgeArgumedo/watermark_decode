import type { Candidate } from "@shared/types/candidate";

export function candidatesNeedingSync(
  candidates: Candidate[],
  thresholdInMinutes = 5,
  now = new Date(),
): string[] {
  const cutoffTime = new Date(now.getTime() - thresholdInMinutes * 60000);

  const ids = candidates
    .filter((candidate) => {
      const isPending = candidate.systemStatus === "pending";
      const neverSynced = candidate.lastApiSync === undefined;
      const stale = candidate.lastApiSync ? candidate.lastApiSync < cutoffTime : false;

      return isPending || neverSynced || stale;
    })
    .map((c) => c.idPersona);

  return ids;
}
