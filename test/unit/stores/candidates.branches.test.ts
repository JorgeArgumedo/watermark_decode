import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useCandidatesStore } from '@/stores/candidates';

describe('candidates store - remove branches', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('remove analysis status filters correctly', () => {
    const store = useCandidatesStore();
    const c1 = store.createCandidateNode('1', 'A', 'manual');
    const c2 = store.createCandidateNode('2', 'B', 'manual');
    c2.analysisStatus = 'approved';

    store.addCandidates([c1, c2]);
    expect(store.totalCount).toBe(2);

    store.removeAllCandidatesByAnalysisStatus('approved');

    expect(store.totalCount).toBe(1);
    expect(store.candidates[0].analysisStatus).toBe('unreviewed');
  });

  it('findCandidateById returns undefined if not found', () => {
    const store = useCandidatesStore();
    const result = store.findCandidateById('nonexistent');
    expect(result).toBeUndefined();
  });

  it('removeCandidateById handles missing candidate silently', () => {
    const store = useCandidatesStore();
    const c = store.createCandidateNode('1', 'A', 'manual');
    store.addCandidate(c);

    store.removeCandidateById('missing');

    expect(store.totalCount).toBe(1);
  });

  it('getCandidatesBySystemStatus returns filtered list', () => {
    const store = useCandidatesStore();
    const c1 = store.createCandidateNode('1', 'A', 'manual');
    const c2 = store.createCandidateNode('2', 'B', 'manual');
    c1.systemStatus = 'error';

    store.addCandidates([c1, c2]);

    const errors = store.getCandidatesBySystemStatus('error');
    expect(errors).toHaveLength(1);
    expect(errors[0].id).toBe('1');
  });
});