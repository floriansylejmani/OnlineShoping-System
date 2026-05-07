import { beforeEach, describe, expect, it } from 'vitest';
import { api } from './api';
import { useAuthStore } from '@/store/auth-store';

describe('api client', () => {
  beforeEach(() => {
    useAuthStore.getState().logout();
    api.defaults.adapter = undefined;
  });

  it('uses the default API base URL when no environment override is provided', () => {
    expect(api.defaults.baseURL).toBe('http://localhost:5290/api');
  });

  it('sets JSON content type by default', () => {
    expect(api.defaults.headers['Content-Type']).toBe('application/json');
  });

  it('attaches the bearer token to authenticated requests', async () => {
    useAuthStore.getState().setAuth({
      token: 'token-123',
      email: 'user@example.com',
      firstName: 'Test',
      lastName: 'User',
      role: 'Customer',
    });

    api.defaults.adapter = async (config) => ({
      data: { authorization: config.headers?.Authorization },
      status: 200,
      statusText: 'OK',
      headers: {},
      config,
    });

    const response = await api.get('/cart');

    expect(response.data.authorization).toBe('Bearer token-123');
  });

  it('logs out the current user on 401 responses', async () => {
    useAuthStore.getState().setAuth({
      token: 'token-123',
      email: 'user@example.com',
      firstName: 'Test',
      lastName: 'User',
      role: 'Customer',
    });

    api.defaults.adapter = async (config) =>
      Promise.reject({
        config,
        response: {
          status: 401,
          data: {},
          statusText: 'Unauthorized',
          headers: {},
          config,
        },
      });

    await expect(api.get('/cart')).rejects.toMatchObject({
      response: { status: 401 },
    });
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(useAuthStore.getState().token).toBeNull();
  });
});
