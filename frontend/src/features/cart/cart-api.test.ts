import { beforeEach, describe, expect, it, vi } from 'vitest';
import { api } from '@/lib/api';
import { cartApi } from './cart-api';

vi.mock('@/lib/api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

const mockedApi = vi.mocked(api);

describe('cartApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('loads the current cart from the cart endpoint', async () => {
    const cart = { id: 'cart-1', userId: 'user-1', items: [], total: 0 };
    mockedApi.get.mockResolvedValueOnce({ data: cart });

    await expect(cartApi.getCart()).resolves.toEqual(cart);

    expect(mockedApi.get).toHaveBeenCalledWith('/cart');
  });

  it('updates and removes cart items with item-specific endpoints', async () => {
    const cart = { id: 'cart-1', userId: 'user-1', items: [], total: 0 };
    mockedApi.put.mockResolvedValueOnce({ data: cart });
    mockedApi.delete.mockResolvedValueOnce({});

    await expect(cartApi.updateItem('item-1', { quantity: 2 })).resolves.toEqual(cart);
    await expect(cartApi.removeItem('item-1')).resolves.toBeUndefined();

    expect(mockedApi.put).toHaveBeenCalledWith('/cart/items/item-1', { quantity: 2 });
    expect(mockedApi.delete).toHaveBeenCalledWith('/cart/items/item-1');
  });
});
