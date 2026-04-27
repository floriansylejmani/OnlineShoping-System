'use client';

import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { ordersApi } from '@/features/orders/orders-api';
import { ProtectedRoute } from '@/components/protected-route';
import type { Order } from '@/types/order';
import type { PaymentDto } from '@/types/payment';

export default function MyOrdersPage() {
  return (
    <ProtectedRoute>
      <OrdersContent />
    </ProtectedRoute>
  );
}

function OrdersContent() {
  const queryClient = useQueryClient();

  const { data: orders, isLoading, isError } = useQuery({
    queryKey: ['my-orders'],
    queryFn: ordersApi.getMyOrders,
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => ordersApi.cancelOrder(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['my-orders'] }),
  });

  const getErrorMsg = (err: unknown): string => {
    if (axios.isAxiosError(err)) {
      return err.response?.data?.errors?.[0] ?? 'Could not cancel order.';
    }
    return 'Could not cancel order.';
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-36 bg-white rounded-xl border border-gray-200 animate-pulse" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center text-red-500">
        Failed to load orders. Make sure the backend is running.
      </div>
    );
  }

  const isEmpty = !orders || orders.length === 0;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Orders</h1>

      {cancelMutation.isError && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
          {getErrorMsg(cancelMutation.error)}
        </div>
      )}

      {isEmpty ? (
        <div className="text-center py-20 space-y-4">
          <p className="text-4xl">📦</p>
          <p className="text-lg font-medium text-gray-700">No orders yet</p>
          <p className="text-sm text-gray-500">Your order history will appear here.</p>
          <Link
            href="/products"
            className="inline-block mt-2 bg-blue-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              isCancelling={
                cancelMutation.isPending && cancelMutation.variables === order.id
              }
              onCancel={() => cancelMutation.mutate(order.id)}
              cancelDisabled={cancelMutation.isPending}
            />
          ))}
        </div>
      )}
    </div>
  );
}

const STATUS_STYLES: Record<string, string> = {
  Pending:    'bg-yellow-100 text-yellow-700',
  Processing: 'bg-blue-100 text-blue-700',
  Shipped:    'bg-purple-100 text-purple-700',
  Delivered:  'bg-green-100 text-green-700',
  Cancelled:  'bg-gray-100 text-gray-500',
};

const PAYMENT_STYLES: Record<string, string> = {
  Pending: 'bg-yellow-50 text-yellow-600',
  Paid:    'bg-green-50 text-green-600',
  Failed:  'bg-red-50 text-red-600',
};

function OrderCard({
  order,
  isCancelling,
  onCancel,
  cancelDisabled,
}: {
  order: Order;
  isCancelling: boolean;
  onCancel: () => void;
  cancelDisabled: boolean;
}) {
  const canCancel =
    order.status === 'Pending' || order.status === 'Processing';

  const orderDate = new Date(order.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-xs font-mono text-gray-400">
            #{order.id.slice(0, 8).toUpperCase()}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">{orderDate}</p>
        </div>
        <div className="flex items-center gap-3">
          <span
            className={`text-xs font-medium px-2.5 py-1 rounded-full ${
              STATUS_STYLES[order.status] ?? 'bg-gray-100 text-gray-600'
            }`}
          >
            {order.status}
          </span>
          <span className="text-base font-bold text-gray-900">
            ${order.totalAmount.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Items */}
      <div className="border-t border-gray-100 px-5 py-3 space-y-1.5">
        {order.items.map((item) => (
          <div key={item.id} className="flex justify-between text-sm">
            <span className="text-gray-700">
              {item.productName}{' '}
              <span className="text-gray-400">× {item.quantity}</span>
            </span>
            <span className="text-gray-500">${item.subtotal.toFixed(2)}</span>
          </div>
        ))}
      </div>

      {/* Payment + cancel */}
      <div className="border-t border-gray-100 px-5 py-3 flex flex-wrap items-center justify-between gap-2">
        <PaymentStatus payment={order.payment} />
        {canCancel && (
          <button
            onClick={onCancel}
            disabled={cancelDisabled}
            className="text-xs font-medium text-red-500 hover:text-red-700 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isCancelling ? 'Cancelling...' : 'Cancel Order'}
          </button>
        )}
      </div>
    </div>
  );
}

function PaymentStatus({ payment }: { payment: PaymentDto | null }) {
  if (!payment) {
    return (
      <span className="text-xs text-gray-400">
        Payment: <span className="font-medium">Not paid</span>
      </span>
    );
  }

  const paidDate =
    payment.paidAt
      ? new Date(payment.paidAt).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })
      : null;

  return (
    <span className="flex items-center gap-2 text-xs text-gray-500">
      Payment:
      <span
        className={`font-medium px-2 py-0.5 rounded-full ${
          PAYMENT_STYLES[payment.status] ?? 'bg-gray-100 text-gray-600'
        }`}
      >
        {payment.status}
      </span>
      {paidDate && <span className="text-gray-400">{paidDate}</span>}
    </span>
  );
}
