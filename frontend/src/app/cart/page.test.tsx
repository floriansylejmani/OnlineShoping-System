import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import CartPage from './page';
import { cartApi } from '@/features/cart/cart-api';

vi.mock('@/components/protected-route', () => ({
  ProtectedRoute: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('@/features/cart/cart-api', () => ({
  cartApi: {
    getCart: vi.fn(),
    updateItem: vi.fn(),
    removeItem: vi.fn(),
    clearCart: vi.fn(),
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
      <CartPage />
    </QueryClientProvider>,
  );
}

describe('CartPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows an empty cart state', async () => {
    vi.mocked(cartApi.getCart).mockResolvedValueOnce({
      id: 'cart-1',
      userId: 'user-1',
      items: [],
      total: 0,
    });

    renderWithClient();

    expect(await screen.findByText(/your cart is empty/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /browse products/i })).toHaveAttribute('href', '/products');
  });

  it('renders cart items and updates quantity', async () => {
    const user = userEvent.setup();
    vi.mocked(cartApi.getCart).mockResolvedValueOnce({
      id: 'cart-1',
      userId: 'user-1',
      total: 39.98,
      items: [
        {
          id: 'item-1',
          productId: 'product-1',
          productName: 'Wireless Mouse',
          productImageUrl: '',
          quantity: 2,
          unitPrice: 19.99,
          subtotal: 39.98,
        },
      ],
    });
    vi.mocked(cartApi.updateItem).mockResolvedValueOnce({
      id: 'cart-1',
      userId: 'user-1',
      total: 59.97,
      items: [],
    });

    renderWithClient();

    expect(await screen.findByText('Wireless Mouse')).toBeInTheDocument();
    expect(screen.getAllByText('$39.98')).toHaveLength(2);

    await user.click(screen.getByLabelText(/increase quantity/i));

    expect(cartApi.updateItem).toHaveBeenCalledWith('item-1', { quantity: 3 });
  });

  it('shows an error state when the cart request fails', async () => {
    vi.mocked(cartApi.getCart).mockRejectedValueOnce(new Error('Network error'));

    renderWithClient();

    expect(await screen.findByText(/failed to load cart/i)).toBeInTheDocument();
  });
});
