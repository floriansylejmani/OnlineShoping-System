import { AdminRoute } from '@/components/admin-route';
import { AdminSidebar } from '@/components/admin-sidebar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminRoute>
      <div className="flex min-h-[calc(100vh-4rem)] flex-col md:flex-row">
        <AdminSidebar />
        <div className="flex-1 overflow-auto bg-gray-50 p-4 md:p-6">
          {children}
        </div>
      </div>
    </AdminRoute>
  );
}
