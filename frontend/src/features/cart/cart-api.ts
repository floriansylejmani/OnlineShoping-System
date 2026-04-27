import { api } from '@/lib/api';
import type { Cart, AddToCartRequest, UpdateCartItemRequest } from '@/types/cart';

export const cartApi = {
  getCart: async (): Promise<Cart> => {
    const res = await api.get<Cart>('/cart');
    return res.data;
  },

  addItem: async (request: AddToCartRequest): Promise<Cart> => {
    const res = await api.post<Cart>('/cart/items', request);
    return res.data;
  },

  updateItem: async (id: string, request: UpdateCartItemRequest): Promise<Cart> => {
    const res = await api.put<Cart>(`/cart/items/${id}`, request);
    return res.data;
  },

  removeItem: async (id: string): Promise<void> => {
    await api.delete(`/cart/items/${id}`);
  },

  clearCart: async (): Promise<void> => {
    await api.delete('/cart/clear');
  },
};
