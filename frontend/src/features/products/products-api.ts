import { api } from '@/lib/api';
import type { PagedResult, Product, ProductQueryParams } from '@/types/product';

export const productsApi = {
  getProducts: async (params: ProductQueryParams): Promise<PagedResult<Product>> => {
    const res = await api.get<PagedResult<Product>>('/products', { params });
    return res.data;
  },

  getProduct: async (id: string): Promise<Product> => {
    const res = await api.get<Product>(`/products/${id}`);
    return res.data;
  },
};
