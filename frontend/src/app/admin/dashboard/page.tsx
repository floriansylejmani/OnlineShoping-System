'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminDashboardApi } from '@/features/admin/admin-dashboard-api';

const actions = [
  { href: '/admin/products', label: 'Products', description: 'Create, edit, and deactivate products.' },
  { href: '/admin/categories', label: 'Categories', description: 'Maintain category names and catalog structure.' },
  { href: '/admin/orders', label: 'Orders', description: 'Review orders and update fulfillment status.' },
] as const;

function formatPrice(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

export default function AdminDashboardPage() {
  const dashboard = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: adminDashboardApi.getDashboard,
  });

  if (dashboard.isLoading) {
    return (
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="h-24 animate-pulse rounded-2xl border border-slate-200 bg-white" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-32 animate-pulse rounded-2xl border border-slate-200 bg-white" />
          ))}
        </div>
        <div className="grid gap-6 xl:grid-cols-[1.4fr_0.9fr]">
          <div className="h-80 animate-pulse rounded-2xl border border-slate-200 bg-white" />
          <div className="h-80 animate-pulse rounded-2xl border border-slate-200 bg-white" />
        </div>
      </div>
    );
  }

  if (dashboard.isError || !dashboard.data) {
    return (
      <div className="mx-auto max-w-3xl rounded-2xl border border-red-100 bg-white p-10 text-center shadow-sm">
        <h1 className="text-2xl font-black text-slate-950">Dashboard could not be loaded</h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500">
          Confirm the API is running and your account has the Admin role.
        </p>
        <button
          type="button"
          onClick={() => dashboard.refetch()}
          className="mt-6 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white hover:bg-indigo-500"
        >
          Try again
        </button>
      </div>
    );
  }

  const data = dashboard.data;

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <section className="rounded-2xl border border-indigo-100 bg-[linear-gradient(135deg,#ffffff,#eef2ff)] p-6 shadow-sm">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-600">
              Commerce overview
            </p>
            <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950">
              Admin dashboard
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Monitor catalog health, order activity, revenue, and fulfillment priorities from one place.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {actions.map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className="rounded-xl border border-indigo-100 bg-white px-4 py-2 text-sm font-bold text-indigo-600 shadow-sm hover:border-indigo-200 hover:bg-indigo-50"
              >
                {action.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Revenue" value={formatPrice(data.totalRevenue)} caption="Completed payments" />
        <KpiCard label="Orders" value={data.totalOrders.toString()} caption={`${data.pendingOrdersCount} pending`} />
        <KpiCard label="Products" value={data.totalProducts.toString()} caption={`${data.lowStockProductsCount} low stock`} />
        <KpiCard label="Categories" value={data.totalCategories.toString()} caption="Active departments" />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.45fr_0.9fr]">
        <Panel title="Recent orders" href="/admin/orders">
          {data.recentOrders.length === 0 ? (
            <EmptyState text="No orders yet." />
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
                    <th className="py-3 pr-4 font-bold">Customer</th>
                    <th className="py-3 pr-4 font-bold">Status</th>
                    <th className="py-3 pr-4 font-bold">Items</th>
                    <th className="py-3 pr-4 font-bold">Total</th>
                    <th className="py-3 font-bold">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.recentOrders.map((order) => (
                    <tr key={order.id}>
                      <td className="py-4 pr-4 font-semibold text-slate-800">{order.customerEmail}</td>
                      <td className="py-4 pr-4">
                        <StatusBadge status={order.status} />
                      </td>
                      <td className="py-4 pr-4 text-slate-500">{order.itemCount}</td>
                      <td className="py-4 pr-4 font-bold text-slate-950">
                        {formatPrice(order.totalAmount)}
                      </td>
                      <td className="py-4 text-slate-500">{formatDate(order.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>

        <Panel title="Low stock" href="/admin/products">
          {data.lowStockProducts.length === 0 ? (
            <EmptyState text="No low-stock products." />
          ) : (
            <div className="space-y-3">
              {data.lowStockProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3"
                >
                  <div>
                    <p className="font-bold text-slate-900">{product.name}</p>
                    <p className="mt-1 text-xs font-semibold text-slate-500">{product.categoryName}</p>
                  </div>
                  <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-black text-amber-700">
                    {product.stockQuantity} left
                  </span>
                </div>
              ))}
            </div>
          )}
        </Panel>
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <Panel title="Best sellers">
          {data.bestSellingProducts.length === 0 ? (
            <EmptyState text="Best sellers appear after orders are placed." />
          ) : (
            <div className="space-y-3">
              {data.bestSellingProducts.map((product, index) => (
                <div
                  key={product.productId}
                  className="grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-xl border border-slate-100 bg-white px-4 py-3"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-50 text-xs font-black text-indigo-600">
                    {index + 1}
                  </span>
                  <div>
                    <p className="font-bold text-slate-900">{product.productName}</p>
                    <p className="mt-1 text-xs font-semibold text-slate-500">
                      {product.quantitySold} sold
                    </p>
                  </div>
                  <p className="font-black text-slate-950">{formatPrice(product.revenue)}</p>
                </div>
              ))}
            </div>
          )}
        </Panel>

        <div className="grid gap-4 sm:grid-cols-3">
          {actions.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-100/60"
            >
              <h2 className="text-base font-black text-slate-950">{action.label}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">{action.description}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

function KpiCard({ label, value, caption }: { label: string; value: string; caption: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-bold text-slate-500">{label}</p>
      <p className="mt-3 text-3xl font-black tracking-tight text-slate-950">{value}</p>
      <p className="mt-2 text-sm font-semibold text-indigo-600">{caption}</p>
    </div>
  );
}

function Panel({
  title,
  href,
  children,
}: {
  title: string;
  href?: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-lg font-black text-slate-950">{title}</h2>
        {href && (
          <Link href={href} className="text-sm font-bold text-indigo-600 hover:text-indigo-500">
            View all
          </Link>
        )}
      </div>
      {children}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const className =
    status === 'Pending'
      ? 'bg-amber-50 text-amber-700'
      : status === 'Cancelled'
        ? 'bg-red-50 text-red-700'
        : 'bg-emerald-50 text-emerald-700';

  return <span className={`rounded-full px-3 py-1 text-xs font-black ${className}`}>{status}</span>;
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm font-semibold text-slate-500">
      {text}
    </div>
  );
}
