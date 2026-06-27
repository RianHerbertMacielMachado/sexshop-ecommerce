import { z } from 'zod'

export const createBannerSchema = z.object({
  body: z.object({
    title: z.string().optional(),
    subtitle: z.string().optional(),
    linkUrl: z.string().optional(),
    linkText: z.string().optional(),
    position: z
      .enum(['HOME_HERO', 'HOME_MIDDLE', 'HOME_BOTTOM', 'CATEGORY_TOP', 'SIDEBAR'])
      .default('HOME_HERO'),
    isActive: z.coerce.boolean().optional().default(true),
    order: z.coerce.number().int().optional().default(0),
    startsAt: z.string().datetime().optional(),
    endsAt: z.string().datetime().optional(),
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
})

export const updateBannerSchema = z.object({
  body: createBannerSchema.shape.body.partial(),
  query: z.object({}).optional(),
  params: z.object({
    id: z.string().cuid(),
  }),
})

export type CreateBannerInput = z.infer<typeof createBannerSchema>['body']
export type UpdateBannerInput = z.infer<typeof updateBannerSchema>['body']
