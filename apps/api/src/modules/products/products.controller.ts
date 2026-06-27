import { Request, Response } from 'express'
import { productsService } from './products.service'
import { asyncHandler } from '../../middleware/error.middleware'
import { validate } from '../../lib/validate'
import { uploadProductImage } from '../../lib/cloudinary'
import {
  createProductSchema,
  updateProductSchema,
  listProductsSchema,
  createVariantSchema,
  updateVariantSchema,
} from './products.schema'

export const listProducts = asyncHandler(async (req: Request, res: Response) => {
  const { query } = validate(listProductsSchema, req)
  const result = await productsService.list(query)
  res.json({ success: true, message: 'Produtos listados com sucesso', data: result })
})

export const getProductBySlug = asyncHandler(async (req: Request, res: Response) => {
  const product = await productsService.findBySlug(req.params.slug)
  res.json({ success: true, message: 'Produto encontrado', data: { product } })
})

export const getProductById = asyncHandler(async (req: Request, res: Response) => {
  const product = await productsService.findById(req.params.id)
  res.json({ success: true, message: 'Produto encontrado', data: { product } })
})

export const getFeaturedProducts = asyncHandler(async (_req: Request, res: Response) => {
  const products = await productsService.getFeatured()
  res.json({ success: true, message: 'Produtos em destaque', data: { products } })
})

export const getNewArrivals = asyncHandler(async (_req: Request, res: Response) => {
  const products = await productsService.getNewArrivals()
  res.json({ success: true, message: 'Novidades', data: { products } })
})

export const getRelatedProducts = asyncHandler(async (req: Request, res: Response) => {
  const products = await productsService.getRelated(req.params.id)
  res.json({ success: true, message: 'Produtos relacionados', data: { products } })
})

export const createProduct = asyncHandler(async (req: Request, res: Response) => {
  const { body } = validate(createProductSchema, req)
  const product = await productsService.create(body)
  res.status(201).json({ success: true, message: 'Produto criado com sucesso', data: { product } })
})

export const updateProduct = asyncHandler(async (req: Request, res: Response) => {
  const { params, body } = validate(updateProductSchema, req)
  const product = await productsService.update(params.id, body)
  res.json({ success: true, message: 'Produto atualizado com sucesso', data: { product } })
})

export const deleteProduct = asyncHandler(async (req: Request, res: Response) => {
  await productsService.delete(req.params.id)
  res.json({ success: true, message: 'Produto removido com sucesso' })
})

export const uploadTempImages = asyncHandler(async (req: Request, res: Response) => {
  const files = req.files as Express.Multer.File[]
  if (!files?.length) {
    res.status(400).json({ success: false, message: 'Nenhuma imagem enviada' })
    return
  }
  // Faz upload de todas as imagens em paralelo para o Cloudinary (pasta products)
  const results = await Promise.all(files.map((f) => uploadProductImage(f.buffer)))
  const urls = results.map((r) => r.secureUrl)
  res.json({ success: true, message: 'Imagens enviadas com sucesso', data: { urls } })
})

export const uploadProductImages = asyncHandler(async (req: Request, res: Response) => {
  const files = req.files as Express.Multer.File[]
  if (!files?.length) {
    res.status(400).json({ success: false, message: 'Nenhuma imagem enviada' })
    return
  }
  const images = await productsService.uploadImages(req.params.id, files)
  res.json({ success: true, message: 'Imagens enviadas com sucesso', data: { images } })
})

export const deleteProductImage = asyncHandler(async (req: Request, res: Response) => {
  const { imageUrl } = req.body as { imageUrl: string }
  const images = await productsService.deleteImage(req.params.id, imageUrl)
  res.json({ success: true, message: 'Imagem removida com sucesso', data: { images } })
})

export const createVariant = asyncHandler(async (req: Request, res: Response) => {
  const { params, body } = validate(createVariantSchema, req)
  const variant = await productsService.createVariant(params.id, body)
  res.status(201).json({ success: true, message: 'Variante criada com sucesso', data: { variant } })
})

export const updateVariant = asyncHandler(async (req: Request, res: Response) => {
  const { params, body } = validate(updateVariantSchema, req)
  const variant = await productsService.updateVariant(params.id, params.variantId, body)
  res.json({ success: true, message: 'Variante atualizada com sucesso', data: { variant } })
})

export const deleteVariant = asyncHandler(async (req: Request, res: Response) => {
  await productsService.deleteVariant(req.params.id, req.params.variantId)
  res.json({ success: true, message: 'Variante removida com sucesso' })
})
