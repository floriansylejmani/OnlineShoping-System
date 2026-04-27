import { api } from '@/lib/api';
import type { PaymentDto, CreatePaymentRequest } from '@/types/payment';

export const paymentsApi = {
  processPayment: async (request: CreatePaymentRequest): Promise<PaymentDto> => {
    const res = await api.post<PaymentDto>('/payments', request);
    return res.data;
  },
};
