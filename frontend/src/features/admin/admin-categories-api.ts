import { api } from '@/lib/api';
import type { Category, CreateCategoryRequest, UpdateCategoryRequest } from '@/types/category';

export const adminCategoriesApi = {
  getCategories: async (): Promise<Category[]> => {
    const res = await api.get<Category[]>('/categories');
    return res.data;
  },

  createCategory: async (data: CreateCategoryRequest): Promise<Category> => {
    const res = await api.post<Category>('/categories', data);
    return res.data;
  },

  updateCategory: async (id: string, data: UpdateCategoryRequest): Promise<Category> => {
    const res = await api.put<Category>(`/categories/${id}`, data);
    return res.data;
  },

  deleteCategory: async (id: string): Promise<void> => {
    await api.delete(`/categories/${id}`);
  },
};
