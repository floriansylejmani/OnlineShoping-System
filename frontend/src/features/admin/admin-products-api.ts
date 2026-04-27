import { api } from '@/lib/api';
import type {
  Product,
  CreateProductRequest,
  UpdateProductRequest,
  ProductQueryParams,
  PagedResult,
} from '@/types/product';

export const adminProductsApi = {
  getProducts: async (params: ProductQueryParams): Promise<PagedResult<Product>> => {
    const res = await api.get<PagedResult<Product>>('/products', { params });
    return res.data;
  },

  createProduct: async (data: CreateProductRequest): Promise<Product> => {
    const res = await api.post<Product>('/products', data);
    return res.data;
  },

  updateProduct: async (id: string, data: UpdateProductRequest): Promise<Product> => {
    const res = await api.put<Product>(`/products/${id}`, data);
    return res.data;
  },

  deleteProduct: async (id: string): Promise<void> => {
    await api.delete(`/products/${id}`);
  },
};
