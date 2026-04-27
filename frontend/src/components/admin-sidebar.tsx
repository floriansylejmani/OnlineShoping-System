'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
  { href: '/admin/dashboard', label: 'Dashboard' },
  { href: '/admin/products', label: 'Products' },
  { href: '/admin/categories', label: 'Categories' },
  { href: '/admin/orders', label: 'Orders' },
] as const;

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="border-b border-gray-200 bg-white md:w-56 md:flex-shrink-0 md:border-b-0 md:border-r">
      <div className="p-3 md:p-4">
        <p className="mb-3 px-2 text-xs font-bold uppercase tracking-widest text-gray-400">
          Admin
        </p>
        <nav className="flex gap-2 overflow-x-auto md:block md:space-y-1 md:overflow-visible">
          {NAV_ITEMS.map(({ href, label }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-colors md:block ${
                  active
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                {label}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
