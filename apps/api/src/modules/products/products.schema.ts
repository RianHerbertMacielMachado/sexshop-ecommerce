import { z } from 'zod'

export const createProductSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(200).trim(),
    description: z.string().min(10),
    shortDescription: z.string().max(500).optional(),
    price: z.number().positive('Preço deve ser positivo'),
    comparePrice: z.number().positive().optional().nullable(),
    costPrice: z.number().positive().optional().nullable(),
    sku: z.string().min(1).max(100).trim(),
    stock: z.number().int().min(0).default(0),
    weight: z.number().positive().optional().nullable(),
    categoryId: z.string().cuid('categoryId inválido'),
    isActive: z.boolean().default(true),
    isFeatured: z.boolean().default(false),
    isDiscreet: z.boolean().default(false),
    metaTitle: z.string().max(70).optional().nullable(),
    metaDescription: z.string().max(160).optional().nullable(),
    tags: z.array(z.string()).optional().default([]),
  }),
})

export const updateProductSchema = z.object({
  params: z.object({ id: z.string().cuid() }),
  body: z.object({
    name: z.string().min(2).max(200).trim().optional(),
    slug: z.string().min(2).max(200).optional(),
    description: z.string().min(10).optional(),
    shortDescription: z.string().max(500).optional().nullable(),
    price: z.number().positive().optional(),
    comparePrice: z.number().positive().optional().nullable(),
    costPrice: z.number().positive().optional().nullable(),
    sku: z.string().min(1).max(100).trim().optional(),
    stock: z.number().int().min(0).optional(),
    weight: z.number().positive().optional().nullable(),
    categoryId: z.string().cuid().optional(),
    isActive: z.boolean().optional(),
    isFeatured: z.boolean().optional(),
    isDiscreet: z.boolean().optional(),
    metaTitle: z.string().max(70).optional().nullable(),
    metaDescription: z.string().max(160).optional().nullable(),
    tags: z.array(z.string()).optional(),
  }),
})

export const listProductsSchema = z.object({
  query: z.object({
    page: z.string().optional().transform((v) => (v ? parseInt(v, 10) : 1)),
    limit: z.string().optional().transform((v) => (v ? Math.min(parseInt(v, 10), 100) : 20)),
    search: z.string().optional(),
    categoryId: z.string().optional(),
    minPrice: z.string().optional().transform((v) => (v ? parseFloat(v) : undefined)),
    maxPrice: z.string().optional().transform((v) => (v ? parseFloat(v) : undefined)),
    sortBy: z
      .enum(['price_asc', 'price_desc', 'newest', 'popular', 'rating'])
      .optional()
      .default('newest'),
    featured: z
      .string()
      .optional()
      .transform((v) => v === 'true'),
    inStock: z
      .string()
      .optional()
      .transform((v) => v === 'true'),
    isActive: z
      .string()
      .optional()
      .transform((v) => (v === undefined ? undefined : v === 'true')),
  }),
})

export const createVariantSchema = z.object({
  params: z.object({ id: z.string().cuid() }),
  body: z.object({
    name: z.string().min(1).max(100),
    options: z.record(z.string()),
    price: z.number().positive().optional().nullable(),
    stock: z.number().int().min(0).default(0),
    sku: z.string().optional().nullable(),
    imageUrl: z.string().url().optional().nullable(),
    isActive: z.boolean().default(true),
  }),
})

export const updateVariantSchema = z.object({
  params: z.object({ id: z.string().cuid(), variantId: z.string().cuid() }),
  body: z.object({
    name: z.string().min(1).max(100).optional(),
    options: z.record(z.string()).optional(),
    price: z.number().positive().optional().nullable(),
    stock: z.number().int().min(0).optional(),
    sku: z.string().optional().nullable(),
    imageUrl: z.string().url().optional().nullable(),
    isActive: z.boolean().optional(),
  }),
})

export type CreateProductInput = z.infer<typeof createProductSchema>['body']
export type UpdateProductInput = z.infer<typeof updateProductSchema>['body']
export type ListProductsQuery = z.infer<typeof listProductsSchema>['query']
export type CreateVariantInput = z.infer<typeof createVariantSchema>['body']
export type UpdateVariantInput = z.infer<typeof updateVariantSchema>['body']
