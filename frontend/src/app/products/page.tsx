'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import { cartApi } from '@/features/cart/cart-api';
import { useAuthStore } from '@/store/auth-store';
import type { PagedResult, Product, ProductQueryParams } from '@/types/product';
import type { Category } from '@/types/category';
import { ProductCard, SectionHeading, enrichCategory, fallbackCategories } from '@/components/shop/catalog-ui';

function useProducts(params: ProductQueryParams) {
  return useQuery({
    queryKey: ['products', params],
    queryFn: async () => {
      const res = await api.get<PagedResult<Product>>('/products', { params });
      return res.data;
    },
  });
}

function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await api.get<Category[]>('/categories');
      return res.data;
    },
  });
}

function getErrorMessage(err: unknown, fallback: string) {
  if (axios.isAxiosError(err)) {
    return err.response?.data?.errors?.[0] ?? fallback;
  }
  return fallback;
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<ProductsLoading />}>
      <ProductsContent />
    </Suspense>
  );
}

function ProductsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [search, setSearch] = useState(searchParams.get('search') ?? '');
  const [categoryId, setCategoryId] = useState(searchParams.get('categoryId') ?? '');
  const [page, setPage] = useState(1);

  const { data: categoriesData } = useCategories();
  const categories = useMemo(
    () => (categoriesData?.length ? categoriesData : fallbackCategories).map(enrichCategory),
    [categoriesData],
  );

  useEffect(() => {
    const categoryName = searchParams.get('category');
    const queryCategoryId = searchParams.get('categoryId');

    if (queryCategoryId) {
      setCategoryId(queryCategoryId);
      return;
    }

    if (categoryName && categoriesData?.length) {
      const match = categoriesData.find((category) => category.name.toLowerCase() === categoryName.toLowerCase());
      if (match) {
        setCategoryId(match.id);
      }
    }
  }, [categoriesData, searchParams]);

  const params: ProductQueryParams = {
    page,
    pageSize: 12,
    search: search || undefined,
    categoryId: categoryId || undefined,
  };

  const { data, isLoading, isError } = useProducts(params);
  const activeCategory = categories.find((category) => category.id === categoryId);

  const addToCartMutation = useMutation({
    mutationFn: (productId: string) => cartApi.addItem({ productId, quantity: 1 }),
    onSuccess: (cart) => queryClient.setQueryData(['cart'], cart),
  });

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPage(1);
  };

  const handleCategory = (id: string) => {
    setCategoryId(id);
    setPage(1);
  };

  const handleAddToCart = (productId: string) => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    addToCartMutation.mutate(productId);
  };

  return (
    <div className="bg-slate-50">
      <section className="border-b border-indigo-100 bg-[radial-gradient(circle_at_12%_10%,#e0f2fe,transparent_28%),linear-gradient(135deg,#ffffff,#eef2ff)]">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-600">Fresh catalog</p>
            <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">Shop products</h1>
            <p className="mt-4 text-base leading-7 text-slate-600">
              Browse ShopNow products with search, category filters, stock-aware cards, and the existing cart flow.
            </p>
          </div>
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <Metric value={data ? data.totalCount.toString() : '--'} label="Products found" />
            <Metric value={activeCategory?.name ?? 'All'} label="Active category" />
            <Metric value="Secure" label="Cart actions" />
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {addToCartMutation.isError && (
          <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-semibold text-red-700">
            {getErrorMessage(addToCartMutation.error, 'Could not add item to cart.')}
          </div>
        )}

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <form onSubmit={handleSearch} className="flex flex-col gap-3 lg:flex-row">
            <div className="relative flex-1">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products, brands, or categories..."
                className="min-h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-950 outline-none transition-all duration-300 placeholder:text-slate-400 focus:border-indigo-300 focus:bg-white focus:ring-4 focus:ring-indigo-100"
              />
            </div>
            <button type="submit" className="rounded-xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-600/20 transition-all duration-300 hover:-translate-y-1 hover:bg-indigo-500">
              Search
            </button>
          </form>

          <div className="mt-5 flex gap-2 overflow-x-auto pb-1">
            <button
              type="button"
              onClick={() => handleCategory('')}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-bold transition-all duration-300 ${!categoryId ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'border border-slate-200 bg-white text-slate-600 hover:border-indigo-200 hover:text-indigo-600'}`}
            >
              All categories
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() => handleCategory(category.id)}
                className={`shrink-0 rounded-full px-4 py-2 text-sm font-bold transition-all duration-300 ${categoryId === category.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'border border-slate-200 bg-white text-slate-600 hover:border-indigo-200 hover:text-indigo-600'}`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-10">
          <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <SectionHeading
              eyebrow="Product grid"
              title={activeCategory ? activeCategory.name : 'All products'}
              description={data ? `${data.totalCount} product${data.totalCount === 1 ? '' : 's'} available with current filters.` : 'Loading products from the backend catalog.'}
            />
          </div>

          {isLoading && (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className="h-[25rem] animate-pulse rounded-2xl border border-slate-200 bg-white" />
              ))}
            </div>
          )}

          {isError && (
            <div className="rounded-2xl border border-red-100 bg-white p-10 text-center shadow-sm">
              <h2 className="text-2xl font-black text-slate-950">Products could not be loaded</h2>
              <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500">Make sure the backend is running and the API URL is configured correctly.</p>
            </div>
          )}

          {data && data.items.length === 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
              <h2 className="text-2xl font-black text-slate-950">No products found</h2>
              <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500">Try a different search term or clear the selected category.</p>
              <button type="button" onClick={() => { setSearch(''); setCategoryId(''); setPage(1); }} className="mt-6 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white hover:bg-indigo-500">
                Clear filters
              </button>
            </div>
          )}

          {data && data.items.length > 0 && (
            <>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {data.items.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={() => handleAddToCart(product.id)}
                    isAdding={addToCartMutation.isPending && addToCartMutation.variables === product.id}
                  />
                ))}
              </div>

              {data.totalPages > 1 && (
                <div className="mt-10 flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={!data.hasPreviousPage}
                    className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm transition-all duration-300 hover:border-indigo-200 hover:text-indigo-600 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Previous
                  </button>
                  <span className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-500 shadow-sm">
                    Page {data.page} of {data.totalPages}
                  </span>
                  <button
                    type="button"
                    onClick={() => setPage((p) => p + 1)}
                    disabled={!data.hasNextPage}
                    className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm transition-all duration-300 hover:border-indigo-200 hover:text-indigo-600 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function ProductsLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="h-48 animate-pulse rounded-2xl border border-slate-200 bg-white" />
      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="h-[25rem] animate-pulse rounded-2xl border border-slate-200 bg-white" />
        ))}
      </div>
    </div>
  );
}

function Metric({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-2xl border border-white bg-white/75 p-4 shadow-sm shadow-indigo-100 backdrop-blur">
      <p className="text-2xl font-black text-slate-950">{value}</p>
      <p className="mt-1 text-sm font-medium text-slate-500">{label}</p>
    </div>
  );
}
