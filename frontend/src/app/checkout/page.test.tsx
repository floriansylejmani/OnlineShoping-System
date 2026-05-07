import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import CheckoutPage from './page';
import { cartApi } from '@/features/cart/cart-api';
import { useAuthStore } from '@/store/auth-store';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));

vi.mock('@/features/cart/cart-api', () => ({
  cartApi: {
    getCart: vi.fn(),
  },
}));

vi.mock('@/features/orders/orders-api', () => ({
  ordersApi: {
    createOrder: vi.fn(),
  },
}));

vi.mock('@/features/payments/payments-api', () => ({
  paymentsApi: {
    processPayment: vi.fn(),
  },
}));

function renderWithClient() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <CheckoutPage />
    </QueryClientProvider>,
  );
}

describe('CheckoutPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.getState().setAuth({
      token: 'token',
      email: 'user@example.com',
      firstName: 'Test',
      lastName: 'User',
      role: 'Customer',
    });
  });

  it('shows an empty cart state when there are no checkout items', async () => {
    vi.mocked(cartApi.getCart).mockResolvedValueOnce({
      id: 'cart-1',
      userId: 'user-1',
      items: [],
      total: 0,
    });

    renderWithClient();

    expect(await screen.findByText('Your cart is empty')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /browse products/i })).toHaveAttribute('href', '/products');
  });
});
