import { z } from 'zod'

export const createProductSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(200),
    description: z.string().optional(),
    price: z.coerce.number().positive(),
    compareAtPrice: z.coerce.number().positive().optional(),
    sku: z.string().min(1).max(100),
    stock: z.coerce.number().int().min(0),
    weight: z.coerce.number().positive().optional(),
    categoryId: z.string().cuid(),
    isActive: z.coerce.boolean().optional().default(true),
    isFeatured: z.coerce.boolean().optional().default(false),
    isDiscreet: z.coerce.boolean().optional().default(false),
    tags: z.array(z.string()).optional().default([]),
    metaTitle: z.string().optional(),
    metaDescription: z.string().optional(),
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
})

export const updateProductSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(200).optional(),
    description: z.string().optional(),
    price: z.coerce.number().positive().optional(),
    compareAtPrice: z.coerce.number().positive().optional(),
    sku: z.string().min(1).max(100).optional(),
    stock: z.coerce.number().int().min(0).optional(),
    weight: z.coerce.number().positive().optional(),
    categoryId: z.string().cuid().optional(),
    isActive: z.coerce.boolean().optional(),
    isFeatured: z.coerce.boolean().optional(),
    isDiscreet: z.coerce.boolean().optional(),
    tags: z.array(z.string()).optional(),
    metaTitle: z.string().optional(),
    metaDescription: z.string().optional(),
  }),
  query: z.object({}).optional(),
  params: z.object({
    id: z.string().cuid(),
  }),
})

export const listProductsSchema = z.object({
  body: z.object({}).optional(),
  query: z.object({
    page: z.coerce.number().int().positive().optional().default(1),
    limit: z.coerce.number().int().positive().max(100).optional().default(12),
    search: z.string().optional(),
    categoryId: z.string().optional(),
    minPrice: z.coerce.number().optional(),
    maxPrice: z.coerce.number().optional(),
    isFeatured: z.coerce.boolean().optional(),
    inStock: z.coerce.boolean().optional(),
    sortBy: z
      .enum(['price_asc', 'price_desc', 'newest', 'popular'])
      .optional()
      .default('newest'),
    admin: z.coerce.boolean().optional(),
  }),
  params: z.object({}).optional(),
})

export const createVariantSchema = z.object({
  body: z.object({
    name: z.string().min(1),
    value: z.string().min(1),
    price: z.coerce.number().positive().optional(),
    stock: z.coerce.number().int().min(0).default(0),
    sku: z.string().optional(),
    isActive: z.coerce.boolean().optional().default(true),
  }),
  query: z.object({}).optional(),
  params: z.object({
    id: z.string().cuid(),
  }),
})

export type CreateProductInput = z.infer<typeof createProductSchema>['body']
export type UpdateProductInput = z.infer<typeof updateProductSchema>['body']
export type ListProductsQuery = z.infer<typeof listProductsSchema>['query']
export type CreateVariantInput = z.infer<typeof createVariantSchema>['body']
