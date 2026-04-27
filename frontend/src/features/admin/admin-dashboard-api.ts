import { api } from '@/lib/api';
import type { AdminDashboard } from '@/types/admin';

export const adminDashboardApi = {
  getDashboard: async (): Promise<AdminDashboard> => {
    const res = await api.get<AdminDashboard>('/admin/dashboard');
    return res.data;
  },
};
