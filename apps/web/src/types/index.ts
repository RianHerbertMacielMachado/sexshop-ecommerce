export interface User {
  id: string
  name: string
  email: string
  role: 'ADMIN' | 'CUSTOMER'
  isActive: boolean
  emailVerified: boolean
  phone: string | null
  cpf: string | null
  birthDate: string | null
  loyaltyPoints: number
  createdAt: string
}

export interface Product {
  id: string
  name: string
  slug: string
  description: string
  shortDescription: string | null
  price: number
  comparePrice: number | null
  costPrice: number | null
  sku: string
  stock: number
  weight: number | null
  images: string[]
  categoryId: string
  category: CategorySummary
  isActive: boolean
  isFeatured: boolean
  isDiscreet: boolean
  metaTitle: string | null
  metaDescription: string | null
  tags: string[]
  soldCount: number
  averageRating: number
  reviewCount: number
  variants: ProductVariant[]
  createdAt: string
  updatedAt: string
}

export interface ProductSummary {
  id: string
  name: string
  slug: string
  shortDescription: string | null
  price: number
  comparePrice: number | null
  images: string[]
  stock: number
  isFeatured: boolean
  isDiscreet: boolean
  soldCount: number
  averageRating: number
  reviewCount: number
  isActive: boolean
  createdAt: string
  category: CategorySummary
}

export interface ProductVariant {
  id: string
  productId: string
  name: string
  options: Record<string, string>
  price: number | null
  stock: number
  sku: string | null
  imageUrl: string | null
  isActive: boolean
}

export interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  imageUrl: string | null
  isActive: boolean
  parentId: string | null
  order: number
  metaTitle: string | null
  metaDescription: string | null
  parent: CategorySummary | null
  children: CategorySummary[]
  _count: { products: number }
  createdAt: string
  updatedAt: string
}

export interface CategorySummary {
  id: string
  name: string
  slug: string
  imageUrl?: string | null
  _count?: { products: number }
}

export interface CartItem {
  productId: string
  variantId?: string | null
  quantity: number
  name: string
  slug: string
  price: number
  originalPrice: number
  image?: string | null
  variantName?: string | null
  stock: number
  isDiscreet: boolean
  sku: string
}

export interface Order {
  id: string
  orderNumber: string
  userId: string | null
  guestEmail: string | null
  guestName: string | null
  status: OrderStatus
  paymentStatus: PaymentStatus
  paymentMethod: string
  subtotal: number
  discount: number
  shippingCost: number
  total: number
  couponCode: string | null
  notes: string | null
  trackingCode: string | null
  isDiscreetPackaging: boolean
  estimatedDelivery: string | null
  paidAt: string | null
  shippedAt: string | null
  deliveredAt: string | null
  cancelledAt: string | null
  createdAt: string
  updatedAt: string
  items: OrderItem[]
  shippingAddress: ShippingAddress | null
  statusHistory: OrderStatusHistory[]
  user: { id: string; name: string; email: string } | null
}

export interface OrderItem {
  id: string
  orderId: string
  productId: string | null
  variantId: string | null
  quantity: number
  price: number
  productName: string
  productImage: string | null
  variantName: string | null
  product?: ProductSummary | null
}

export interface ShippingAddress {
  id: string
  orderId: string
  recipientName: string
  street: string
  number: string
  complement: string | null
  neighborhood: string
  city: string
  state: string
  zipCode: string
  phone: string | null
}

export interface OrderStatusHistory {
  id: string
  orderId: string
  status: string
  comment: string | null
  createdAt: string
}

export type OrderStatus =
  | 'PENDING'
  | 'PAID'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'REFUNDED'

export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED'

export interface Review {
  id: string
  productId: string
  userId: string | null
  guestName: string | null
  rating: number
  comment: string | null
  isApproved: boolean
  adminReply: string | null
  createdAt: string
  user: { id: string; name: string } | null
  product?: { id: string; name: string; slug: string }
}

export interface Banner {
  id: string
  title: string
  subtitle: string | null
  imageUrl: string
  mobileImageUrl: string | null
  link: string | null
  position: BannerPosition
  isActive: boolean
  order: number
  startDate: string | null
  endDate: string | null
  createdAt: string
}

export type BannerPosition = 'HOME_HERO' | 'HOME_MIDDLE' | 'HOME_BOTTOM' | 'SIDEBAR'

export interface SiteSettings {
  id: string
  storeName: string
  storeDescription: string | null
  storeEmail: string | null
  storePhone: string | null
  storeWhatsapp: string | null
  storeCNPJ: string | null
  logoUrl: string | null
  faviconUrl: string | null
  primaryColor: string
  secondaryColor: string
  socialLinks: Record<string, string>
  seoTitle: string | null
  seoDescription: string | null
  seoKeywords: string | null
  maintenanceMode: boolean
  maintenanceMessage: string | null
  freeShippingThreshold: number | null
  footerText: string | null
  privacyPolicy?: boolean | string | null
  termsOfService?: boolean | string | null
  createdAt: string
  updatedAt: string
}

export interface ShippingOption {
  zoneId: string
  name: string
  price: number
  originalPrice: number
  estimatedDays: string
  isFree: boolean
}

export interface Coupon {
  id: string
  code: string
  type: 'PERCENTAGE' | 'FIXED'
  value: number
  minOrderValue: number | null
  maxDiscountValue: number | null
  maxUses: number | null
  usedCount: number
  expiresAt: string | null
  isActive: boolean
  createdAt: string
}

export interface PaginatedResponse<T> {
  items?: T[]
  products?: T[]
  orders?: T[]
  customers?: T[]
  reviews?: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface ApiResponse<T = unknown> {
  success: boolean
  message: string
  data?: T
  errors?: unknown
}

export interface DashboardData {
  revenue: {
    today: number
    week: number
    month: number
    year: number
    todayOrders: number
    monthOrders: number
  }
  orders: {
    byStatus: Record<string, number>
    total: number
  }
  customers: {
    total: number
    newThisMonth: number
  }
  products: {
    total: number
    lowStock: Array<{ id: string; name: string; sku: string; stock: number; images: string[] }>
    topSelling: Array<{ id: string; name: string; slug: string; soldCount: number; images: string[]; price: number }>
  }
  recentOrders: Order[]
  revenueChart: Array<{ date: string; revenue: number; orders: number }>
}

export interface WishlistItem {
  id: string
  userId: string
  productId: string
  createdAt: string
  product: ProductSummary
}

export interface Address {
  id: string
  userId: string
  name: string
  street: string
  number: string
  complement: string | null
  neighborhood: string
  city: string
  state: string
  zipCode: string
  isDefault: boolean
  createdAt: string
}
