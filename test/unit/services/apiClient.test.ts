import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiClient } from '@/services/apiClient';

describe('apiClient interceptors', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('processes axios error and rejects with ApiError and logs', async () => {
    // Replace the internal axios instance's post method to reject
    const client: any = apiClient as any;
    const fakeError = {
      message: 'Network Error',
      code: 'ERR_NETWORK',
      response: { data: { info: 'bad' } },
    };

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    // Locate the response interceptor handler and invoke its rejection handler directly
    const handlers = (client as any).clientInstance.interceptors?.response?.handlers;
    expect(handlers && handlers.length).toBeGreaterThan(0);
    const rejectHandler = handlers.find((h: any) => typeof h.rejected === 'function')?.rejected;
    expect(rejectHandler).toBeDefined();

    // Invoking the interceptor should result in a rejected processed error
    await expect(rejectHandler(fakeError)).rejects.toMatchObject({
      message: 'Network Error',
      code: 'ERR_NETWORK',
    });

    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });
});