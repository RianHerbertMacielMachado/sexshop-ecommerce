import { z } from 'zod'

export const createCategorySchema = z.object({
  body: z.object({
    name: z.string().min(2).max(100).trim(),
    description: z.string().max(500).optional().nullable(),
    imageUrl: z.string().url().optional().nullable(),
    parentId: z.string().cuid().optional().nullable(),
    isActive: z.boolean().default(true),
    order: z.number().int().min(0).default(0),
    metaTitle: z.string().max(70).optional().nullable(),
    metaDescription: z.string().max(160).optional().nullable(),
  }),
})

export const updateCategorySchema = z.object({
  params: z.object({ id: z.string().cuid() }),
  body: z.object({
    name: z.string().min(2).max(100).trim().optional(),
    slug: z.string().min(2).max(100).optional(),
    description: z.string().max(500).optional().nullable(),
    imageUrl: z.string().url().optional().nullable(),
    parentId: z.string().cuid().optional().nullable(),
    isActive: z.boolean().optional(),
    order: z.number().int().min(0).optional(),
    metaTitle: z.string().max(70).optional().nullable(),
    metaDescription: z.string().max(160).optional().nullable(),
  }),
})

export type CreateCategoryInput = z.infer<typeof createCategorySchema>['body']
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>['body']
