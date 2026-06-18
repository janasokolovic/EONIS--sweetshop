export interface CategoryDto {
  id: number;
  name: string;
  description?: string;
  imageUrl?: string;
  productCount: number;
}

export interface CreateCategoryDto {
  name: string;
  description?: string;
  imageUrl?: string;
}

export interface UpdateCategoryDto {
  name: string;
  description?: string;
  imageUrl?: string;
}