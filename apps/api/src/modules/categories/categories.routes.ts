import { Router } from 'express'
import { authMiddleware, isAdmin, optionalAuth } from '../../middleware/auth.middleware'
import { auditLog } from '../../middleware/audit.middleware'
import * as controller from './categories.controller'

const router = Router()

router.get('/', optionalAuth, controller.listCategories)
router.get('/:slug', controller.getCategoryBySlug)
router.post('/', authMiddleware, isAdmin, auditLog({ entity: 'Category' }), controller.createCategory)
router.put('/:id', authMiddleware, isAdmin, auditLog({ entity: 'Category' }), controller.updateCategory)
router.delete('/:id', authMiddleware, isAdmin, auditLog({ entity: 'Category', action: 'DELETE_CATEGORY' }), controller.deleteCategory)

export { router as categoryRoutes }
