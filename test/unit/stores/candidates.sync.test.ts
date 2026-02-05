import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useCandidatesStore } from '@/stores/candidates';
import { candidateService } from '@/services/candidateService';

describe('synchronizeCandidatesWithExternalApi', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.restoreAllMocks();
  });

  it('returns zero when no candidates need sync', async () => {
    const store = useCandidatesStore();

    const c = store.createCandidateNode('1', 'AAA', 'manual');
    c.systemStatus = 'found';
    store.addCandidate(c);

    const result = await store.synchronizeCandidatesWithExternalApi();
    expect(result).toEqual({ totalFound: 0, totalNotFound: 0 });
  });

  it('marks found and not_found correctly on success', async () => {
    const store = useCandidatesStore();
    const c1 = store.createCandidateNode('1', 'AAA', 'manual');
    const c2 = store.createCandidateNode('2', 'BBB', 'manual');
    store.addCandidates([c1, c2]);

    vi.spyOn(candidateService, 'fetchDetailsForCandidates').mockResolvedValue({
      status: 'success',
      data: [{ idPersona: '1', nombre: 'X' }],
    } as any);

    const result = await store.synchronizeCandidatesWithExternalApi();
    expect(result.totalFound).toBe(1);
    expect(result.totalNotFound).toBe(1);

    expect(store.findCandidateById('1')?.systemStatus).toBe('found');
    expect(store.findCandidateById('2')?.systemStatus).toBe('not_found');
  });

  it('handles api error status by marking candidates as error', async () => {
    const store = useCandidatesStore();
    const c1 = store.createCandidateNode('1', 'AAA', 'manual');
    const c2 = store.createCandidateNode('2', 'BBB', 'manual');
    store.addCandidates([c1, c2]);

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    vi.spyOn(candidateService, 'fetchDetailsForCandidates').mockResolvedValue({
      status: 'error',
      message: 'External API error',
    } as any);

    const result = await store.synchronizeCandidatesWithExternalApi();

    expect(consoleSpy).toHaveBeenCalled();
    expect(result.totalFound).toBe(0);
    expect(result.totalNotFound).toBe(2);

    expect(store.findCandidateById('1')?.systemStatus).toBe('error');
    expect(store.findCandidateById('2')?.systemStatus).toBe('error');

    consoleSpy.mockRestore();
  });

  it('handles thrown exceptions from the service and marks as error', async () => {
    const store = useCandidatesStore();
    const c1 = store.createCandidateNode('1', 'AAA', 'manual');
    store.addCandidate(c1);

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    vi.spyOn(candidateService, 'fetchDetailsForCandidates').mockRejectedValue(new Error('Network'));

    const result = await store.synchronizeCandidatesWithExternalApi();

    expect(consoleSpy).toHaveBeenCalled();
    expect(result.totalFound).toBe(0);
    expect(result.totalNotFound).toBe(1);
    expect(store.findCandidateById('1')?.systemStatus).toBe('error');

    consoleSpy.mockRestore();
  });
});