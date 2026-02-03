import { expandWildcards } from "@domain/utils/wildcard";
import { decodeSymbolicSequenceToId } from "@domain/utils/decoding";
import type { Candidate, CandidateSource } from "@shared/types/candidate";

/**
 * Use case: Generar candidatos a partir de una secuencia simbólica
 * - Es pura respecto a side-effects externos (usa utils puras)
 * - Devuelve entidades listos para insertar en el store
 */
export class GenerateCandidatesUseCase {
  async execute(
    symbolicSequence: string,
    symbols: string[],
    symbolIndexMap: Map<string, number>,
  ): Promise<Candidate[]> {
    const expandedSequences = expandWildcards(symbolicSequence, symbols);
    const generated: Candidate[] = [];

    for (const sequence of expandedSequences) {
      const decodingResult = decodeSymbolicSequenceToId(sequence, symbolIndexMap);
      if (decodingResult.ok && decodingResult.value !== undefined) {
        const source: CandidateSource = expandedSequences.length > 1 ? "expanded" : "manual";
        const idPersona = String(decodingResult.value);
        generated.push({
          id: idPersona,
          idPersona,
          sequence,
          systemStatus: "pending",
          analysisStatus: "unreviewed",
          source,
          createdAt: new Date(),
        } as Candidate);
      }
    }

    return generated;
  }
}
