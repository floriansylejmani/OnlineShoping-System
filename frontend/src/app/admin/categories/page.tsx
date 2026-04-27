'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminCategoriesApi } from '@/features/admin/admin-categories-api';
import { getAdminErrorMessage } from '@/features/admin/admin-error';
import type { Category } from '@/types/category';

export default function AdminCategoriesPage() {
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [editing, setEditing] = useState<Category | null>(null);

  const categories = useQuery({
    queryKey: ['admin-categories'],
    queryFn: adminCategoriesApi.getCategories,
  });

  const invalidateCategories = () => {
    queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
    queryClient.invalidateQueries({ queryKey: ['admin-categories-summary'] });
  };

  const saveMutation = useMutation({
    mutationFn: () => editing
      ? adminCategoriesApi.updateCategory(editing.id, { name })
      : adminCategoriesApi.createCategory({ name }),
    onSuccess: () => {
      invalidateCategories();
      setEditing(null);
      setName('');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminCategoriesApi.deleteCategory(id),
    onSuccess: invalidateCategories,
  });

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    saveMutation.mutate();
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
        <p className="mt-1 text-sm text-gray-500">List, create, update, and delete product categories.</p>
      </div>

      <form onSubmit={submit} className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:flex-row sm:items-end">
        <label className="flex-1 text-sm font-medium text-gray-700">
          <span className="mb-1 block">Name</span>
          <input required value={name} onChange={(event) => setName(event.target.value)} className="input" />
        </label>
        <div className="flex gap-2">
          <button disabled={saveMutation.isPending} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50">
            {editing ? 'Update category' : 'Create category'}
          </button>
          {editing && (
            <button type="button" onClick={() => { setEditing(null); setName(''); }} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50">
              Cancel
            </button>
          )}
        </div>
      </form>

      {categories.isError && (
        <p className="text-sm text-red-600">
          {getAdminErrorMessage(categories.error, 'Unable to load categories.')}
        </p>
      )}
      {saveMutation.isError && (
        <p className="text-sm text-red-600">
          {getAdminErrorMessage(saveMutation.error, 'Unable to save category.')}
        </p>
      )}
      {deleteMutation.isError && (
        <p className="text-sm text-red-600">
          {getAdminErrorMessage(deleteMutation.error, 'Unable to delete category.')}
        </p>
      )}

      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Products</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {categories.data?.map((category) => (
                <tr key={category.id}>
                  <td className="px-4 py-3 font-medium text-gray-900">{category.name}</td>
                  <td className="px-4 py-3 text-gray-600">{category.productCount}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => { setEditing(category); setName(category.name); }} className="mr-3 text-sm font-semibold text-blue-600 hover:text-blue-800">Edit</button>
                    <button disabled={deleteMutation.isPending} onClick={() => deleteMutation.mutate(category.id)} className="text-sm font-semibold text-red-600 hover:text-red-800 disabled:text-gray-300">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {categories.isLoading && <p className="p-4 text-sm text-gray-500">Loading categories...</p>}
        {categories.data?.length === 0 && <p className="p-4 text-sm text-gray-500">No categories found.</p>}
      </div>
    </div>
  );
}
