import slugify from 'slugify'
import { prisma } from '../../lib/prisma'
import { AppError, NotFoundError } from '../../middleware/error.middleware'
import type { CreateCategoryInput, UpdateCategoryInput } from './categories.schema'

function generateSlug(name: string): string {
  return slugify(name, { lower: true, strict: true, locale: 'pt' })
}

async function ensureUniqueSlug(slug: string, excludeId?: string): Promise<string> {
  let candidate = slug
  let counter = 1
  while (true) {
    const existing = await prisma.category.findUnique({
      where: { slug: candidate },
      select: { id: true },
    })
    if (!existing || existing.id === excludeId) break
    candidate = `${slug}-${counter++}`
  }
  return candidate
}

function buildTree(
  categories: Array<{
    id: string
    name: string
    slug: string
    description: string | null
    imageUrl: string | null
    isActive: boolean
    parentId: string | null
    order: number
    _count: { products: number }
    children?: unknown[]
  }>
): unknown[] {
  const map = new Map<string, (typeof categories)[0] & { children: unknown[] }>()
  const roots: unknown[] = []

  for (const cat of categories) {
    map.set(cat.id, { ...cat, children: [] })
  }

  for (const cat of categories) {
    const node = map.get(cat.id)!
    if (cat.parentId) {
      const parent = map.get(cat.parentId)
      if (parent) {
        parent.children.push(node)
      } else {
        roots.push(node)
      }
    } else {
      roots.push(node)
    }
  }

  return roots
}

export class CategoriesService {
  async list(tree: boolean = false) {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: [{ order: 'asc' }, { name: 'asc' }],
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        imageUrl: true,
        isActive: true,
        parentId: true,
        order: true,
        _count: { select: { products: { where: { isActive: true } } } },
      },
    })

    if (tree) return buildTree(categories)
    return categories
  }

  async listAll() {
    return prisma.category.findMany({
      orderBy: [{ order: 'asc' }, { name: 'asc' }],
      include: {
        parent: { select: { id: true, name: true } },
        _count: { select: { products: true } },
      },
    })
  }

  async findBySlug(slug: string) {
    const category = await prisma.category.findUnique({
      where: { slug, isActive: true },
      include: {
        parent: { select: { id: true, name: true, slug: true } },
        children: {
          where: { isActive: true },
          select: { id: true, name: true, slug: true, imageUrl: true, _count: { select: { products: true } } },
        },
        _count: { select: { products: { where: { isActive: true } } } },
      },
    })

    if (!category) throw new NotFoundError('Categoria')
    return category
  }

  async findById(id: string) {
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        parent: { select: { id: true, name: true } },
        children: { select: { id: true, name: true, slug: true } },
        _count: { select: { products: true } },
      },
    })
    if (!category) throw new NotFoundError('Categoria')
    return category
  }

  async create(input: CreateCategoryInput) {
    const baseSlug = generateSlug(input.name)
    const slug = await ensureUniqueSlug(baseSlug)

    if (input.parentId) {
      await prisma.category.findUniqueOrThrow({ where: { id: input.parentId } }).catch(() => {
        throw new NotFoundError('Categoria pai')
      })
    }

    return prisma.category.create({
      data: {
        name: input.name,
        slug,
        description: input.description ?? null,
        imageUrl: input.imageUrl ?? null,
        parentId: input.parentId ?? null,
        isActive: input.isActive,
        order: input.order,
        metaTitle: input.metaTitle ?? null,
        metaDescription: input.metaDescription ?? null,
      },
    })
  }

  async update(id: string, input: UpdateCategoryInput) {
    await this.findById(id)

    if (input.parentId === id) {
      throw new AppError('Uma categoria não pode ser pai de si mesma', 400)
    }

    let slug: string | undefined
    if (input.name) {
      const baseSlug = input.slug ?? generateSlug(input.name)
      slug = await ensureUniqueSlug(baseSlug, id)
    } else if (input.slug) {
      slug = await ensureUniqueSlug(input.slug, id)
    }

    return prisma.category.update({
      where: { id },
      data: { ...input, slug, updatedAt: new Date() },
    })
  }

  async delete(id: string): Promise<void> {
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: { select: { products: true, children: true } },
      },
    })

    if (!category) throw new NotFoundError('Categoria')

    if (category._count.products > 0) {
      throw new AppError(
        `Não é possível deletar: categoria possui ${category._count.products} produto(s)`,
        400
      )
    }

    if (category._count.children > 0) {
      throw new AppError(
        `Não é possível deletar: categoria possui ${category._count.children} subcategoria(s)`,
        400
      )
    }

    await prisma.category.delete({ where: { id } })
  }
}

export const categoriesService = new CategoriesService()
