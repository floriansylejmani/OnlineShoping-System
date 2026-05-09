import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import MyOrdersPage from './page';
import { ordersApi } from '@/features/orders/orders-api';

vi.mock('@/components/protected-route', () => ({
  ProtectedRoute: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('@/features/orders/orders-api', () => ({
  ordersApi: {
    getMyOrders: vi.fn(),
    cancelOrder: vi.fn(),
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
      <MyOrdersPage />
    </QueryClientProvider>,
  );
}

describe('MyOrdersPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows an empty orders state', async () => {
    vi.mocked(ordersApi.getMyOrders).mockResolvedValueOnce([]);

    renderWithClient();

    expect(await screen.findByText(/no orders yet/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /start shopping/i })).toHaveAttribute('href', '/products');
  });

  it('renders orders and allows cancellation for pending orders', async () => {
    const user = userEvent.setup();
    vi.mocked(ordersApi.getMyOrders).mockResolvedValueOnce([
      {
        id: 'order-12345678',
        userId: 'user-1',
        status: 'Pending',
        totalAmount: 49.98,
        createdAt: '2026-04-25T00:00:00Z',
        payment: null,
        items: [
          {
            id: 'order-item-1',
            productId: 'product-1',
            productName: 'Desk Lamp',
            quantity: 2,
            unitPrice: 24.99,
            subtotal: 49.98,
          },
        ],
      },
    ]);
    vi.mocked(ordersApi.cancelOrder).mockResolvedValueOnce();

    renderWithClient();

    expect(await screen.findByText('Desk Lamp')).toBeInTheDocument();
    expect(screen.getByText('Pending')).toBeInTheDocument();
    expect(screen.getAllByText('$49.98')).toHaveLength(2);

    await user.click(screen.getByRole('button', { name: /cancel order/i }));

    expect(ordersApi.cancelOrder).toHaveBeenCalledWith('order-12345678');
  });

  it('shows an error state when orders fail to load', async () => {
    vi.mocked(ordersApi.getMyOrders).mockRejectedValueOnce(new Error('Network error'));

    renderWithClient();

    expect(await screen.findByText(/failed to load orders/i)).toBeInTheDocument();
  });
});
