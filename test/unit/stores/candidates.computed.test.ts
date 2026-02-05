import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useCandidatesStore } from '@/stores/candidates';
import type { Candidate } from '@/types/candidate';

describe('useCandidatesStore computed branches', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  const mockCandidate = (overrides?: Partial<Candidate>): Candidate => ({
    id: '1',
    idPersona: 'P1',
    sequence: '🟩🟨',
    systemStatus: 'found',
    analysisStatus: 'unreviewed',
    createdAt: new Date(),
    ...overrides,
  });

  it('pendingCandidates returns candidates with pending status', () => {
    const store = useCandidatesStore();
    store.addCandidates([
      mockCandidate({ systemStatus: 'pending', id: '1', idPersona: 'P1' }),
      mockCandidate({ systemStatus: 'found', id: '2', idPersona: 'P2' }),
    ]);
    expect(store.pendingCandidates).toHaveLength(1);
    expect(store.pendingCandidates[0].systemStatus).toBe('pending');
  });

  it('foundCandidates returns candidates with found status', () => {
    const store = useCandidatesStore();
    store.addCandidates([
      mockCandidate({ systemStatus: 'found', id: '1', idPersona: 'P3' }),
      mockCandidate({ systemStatus: 'pending', id: '2', idPersona: 'P4' }),
    ]);
    expect(store.foundCandidates).toHaveLength(1);
    expect(store.foundCandidates[0].systemStatus).toBe('found');
  });

  it('unreviewedCandidates returns candidates with unreviewed analysis status', () => {
    const store = useCandidatesStore();
    store.addCandidates([
      mockCandidate({ analysisStatus: 'unreviewed', id: '1', idPersona: 'P5' }),
      mockCandidate({ analysisStatus: 'approved', id: '2', idPersona: 'P6' }),
    ]);
    expect(store.unreviewedCandidates).toHaveLength(1);
    expect(store.unreviewedCandidates[0].analysisStatus).toBe('unreviewed');
  });

  it('empty computed properties when no candidates match', () => {
    const store = useCandidatesStore();
    store.addCandidates([mockCandidate({ systemStatus: 'found', idPersona: 'P7' })]);
    expect(store.pendingCandidates).toHaveLength(0);
  });

  it('getCandidatesBySystemStatus filter branch', () => {
    const store = useCandidatesStore();
    store.addCandidates([
      mockCandidate({ systemStatus: 'pending', id: '1', idPersona: 'P8' }),
      mockCandidate({ systemStatus: 'found', id: '2', idPersona: 'P9' }),
    ]);
    const pending = store.getCandidatesBySystemStatus('pending');
    expect(pending).toHaveLength(1);
    expect(pending[0].systemStatus).toBe('pending');
  });

  it('getCandidatesByAnalysisStatus filter branch', () => {
    const store = useCandidatesStore();
    store.addCandidates([
      mockCandidate({ analysisStatus: 'approved', id: '1', idPersona: 'P10' }),
      mockCandidate({ analysisStatus: 'unreviewed', id: '2', idPersona: 'P11' }),
    ]);
    const approved = store.getCandidatesByAnalysisStatus('approved');
    expect(approved).toHaveLength(1);
    expect(approved[0].analysisStatus).toBe('approved');
  });
});
