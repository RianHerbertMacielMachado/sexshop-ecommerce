import slugify from 'slugify'
import { Prisma } from '@prisma/client'
import { prisma } from '../../lib/prisma'
import { AppError, NotFoundError } from '../../middleware/error.middleware'
import { uploadProductImage, deleteImage, extractPublicId } from '../../lib/cloudinary'
import type {
  CreateProductInput,
  UpdateProductInput,
  ListProductsQuery,
  CreateVariantInput,
  UpdateVariantInput,
} from './products.schema'

function generateSlug(name: string): string {
  return slugify(name, { lower: true, strict: true, locale: 'pt' })
}

async function ensureUniqueSlug(slug: string, excludeId?: string): Promise<string> {
  let candidate = slug
  let counter = 1

  while (true) {
    const existing = await prisma.product.findUnique({
      where: { slug: candidate },
      select: { id: true },
    })
    if (!existing || existing.id === excludeId) break
    candidate = `${slug}-${counter++}`
  }

  return candidate
}

export class ProductsService {
  async list(query: ListProductsQuery) {
    const {
      page,
      limit,
      search,
      categoryId,
      minPrice,
      maxPrice,
      sortBy,
      featured,
      inStock,
      isActive,
    } = query

    const skip = (page - 1) * limit

    const where: Prisma.ProductWhereInput = {
      isActive: isActive !== undefined ? isActive : true,
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
        { tags: { has: search } },
      ]
    }

    if (categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: categoryId },
        include: { children: { select: { id: true } } },
      })
      if (category) {
        const categoryIds = [categoryId, ...category.children.map((c) => c.id)]
        where.categoryId = { in: categoryIds }
      }
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {}
      if (minPrice !== undefined) where.price.gte = minPrice
      if (maxPrice !== undefined) where.price.lte = maxPrice
    }

    if (featured) where.isFeatured = true
    if (inStock) where.stock = { gt: 0 }

    const orderBy: Prisma.ProductOrderByWithRelationInput = (() => {
      switch (sortBy) {
        case 'price_asc': return { price: 'asc' }
        case 'price_desc': return { price: 'desc' }
        case 'popular': return { soldCount: 'desc' }
        case 'rating': return { averageRating: 'desc' }
        case 'newest':
        default: return { createdAt: 'desc' }
      }
    })()

    const [products, total] = await prisma.$transaction([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        select: {
          id: true,
          name: true,
          slug: true,
          shortDescription: true,
          price: true,
          comparePrice: true,
          images: true,
          stock: true,
          isFeatured: true,
          isDiscreet: true,
          soldCount: true,
          averageRating: true,
          reviewCount: true,
          isActive: true,
          createdAt: true,
          category: { select: { id: true, name: true, slug: true } },
        },
      }),
      prisma.product.count({ where }),
    ])

    return {
      products,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    }
  }

  async findBySlug(slug: string) {
    const product = await prisma.product.findUnique({
      where: { slug, isActive: true },
      include: {
        category: { select: { id: true, name: true, slug: true, parent: { select: { id: true, name: true, slug: true } } } },
        variants: { where: { isActive: true }, orderBy: { name: 'asc' } },
        reviews: {
          where: { isApproved: true },
          take: 5,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            rating: true,
            comment: true,
            guestName: true,
            adminReply: true,
            createdAt: true,
            user: { select: { id: true, name: true } },
          },
        },
      },
    })

    if (!product) throw new NotFoundError('Produto')
    return product
  }

  async findById(id: string) {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        variants: { orderBy: { name: 'asc' } },
      },
    })
    if (!product) throw new NotFoundError('Produto')
    return product
  }

  async getFeatured(limit: number = 8) {
    return prisma.product.findMany({
      where: { isActive: true, isFeatured: true, stock: { gt: 0 } },
      take: limit,
      orderBy: { soldCount: 'desc' },
      select: {
        id: true,
        name: true,
        slug: true,
        price: true,
        comparePrice: true,
        images: true,
        stock: true,
        averageRating: true,
        reviewCount: true,
        isFeatured: true,
        isDiscreet: true,
        soldCount: true,
        category: { select: { id: true, name: true, slug: true } },
      },
    })
  }

  async getRelated(productId: string, limit: number = 6) {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { categoryId: true },
    })
    if (!product) return []

    return prisma.product.findMany({
      where: {
        categoryId: product.categoryId,
        isActive: true,
        id: { not: productId },
      },
      take: limit,
      orderBy: { soldCount: 'desc' },
      select: {
        id: true,
        name: true,
        slug: true,
        price: true,
        comparePrice: true,
        images: true,
        stock: true,
        averageRating: true,
        reviewCount: true,
        isDiscreet: true,
        soldCount: true,
      },
    })
  }

  async getNewArrivals(limit: number = 8) {
    return prisma.product.findMany({
      where: { isActive: true },
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        slug: true,
        price: true,
        comparePrice: true,
        images: true,
        stock: true,
        averageRating: true,
        reviewCount: true,
        isDiscreet: true,
        soldCount: true,
        createdAt: true,
      },
    })
  }

  async create(input: CreateProductInput) {
    const existingSku = await prisma.product.findUnique({ where: { sku: input.sku } })
    if (existingSku) throw new AppError('SKU já em uso por outro produto', 409)

    const baseSlug = generateSlug(input.name)
    const slug = await ensureUniqueSlug(baseSlug)

    await prisma.category.findUniqueOrThrow({ where: { id: input.categoryId } }).catch(() => {
      throw new NotFoundError('Categoria')
    })

    return prisma.product.create({
      data: {
        name: input.name,
        slug,
        description: input.description,
        shortDescription: input.shortDescription ?? null,
        price: input.price,
        comparePrice: input.comparePrice ?? null,
        costPrice: input.costPrice ?? null,
        sku: input.sku,
        stock: input.stock,
        weight: input.weight ?? null,
        images: [],
        categoryId: input.categoryId,
        isActive: input.isActive,
        isFeatured: input.isFeatured,
        isDiscreet: input.isDiscreet,
        metaTitle: input.metaTitle ?? null,
        metaDescription: input.metaDescription ?? null,
        tags: input.tags ?? [],
      },
      include: {
        category: { select: { id: true, name: true, slug: true } },
      },
    })
  }

  async update(id: string, input: UpdateProductInput) {
    await this.findById(id)

    if (input.sku) {
      const existingSku = await prisma.product.findFirst({
        where: { sku: input.sku, id: { not: id } },
      })
      if (existingSku) throw new AppError('SKU já em uso por outro produto', 409)
    }

    let slug: string | undefined
    if (input.name) {
      const baseSlug = input.slug ?? generateSlug(input.name)
      slug = await ensureUniqueSlug(baseSlug, id)
    } else if (input.slug) {
      slug = await ensureUniqueSlug(input.slug, id)
    }

    return prisma.product.update({
      where: { id },
      data: {
        ...input,
        slug,
        updatedAt: new Date(),
      },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        variants: true,
      },
    })
  }

  async delete(id: string): Promise<void> {
    const product = await this.findById(id)

    const hasOrders = await prisma.orderItem.count({ where: { productId: id } })

    if (hasOrders > 0) {
      await prisma.product.update({ where: { id }, data: { isActive: false } })
    } else {
      const images = (product.images as string[]) ?? []
      for (const imageUrl of images) {
        const publicId = extractPublicId(imageUrl)
        if (publicId) await deleteImage(publicId).catch(() => {})
      }
      await prisma.product.delete({ where: { id } })
    }
  }

  async uploadImages(id: string, files: Express.Multer.File[]): Promise<string[]> {
    const product = await this.findById(id)
    const currentImages = (product.images as string[]) ?? []

    if (currentImages.length + files.length > 10) {
      throw new AppError('Limite máximo de 10 imagens por produto', 400)
    }

    const uploadedUrls: string[] = []

    for (const file of files) {
      const result = await uploadProductImage(file.buffer)
      uploadedUrls.push(result.url)
    }

    const updatedImages = [...currentImages, ...uploadedUrls]
    await prisma.product.update({
      where: { id },
      data: { images: updatedImages },
    })

    return updatedImages
  }

  async deleteImage(id: string, imageUrl: string): Promise<string[]> {
    const product = await this.findById(id)
    const images = (product.images as string[]) ?? []

    if (!images.includes(imageUrl)) {
      throw new AppError('Imagem não encontrada no produto', 404)
    }

    const publicId = extractPublicId(imageUrl)
    if (publicId) await deleteImage(publicId).catch(() => {})

    const updatedImages = images.filter((img) => img !== imageUrl)
    await prisma.product.update({ where: { id }, data: { images: updatedImages } })

    return updatedImages
  }

  async createVariant(productId: string, input: CreateVariantInput) {
    await this.findById(productId)

    return prisma.productVariant.create({
      data: {
        productId,
        name: input.name,
        options: input.options,
        price: input.price ?? null,
        stock: input.stock,
        sku: input.sku ?? null,
        imageUrl: input.imageUrl ?? null,
        isActive: input.isActive,
      },
    })
  }

  async updateVariant(productId: string, variantId: string, input: UpdateVariantInput) {
    const variant = await prisma.productVariant.findFirst({
      where: { id: variantId, productId },
    })
    if (!variant) throw new NotFoundError('Variante')

    return prisma.productVariant.update({
      where: { id: variantId },
      data: input,
    })
  }

  async deleteVariant(productId: string, variantId: string): Promise<void> {
    const variant = await prisma.productVariant.findFirst({
      where: { id: variantId, productId },
    })
    if (!variant) throw new NotFoundError('Variante')

    await prisma.productVariant.delete({ where: { id: variantId } })
  }

  async updateStock(productId: string, quantity: number): Promise<void> {
    await prisma.product.update({
      where: { id: productId },
      data: { stock: { decrement: quantity }, soldCount: { increment: quantity } },
    })
  }

  async getLowStock(threshold: number = 5) {
    return prisma.product.findMany({
      where: { isActive: true, stock: { lte: threshold } },
      select: {
        id: true,
        name: true,
        sku: true,
        stock: true,
        images: true,
        category: { select: { name: true } },
      },
      orderBy: { stock: 'asc' },
      take: 20,
    })
  }
}

export const productsService = new ProductsService()
