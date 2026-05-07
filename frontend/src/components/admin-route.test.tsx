import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AdminRoute } from './admin-route';
import { useAuthStore } from '@/store/auth-store';

const replace = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace }),
}));

describe('AdminRoute', () => {
  beforeEach(() => {
    replace.mockClear();
    useAuthStore.getState().logout();
  });

  it('redirects unauthenticated users to login', async () => {
    render(
      <AdminRoute>
        <p>Admin content</p>
      </AdminRoute>,
    );

    await waitFor(() => expect(replace).toHaveBeenCalledWith('/login'));
    expect(screen.queryByText('Admin content')).not.toBeInTheDocument();
  });

  it('redirects authenticated non-admin users home', async () => {
    useAuthStore.getState().setAuth({
      token: 'token',
      email: 'user@example.com',
      firstName: 'Test',
      lastName: 'User',
      role: 'Customer',
    });

    render(
      <AdminRoute>
        <p>Admin content</p>
      </AdminRoute>,
    );

    await waitFor(() => expect(replace).toHaveBeenCalledWith('/'));
    expect(screen.queryByText('Admin content')).not.toBeInTheDocument();
  });

  it('renders children for admin users', async () => {
    useAuthStore.getState().setAuth({
      token: 'token',
      email: 'admin@example.com',
      firstName: 'Admin',
      lastName: 'User',
      role: 'Admin',
    });

    render(
      <AdminRoute>
        <p>Admin content</p>
      </AdminRoute>,
    );

    expect(await screen.findByText('Admin content')).toBeInTheDocument();
    expect(replace).not.toHaveBeenCalled();
  });
});
