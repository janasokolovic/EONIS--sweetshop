export interface ProductDto {
  id: number;
  name: string;
  description: string;
  price: number;
  stockQuantity: number;
  isActive: boolean;
  createdAt: string;
  categoryId: number;
  categoryName: string;
  images: ProductImageDto[];
  averageRating: number;
  reviewCount: number;
}

export interface ProductImageDto {
  id: number;
  imageUrl: string;
  isPrimary: boolean;
  displayOrder: number;
}

export interface CreateProductDto {
  name: string;
  description: string;
  price: number;
  stockQuantity: number;
  categoryId: number;
  images: CreateProductImageDto[];
}

export interface CreateProductImageDto {
  imageUrl: string;
  isPrimary: boolean;
  displayOrder: number;
}

export interface UpdateProductDto {
  name: string;
  description: string;
  price: number;
  stockQuantity: number;
  categoryId: number;
  isActive: boolean;
  imageUrl?: string;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}