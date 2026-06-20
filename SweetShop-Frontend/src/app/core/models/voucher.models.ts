export interface VoucherDto {
  id: number;
  code: string;
  description?: string;
  isPercentage: boolean;
  discountValue: number;
  validFrom: string;
  validUntil: string;
  minOrderAmount?: number;
  maxUsageCount?: number;
  currentUsageCount: number;
  isActive: boolean;
  createdAt: string;
  isExpired: boolean;
  isUsageLimitReached: boolean;
}

export interface CreateVoucherDto {
  code: string;
  description?: string;
  isPercentage: boolean;
  discountValue: number;
  validFrom: string;
  validUntil: string;
  minOrderAmount?: number;
  maxUsageCount?: number;
  isActive: boolean;
}

export interface UpdateVoucherDto {
  code: string;
  description?: string;
  isPercentage: boolean;
  discountValue: number;
  validFrom: string;
  validUntil: string;
  minOrderAmount?: number;
  maxUsageCount?: number;
  isActive: boolean;
}

export interface ApplyVoucherDto {
  code: string;
  orderSubtotal: number;
}

export interface VoucherCalculationDto {
  code: string;
  description: string;
  originalAmount: number;
  discountAmount: number;
  finalAmount: number;
  isValid: boolean;
  message?: string;
}