export interface AdminRecentOrder {
  id: string;
  customerEmail: string;
  status: string;
  totalAmount: number;
  itemCount: number;
  createdAt: string;
}

export interface AdminLowStockProduct {
  id: string;
  name: string;
  categoryName: string;
  stockQuantity: number;
}

export interface AdminBestSellingProduct {
  productId: string;
  productName: string;
  quantitySold: number;
  revenue: number;
}

export interface AdminDashboard {
  totalProducts: number;
  totalCategories: number;
  totalOrders: number;
  totalRevenue: number;
  pendingOrdersCount: number;
  lowStockProductsCount: number;
  recentOrders: AdminRecentOrder[];
  lowStockProducts: AdminLowStockProduct[];
  bestSellingProducts: AdminBestSellingProduct[];
}
