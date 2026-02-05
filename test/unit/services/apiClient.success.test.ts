import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiClient } from '@/services/apiClient';

describe('apiClient post/get success paths', () => {
  beforeEach(() => vi.restoreAllMocks());

  it('returns response.data for post and get', async () => {
    const client: any = apiClient as any;
    const postData = { results: [1] };
    const getData = { items: [2] };

    vi.spyOn(client.clientInstance, 'post').mockResolvedValue({ data: postData });
    vi.spyOn(client.clientInstance, 'get').mockResolvedValue({ data: getData });

    const p = await apiClient.post('/x', {});
    const g = await apiClient.get('/y');

    expect(p).toEqual(postData);
    expect(g).toEqual(getData);
  });
});