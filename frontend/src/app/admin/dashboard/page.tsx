'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { adminProductsApi } from '@/features/admin/admin-products-api';
import { adminCategoriesApi } from '@/features/admin/admin-categories-api';
import { adminOrdersApi } from '@/features/admin/admin-orders-api';

const cards = [
  { href: '/admin/products', label: 'Products', description: 'Create, edit, and deactivate products.' },
  { href: '/admin/categories', label: 'Categories', description: 'Maintain product category names.' },
  { href: '/admin/orders', label: 'Orders', description: 'Review orders and update fulfillment status.' },
] as const;

export default function AdminDashboardPage() {
  const products = useQuery({
    queryKey: ['admin-products-summary'],
    queryFn: () => adminProductsApi.getProducts({ page: 1, pageSize: 1 }),
  });
  const categories = useQuery({
    queryKey: ['admin-categories-summary'],
    queryFn: adminCategoriesApi.getCategories,
  });
  const orders = useQuery({
    queryKey: ['admin-orders-summary'],
    queryFn: () => adminOrdersApi.getOrders(1, 1),
  });

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">Manage catalog and order operations.</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <SummaryCard label="Products" value={products.data?.totalCount} loading={products.isLoading} />
        <SummaryCard label="Categories" value={categories.data?.length} loading={categories.isLoading} />
        <SummaryCard label="Orders" value={orders.data?.totalCount} loading={orders.isLoading} />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm transition hover:border-blue-200 hover:shadow-md"
          >
            <h2 className="text-base font-semibold text-gray-900">{card.label}</h2>
            <p className="mt-2 text-sm leading-6 text-gray-500">{card.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  loading,
}: {
  label: string;
  value: number | undefined;
  loading: boolean;
}) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p className="mt-2 text-3xl font-bold text-gray-900">{loading ? '...' : value ?? 0}</p>
    </div>
  );
}
