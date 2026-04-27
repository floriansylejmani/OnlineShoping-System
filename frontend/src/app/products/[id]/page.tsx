'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { cartApi } from '@/features/cart/cart-api';
import { productsApi } from '@/features/products/products-api';
import { useAuthStore } from '@/store/auth-store';
import { ProductCard, ProductImage, formatPrice } from '@/components/shop/catalog-ui';

function getErrorMessage(err: unknown, fallback: string) {
  if (axios.isAxiosError(err)) {
    return err.response?.data?.errors?.[0] ?? fallback;
  }
  return fallback;
}

export default function ProductDetailsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const product = useQuery({
    queryKey: ['product', params.id],
    queryFn: () => productsApi.getProduct(params.id),
  });

  const related = useQuery({
    queryKey: ['related-products', product.data?.categoryId, params.id],
    enabled: Boolean(product.data?.categoryId),
    queryFn: () =>
      productsApi.getProducts({
        page: 1,
        pageSize: 4,
        categoryId: product.data?.categoryId,
      }),
  });

  const addToCartMutation = useMutation({
    mutationFn: () => cartApi.addItem({ productId: params.id, quantity: 1 }),
    onSuccess: (cart) => queryClient.setQueryData(['cart'], cart),
  });

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    addToCartMutation.mutate();
  };

  if (product.isLoading) {
    return (
      <main className="bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="h-[34rem] animate-pulse rounded-2xl border border-slate-200 bg-white" />
        </div>
      </main>
    );
  }

  if (product.isError || !product.data) {
    return (
      <main className="bg-slate-50">
        <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-red-100 bg-white p-10 shadow-sm">
            <h1 className="text-2xl font-black text-slate-950">Product could not be loaded</h1>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              {getErrorMessage(product.error, 'The product may no longer exist or the backend is unavailable.')}
            </p>
            <Link href="/products" className="mt-6 inline-flex rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white hover:bg-indigo-500">
              Back to products
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const item = product.data;
  const inStock = item.stockQuantity > 0;
  const relatedItems = related.data?.items.filter((candidate) => candidate.id !== item.id).slice(0, 4) ?? [];

  return (
    <main className="bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <Link href="/products" className="text-sm font-bold text-indigo-600 hover:text-indigo-500">
          Back to products
        </Link>

        <section className="mt-6 grid overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:grid-cols-2">
          <div className="aspect-[4/3] bg-slate-100 lg:aspect-auto">
            <ProductImage product={item} />
          </div>
          <div className="flex flex-col p-6 sm:p-8 lg:p-10">
            <span className="w-fit rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-600">
              {item.categoryName}
            </span>
            <h1 className="mt-5 text-3xl font-black tracking-tight text-slate-950 sm:text-5xl">{item.name}</h1>
            <p className="mt-5 text-base leading-7 text-slate-600">{item.description}</p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <span className="text-4xl font-black text-slate-950">{formatPrice(item.price)}</span>
              <span className={`rounded-full px-3 py-1 text-xs font-bold ${inStock ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                {inStock ? `${item.stockQuantity} in stock` : 'Out of stock'}
              </span>
            </div>
            {addToCartMutation.isError && (
              <p className="mt-5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                {getErrorMessage(addToCartMutation.error, 'Could not add item to cart.')}
              </p>
            )}
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={!inStock || addToCartMutation.isPending}
              className="mt-8 inline-flex min-h-12 items-center justify-center rounded-xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-600/20 transition-all duration-300 hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {addToCartMutation.isPending ? 'Adding...' : 'Add to Cart'}
            </button>
          </div>
        </section>

        {relatedItems.length > 0 && (
          <section className="mt-12">
            <div className="mb-6">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-600">Related products</p>
              <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">More from {item.categoryName}</h2>
            </div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {relatedItems.map((candidate) => (
                <ProductCard
                  key={candidate.id}
                  product={candidate}
                  onAddToCart={() => {
                    if (!isAuthenticated) {
                      router.push('/login');
                      return;
                    }
                    cartApi.addItem({ productId: candidate.id, quantity: 1 }).then((cart) => {
                      queryClient.setQueryData(['cart'], cart);
                    });
                  }}
                  isAdding={false}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
