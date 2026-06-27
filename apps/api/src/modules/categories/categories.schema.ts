import { z } from 'zod' 

export const createCategorySchema = z.object({
  body: z.object({
    name: z.string().min(2).max(100),
    description: z.string().optional(),
    imageUrl: z.string().url().optional(),
    parentId: z.string().cuid().optional(),
    isActive: z.coerce.boolean().optional().default(true),
    order: z.coerce.number().int().optional().default(0),
    metaTitle: z.string().optional(),
    metaDescription: z.string().optional(),
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
})

export const updateCategorySchema = z.object({
  body: z.object({
    name: z.string().min(2).max(100).optional(),
    description: z.string().optional(),
    imageUrl: z.string().url().optional(),
    parentId: z.string().cuid().optional().nullable(),
    isActive: z.coerce.boolean().optional(),
    order: z.coerce.number().int().optional(),
    metaTitle: z.string().optional(),
    metaDescription: z.string().optional(),
  }),
  query: z.object({}).optional(),
  params: z.object({
    id: z.string().cuid(),
  }),
})

export type CreateCategoryInput = z.infer<typeof createCategorySchema>['body']
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>['body']
