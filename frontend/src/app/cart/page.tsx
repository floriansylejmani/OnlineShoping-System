'use client';

import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { cartApi } from '@/features/cart/cart-api';
import { ProtectedRoute } from '@/components/protected-route';
import type { CartItem } from '@/types/cart';

export default function CartPage() {
  return (
    <ProtectedRoute>
      <CartContent />
    </ProtectedRoute>
  );
}

function CartContent() {
  const queryClient = useQueryClient();

  const { data: cart, isLoading, isError } = useQuery({
    queryKey: ['cart'],
    queryFn: cartApi.getCart,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, quantity }: { id: string; quantity: number }) =>
      cartApi.updateItem(id, { quantity }),
    onSuccess: (updatedCart) => {
      queryClient.setQueryData(['cart'], updatedCart);
    },
  });

  const removeMutation = useMutation({
    mutationFn: (id: string) => cartApi.removeItem(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cart'] }),
  });

  const clearMutation = useMutation({
    mutationFn: cartApi.clearCart,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cart'] }),
  });

  const isMutating =
    updateMutation.isPending || removeMutation.isPending || clearMutation.isPending;

  const getErrorMsg = (err: unknown) => {
    if (axios.isAxiosError(err)) {
      return err.response?.data?.errors?.[0] ?? 'Something went wrong.';
    }
    return 'Something went wrong.';
  };

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 bg-white rounded-xl border border-gray-200 animate-pulse" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center text-red-500">
        Failed to load cart. Make sure the backend is running.
      </div>
    );
  }

  const isEmpty = !cart || cart.items.length === 0;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Your Cart</h1>

      {/* Mutation errors */}
      {updateMutation.isError && (
        <ErrorBanner message={getErrorMsg(updateMutation.error)} />
      )}
      {removeMutation.isError && (
        <ErrorBanner message={getErrorMsg(removeMutation.error)} />
      )}

      {isEmpty ? (
        <div className="text-center py-20 space-y-4">
          <p className="text-3xl font-bold text-blue-600">Cart</p>
          <p className="text-lg font-medium text-gray-700">Your cart is empty</p>
          <p className="text-sm text-gray-500">Add some products to get started.</p>
          <Link
            href="/products"
            className="inline-block mt-2 bg-blue-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            Browse Products
          </Link>
        </div>
      ) : (
        <>
          {/* Item list */}
          <div className="space-y-3">
            {cart.items.map((item) => (
              <CartItemRow
                key={item.id}
                item={item}
                disabled={isMutating}
                onUpdate={(qty) =>
                  updateMutation.mutate({ id: item.id, quantity: qty })
                }
                onRemove={() => removeMutation.mutate(item.id)}
                isRemoving={
                  removeMutation.isPending &&
                  removeMutation.variables === item.id
                }
              />
            ))}
          </div>

          {/* Summary */}
          <div className="mt-6 bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex justify-between items-center text-lg font-bold text-gray-900">
              <span>Total</span>
              <span>${cart.total.toFixed(2)}</span>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-5">
              <button
                onClick={() => clearMutation.mutate()}
                disabled={isMutating}
                className="flex-1 border border-gray-300 text-gray-600 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {clearMutation.isPending ? 'Clearing...' : 'Clear Cart'}
              </button>
              <Link
                href="/checkout"
                className={`flex-1 text-center bg-blue-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors ${
                  isMutating ? 'pointer-events-none opacity-50' : ''
                }`}
              >
                Proceed to Checkout &gt;
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function CartItemRow({
  item,
  disabled,
  onUpdate,
  onRemove,
  isRemoving,
}: {
  item: CartItem;
  disabled: boolean;
  onUpdate: (qty: number) => void;
  onRemove: () => void;
  isRemoving: boolean;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 flex gap-4">
      {/* Image placeholder */}
      {item.productImageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={item.productImageUrl}
          alt={item.productName}
          className="w-16 h-16 object-cover rounded-lg bg-gray-100 flex-shrink-0"
        />
      ) : (
        <div className="w-16 h-16 rounded-lg bg-gray-100 flex-shrink-0" />
      )}

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 truncate">
          {item.productName}
        </p>
        <p className="text-sm text-gray-500 mt-0.5">
          ${item.unitPrice.toFixed(2)} each
        </p>

        <div className="flex items-center justify-between mt-3">
          {/* Quantity controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => onUpdate(item.quantity - 1)}
              disabled={disabled || item.quantity <= 1}
              className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 text-sm hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              aria-label="Decrease quantity"
            >
              -
            </button>
            <span className="w-6 text-center text-sm font-medium text-gray-900">
              {item.quantity}
            </span>
            <button
              onClick={() => onUpdate(item.quantity + 1)}
              disabled={disabled}
              className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 text-sm hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm font-bold text-gray-900">
              ${item.subtotal.toFixed(2)}
            </span>
            <button
              onClick={onRemove}
              disabled={disabled}
              className="text-xs text-red-500 hover:text-red-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {isRemoving ? 'Removing...' : 'Remove'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
      {message}
    </div>
  );
}
