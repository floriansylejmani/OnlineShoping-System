export interface Category {
  id: string;
  name: string;
  productCount: number;
}

export interface CreateCategoryRequest {
  name: string;
}

export interface UpdateCategoryRequest {
  name: string;
}
