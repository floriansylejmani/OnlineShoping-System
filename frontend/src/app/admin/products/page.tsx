'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminCategoriesApi } from '@/features/admin/admin-categories-api';
import { adminProductsApi } from '@/features/admin/admin-products-api';
import { getAdminErrorMessage } from '@/features/admin/admin-error';
import type { CreateProductRequest, Product, ProductQueryParams } from '@/types/product';

type ProductFormState = CreateProductRequest & { isActive: boolean };

const emptyForm: ProductFormState = {
  name: '',
  description: '',
  price: 0,
  stockQuantity: 0,
  imageUrl: '',
  categoryId: '',
  isActive: true,
};

export default function AdminProductsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState<ProductFormState>(emptyForm);

  const params: ProductQueryParams = useMemo(() => ({ page, pageSize: 10 }), [page]);
  const products = useQuery({
    queryKey: ['admin-products', params],
    queryFn: () => adminProductsApi.getProducts(params),
  });
  const categories = useQuery({
    queryKey: ['admin-categories'],
    queryFn: adminCategoriesApi.getCategories,
  });

  const invalidateProducts = () => {
    queryClient.invalidateQueries({ queryKey: ['admin-products'] });
    queryClient.invalidateQueries({ queryKey: ['admin-products-summary'] });
  };

  const saveMutation = useMutation({
    mutationFn: () => {
      if (editing) {
        return adminProductsApi.updateProduct(editing.id, form);
      }
      const createData = {
        name: form.name,
        description: form.description,
        price: form.price,
        stockQuantity: form.stockQuantity,
        imageUrl: form.imageUrl,
        categoryId: form.categoryId,
      };
      return adminProductsApi.createProduct(createData);
    },
    onSuccess: () => {
      invalidateProducts();
      setEditing(null);
      setForm(emptyForm);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminProductsApi.deleteProduct(id),
    onSuccess: invalidateProducts,
  });

  const startEdit = (product: Product) => {
    setEditing(product);
    setForm({
      name: product.name,
      description: product.description,
      price: product.price,
      stockQuantity: product.stockQuantity,
      imageUrl: product.imageUrl,
      categoryId: product.categoryId,
      isActive: product.isActive,
    });
  };

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    saveMutation.mutate();
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Products</h1>
        <p className="mt-1 text-sm text-gray-500">List, create, update, and soft delete catalog items.</p>
      </div>

      <form onSubmit={submit} className="grid gap-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm md:grid-cols-2">
        <Field label="Name">
          <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input" />
        </Field>
        <Field label="Category">
          <select required value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} className="input bg-white">
            <option value="">Select category</option>
            {categories.data?.map((category) => (
              <option key={category.id} value={category.id}>{category.name}</option>
            ))}
          </select>
        </Field>
        <Field label="Price">
          <input required min="0" step="0.01" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} className="input" />
        </Field>
        <Field label="Stock">
          <input required min="0" type="number" value={form.stockQuantity} onChange={(e) => setForm({ ...form, stockQuantity: Number(e.target.value) })} className="input" />
        </Field>
        <Field label="Image URL">
          <input value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} className="input" />
        </Field>
        {editing && (
          <Field label="Status">
            <select value={String(form.isActive)} onChange={(e) => setForm({ ...form, isActive: e.target.value === 'true' })} className="input bg-white">
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </Field>
        )}
        <Field label="Description">
          <textarea required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input min-h-24" />
        </Field>
        <div className="flex items-end gap-2">
          <button disabled={saveMutation.isPending} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50">
            {editing ? 'Update product' : 'Create product'}
          </button>
          {editing && (
            <button type="button" onClick={() => { setEditing(null); setForm(emptyForm); }} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50">
              Cancel
            </button>
          )}
        </div>
      </form>

      {products.isError && (
        <p className="text-sm text-red-600">
          {getAdminErrorMessage(products.error, 'Unable to load products.')}
        </p>
      )}
      {saveMutation.isError && (
        <p className="text-sm text-red-600">
          {getAdminErrorMessage(saveMutation.error, 'Unable to save product.')}
        </p>
      )}
      {deleteMutation.isError && (
        <p className="text-sm text-red-600">
          {getAdminErrorMessage(deleteMutation.error, 'Unable to delete product.')}
        </p>
      )}

      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Stock</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.data?.items.map((product) => (
                <tr key={product.id}>
                  <td className="px-4 py-3 font-medium text-gray-900">{product.name}</td>
                  <td className="px-4 py-3 text-gray-600">{product.categoryName}</td>
                  <td className="px-4 py-3 text-gray-600">${product.price.toFixed(2)}</td>
                  <td className="px-4 py-3 text-gray-600">{product.stockQuantity}</td>
                  <td className="px-4 py-3 text-gray-600">{product.isActive ? 'Active' : 'Inactive'}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => startEdit(product)} className="mr-3 text-sm font-semibold text-blue-600 hover:text-blue-800">Edit</button>
                    <button disabled={!product.isActive || deleteMutation.isPending} onClick={() => deleteMutation.mutate(product.id)} className="text-sm font-semibold text-red-600 hover:text-red-800 disabled:text-gray-300">Soft delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {products.isLoading && <p className="p-4 text-sm text-gray-500">Loading products...</p>}
        {products.data?.items.length === 0 && <p className="p-4 text-sm text-gray-500">No products found.</p>}
      </div>

      {products.data && products.data.totalPages > 1 && (
        <div className="flex items-center justify-end gap-3">
          <button disabled={!products.data.hasPreviousPage} onClick={() => setPage((current) => Math.max(1, current - 1))} className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium disabled:opacity-40">Previous</button>
          <span className="text-sm text-gray-600">Page {products.data.page} of {products.data.totalPages}</span>
          <button disabled={!products.data.hasNextPage} onClick={() => setPage((current) => current + 1)} className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium disabled:opacity-40">Next</button>
        </div>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block text-sm font-medium text-gray-700">
      <span className="mb-1 block">{label}</span>
      {children}
    </label>
  );
}
