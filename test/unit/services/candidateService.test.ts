import { describe, it, expect, vi, beforeEach } from 'vitest';
import { candidateService } from '@/services/candidateService';
import { apiClient } from '@/services/apiClient';

describe('candidateService', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('returns empty response when no ids provided', async () => {
    const res = await candidateService.fetchDetailsForCandidates([]);
    expect(res.results).toHaveLength(0);
    expect(res.summary.totalQueried).toBe(0);
    expect(res.summary.totalFound).toBe(0);
  });

  it('forwards successful api response', async () => {
    const apiResp = {
      results: [{ idPersona: '1', exists: true }],
      summary: { totalQueried: 1, totalFound: 1, totalNotFound: 0 },
    };

    const postSpy = vi.spyOn(apiClient, 'post').mockResolvedValueOnce(apiResp as any);

    const res = await candidateService.fetchDetailsForCandidates(['1']);

    expect(postSpy).toHaveBeenCalledWith('/candidates/batch-details', { ids: ['1'], authorization: true });
    expect(res).toEqual(apiResp);
  });

  it('returns error-shaped response when api throws', async () => {
    const postSpy = vi.spyOn(apiClient, 'post').mockRejectedValueOnce(new Error('Network')); 
    const consoleSpy = vi.spyOn(console, 'error');

    const res = await candidateService.fetchDetailsForCandidates(['a', 'b']);

    expect(postSpy).toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalled();
    expect(res.results).toHaveLength(2);
    expect(res.summary.totalQueried).toBe(2);
    expect(res.summary.totalFound).toBe(0);
  });
});