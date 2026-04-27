'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { CartIcon } from '@/components/shop/catalog-ui';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/products', label: 'Products' },
  { href: '/#categories', label: 'Categories' },
];

export function Navbar() {
  const { isAuthenticated, user, logout } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <header className="sticky top-0 z-50 border-b border-white/70 bg-white/85 shadow-sm shadow-blue-100/50 backdrop-blur-xl">
      <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-sm font-black text-white shadow-lg shadow-blue-600/20">
            S
          </span>
          <span className="text-xl font-bold tracking-tight text-slate-950">
            Shop<span className="text-blue-600">Now</span>
          </span>
        </Link>

        <nav className="hidden items-center rounded-full border border-slate-200 bg-white/80 p-1 shadow-sm md:flex">
          {navLinks.map((link) => {
            const baseHref = link.href.split('#')[0];
            const isActive = link.href === '/' ? pathname === '/' : baseHref !== '/' && pathname.startsWith(baseHref);

            return (
              <Link
                key={link.label}
                href={link.href}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/20'
                    : 'text-slate-600 hover:bg-blue-50 hover:text-blue-700'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/cart"
            aria-label="Open cart"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-indigo-200 hover:text-indigo-600"
          >
            <CartIcon />
          </Link>
          {isAuthenticated ? (
            <>
              <Link
                href="/my-orders"
                className="hidden rounded-full px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-blue-50 hover:text-blue-700 sm:inline-flex"
              >
                My Orders
              </Link>
              {user?.role === 'Admin' && (
                <Link
                  href="/admin/dashboard"
                  className="rounded-full bg-indigo-50 px-3 py-2 text-sm font-bold text-indigo-700 hover:bg-indigo-100"
                >
                  Admin
                </Link>
              )}
              <span className="hidden text-sm font-medium text-slate-500 lg:inline">
                Hi, <span className="font-bold text-slate-800">{user?.firstName}</span>
              </span>
              <button
                onClick={handleLogout}
                className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm hover:border-red-200 hover:text-red-600"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-full px-4 py-2 text-sm font-bold text-slate-600 hover:bg-blue-50 hover:text-blue-700"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-bold text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-500"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>

      <div className="border-t border-slate-100 bg-white/85 px-4 py-2 md:hidden">
        <nav className="mx-auto flex max-w-7xl items-center gap-2 overflow-x-auto">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="shrink-0 rounded-full bg-slate-50 px-3 py-2 text-xs font-bold text-slate-600 hover:bg-blue-50 hover:text-blue-700"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
