import type { PaymentDto } from './payment';

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface Order {
  id: string;
  userId: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  items: OrderItem[];
  payment: PaymentDto | null;
}

export interface UpdateOrderStatusRequest {
  status: string;
}
