'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { cartApi } from '@/features/cart/cart-api';
import { ordersApi } from '@/features/orders/orders-api';
import { paymentsApi } from '@/features/payments/payments-api';
import { ProtectedRoute } from '@/components/protected-route';

export default function CheckoutPage() {
  return (
    <ProtectedRoute>
      <CheckoutContent />
    </ProtectedRoute>
  );
}

function CheckoutContent() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const createdOrderIdRef = useRef<string | null>(null);

  const { data: cart, isLoading } = useQuery({
    queryKey: ['cart'],
    queryFn: cartApi.getCart,
  });

  const checkoutMutation = useMutation({
    mutationFn: async () => {
      createdOrderIdRef.current = null;
      // Step 1: create order from cart
      const order = await ordersApi.createOrder();
      createdOrderIdRef.current = order.id;
      // Step 2: process payment for that order
      await paymentsApi.processPayment({ orderId: order.id });
      return order;
    },
    onSuccess: () => {
      // Cart is cleared on backend — drop the cached cart data
      queryClient.removeQueries({ queryKey: ['cart'] });
      queryClient.invalidateQueries({ queryKey: ['my-orders'] });
      router.push('/my-orders');
    },
    onError: () => {
      if (createdOrderIdRef.current) {
        queryClient.removeQueries({ queryKey: ['cart'] });
        queryClient.invalidateQueries({ queryKey: ['my-orders'] });
      }
    },
  });

  const getErrorMsg = (err: unknown): string => {
    if (createdOrderIdRef.current) {
      return 'Order was created, but payment could not be completed. Check My Orders before trying again.';
    }
    if (axios.isAxiosError(err)) {
      return err.response?.data?.errors?.[0] ?? 'Checkout failed. Please try again.';
    }
    return 'Checkout failed. Please try again.';
  };

  if (isLoading) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 flex justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const isEmpty = !cart || cart.items.length === 0;

  if (isEmpty) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <p className="text-lg font-medium text-gray-700">Your cart is empty</p>
        <Link
          href="/products"
          className="inline-block bg-blue-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          Browse Products
        </Link>
      </div>
    );
  }

  const isPlacing = checkoutMutation.isPending;

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Checkout</h1>
        <p className="text-sm text-gray-500 mt-1">Review your order before paying</p>
      </div>

      {/* Order review card */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-4">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-700">Order Summary</h2>
        </div>

        <div className="divide-y divide-gray-100">
          {cart.items.map((item) => (
            <div key={item.id} className="px-5 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                {item.productImageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.productImageUrl}
                    alt={item.productName}
                    className="w-10 h-10 rounded-lg object-cover bg-gray-100 flex-shrink-0"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-gray-100 flex-shrink-0" />
                )}
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {item.productName}
                  </p>
                  <p className="text-xs text-gray-500">
                    {item.quantity} × ${item.unitPrice.toFixed(2)}
                  </p>
                </div>
              </div>
              <span className="text-sm font-semibold text-gray-900 ml-4 flex-shrink-0">
                ${item.subtotal.toFixed(2)}
              </span>
            </div>
          ))}
        </div>

        <div className="px-5 py-4 border-t border-gray-100 flex justify-between items-center">
          <span className="text-base font-bold text-gray-900">Total</span>
          <span className="text-xl font-bold text-blue-600">
            ${cart.total.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Payment notice */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 mb-5 text-sm text-blue-700">
        Payment will be processed immediately when you confirm.
      </div>

      {/* Error */}
      {checkoutMutation.isError && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-4">
          {getErrorMsg(checkoutMutation.error)}
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          href="/cart"
          className={`flex-1 text-center border border-gray-300 text-gray-600 py-3 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors ${
            isPlacing ? 'pointer-events-none opacity-50' : ''
          }`}
        >
          ← Back to Cart
        </Link>

        <button
          onClick={() => checkoutMutation.mutate()}
          disabled={isPlacing}
          className="flex-1 bg-blue-600 text-white py-3 rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          {isPlacing ? (
            <>
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Processing...
            </>
          ) : (
            `Confirm & Pay $${cart.total.toFixed(2)}`
          )}
        </button>
      </div>
    </div>
  );
}
