import { api } from '@/lib/api';
import type { Order, UpdateOrderStatusRequest } from '@/types/order';
import type { PagedResult } from '@/types/product';

export const adminOrdersApi = {
  getOrders: async (page: number, pageSize: number): Promise<PagedResult<Order>> => {
    const res = await api.get<PagedResult<Order>>('/orders', {
      params: { page, pageSize },
    });
    return res.data;
  },

  updateStatus: async (id: string, data: UpdateOrderStatusRequest): Promise<Order> => {
    const res = await api.put<Order>(`/orders/${id}/status`, data);
    return res.data;
  },
};
