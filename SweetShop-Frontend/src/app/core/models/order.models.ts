export interface OrderDto {
  id: number;
  orderDate: string;
  status: string;
  totalAmount: number;
   subtotalAmount: number;
  discountAmount: number;
  voucherCode?: string;
  customerId: number;
  customerName: string;
  customerEmail: string;
  shippingAddress: ShippingAddressDto;
  items: OrderItemDto[];
  payment?: PaymentInfoDto;
}

export interface OrderItemDto {
  id: number;
  productId: number;
  productName: string;
  productImageUrl?: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface ShippingAddressDto {
  recipientName: string;
  street: string;
  city: string;
  postalCode: string;
  country: string;
  phoneNumber?: string;
}

export interface PaymentInfoDto {
  stripePaymentIntentId: string;
  amount: number;
  currency: string;
  status: string;
  paidAt?: string;
}

export interface CreateOrderDto {
  shippingAddressId: number;
  voucherCode?: string;
}

export interface UpdateOrderStatusDto {
  status: number; // OrderStatus enum value
}

export enum OrderStatus {
  Pending = 1,
  Paid = 2,
  Processing = 3,
  Shipped = 4,
  Delivered = 5,
  Cancelled = 6
}