// ============================================================
// Tipos compartilhados entre Frontend e Backend
// ============================================================

export type UserRole = 'ADMIN' | 'CUSTOMER'

export type OrderStatus =
  | 'PENDING'
  | 'PAID'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'REFUNDED'

export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED'

export type CouponType = 'PERCENTAGE' | 'FIXED'

export type PaymentMethodType = 'STRIPE_CARD' | 'PIX' | 'BOLETO' | 'MANUAL'

export type BannerPosition = 'HOME_HERO' | 'HOME_MIDDLE' | 'HOME_BOTTOM' | 'SIDEBAR'

export interface ApiResponse<T = unknown> {
  success: boolean
  message: string
  data?: T
  errors?: unknown
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface ProductSummary {
  id: string
  name: string
  slug: string
  price: number
  comparePrice?: number
  images: string[]
  averageRating: number
  reviewCount: number
  stock: number
  isFeatured: boolean
  isDiscreet: boolean
  soldCount: number
  categoryId: string
}

export interface CartItem {
  productId: string
  variantId?: string
  quantity: number
  name: string
  price: number
  image?: string
  variantName?: string
  stock: number
  isDiscreet: boolean
}

export interface AddressData {
  name: string
  street: string
  number: string
  complement?: string
  neighborhood: string
  city: string
  state: string
  zipCode: string
}
