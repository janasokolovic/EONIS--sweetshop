export interface CartDto {
  id: number;
  customerId: number;
  items: CartItemDto[];
  totalPrice: number;
  totalItems: number;
}

export interface CartItemDto {
  id: number;
  productId: number;
  productName: string;
  productImageUrl?: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  availableStock: number;
}

export interface AddToCartDto {
  productId: number;
  quantity: number;
}

export interface UpdateCartItemDto {
  quantity: number;
}