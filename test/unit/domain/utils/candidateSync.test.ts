import { describe, it, expect } from "vitest";
import { candidatesNeedingSync } from "@domain/utils/candidateSync";

import type { Candidate } from "@shared/types/candidate";

describe("candidatesNeedingSync", () => {
  const now = new Date("2025-01-01T12:00:00Z");

  it("returns empty array when candidate was recently synced and is found", () => {
    const recent = new Date(now.getTime() - 1 * 60000); // 1 minute ago
    const candidates: Candidate[] = [
      {
        id: "1",
        idPersona: "1",
        sequence: "A",
        systemStatus: "found",
        analysisStatus: "unreviewed",
        source: "manual",
        createdAt: new Date(),
        lastApiSync: recent,
      },
    ];

    const ids = candidatesNeedingSync(candidates, 5, now);
    expect(ids).toEqual([]);
  });

  it("includes candidate with undefined lastApiSync (never synced)", () => {
    const candidates: Candidate[] = [
      {
        id: "2",
        idPersona: "2",
        sequence: "B",
        systemStatus: "found",
        analysisStatus: "unreviewed",
        source: "manual",
        createdAt: new Date(),
        // lastApiSync omitted
      } as Candidate,
    ];

    const ids = candidatesNeedingSync(candidates, 5, now);
    expect(ids).toEqual(["2"]);
  });

  it("includes candidate that is pending regardless of lastApiSync", () => {
    const recent = new Date(now.getTime() - 1 * 60000);
    const candidates: Candidate[] = [
      {
        id: "3",
        idPersona: "3",
        sequence: "C",
        systemStatus: "pending",
        analysisStatus: "unreviewed",
        source: "manual",
        createdAt: new Date(),
        lastApiSync: recent,
      },
    ];

    const ids = candidatesNeedingSync(candidates, 5, now);
    expect(ids).toEqual(["3"]);
  });

  it("includes candidate with stale lastApiSync", () => {
    const stale = new Date(now.getTime() - 10 * 60000); // 10 minutes ago
    const candidates: Candidate[] = [
      {
        id: "4",
        idPersona: "4",
        sequence: "D",
        systemStatus: "found",
        analysisStatus: "unreviewed",
        source: "manual",
        createdAt: new Date(),
        lastApiSync: stale,
      },
    ];

    const ids = candidatesNeedingSync(candidates, 5, now);
    expect(ids).toEqual(["4"]);
  });
});