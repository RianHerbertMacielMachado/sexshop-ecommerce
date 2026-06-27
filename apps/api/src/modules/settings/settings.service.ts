import { prisma } from '../../lib/prisma'
import { uploadLogoImage, uploadImage, deleteImage, extractPublicId } from '../../lib/cloudinary'
import { z } from 'zod'

export const updateSettingsSchema = z.object({
  storeName: z.string().min(1).max(100).optional(),
  storeDescription: z.string().max(500).optional().nullable(),
  storeEmail: z.string().email().optional().nullable(),
  storePhone: z.string().optional().nullable(),
  storeWhatsapp: z.string().optional().nullable(),
  storeCNPJ: z.string().optional().nullable(),
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  secondaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  socialLinks: z.record(z.string()).optional(),
  seoTitle: z.string().max(70).optional().nullable(),
  seoDescription: z.string().max(160).optional().nullable(),
  seoKeywords: z.string().optional().nullable(),
  maintenanceMode: z.boolean().optional(),
  maintenanceMessage: z.string().optional().nullable(),
  freeShippingThreshold: z.number().positive().optional().nullable(),
  footerText: z.string().optional().nullable(),
  privacyPolicy: z.string().optional().nullable(),
  termsOfService: z.string().optional().nullable(),
})

export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>

export class SettingsService {
  async get() {
    return prisma.siteSettings.upsert({
      where: { id: 'singleton' },
      update: {},
      create: {
        id: 'singleton',
        storeName: 'Minha Sexy Shop',
        primaryColor: '#7c3aed',
        secondaryColor: '#db2777',
        socialLinks: {},
      },
    })
  }

  async getPublic() {
    const settings = await this.get()
    const { privacyPolicy: _pp, termsOfService: _tos, storeCNPJ: _cnpj, ...publicSettings } = settings
    return { ...publicSettings, privacyPolicy: !!_pp, termsOfService: !!_tos }
  }

  async getPolicy(type: 'privacy' | 'terms') {
    const settings = await this.get()
    return type === 'privacy' ? settings.privacyPolicy : settings.termsOfService
  }

  async update(input: UpdateSettingsInput) {
    return prisma.siteSettings.upsert({
      where: { id: 'singleton' },
      update: { ...input, storeEmail: input.storeEmail ?? undefined, updatedAt: new Date() },
      create: {
        id: 'singleton',
        ...input,
        storeName: input.storeName ?? 'Minha Sexy Shop',
        primaryColor: input.primaryColor ?? '#7c3aed',
        secondaryColor: input.secondaryColor ?? '#db2777',
        socialLinks: input.socialLinks ?? {},
        storeEmail: input.storeEmail ?? undefined,
      },
    })
  }

  async uploadLogo(file: Express.Multer.File) {
    const settings = await this.get()
    if (settings.logoUrl) {
      const publicId = extractPublicId(settings.logoUrl)
      if (publicId) await deleteImage(publicId).catch(() => {})
    }
    const result = await uploadLogoImage(file.buffer)
    await prisma.siteSettings.update({ where: { id: 'singleton' }, data: { logoUrl: result.url } })
    return result.url
  }

  async uploadFavicon(file: Express.Multer.File) {
    const settings = await this.get()
    if (settings.faviconUrl) {
      const publicId = extractPublicId(settings.faviconUrl)
      if (publicId) await deleteImage(publicId).catch(() => {})
    }
    const result = await uploadImage(file.buffer, 'brand', {
      transformation: [{ width: 32, height: 32, crop: 'fill' }],
    })
    await prisma.siteSettings.update({ where: { id: 'singleton' }, data: { faviconUrl: result.url } })
    return result.url
  }
}

export const settingsService = new SettingsService()
