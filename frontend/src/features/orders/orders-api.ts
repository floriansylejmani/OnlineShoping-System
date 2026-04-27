import { api } from '@/lib/api';
import type { Order } from '@/types/order';

export const ordersApi = {
  createOrder: async (): Promise<Order> => {
    const res = await api.post<Order>('/orders');
    return res.data;
  },

  getMyOrders: async (): Promise<Order[]> => {
    const res = await api.get<Order[]>('/orders/my');
    return res.data;
  },

  cancelOrder: async (id: string): Promise<void> => {
    await api.put(`/orders/${id}/cancel`);
  },
};
