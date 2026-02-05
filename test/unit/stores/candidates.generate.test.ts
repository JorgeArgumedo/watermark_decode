import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useCandidatesStore } from '@/stores/candidates';
import * as wildcard from '@/utils/wildcard';
import * as decoding from '@/utils/decoding';

describe('generateCandidatesFromSequence edge cases', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.restoreAllMocks();
  });

  it('handles mixed decodable and non-decodable sequences, warns on failures', async () => {
    const store = useCandidatesStore();

    // Force expandWildcards to return two sequences
    const expandSpy = vi.spyOn(wildcard, 'expandWildcards').mockReturnValue(['GOOD', 'BAD']);

    // GOOD decodes, BAD fails
    const decodeSpy = vi.spyOn(decoding, 'decodeSymbolicSequenceToId')
      .mockImplementation((seq: string) => {
        if (seq === 'GOOD') return { ok: true, value: 123 } as any;
        return { ok: false, error: 'invalid' } as any;
      });

    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const count = await store.generateCandidatesFromSequence('X');

    expect(expandSpy).toHaveBeenCalled();
    expect(decodeSpy).toHaveBeenCalledTimes(2);
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('Failed to decode sequence'), expect.anything());
    expect(count).toBe(1);

    warnSpy.mockRestore();
  });
});