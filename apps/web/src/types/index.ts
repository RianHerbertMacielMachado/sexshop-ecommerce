// ── Enums ──────────────────────────────────────────────

export type UserRole = 'CUSTOMER' | 'ADMIN'

export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'REFUNDED'

export type PaymentStatus =
  | 'PENDING'
  | 'PAID'
  | 'FAILED'
  | 'REFUNDED'
  | 'CANCELLED'

export type CouponType = 'PERCENTAGE' | 'FIXED' | 'FREE_SHIPPING'

export type PaymentMethodType = 'STRIPE_CARD' | 'PIX' | 'BOLETO' | 'MANUAL'

export type BannerPosition =
  | 'HOME_HERO'
  | 'HOME_MIDDLE'
  | 'HOME_BOTTOM'
  | 'CATEGORY_TOP'
  | 'SIDEBAR'

// ── User ───────────────────────────────────────────────

export interface User {
  id: string
  name: string
  email: string
  phone?: string | null
  cpf?: string | null
  birthDate?: string | null
  role: UserRole
  isActive: boolean
  emailVerified: boolean
  loyaltyPoints: number
  createdAt: string
  updatedAt: string
}

// ── Address ────────────────────────────────────────────

export interface Address {
  id: string
  userId: string
  label?: string | null
  recipientName?: string | null
  street: string
  number: string
  complement?: string | null
  neighborhood: string
  city: string
  state: string
  zipCode: string
  isDefault: boolean
  createdAt: string
  updatedAt: string
}

// ── Category ───────────────────────────────────────────

export interface CategorySummary {
  id: string
  name: string
  slug: string
  imageUrl?: string | null
  _count?: {
    products: number
  }
}

export interface Category {
  id: string
  name: string
  slug: string
  description?: string | null
  imageUrl?: string | null
  parentId?: string | null
  parent?: { id: string; name: string; slug: string } | null
  isActive: boolean
  order: number
  metaTitle?: string | null
  metaDescription?: string | null
  createdAt: string
  updatedAt: string
  children?: Category[]
  _count?: {
    products: number
    children: number
  }
}

// ── Product ────────────────────────────────────────────

export interface ProductVariant {
  id: string
  productId: string
  name: string
  value: string
  price?: number | null
  stock: number
  sku?: string | null
  isActive: boolean
}

export interface Product {
  id: string
  name: string
  slug: string
  description?: string | null
  shortDescription?: string | null
  price: number
  compareAtPrice?: number | null
  sku: string
  stock: number
  weight?: number | null
  images: string[]
  categoryId: string
  category?: Category | null
  isActive: boolean
  isFeatured: boolean
  isDiscreet: boolean
  tags: string[]
  metaTitle?: string | null
  metaDescription?: string | null
  variants?: ProductVariant[]
  reviews?: Review[]
  averageRating?: number
  reviewCount?: number
  createdAt: string
  updatedAt: string
}

export interface ProductSummary {
  id: string
  name: string
  slug: string
  price: number
  compareAtPrice?: number | null
  images: string[]
  category?: { name: string } | null
  isDiscreet: boolean
  isFeatured: boolean
  stock: number
  averageRating?: number
  reviewCount?: number
}

// ── Cart ───────────────────────────────────────────────

export interface CartItem {
  id: string
  productId: string
  name: string
  slug: string
  price: number
  image?: string
  quantity: number
  stock: number
  variantId?: string
  variantName?: string
  isDiscreet?: boolean
}

// ── Order ──────────────────────────────────────────────

export interface ShippingAddress {
  id: string
  recipientName: string
  street: string
  number: string
  complement?: string | null
  neighborhood: string
  city: string
  state: string
  zipCode: string
}

export interface OrderItem {
  id: string
  productId: string
  productName: string
  variantName?: string | null
  quantity: number
  price: number
  product?: {
    images: string[]
  } | null
}

export interface OrderStatusHistory {
  id: string
  status: OrderStatus
  comment?: string | null
  createdAt: string
}

export interface Order {
  id: string
  orderNumber: string
  userId?: string | null
  user?: Pick<User, 'id' | 'name' | 'email'> | null
  guestName?: string | null
  guestEmail?: string | null
  status: OrderStatus
  paymentStatus: PaymentStatus
  subtotal: number
  discountAmount: number
  shippingCost: number
  total: number
  couponCode?: string | null
  trackingCode?: string | null
  isDiscreetPackaging: boolean
  notes?: string | null
  items?: OrderItem[]
  shippingAddress?: ShippingAddress | null
  statusHistory?: OrderStatusHistory[]
  createdAt: string
  updatedAt: string
}

// ── Coupon ─────────────────────────────────────────────

export interface Coupon {
  id: string
  code: string
  type: CouponType
  value: number
  minOrderAmount?: number | null
  maxUses?: number | null
  usedCount: number
  expiresAt?: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

// ── Payment ────────────────────────────────────────────

export interface PaymentMethod {
  id: string
  name: string
  type: PaymentMethodType
  isActive: boolean
  config?: Record<string, unknown>
}

// ── Review ─────────────────────────────────────────────

export interface Review {
  id: string
  productId: string
  userId: string | null
  guestName?: string | null
  rating: number
  title?: string | null
  comment?: string | null
  isApproved: boolean
  adminReply?: string | null
  user?: Pick<User, 'id' | 'name'> | null
  product?: Pick<Product, 'id' | 'name' | 'slug'> | null
  createdAt: string
  updatedAt: string
}

// ── Banner ─────────────────────────────────────────────

export interface Banner {
  id: string
  title?: string | null
  subtitle?: string | null
  imageUrl?: string | null
  mobileImageUrl?: string | null
  linkUrl?: string | null
  linkText?: string | null
  position: BannerPosition
  isActive: boolean
  order: number
  startsAt?: string | null
  endsAt?: string | null
  createdAt: string
  updatedAt: string
}

// ── Shipping ───────────────────────────────────────────

export interface ShippingZone {
  id: string
  name: string
  states: string[]
  price: number
  deliveryDays: number
  freeShippingThreshold?: number | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface ShippingOption {
  zoneId: string
  name: string
  price: number
  deliveryDays: number
  estimatedDays?: string
  isFree: boolean
}

// ── Site Settings ──────────────────────────────────────

export interface SiteSettings {
  id: string
  storeName: string
  storeDescription?: string | null
  storeEmail: string
  storePhone?: string | null
  storeCnpj?: string | null
  logoUrl?: string | null
  faviconUrl?: string | null
  freeShippingThreshold?: number | null
  maintenanceMode: boolean
  allowGuestCheckout: boolean
  metaTitle?: string | null
  metaDescription?: string | null
  primaryColor?: string | null
  secondaryColor?: string | null
  footerText?: string | null
  socialLinks?: Record<string, string> | null
  updatedAt: string
}

// ── Dashboard ──────────────────────────────────────────

export interface DashboardData {
  revenue30d: number
  ordersCount30d: number
  pendingOrders: number
  totalCustomers: number
  newCustomers30d: number
  activeProducts: number
  lowStockProducts: number
  revenueChart: { date: string; revenue: number }[]
  ordersByStatus: { status: string; count: number }[]
  topProducts: {
    id: string
    name: string
    totalSold: number
    revenue: number
  }[]
}

// ── API Response ───────────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean
  message: string
  data?: T
  errors?: Record<string, string[]>
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  pages: number
  totalPages: number
  limit: number
}
