import { Request, Response } from 'express'
import { categoriesService } from './categories.service'
import { asyncHandler } from '../../middleware/error.middleware'
import { validate } from '../../lib/validate'
import { createCategorySchema, updateCategorySchema } from './categories.schema'

export const listCategories = asyncHandler(async (req: Request, res: Response) => {
  const tree = req.query.tree === 'true'
  const includeInactive = req.query.all === 'true' && req.user?.role === 'ADMIN'
  const categories = includeInactive
    ? await categoriesService.listAll()
    : await categoriesService.list(tree)
  res.json({ success: true, message: 'Categorias listadas', data: { categories } })
})

export const getCategoryBySlug = asyncHandler(async (req: Request, res: Response) => {
  const category = await categoriesService.findBySlug(req.params.slug)
  res.json({ success: true, message: 'Categoria encontrada', data: { category } })
})

export const createCategory = asyncHandler(async (req: Request, res: Response) => {
  const { body } = validate(createCategorySchema, req)
  const category = await categoriesService.create(body)
  res.status(201).json({ success: true, message: 'Categoria criada com sucesso', data: { category } })
})

export const updateCategory = asyncHandler(async (req: Request, res: Response) => {
  const { params, body } = validate(updateCategorySchema, req)
  const category = await categoriesService.update(params.id, body)
  res.json({ success: true, message: 'Categoria atualizada com sucesso', data: { category } })
})

export const deleteCategory = asyncHandler(async (req: Request, res: Response) => {
  await categoriesService.delete(req.params.id)
  res.json({ success: true, message: 'Categoria removida com sucesso' })
})
