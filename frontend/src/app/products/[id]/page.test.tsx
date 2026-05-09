import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ProductDetailsPage from './page';
import { cartApi } from '@/features/cart/cart-api';
import { productsApi } from '@/features/products/products-api';
import { useAuthStore } from '@/store/auth-store';
import type { Product } from '@/types/product';

const push = vi.fn();

vi.mock('next/navigation', () => ({
  useParams: () => ({ id: 'product-1' }),
  useRouter: () => ({ push }),
}));

vi.mock('@/features/products/products-api', () => ({
  productsApi: {
    getProduct: vi.fn(),
    getProducts: vi.fn(),
  },
}));

vi.mock('@/features/cart/cart-api', () => ({
  cartApi: {
    addItem: vi.fn(),
  },
}));

const product: Product = {
  id: 'product-1',
  name: 'Wireless Mouse',
  description: 'A responsive mouse for daily work.',
  price: 29.99,
  stockQuantity: 5,
  imageUrl: '',
  isActive: true,
  categoryId: 'electronics',
  categoryName: 'Electronics',
  createdAt: '2026-04-25T00:00:00Z',
};

function renderWithClient() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <ProductDetailsPage />
    </QueryClientProvider>,
  );
}

describe('ProductDetailsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.getState().logout();
    localStorage.clear();
  });

  it('renders product details', async () => {
    vi.mocked(productsApi.getProduct).mockResolvedValueOnce(product);
    vi.mocked(productsApi.getProducts).mockResolvedValueOnce({
      items: [],
      totalCount: 0,
      page: 1,
      pageSize: 4,
      totalPages: 0,
      hasNextPage: false,
      hasPreviousPage: false,
    });

    renderWithClient();

    expect(await screen.findByRole('heading', { name: 'Wireless Mouse' })).toBeInTheDocument();
    expect(screen.getByText('A responsive mouse for daily work.')).toBeInTheDocument();
    expect(screen.getByText('$29.99')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add to cart/i })).toBeEnabled();
  });

  it('redirects unauthenticated users to login before adding to cart', async () => {
    const user = userEvent.setup();
    vi.mocked(productsApi.getProduct).mockResolvedValueOnce(product);
    vi.mocked(productsApi.getProducts).mockResolvedValueOnce({
      items: [],
      totalCount: 0,
      page: 1,
      pageSize: 4,
      totalPages: 0,
      hasNextPage: false,
      hasPreviousPage: false,
    });

    renderWithClient();

    await user.click(await screen.findByRole('button', { name: /add to cart/i }));

    expect(push).toHaveBeenCalledWith('/login');
    expect(cartApi.addItem).not.toHaveBeenCalled();
  });

  it('shows an error state when the product cannot be loaded', async () => {
    vi.mocked(productsApi.getProduct).mockRejectedValueOnce(new Error('Not found'));

    renderWithClient();

    expect(await screen.findByText(/product could not be loaded/i)).toBeInTheDocument();
    await waitFor(() => expect(productsApi.getProducts).not.toHaveBeenCalled());
  });
});
