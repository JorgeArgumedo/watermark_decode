import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useCandidatesStore } from '@/stores/candidates';

describe('updateCandidateWithApiData and clearCandidateApiData', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('updates candidate with api data when idPersona present', () => {
    const store = useCandidatesStore();
    const c = store.createCandidateNode('1', 'AAA', 'manual');
    store.addCandidate(c);

    const apiData: any = {
      idPersona: '1',
      nombre: 'Nombre',
      estado: 'Active',
      usuario: 'u1',
      email: 'e@x.com',
      matricula: 'M1',
      fotos: ['/a.jpg'],
      grupos: [{ grupo: 'G', idgrupo: 'g1' }],
    };

    store.updateCandidateWithApiData(c, apiData);

    expect(c.systemStatus).toBe('found');
    expect(c.nombre).toBe('Nombre');
    expect(c.fotos).toEqual(['/a.jpg']);
    expect(c.grupos).toHaveLength(1);
    expect(c.lastApiSync).toBeInstanceOf(Date);
  });

  it('clears candidate api data when idPersona absent', () => {
    const store = useCandidatesStore();
    const c = store.createCandidateNode('1', 'AAA', 'manual');
    c.nombre = 'X';
    c.email = 'a@b';
    c.fotos = ['/a.jpg'];
    store.addCandidate(c);

    const apiData: any = { idPersona: undefined };

    store.updateCandidateWithApiData(c, apiData);

    expect(c.systemStatus).toBe('not_found');
    expect(c.nombre).toBeUndefined();
    expect(c.email).toBeUndefined();
    expect(c.fotos).toBeUndefined();
  });
});