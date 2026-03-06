import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PuterClient } from '../src/puter/client.js';
import { AuthManager } from '../src/puter/auth.js';
import { PuterApiError, PuterAuthError } from '../src/puter/types.js';

// Mock AuthManager
vi.mock('../src/puter/auth.js');

// Mock global fetch
const fetchMock = vi.fn();
global.fetch = fetchMock;

describe('PuterClient', () => {
  let authManager: AuthManager;
  let client: PuterClient;

  beforeEach(() => {
    vi.resetAllMocks();
    authManager = new AuthManager();
    client = new PuterClient(authManager);
  });

  it('should throw PuterAuthError if no token is available', async () => {
    (authManager.getToken as any).mockResolvedValue(undefined);

    await expect(client.callDriver({
      interface: 'test',
      method: 'test',
      args: {}
    })).rejects.toThrow(PuterAuthError);
  });

  it('should make a successful API call', async () => {
    (authManager.getToken as any).mockResolvedValue('valid-token');
    fetchMock.mockResolvedValue({
      ok: true,
      headers: { get: () => 'application/json' },
      json: async () => ({ success: true, result: { foo: 'bar' } }),
    });

    const result = await client.callDriver({
      interface: 'test-interface',
      method: 'test-method',
      args: { param: 1 }
    });

    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.puter.com/drivers/call',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Authorization': 'Bearer valid-token',
          'Content-Type': 'application/json'
        }),
        body: JSON.stringify({
          interface: 'test-interface',
          method: 'test-method',
          args: { param: 1 }
        })
      })
    );

    expect(result).toEqual({ success: true, result: { foo: 'bar' } });
  });

  it('should handle API errors (HTTP 200 but success: false)', async () => {
    (authManager.getToken as any).mockResolvedValue('valid-token');
    fetchMock.mockResolvedValue({
      ok: true,
      headers: { get: () => 'application/json' },
      json: async () => ({
        success: false,
        error: { message: 'API Error', code: 'ERR_TEST' }
      }),
    });

    await expect(client.callDriver({
      interface: 'test',
      method: 'test',
      args: {}
    })).rejects.toThrow('API Error');
  });

  it('should handle HTTP errors', async () => {
    (authManager.getToken as any).mockResolvedValue('valid-token');
    fetchMock.mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
    });

    await expect(client.callDriver({
      interface: 'test',
      method: 'test',
      args: {}
    })).rejects.toThrow('HTTP 500: Internal Server Error');
  });

  it('should handle image responses correctly', async () => {
    (authManager.getToken as any).mockResolvedValue('valid-token');
    const mockBuffer = Buffer.from('fake-image-data');
    
    fetchMock.mockResolvedValue({
      ok: true,
      headers: { get: () => 'image/png; charset=utf-8' },
      arrayBuffer: async () => mockBuffer,
    });

    const result = await client.callDriver({
      interface: 'image-gen',
      method: 'generate',
      args: {}
    });

    expect(result.success).toBe(true);
    expect((result.result as any).mimeType).toBe('image/png');
    expect((result.result as any).base64).toBe(mockBuffer.toString('base64'));
  });
});
