'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { cartApi } from '@/features/cart/cart-api';
import { useAuthStore } from '@/store/auth-store';
import type { Category } from '@/types/category';
import type { PagedResult, Product } from '@/types/product';
import {
  CartIcon,
  CategoryCard,
  ProductCard,
  ProductImage,
  SectionHeading,
  ShopFooter,
  SparkIcon,
  enrichCategory,
  fallbackCategories,
  formatPrice,
} from '@/components/shop/catalog-ui';

function useHomeProducts() {
  return useQuery({
    queryKey: ['home-products'],
    queryFn: async () => {
      const res = await api.get<PagedResult<Product>>('/products', {
        params: { page: 1, pageSize: 8 },
      });
      return res.data;
    },
    retry: 1,
  });
}

function useHomeCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await api.get<Category[]>('/categories');
      return res.data;
    },
    retry: 1,
  });
}

function HeroSection({ products, totalProducts }: { products: Product[]; totalProducts: number }) {
  const showcase = products.slice(0, 4);

  return (
    <section className="relative isolate overflow-hidden bg-[radial-gradient(circle_at_10%_5%,#e0f2fe,transparent_28%),radial-gradient(circle_at_88%_12%,#eef2ff,transparent_30%),linear-gradient(135deg,#ffffff_0%,#f8fafc_48%,#eef2ff_100%)]">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 pb-14 pt-10 sm:px-6 lg:grid-cols-[1.02fr_0.98fr] lg:px-8 lg:pb-20 lg:pt-16">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-white/80 px-4 py-2 text-sm font-bold text-indigo-600 shadow-sm backdrop-blur">
            <span className="h-2 w-2 rounded-full bg-sky-400" />
            Premium shopping, live catalog, secure checkout
          </div>
          <h1 className="mt-6 max-w-3xl text-4xl font-black tracking-tight text-slate-950 sm:text-6xl lg:text-7xl">
            Shop smarter with ShopNow
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
            Discover products across books, drinks, electronics, fashion, home and kitchen, snacks, sports, and sweets in one clean online shopping system.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/products" className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-7 py-4 text-base font-bold text-white shadow-xl shadow-indigo-600/20 transition-all duration-300 hover:-translate-y-1 hover:bg-indigo-500">
              Shop Now
            </Link>
            <a href="#categories" className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-7 py-4 text-base font-bold text-slate-950 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-indigo-200 hover:text-indigo-600">
              Explore Categories
            </a>
          </div>
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {[[`${Math.max(totalProducts, 60)}+`, 'Products'], ['8', 'Categories'], ['24/7', 'Shopping']].map(([value, label]) => (
              <div key={label} className="rounded-2xl border border-white bg-white/75 p-4 shadow-sm shadow-indigo-100 backdrop-blur">
                <p className="text-2xl font-black text-slate-950">{value}</p>
                <p className="mt-1 text-sm font-medium text-slate-500">{label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative">
          <div className="absolute -left-2 top-8 z-10 hidden rounded-2xl border border-white bg-white/90 p-4 shadow-xl shadow-sky-200/60 backdrop-blur sm:block">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white">
                <CartIcon />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Cart</p>
                <p className="text-sm font-bold text-slate-950">Ready to checkout</p>
              </div>
            </div>
          </div>
          <div className="rounded-[2rem] border border-white bg-white/65 p-3 shadow-2xl shadow-indigo-100 backdrop-blur sm:p-4">
            <div className="grid gap-3 rounded-[1.5rem] border border-indigo-100 bg-white p-3 sm:grid-cols-2">
              {(showcase.length ? showcase : []).map((product, index) => (
                <article key={product.id} className={`group overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${index === 0 ? 'sm:row-span-2' : ''}`}>
                  <div className={`${index === 0 ? 'aspect-[4/5]' : 'aspect-[16/10]'} overflow-hidden bg-slate-100`}>
                    <ProductImage product={product} />
                  </div>
                  <div className="p-4">
                    <div className="flex items-center justify-between gap-2">
                      <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-600">{product.categoryName}</span>
                      <span className="text-sm font-black text-slate-950">{formatPrice(product.price)}</span>
                    </div>
                    <h3 className="mt-3 line-clamp-1 text-sm font-bold text-slate-950">{product.name}</h3>
                  </div>
                </article>
              ))}
              {!showcase.length && fallbackCategories.slice(0, 4).map((category, index) => (
                <article key={category.id} className={`overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm ${index === 0 ? 'sm:row-span-2' : ''}`}>
                  <div className={`${index === 0 ? 'aspect-[4/5]' : 'aspect-[16/10]'} flex items-center justify-center bg-gradient-to-br from-sky-50 to-indigo-100`}>
                    <span className="text-4xl font-black text-indigo-500">{category.name.charAt(0)}</span>
                  </div>
                  <div className="p-4">
                    <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-600">{category.name}</span>
                    <h3 className="mt-3 text-sm font-bold text-slate-950">Curated {category.name}</h3>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function CategoriesSection({ categories, isLoading }: { categories: ReturnType<typeof enrichCategory>[]; isLoading: boolean }) {
  return (
    <section id="categories" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <SectionHeading
          eyebrow="Shop by category"
          title="Browse clean, curated departments"
          description="Find the right products quickly across ShopNow's eight core categories."
        />
        <Link href="/products" className="inline-flex w-fit rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-950 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-indigo-200 hover:text-indigo-600">
          Browse all
        </Link>
      </div>
      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {isLoading
          ? Array.from({ length: 8 }).map((_, index) => <div key={index} className="h-64 animate-pulse rounded-2xl border border-slate-200 bg-white" />)
          : categories.map((category) => <CategoryCard key={category.id} category={category} />)}
      </div>
    </section>
  );
}

function FeaturedProductsSection({
  products,
  isLoading,
  isError,
  isAdding,
  addingProductId,
  onAddToCart,
  onRetry,
}: {
  products: Product[];
  isLoading: boolean;
  isError: boolean;
  isAdding: boolean;
  addingProductId?: string;
  onAddToCart: (productId: string) => void;
  onRetry: () => void;
}) {
  return (
    <section className="bg-white py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <SectionHeading
            eyebrow="Featured products"
            title="Popular picks from the live catalog"
            description="Products are loaded from the existing backend and keep the same cart behavior."
          />
          <Link href="/products" className="inline-flex w-fit rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-950 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-indigo-200 hover:text-indigo-600">
            View all products
          </Link>
        </div>
        {isLoading && (
          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => <div key={index} className="h-[25rem] animate-pulse rounded-2xl border border-slate-200 bg-slate-50" />)}
          </div>
        )}
        {isError && (
          <div className="mt-8 rounded-2xl border border-indigo-100 bg-indigo-50 p-8 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 text-white"><SparkIcon /></div>
            <h3 className="mt-5 text-2xl font-black text-slate-950">Products could not be loaded</h3>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-500">Make sure the backend is running, then refresh this section.</p>
            <button type="button" onClick={onRetry} className="mt-6 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white hover:bg-indigo-500">
              Refresh products
            </button>
          </div>
        )}
        {!isLoading && !isError && products.length === 0 && (
          <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-8 text-center text-sm font-semibold text-slate-500">
            No featured products are available yet.
          </div>
        )}
        {products.length > 0 && (
          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={() => onAddToCart(product.id)}
                isAdding={isAdding && addingProductId === product.id}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function BenefitsSection() {
  const benefits = [
    ['Fast Delivery', 'A streamlined shopping flow designed around quick decisions.'],
    ['Secure Payment', 'Protected checkout actions and authenticated customer flows.'],
    ['Quality Products', 'Clear product details, stock status, and category context.'],
    ['Easy Shopping', 'Responsive layouts that work cleanly on every screen size.'],
  ] as const;

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <SectionHeading eyebrow="Benefits" title="Everything feels simple, fast, and trustworthy" description="ShopNow presents the existing online shopping system with a polished customer experience." />
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {benefits.map(([title, copy]) => (
          <div key={title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-100/70">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-sky-400 text-white"><SparkIcon /></div>
            <h3 className="mt-5 text-lg font-black text-slate-950">{title}</h3>
            <p className="mt-3 text-sm leading-6 text-slate-500">{copy}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function PromoBanner() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="relative overflow-hidden rounded-[2rem] border border-indigo-100 bg-[linear-gradient(135deg,#eef2ff,#e0f2fe_55%,#ffffff)] p-8 shadow-xl shadow-indigo-100 sm:p-12">
        <div className="max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-600">Limited showcase</p>
          <h2 className="mt-4 text-3xl font-black tracking-tight text-slate-950 sm:text-5xl">Build a better basket with premium everyday picks.</h2>
          <p className="mt-5 text-base leading-7 text-slate-600">Shop across all categories, add products to cart, and continue through the existing checkout flow.</p>
          <Link href="/products" className="mt-7 inline-flex rounded-xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-600/20 transition-all duration-300 hover:-translate-y-1 hover:bg-indigo-500">
            Shop the collection
          </Link>
        </div>
      </div>
    </section>
  );
}

function NewsletterSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8 lg:p-10">
        <div className="grid items-center gap-6 md:grid-cols-[1fr_0.9fr]">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-600">Newsletter</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950">Get new arrivals and offers.</h2>
            <p className="mt-3 text-sm leading-6 text-slate-500">A polished newsletter UI ready for a future integration.</p>
          </div>
          <form className="flex flex-col gap-3 sm:flex-row">
            <input type="email" placeholder="Enter your email" className="min-h-12 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-950 outline-none focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100" />
            <button type="button" className="rounded-xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-500">
              Subscribe
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

export function HomeLanding() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const productsQuery = useHomeProducts();
  const categoriesQuery = useHomeCategories();

  const addToCartMutation = useMutation({
    mutationFn: (productId: string) => cartApi.addItem({ productId, quantity: 1 }),
    onSuccess: (cart) => queryClient.setQueryData(['cart'], cart),
  });

  const categories = (categoriesQuery.data?.length ? categoriesQuery.data : fallbackCategories).map(enrichCategory);
  const products = productsQuery.data?.items ?? [];

  const handleAddToCart = (productId: string) => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    addToCartMutation.mutate(productId);
  };

  return (
    <div className="overflow-hidden bg-slate-50">
      <HeroSection products={products} totalProducts={productsQuery.data?.totalCount ?? 60} />
      <CategoriesSection categories={categories} isLoading={categoriesQuery.isLoading} />
      <FeaturedProductsSection
        products={products.slice(0, 8)}
        isLoading={productsQuery.isLoading}
        isError={productsQuery.isError}
        isAdding={addToCartMutation.isPending}
        addingProductId={addToCartMutation.variables}
        onAddToCart={handleAddToCart}
        onRetry={() => productsQuery.refetch()}
      />
      <BenefitsSection />
      <PromoBanner />
      <NewsletterSection />
      <ShopFooter categories={categories} />
    </div>
  );
}
