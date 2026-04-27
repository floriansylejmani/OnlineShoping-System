import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ProductCard } from './catalog-ui';
import type { Product } from '@/types/product';

const baseProduct: Product = {
  id: 'product-1',
  name: 'Wireless Headphones',
  description: 'Comfortable headphones with clear sound.',
  price: 49.99,
  stockQuantity: 12,
  imageUrl: '',
  isActive: true,
  categoryId: 'category-1',
  categoryName: 'Electronics',
  createdAt: '2026-04-27T00:00:00Z',
};

describe('ProductCard', () => {
  it('renders product name, price, and in-stock state', () => {
    render(<ProductCard product={baseProduct} onAddToCart={vi.fn()} isAdding={false} />);

    expect(screen.getByRole('heading', { name: /wireless headphones/i })).toBeInTheDocument();
    expect(screen.getByText('$49.99')).toBeInTheDocument();
    expect(screen.getByText('In stock')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add to cart/i })).toBeEnabled();
  });

  it('disables add to cart when product is out of stock', () => {
    render(
      <ProductCard
        product={{ ...baseProduct, stockQuantity: 0 }}
        onAddToCart={vi.fn()}
        isAdding={false}
      />,
    );

    expect(screen.getByText('Out')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add to cart/i })).toBeDisabled();
  });
});
