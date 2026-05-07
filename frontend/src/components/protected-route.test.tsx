import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ProtectedRoute } from './protected-route';
import { useAuthStore } from '@/store/auth-store';

const replace = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace }),
}));

describe('ProtectedRoute', () => {
  beforeEach(() => {
    replace.mockClear();
    useAuthStore.getState().logout();
  });

  it('redirects unauthenticated users to login', async () => {
    render(
      <ProtectedRoute>
        <p>Protected content</p>
      </ProtectedRoute>,
    );

    await waitFor(() => expect(replace).toHaveBeenCalledWith('/login'));
    expect(screen.queryByText('Protected content')).not.toBeInTheDocument();
  });

  it('renders children for authenticated users', async () => {
    useAuthStore.getState().setAuth({
      token: 'token',
      email: 'user@example.com',
      firstName: 'Test',
      lastName: 'User',
      role: 'Customer',
    });

    render(
      <ProtectedRoute>
        <p>Protected content</p>
      </ProtectedRoute>,
    );

    expect(await screen.findByText('Protected content')).toBeInTheDocument();
    expect(replace).not.toHaveBeenCalled();
  });
});
