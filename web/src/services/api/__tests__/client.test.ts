import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('API Client', () => {
  beforeEach(() => {
    mockFetch.mockReset();
    localStorage.clear();
  });

  it('attaches Authorization header when token exists', async () => {
    localStorage.setItem('beyon_token', 'test-token-123');
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: { id: 1 } }),
      headers: new Headers({ 'content-type': 'application/json' }),
    });

    const { api } = await import('../client');
    await api.get('/test');

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/test'),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer test-token-123',
        }),
      })
    );
  });

  it('returns data from successful response', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: { name: 'test' }, message: 'ok' }),
      headers: new Headers({ 'content-type': 'application/json' }),
    });

    const { api } = await import('../client');
    const result = await api.get('/test');
    expect(result).toEqual({ name: 'test' });
  });

  it('throws on failed response', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: async () => ({ error: 'Not found' }),
      headers: new Headers({ 'content-type': 'application/json' }),
    });

    const { api } = await import('../client');
    await expect(api.get('/missing')).rejects.toThrow();
  });

  it('sends POST with correct body', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: { id: 'new-1' } }),
      headers: new Headers({ 'content-type': 'application/json' }),
    });

    const { api } = await import('../client');
    await api.post('/items', { name: 'new item' });

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/items'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ name: 'new item' }),
      })
    );
  });
});
