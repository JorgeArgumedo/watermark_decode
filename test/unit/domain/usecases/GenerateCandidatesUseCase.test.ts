import { describe, it, expect } from "vitest";
import { GenerateCandidatesUseCase } from "@/domain/usecases/GenerateCandidatesUseCase";

describe("GenerateCandidatesUseCase", () => {
  it("should generate candidates from a valid simple sequence", async () => {
    const usecase = new GenerateCandidatesUseCase();

    const symbols = ["A", "B", "C"];
    const symbolIndexMap = new Map<string, number>([["A", 1], ["B", 2], ["C", 3]]);

    // Using a sequence composed of a single symbol repeated
    const sequence = "AAAA";

    const result = await usecase.execute(sequence, symbols, symbolIndexMap);

    expect(result.length).toBeGreaterThan(0);
    expect(result[0]).toHaveProperty("idPersona");
    expect(result[0]).toHaveProperty("sequence", sequence);
  });
});
