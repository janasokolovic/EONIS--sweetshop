export interface ShippingAddressDetailsDto {
  id: number;
  recipientName: string;
  street: string;
  city: string;
  postalCode: string;
  country: string;
  phoneNumber?: string;
  isDefault: boolean;
}

export interface CreateShippingAddressDto {
  recipientName: string;
  street: string;
  city: string;
  postalCode: string;
  country: string;
  phoneNumber?: string;
  isDefault: boolean;
}

export interface UpdateShippingAddressDto {
  recipientName: string;
  street: string;
  city: string;
  postalCode: string;
  country: string;
  phoneNumber?: string;
  isDefault: boolean;
}