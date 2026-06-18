export interface ReviewDto {
  id: number;
  rating: number;
  comment: string;
  createdAt: string;
  isApproved: boolean;
  customerId: number;
  customerName: string;
  productId: number;
  productName: string;
}

export interface CreateReviewDto {
  productId: number;
  rating: number;
  comment: string;
}

export interface UpdateReviewDto {
  rating: number;
  comment: string;
}