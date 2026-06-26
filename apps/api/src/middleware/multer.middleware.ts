import multer, { FileFilterCallback } from 'multer'
import { Request } from 'express'
import { AppError } from './error.middleware'

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

const storage = multer.memoryStorage()

function fileFilter(_req: Request, file: Express.Multer.File, cb: FileFilterCallback): void {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(
      new AppError(
        `Tipo de arquivo não suportado: ${file.mimetype}. Use JPEG, PNG ou WebP`,
        415
      )
    )
  }
}

export const uploadSingle = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE, files: 1 },
}).single('image')

export const uploadMultiple = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE, files: 10 },
}).array('images', 10)

export const uploadFields = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE, files: 5 },
}).fields([
  { name: 'image', maxCount: 1 },
  { name: 'mobileImage', maxCount: 1 },
])
