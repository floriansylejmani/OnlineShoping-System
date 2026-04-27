'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminOrdersApi } from '@/features/admin/admin-orders-api';
import { getAdminErrorMessage } from '@/features/admin/admin-error';

const orderStatuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'] as const;

export default function AdminOrdersPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);

  const orders = useQuery({
    queryKey: ['admin-orders', page],
    queryFn: () => adminOrdersApi.getOrders(page, 10),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      adminOrdersApi.updateStatus(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      queryClient.invalidateQueries({ queryKey: ['admin-orders-summary'] });
    },
  });

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
        <p className="mt-1 text-sm text-gray-500">List all orders and update fulfillment status.</p>
      </div>

      {orders.isError && (
        <p className="text-sm text-red-600">
          {getAdminErrorMessage(orders.error, 'Unable to load orders.')}
        </p>
      )}
      {statusMutation.isError && (
        <p className="text-sm text-red-600">
          {getAdminErrorMessage(statusMutation.error, 'Unable to update order status.')}
        </p>
      )}

      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3">Created</th>
                <th className="px-4 py-3">Items</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.data?.items.map((order) => (
                <tr key={order.id}>
                  <td className="px-4 py-3 font-medium text-gray-900">{order.id.slice(0, 8)}</td>
                  <td className="px-4 py-3 text-gray-600">{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-gray-600">{order.items.length}</td>
                  <td className="px-4 py-3 text-gray-600">${order.totalAmount.toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <select
                      value={order.status}
                      disabled={statusMutation.isPending}
                      onChange={(event) => statusMutation.mutate({ id: order.id, status: event.target.value })}
                      className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {orderStatuses.map((status) => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {orders.isLoading && <p className="p-4 text-sm text-gray-500">Loading orders...</p>}
        {orders.data?.items.length === 0 && <p className="p-4 text-sm text-gray-500">No orders found.</p>}
      </div>

      {orders.data && orders.data.totalPages > 1 && (
        <div className="flex items-center justify-end gap-3">
          <button disabled={!orders.data.hasPreviousPage} onClick={() => setPage((current) => Math.max(1, current - 1))} className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium disabled:opacity-40">Previous</button>
          <span className="text-sm text-gray-600">Page {orders.data.page} of {orders.data.totalPages}</span>
          <button disabled={!orders.data.hasNextPage} onClick={() => setPage((current) => current + 1)} className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium disabled:opacity-40">Next</button>
        </div>
      )}
    </div>
  );
}
