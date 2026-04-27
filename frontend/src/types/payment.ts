export interface PaymentDto {
  id: string;
  orderId: string;
  status: string;
  amount: number;
  paidAt: string | null;
}

export interface CreatePaymentRequest {
  orderId: string;
}
