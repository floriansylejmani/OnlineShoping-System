'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import type { Category } from '@/types/category';
import type { Product } from '@/types/product';

export type EnrichedCategory = Category & {
  description: string;
  accent: string;
  icon: ReactNode;
};

export const fallbackCategories: Category[] = [
  { id: 'books', name: 'Books', productCount: 0 },
  { id: 'drinks', name: 'Drinks', productCount: 0 },
  { id: 'electronics', name: 'Electronics', productCount: 0 },
  { id: 'fashion', name: 'Fashion', productCount: 0 },
  { id: 'home-kitchen', name: 'Home & Kitchen', productCount: 0 },
  { id: 'salty', name: 'Salty', productCount: 0 },
  { id: 'sports', name: 'Sports', productCount: 0 },
  { id: 'sweet', name: 'Sweet', productCount: 0 },
];

const categoryMeta: Record<string, Omit<EnrichedCategory, keyof Category>> = {
  books: {
    description: 'New reads, study picks, and thoughtful gifts for every shelf.',
    accent: 'from-indigo-50 via-white to-sky-50 text-indigo-600 border-indigo-100',
    icon: <BookIcon />,
  },
  drinks: {
    description: 'Refreshing drinks, juices, water, and everyday favorites.',
    accent: 'from-sky-50 via-white to-cyan-50 text-sky-600 border-sky-100',
    icon: <CupIcon />,
  },
  electronics: {
    description: 'Smart tech, useful accessories, and modern essentials.',
    accent: 'from-blue-50 via-white to-indigo-50 text-blue-600 border-blue-100',
    icon: <DeviceIcon />,
  },
  fashion: {
    description: 'Clean style pieces and accessories for everyday wear.',
    accent: 'from-violet-50 via-white to-indigo-50 text-violet-600 border-violet-100',
    icon: <FashionIcon />,
  },
  'home & kitchen': {
    description: 'Helpful home goods, kitchen basics, and practical upgrades.',
    accent: 'from-slate-50 via-white to-sky-50 text-slate-700 border-slate-100',
    icon: <HomeIcon />,
  },
  salty: {
    description: 'Crunchy snacks, pantry bites, and savory favorites.',
    accent: 'from-sky-50 via-white to-indigo-50 text-indigo-600 border-indigo-100',
    icon: <SnackIcon />,
  },
  sports: {
    description: 'Training gear, active essentials, and outdoor picks.',
    accent: 'from-cyan-50 via-white to-blue-50 text-cyan-700 border-cyan-100',
    icon: <SportIcon />,
  },
  sweet: {
    description: 'Desserts, candies, chocolates, and small treats.',
    accent: 'from-indigo-50 via-white to-blue-50 text-indigo-600 border-indigo-100',
    icon: <SparkIcon />,
  },
};

export function enrichCategory(category: Category): EnrichedCategory {
  const meta = categoryMeta[category.name.toLowerCase()] ?? {
    description: 'A curated department of useful everyday products.',
    accent: 'from-indigo-50 via-white to-sky-50 text-indigo-600 border-indigo-100',
    icon: <SparkIcon />,
  };

  return { ...category, ...meta };
}

export function formatPrice(price: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price);
}

export function ProductImage({ product, className = '' }: { product: Product; className?: string }) {
  if (product.imageUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={product.imageUrl}
        alt={product.name}
        className={`h-full w-full object-cover transition-all duration-500 group-hover:scale-105 ${className}`}
      />
    );
  }

  return (
    <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_30%_20%,#e0f2fe,transparent_35%),linear-gradient(135deg,#ffffff,#eef2ff)]">
      <div className="rounded-2xl border border-white/80 bg-white/75 px-4 py-3 text-sm font-bold text-indigo-500 shadow-sm">
        ShopNow
      </div>
    </div>
  );
}

export function CategoryCard({ category }: { category: EnrichedCategory }) {
  return (
    <Link
      href={`/products?category=${encodeURIComponent(category.name)}`}
      className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-100/70"
    >
      <div className={`border-b bg-gradient-to-br ${category.accent} p-5`}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/85 shadow-sm">
            {category.icon}
          </div>
          <span className="rounded-full bg-white/85 px-3 py-1 text-xs font-bold text-slate-600 shadow-sm">
            {category.productCount || 0} items
          </span>
        </div>
        <div className="mt-8 h-12 rounded-2xl bg-white/35 shadow-inner" />
      </div>
      <div className="p-5">
        <h3 className="text-lg font-bold text-slate-950">{category.name}</h3>
        <p className="mt-2 min-h-12 text-sm leading-6 text-slate-500">{category.description}</p>
        <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
          <span className="text-sm font-semibold text-slate-500">Explore collection</span>
          <span className="text-sm font-bold text-indigo-600 transition-transform duration-300 group-hover:translate-x-1">View</span>
        </div>
      </div>
    </Link>
  );
}

export function ProductCard({
  product,
  onAddToCart,
  isAdding,
}: {
  product: Product;
  onAddToCart: () => void;
  isAdding: boolean;
}) {
  const inStock = product.stockQuantity > 0;

  return (
    <article className="group flex overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-100/70">
      <div className="flex w-full flex-col">
        <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
          <ProductImage product={product} />
          <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-indigo-600 shadow-sm ring-1 ring-indigo-100 backdrop-blur">
            {product.categoryName}
          </span>
        </div>
        <div className="flex flex-1 flex-col p-5">
          <div className="flex items-center gap-1 text-xs font-semibold text-slate-500">
            <span className="text-sky-500">*****</span>
            <span>Trusted pick</span>
          </div>
          <h3 className="mt-3 line-clamp-2 min-h-12 text-base font-bold leading-6 text-slate-950">{product.name}</h3>
          <p className="mt-2 line-clamp-2 min-h-10 text-sm leading-5 text-slate-500">{product.description}</p>
          <div className="mt-5 flex items-center justify-between gap-3">
            <span className="text-2xl font-black tracking-tight text-slate-950">{formatPrice(product.price)}</span>
            <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${inStock ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
              {inStock ? 'In stock' : 'Out'}
            </span>
          </div>
          <button
            type="button"
            onClick={onAddToCart}
            disabled={isAdding || !inStock}
            className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-600/20 transition-all duration-300 hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isAdding ? 'Adding...' : 'Add to Cart'}
          </button>
          <Link
            href={`/products/${product.id}`}
            className="mt-3 inline-flex w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition-all duration-300 hover:border-indigo-200 hover:text-indigo-600"
          >
            View details
          </Link>
        </div>
      </div>
    </article>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="max-w-2xl">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-600">{eyebrow}</p>
      <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">{title}</h2>
      <p className="mt-3 text-base leading-7 text-slate-500">{description}</p>
    </div>
  );
}

export function ShopFooter({ categories }: { categories: EnrichedCategory[] }) {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-2 lg:grid-cols-[1.35fr_0.75fr_0.85fr_1fr] lg:px-8">
        <div>
          <Link href="/" className="inline-flex items-center gap-2 text-2xl font-black tracking-tight text-slate-950">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-600 text-sm font-black text-white shadow-lg shadow-indigo-600/20">S</span>
            Shop<span className="text-indigo-600">Now</span>
          </Link>
          <p className="mt-4 max-w-sm text-sm leading-6 text-slate-500">
            A clean online shopping system for browsing, cart management, checkout, and order tracking.
          </p>
        </div>
        <FooterColumn title="Quick Links" links={[['Home', '/'], ['Products', '/products'], ['Categories', '/#categories'], ['Cart', '/cart']]} />
        <FooterColumn title="Categories" links={categories.slice(0, 8).map((category) => [category.name, `/products?category=${encodeURIComponent(category.name)}`])} />
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wide text-slate-950">Contact</h3>
          <div className="mt-4 grid gap-2 text-sm leading-6 text-slate-500">
            <p>support@shopnow.local</p>
            <p>Budapest, Hungary</p>
            <p>Secure shopping support</p>
          </div>
        </div>
      </div>
      <div className="border-t border-slate-200 px-4 py-5 text-center text-sm text-slate-500">
        Copyright 2026 ShopNow. All rights reserved.
      </div>
    </footer>
  );
}

function FooterColumn({ title, links }: { title: string; links: Array<[string, string]> }) {
  return (
    <div>
      <h3 className="text-sm font-bold uppercase tracking-wide text-slate-950">{title}</h3>
      <div className="mt-4 grid gap-3 text-sm text-slate-500">
        {links.map(([label, href]) => (
          <Link key={label} href={href} className="hover:text-indigo-600">
            {label}
          </Link>
        ))}
      </div>
    </div>
  );
}

export function CartIcon() {
  return (
    <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M6 6h15l-2 8H8L6 3H3" />
      <path d="M9 20a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" />
      <path d="M18 20a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" />
    </svg>
  );
}

function BookIcon() { return <Icon><path d="M5 4h9a4 4 0 0 1 4 4v12H8a3 3 0 0 0-3-3V4Z" /><path d="M8 4v13" /></Icon>; }
function CupIcon() { return <Icon><path d="M8 3h8l-1 18H9L8 3Z" /><path d="M9 7h6" /><path d="m16 3 2-2" /></Icon>; }
function DeviceIcon() { return <Icon><rect x="5" y="4" width="14" height="16" rx="3" /><path d="M10 17h4" /></Icon>; }
function FashionIcon() { return <Icon><path d="M8 4 5 7l3 3v10h8V10l3-3-3-3-2 2h-4L8 4Z" /></Icon>; }
function HomeIcon() { return <Icon><path d="m4 11 8-7 8 7" /><path d="M6 10v10h12V10" /><path d="M10 20v-6h4v6" /></Icon>; }
function SnackIcon() { return <Icon><path d="M7 3h10l2 18H5L7 3Z" /><path d="M8 8h8" /><path d="M9 13h6" /></Icon>; }
function SportIcon() { return <Icon><circle cx="12" cy="12" r="8" /><path d="M4 12h16" /><path d="M12 4a12 12 0 0 1 0 16" /></Icon>; }
export function SparkIcon() { return <Icon><path d="M12 3v4" /><path d="M12 17v4" /><path d="M3 12h4" /><path d="M17 12h4" /><path d="m6 6 2.5 2.5" /><path d="m15.5 15.5 2.5 2.5" /><path d="m18 6-2.5 2.5" /><path d="m8.5 15.5-2.5 2.5" /></Icon>; }

function Icon({ children }: { children: ReactNode }) {
  return (
    <svg aria-hidden="true" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      {children}
    </svg>
  );
}
